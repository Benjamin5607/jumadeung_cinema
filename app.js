document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    diary: document.getElementById("diary"),
    videoStyle: document.getElementById("videoStyle"),
    characterStyle: document.getElementById("characterStyle"),
    customStyle: document.getElementById("customStyle"),
    characterDesc: document.getElementById("characterDesc"),
    apiKey: document.getElementById("apiKey"),
    aiModel: document.getElementById("aiModel"),
    extractBtn: document.getElementById("extractBtn"),
    fixedPrompt: document.getElementById("fixedCharacterPrompt"),
    generateScenesBtn: document.getElementById("generateScenesBtn"),
    outputKR: document.getElementById("outputKR"),
    outputEN: document.getElementById("outputEN"),
    copyEN: document.getElementById("copyEN")
  };

  elements.characterStyle.addEventListener("change", () => {
    elements.customStyle.style.display = elements.characterStyle.value === "custom" ? "block" : "none";
  });

  function detectKeyType(key) {
    if (key.startsWith("sk-")) return "openai";
    if (key.startsWith("gsk_") || key.startsWith("gq-")) return "groq";
    if (key.startsWith("AIza")) return "gemini";
    return "unknown";
  }

  // --- 모델 불러오기 ---
  document.getElementById("loadModels").addEventListener("click", async () => {
    const key = elements.apiKey.value.trim();
    if (!key) return alert("API Key를 입력해주세요.");
    elements.aiModel.innerHTML = "<option>불러오는 중...</option>";
    
    try {
      const type = detectKeyType(key);
      let url = type === "openai" ? "https://api.openai.com/v1/models" : 
                type === "groq" ? "https://api.groq.com/openai/v1/models" : 
                `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
      
      const headers = type === "gemini" ? {} : { "Authorization": `Bearer ${key}` };
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("모델을 불러오지 못했습니다.");
      
      const data = await res.json();
      const models = type === "gemini" ? 
        data.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).map(m => ({ id: m.name.replace("models/", ""), name: m.displayName || m.name })) : 
        data.data.map(m => ({ id: m.id, name: m.id }));
      
      elements.aiModel.innerHTML = models.map(m => `<option value="${m.id}">${m.name}</option>`).join("");
    } catch (e) {
      alert(e.message);
      elements.aiModel.innerHTML = "<option value=''>실패</option>";
    }
  });

  // --- 공용 AI 호출 함수 ---
  async function callAI(systemPrompt, userText) {
    const modelId = elements.aiModel.value;
    const apiKey = elements.apiKey.value.trim();
    if (!apiKey || !modelId) throw new Error("API 키와 모델을 확인하세요.");

    const type = detectKeyType(apiKey);
    let url = "", payload = {};
    const headers = { "Content-Type": "application/json" };

    if (type === "openai" || type === "groq") {
      url = type === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      payload = {
        model: modelId,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
        temperature: 0.3
      };
    } else if (type === "gemini") {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
      payload = { contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${userText}` }] }] };
    }

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "AI 응답 오류");

    return type === "gemini" ? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
  }

  // --- 1단계: 캐릭터 및 스타일 프롬프트 추출 ---
  elements.extractBtn.addEventListener("click", async () => {
    if (!elements.diary.value.trim()) return alert("일기를 먼저 작성해주세요!");
    elements.extractBtn.innerText = "추출 중...";
    
    const styleText = elements.characterStyle.value === "custom" ? elements.customStyle.value : elements.characterStyle.value;
    const sysPrompt = `You are a prompt engineer for AI image generators. 
Based on the diary and inputs, create a comma-separated list of visual tags representing the MAIN CHARACTER and OVERALL STYLE. 
DO NOT include any actions or background. 
Format Example: 1boy, 30 years old, messy hair, wearing a suit, ${elements.videoStyle.value}, ${styleText}`;
    
    const userPrompt = `Diary: ${elements.diary.value}\nCharacter Hints: ${elements.characterDesc.value}`;

    try {
      const result = await callAI(sysPrompt, userPrompt);
      elements.fixedPrompt.value = result.trim();
      elements.generateScenesBtn.disabled = false; // 2단계 버튼 활성화
    } catch (e) {
      alert(e.message);
    } finally {
      elements.extractBtn.innerText = "1단계 : 캐릭터 및 스타일 프롬프트 추출";
    }
  });

  // --- 2단계: 씬 분할 및 최종 조립 ---
  elements.generateScenesBtn.addEventListener("click", async () => {
    const text = elements.diary.value.trim();
    const fixedBasePrompt = elements.fixedPrompt.value.trim();
    if (!text || !fixedBasePrompt) return alert("1단계를 먼저 완료해주세요!");

    elements.generateScenesBtn.innerText = "최종 씬 생성 중...";
    
    // 로컬 씬 분할 (간단히 문장 단위)
    const scenes = text.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length > 2);
    document.getElementById("sceneCount").innerText = `총 ${scenes.length}개의 씬이 감지되었습니다.`;

    let krOutput = "", enOutput = "";
    
    // 행동 번역용 시스템 프롬프트
    const sysPrompt = `Translate the character's action and background setting into comma-separated English visual tags for an AI video generator. 
DO NOT describe the character's appearance, ONLY the action, camera, and environment.`;

    for (let i = 0; i < scenes.length; i++) {
      krOutput += `[ Scene ${i + 1} ]\n내용: ${scenes[i]}\n\n`;
      elements.outputKR.value = krOutput;

      try {
        const translatedAction = await callAI(sysPrompt, scenes[i]);
        // 최종 조립: [고정 프롬프트] + [행동 프롬프트]
        enOutput += `[ Scene ${i + 1} ]\n${fixedBasePrompt}, ${translatedAction.replace(/\n/g, '')}\n\n`;
        elements.outputEN.value = enOutput;
      } catch (e) {
        enOutput += `[ Scene ${i + 1} ]\nError: ${e.message}\n\n`;
      }
    }
    elements.generateScenesBtn.innerText = "2단계 : 씬 분할 및 최종 영문 프롬프트 생성";
  });

  // 복사
  elements.copyEN.addEventListener("click", () => {
    navigator.clipboard.writeText(elements.outputEN.value).then(() => alert("복사 완료!"));
  });
});
