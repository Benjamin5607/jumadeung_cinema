document.addEventListener("DOMContentLoaded", () => {
  // --- 다국어(i18n) 번역 데이터 ---
  const translations = {
    ko: {
      mainTitle: "주마등 : 시네마 v16",
      subTitle: "Wisk / Flow / Groq 하이브리드 워크플로우",
      langLabel: "Language:",
      apiLabel: "AI API Key:",
      apiHelp: "👉 API 키 무료 발급 (Groq)",
      loadModels: "모델 리스트 불러오기",
      modelLabel: "AI 모델 선택:",
      baseTitle: "📚 일기 및 스타일 설정",
      diaryPlaceholder: "오늘의 일기를 적어주세요...",
      styleLabel: "영상 스타일:",
      charStyleLabel: "캐릭터 비주얼:",
      customStylePlaceholder: "스타일 직접 입력",
      charDescLabel: "캐릭터 특징 요약 (선택):",
      charDescPlaceholder: "예: 문이-30대 남자, 나-20대 여자",
      extractBtn: "1단계 : 캐릭터 오브젝트 추출",
      fixedTitle: "🧬 캐릭터별 고정 프롬프트 (Wisk Object용)",
      fixedDesc: "캐릭터별로 따로 복사해서 위스크의 Object/Character 설정에 넣으세요.",
      fixedPromptPlaceholder: "1단계를 실행하면 캐릭터별 프롬프트가 여기에 생성됩니다.",
      generateScenesBtn: "2단계 : 전체 씬 프롬프트 생성",
      krTitle: "🎬 한글 씬 플랜",
      imgTitle: "🖼️ 이미지 전용 프롬프트 (Wisk/Flow 씬 입력용)",
      enTitle: "🎥 최종 영상 프롬프트 (Groq/Luma/Runway용)",
      copyEN: "영상 프롬프트 전체 복사",
      reaperQuotes: [
        "오늘 하루는 후회 없었어?",
        "주마등은 거짓말을 하지 않지 💀",
        "위스크에 복붙은 잘 하고 있나?",
        "시간은 참 빠르지...",
        "일기 쓸 내용이 그것뿐이야?",
        "날 클릭하면 멘트가 바뀐다구!"
      ]
    },
    en: {
      mainTitle: "Flashback : Cinema v16",
      subTitle: "Wisk / Flow / Groq Hybrid Workflow",
      langLabel: "Language:",
      apiLabel: "AI API Key:",
      apiHelp: "👉 Get a free Groq key",
      loadModels: "Load Model List",
      modelLabel: "Select AI Model:",
      baseTitle: "📚 Diary & Style Settings",
      diaryPlaceholder: "Write your diary entry here...",
      styleLabel: "Video Style:",
      charStyleLabel: "Character Visual:",
      customStylePlaceholder: "Enter custom style",
      charDescLabel: "Character Summary (Optional):",
      charDescPlaceholder: "e.g., Moon-30s man, Me-20s woman",
      extractBtn: "Step 1: Extract Character Objects",
      fixedTitle: "🧬 Fixed Character Prompts (Wisk Object)",
      fixedDesc: "Copy each character prompt into Wisk's Object settings.",
      fixedPromptPlaceholder: "Character prompts will appear here after Step 1.",
      generateScenesBtn: "Step 2: Generate All Scene Prompts",
      krTitle: "🎬 Scene Plan (Korean)",
      imgTitle: "🖼️ Image Prompts (For Wisk/Flow Scenes)",
      enTitle: "🎥 Final Video Prompts (For Groq/Runway)",
      copyEN: "Copy All Video Prompts",
      reaperQuotes: [
        "Any regrets today?",
        "Flashbacks don't lie 💀",
        "Ready to copy-paste to Wisk?",
        "Time flies, doesn't it...",
        "Is that all you did today?",
        "Click me to hear more!"
      ]
    }
  };

  const elements = {
    langSelect: document.getElementById("langSelect"),
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
    outputImageEN: document.getElementById("outputImageEN"), // 이미지 전용 박스
    outputEN: document.getElementById("outputEN"),           // 영상 전용 박스
    copyEN: document.getElementById("copyEN")
  };

  // --- 언어 변환 이벤트 ---
  elements.langSelect.addEventListener("change", (e) => {
    const lang = e.target.value;
    const t = translations[lang];
    
    document.getElementById("ui_mainTitle").innerText = t.mainTitle;
    document.getElementById("ui_subTitle").innerText = t.subTitle;
    document.getElementById("ui_langLabel").innerText = t.langLabel;
    document.getElementById("ui_apiLabel").innerText = t.apiLabel;
    document.getElementById("ui_apiHelp").innerText = t.apiHelp;
    document.getElementById("loadModels").innerText = t.loadModels;
    document.getElementById("ui_modelLabel").innerText = t.modelLabel;
    document.getElementById("ui_baseTitle").innerText = t.baseTitle;
    document.getElementById("ui_styleLabel").innerText = t.styleLabel;
    document.getElementById("ui_charStyleLabel").innerText = t.charStyleLabel;
    document.getElementById("ui_charDescLabel").innerText = t.charDescLabel;
    elements.extractBtn.innerText = t.extractBtn;
    document.getElementById("ui_fixedTitle").innerText = t.fixedTitle;
    document.getElementById("ui_fixedDesc").innerText = t.fixedDesc;
    elements.generateScenesBtn.innerText = t.generateScenesBtn;
    document.getElementById("ui_krTitle").innerText = t.krTitle;
    document.getElementById("ui_imgTitle").innerText = t.imgTitle;
    document.getElementById("ui_enTitle").innerText = t.enTitle;
    elements.copyEN.innerText = t.copyEN;

    elements.diary.placeholder = t.diaryPlaceholder;
    elements.customStyle.placeholder = t.customStylePlaceholder;
    elements.characterDesc.placeholder = t.charDescPlaceholder;
    elements.fixedPrompt.placeholder = t.fixedPromptPlaceholder;
  });

  // --- UI 설정 및 모델 로드 ---
  elements.characterStyle.addEventListener("change", () => {
    elements.customStyle.style.display = elements.characterStyle.value === "custom" ? "block" : "none";
  });

  function detectKeyType(key) {
    if (key.startsWith("sk-")) return "openai";
    if (key.startsWith("gsk_") || key.startsWith("gq-")) return "groq";
    if (key.startsWith("AIza")) return "gemini";
    return "unknown";
  }

  document.getElementById("loadModels").addEventListener("click", async () => {
    const key = elements.apiKey.value.trim();
    if (!key) return alert("API Key를 입력해주세요.");
    const lang = elements.langSelect.value;
    elements.aiModel.innerHTML = lang === "ko" ? "<option>불러오는 중...</option>" : "<option>Loading...</option>";
    
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
      elements.aiModel.innerHTML = "<option value=''>실패 / Failed</option>";
    }
  });

  // --- 공용 AI 호출 함수 ---
  async function callAI(systemPrompt, userText, temperature = 0.2) {
    const modelId = elements.aiModel.value;
    const apiKey = elements.apiKey.value.trim();
    if (!apiKey || !modelId) throw new Error("API 키와 모델을 확인하세요.");
    const type = detectKeyType(apiKey);
    let url = "", payload = {}, headers = { "Content-Type": "application/json" };

    if (type === "openai" || type === "groq") {
      url = type === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      payload = { model: modelId, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }], temperature: temperature };
    } else if (type === "gemini") {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
      payload = { contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${userText}` }] }], generationConfig: { temperature: temperature } };
    }

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "AI 응답 오류");
    return type === "gemini" ? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
  }

  // --- 🔥 1단계: 캐릭터별 오브젝트 분할 추출 (Wisk 최적화) ---
  elements.extractBtn.addEventListener("click", async () => {
    if (!elements.diary.value.trim()) return alert("일기를 먼저 작성해주세요!");
    const lang = elements.langSelect.value;
    elements.extractBtn.innerText = lang === "ko" ? "캐릭터 분석 중..." : "Analyzing...";
    
    const styleText = elements.characterStyle.value === "custom" ? elements.customStyle.value : elements.characterStyle.value;
    
    const sysPrompt = `You are a character design expert. Extract each character's visual appearance from the text to be used as a 'Fixed Object' in Wisk.ai.
RULES:
1. Divide characters clearly using headers like ### [Character Name].
2. For each character, provide ONLY physical traits: Age, Ethnicity, Hair, Face, Body, and Outfit.
3. Append this overall style at the end of each block: "${elements.videoStyle.value}, ${styleText}".
4. DO NOT include background or action.

Example:
### [Character: Moon]
30s Korean man, short sharp black hair, sharp jawline, wearing a black silk shirt, Cinematic, 8k, Pixar 3D style`;
    
    const userPrompt = `Diary: ${elements.diary.value}\nHints: ${elements.characterDesc.value}`;

    try {
      const result = await callAI(sysPrompt, userPrompt, 0.2);
      elements.fixedPrompt.value = result.trim();
      elements.generateScenesBtn.disabled = false;
    } catch (e) {
      alert(e.message);
    } finally {
      elements.extractBtn.innerText = translations[lang].extractBtn;
    }
  });

  // --- 🔥 2단계: 이미지(배경+액션) vs 영상(풀버전) 분리 생성 ---
  elements.generateScenesBtn.addEventListener("click", async () => {
    const text = elements.diary.value.trim();
    const fixedBase = elements.fixedPrompt.value.trim();
    if (!text || !fixedBase) return alert("1단계를 완료하세요!");

    const lang = elements.langSelect.value;
    elements.generateScenesBtn.innerText = lang === "ko" ? "프롬프트 조립 중..." : "Assembling...";
    
    const rawScenes = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
    const scenes = rawScenes.map(s => s.trim()).filter(s => s.length > 5);
    
    let kr = "", imgEn = "", vidEn = "";

    // 씬 생성용 시스템 프롬프트 (스토리 고정 + 역할 분리)
    const sysPrompt = `You are an AI video director. For the given scene context:
1. DO NOT change the story. Stay 100% faithful to the input.
2. [KR] Provide a detailed Korean scene plan.
3. [IMG] Provide an English prompt for Wisk/Flow: ONLY environment, lighting, and movement. (Character descriptions are already fixed, so DELETE all mentions of hair, face, or clothing here).
4. [VID] Provide a Full English Prompt: Character description + [IMG].

Format:
[KR] (내용)
[IMG] (Action/Environment Only)
[VID] (Full Cinematic Prompt)`;

    for (let i = 0; i < scenes.length; i++) {
      try {
        const aiRes = await callAI(sysPrompt, `Scene: ${scenes[i]}`, 0.2);
        
        // 데이터 파싱
        const parts = {
          kr: aiRes.split("[IMG]")[0].replace("[KR]", "").trim(),
          img: aiRes.split("[IMG]")[1]?.split("[VID]")[0].trim() || "",
          vid: aiRes.split("[VID]")[1]?.trim() || ""
        };

        kr += `[ Scene ${i + 1} - 원문: ${scenes[i]} ]\n${parts.kr}\n--------------------\n`;
        imgEn += `[ Scene ${i + 1} Image ]\n${parts.img}\n--------------------\n`;
        vidEn += `[ Scene ${i + 1} Video ]\n${fixedBase.split('\n')[1]}, ${parts.vid}\n--------------------\n`;

        elements.outputKR.value = kr;
        elements.outputImageEN.value = imgEn;
        elements.outputEN.value = vidEn;
      } catch (e) { console.error(e); }
    }
    elements.generateScenesBtn.innerText = translations[lang].generateScenesBtn;
  });

  // 복사 기능
  elements.copyEN.addEventListener("click", () => {
    navigator.clipboard.writeText(elements.outputEN.value).then(() => {
      alert(elements.langSelect.value === "ko" ? "복사 완료!" : "Copied!");
    });
  });

  // --- 저승사자 랜덤 멘트 (유지) ---
  const reaperBubble = document.getElementById("reaperBubble");
  const reaperImg = document.getElementById("reaperImg");
  let reaperInterval;
  function showReaperMessage() {
    const lang = elements.langSelect.value;
    const quotes = translations[lang].reaperQuotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    reaperBubble.innerText = randomQuote;
    reaperBubble.classList.add("show");
    setTimeout(() => { reaperBubble.classList.remove("show"); }, 4000);
  }
  reaperInterval = setInterval(showReaperMessage, 12000);
  reaperImg.addEventListener("click", () => {
    showReaperMessage();
    clearInterval(reaperInterval);
    reaperInterval = setInterval(showReaperMessage, 12000);
  });
});
