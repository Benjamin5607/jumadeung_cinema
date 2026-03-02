document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("langSelect");
  const diary = document.getElementById("diary");
  const videoStyle = document.getElementById("videoStyle");
  const characterStyleSelect = document.getElementById("characterStyle");
  const customStyleInput = document.getElementById("customStyle");
  const characterDesc = document.getElementById("characterDesc");
  const timelineMode = document.getElementById("timelineMode");
  const apiKeyInput = document.getElementById("apiKey");
  const aiModelSelect = document.getElementById("aiModel");
  const generateBtn = document.getElementById("generateBtn");
  const outputKR = document.getElementById("outputKR");
  const outputEN = document.getElementById("outputEN");

  // 커스텀 스타일 입력창 토글
  characterStyleSelect.addEventListener("change", () => {
    customStyleInput.style.display = characterStyleSelect.value === "custom" ? "block" : "none";
  });

  // 키 유형 감지 (Gemini는 보통 AIza 로 시작함)
  function detectKeyType(key) {
    if (key.startsWith("sk-")) return "openai";
    if (key.startsWith("gsk_")) return "groq"; // Groq 키는 gsk_ 로 시작하는 경우가 많음
    if (key.startsWith("gq-")) return "groq";
    if (key.startsWith("AIza")) return "gemini";
    return "unknown";
  }

  // 1. 서버별 모델 리스트 불러오기 (구조 완벽 호환)
  async function fetchModels(key) {
    const type = detectKeyType(key);
    if (type === "unknown") throw new Error("지원하지 않거나 형식이 잘못된 Key입니다. (sk-, gsk_, AIza- 확인)");

    let url = "";
    let headers = { "Content-Type": "application/json" };

    if (type === "openai") {
      url = "https://api.openai.com/v1/models";
      headers["Authorization"] = `Bearer ${key}`;
    } else if (type === "groq") {
      // Groq의 모델 엔드포인트
      url = "https://api.groq.com/openai/v1/models";
      headers["Authorization"] = `Bearer ${key}`;
    } else if (type === "gemini") {
      // Gemini는 쿼리 파라미터로 키 전송
      url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    }

    const res = await fetch(url, { method: "GET", headers });
    if (!res.ok) throw new Error(`${type} 서버 모델 불러오기 실패 (Status: ${res.status})`);
    
    const data = await res.json();
    
    // API별 데이터 구조가 다름을 반영
    if (type === "gemini") {
      return (data.models || [])
        .filter(m => m.supportedGenerationMethods.includes("generateContent"))
        .map(m => ({ id: m.name.replace("models/", ""), name: m.displayName || m.name }));
    } else {
      return (data.data || []).map(m => ({ id: m.id, name: m.id }));
    }
  }

  // 2. 모델 리스트 로드 버튼 클릭
  document.getElementById("loadModels").addEventListener("click", async () => {
    const key = apiKeyInput.value.trim();
    if (!key) { alert("API Key를 입력해주세요."); return; }
    
    aiModelSelect.innerHTML = "<option>불러오는 중...</option>";
    
    try {
      const models = await fetchModels(key);
      aiModelSelect.innerHTML = "";
      models.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.text = m.name;
        aiModelSelect.appendChild(opt);
      });
      alert("모델 리스트를 성공적으로 불러왔습니다!");
    } catch (e) {
      aiModelSelect.innerHTML = "<option value=''>불러오기 실패</option>";
      alert(e.message);
    }
  });

  // 3. 씬 분할 로직 (빈 문자열 제거 강화)
  function splitIntoScenes(text) {
    if (!text) return [];
    return text.split(/[.!?\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => ({ sentences: [s], place: "미상", action: s }));
  }

  // 4. AI 호출 (각 API별 페이로드 규격에 맞춤)
  async function callAI(scenePrompt) {
    const modelId = aiModelSelect.value;
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return "[API Key 필요]";
    if (!modelId) return "[모델 선택 필요]";

    const type = detectKeyType(apiKey);
    let url = "";
    let payload = {};
    let headers = { "Content-Type": "application/json" };
    
    // AI에게 영어 번역 및 이미지 프롬프트 변환을 지시
    const systemPrompt = "Translate the following scene description into an English prompt suitable for AI video generation (like Midjourney or Stable Video Diffusion). Use comma-separated keywords, describing subject, action, style, and lighting. Do not add conversational text, just the prompt.";

    if (type === "openai" || type === "groq") {
      url = type === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      payload = {
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: scenePrompt }
        ],
        max_tokens: 300
      };
    } else if (type === "gemini") {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
      payload = {
        contents: [{ parts: [{ text: `${systemPrompt}\n\nScene: ${scenePrompt}` }] }]
      };
    }

    try {
      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error?.message || "응답 오류");

      if (type === "gemini") {
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "[생성 실패]";
      } else {
        return data.choices?.[0]?.message?.content || "[생성 실패]";
      }
    } catch (e) {
      return `[AI 프롬프트 생성 에러: ${e.message}]`;
    }
  }

  // 5. 프롬프트 생성 버튼 클릭
  generateBtn.addEventListener("click", async () => {
    const text = diary.value.trim();
    if (!text) { alert("일기 내용을 입력해주세요!"); return; }

    generateBtn.innerText = "생성 중... (시간이 걸릴 수 있습니다)";
    generateBtn.disabled = true;

    const scenes = splitIntoScenes(text);
    let krText = "", enText = "";
    const style = characterStyleSelect.value === "custom" ? customStyleInput.value : characterStyleSelect.value;
    
    document.getElementById("sceneCount").innerText = `총 씬 개수: ${scenes.length}개`;
    document.getElementById("totalDuration").innerText = `예상 영상 길이: ${scenes.length * 6}초`;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      
      // 한국어 기준 텍스트 구성
      const krPrompt = `스타일: ${videoStyle.value}\n비주얼: ${style}\n캐릭터: ${characterDesc.value}\n장소: ${scene.place}\n행동: ${scene.action}`;
      
      krText += `[ Scene ${i + 1} (${i * 6}-${(i + 1) * 6}s) ]\n내용: ${scene.sentences[0]}\n${krPrompt}\n----------------\n`;
      outputKR.value = krText; // 실시간 업데이트

      // 영문 프롬프트 생성 호출
      const aiResponse = await callAI(krPrompt + `\n내용: ${scene.sentences[0]}`);
      enText += `[ Scene ${i + 1} (${i * 6}-${(i + 1) * 6}s) ]\n${aiResponse}\n----------------\n`;
      outputEN.value = enText; // 실시간 업데이트
    }

    generateBtn.innerText = "프롬프트 생성";
    generateBtn.disabled = false;
  });

  // 6. 복사 기능 추가
  document.getElementById("copyKR").addEventListener("click", () => {
    navigator.clipboard.writeText(outputKR.value).then(() => alert("한글 프롬프트가 복사되었습니다!"));
  });
  
  document.getElementById("copyEN").addEventListener("click", () => {
    navigator.clipboard.writeText(outputEN.value).then(() => alert("영문 프롬프트가 복사되었습니다!"));
  });

});
