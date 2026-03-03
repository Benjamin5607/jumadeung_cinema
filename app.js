document.addEventListener("DOMContentLoaded", () => {
  // --- 다국어(i18n) 번역 데이터 ---
  const translations = {
    ko: {
      mainTitle: "주마등 : 시네마 v15",
      subTitle: "AI 프롬프트 체이닝 기반 씬 생성기",
      langLabel: "Language:",
      apiLabel: "AI API Key:",
      apiHelp: "👉 API 키가 없으신가요? (1분 만에 무료 Groq 키 발급받기)",
      loadModels: "모델 리스트 불러오기",
      modelLabel: "AI 모델 선택:",
      baseTitle: "📚 Base 설정 (일기 및 스타일)",
      diaryPlaceholder: "오늘의 일기를 적어주세요...",
      styleLabel: "영상 스타일:",
      charStyleLabel: "캐릭터 비주얼:",
      customStylePlaceholder: "스타일 직접 입력",
      charDescLabel: "캐릭터 특징 요약 (선택):",
      charDescPlaceholder: "예: 30대 남자, 피곤한 표정, 뿔테 안경",
      extractBtn: "1단계 : 캐릭터 및 스타일 프롬프트 추출",
      fixedTitle: "🧬 고정 캐릭터 프롬프트 (수정 가능)",
      fixedDesc: "AI가 일기를 바탕으로 추출한 메인 프롬프트입니다. 자유롭게 태그를 추가/수정하세요.",
      fixedPromptPlaceholder: "1단계를 실행하면 여기에 고정 프롬프트가 생성됩니다.",
      generateScenesBtn: "2단계 : 씬 분할 및 최종 영문 프롬프트 생성",
      krTitle: "🎬 한글 씬 플랜",
      enTitle: "🌐 최종 영문 프롬프트 (복사해서 AI 영상 툴에 붙여넣기)",
      copyEN: "최종 영문 프롬프트 복사",
      reaperQuotes: [
        "오늘 하루는 후회 없었어?",
        "시간은 참 빠르지...",
        "너의 기억을 영상으로 보여줄게.",
        "주마등은 거짓말을 하지 않지 💀",
        "일기 쓸 내용이 그것뿐이야?",
        "날 클릭하면 멘트가 바뀐다구!"
      ]
    },
    en: {
      mainTitle: "Flashback : Cinema v15",
      subTitle: "AI Prompt Chaining Scene Generator",
      langLabel: "Language:",
      apiLabel: "AI API Key:",
      apiHelp: "👉 Need an API Key? (Get a free Groq key in 1 min)",
      loadModels: "Load Model List",
      modelLabel: "Select AI Model:",
      baseTitle: "📚 Base Settings (Diary & Style)",
      diaryPlaceholder: "Write your diary entry here...",
      styleLabel: "Video Style:",
      charStyleLabel: "Character Visual:",
      customStylePlaceholder: "Enter custom style",
      charDescLabel: "Character Summary (Optional):",
      charDescPlaceholder: "e.g., 30s man, tired expression, glasses",
      extractBtn: "Step 1: Extract Character & Style Prompt",
      fixedTitle: "🧬 Fixed Character Prompt (Editable)",
      fixedDesc: "Main prompt extracted by AI. Feel free to add/edit tags.",
      fixedPromptPlaceholder: "The fixed prompt will appear here after Step 1.",
      generateScenesBtn: "Step 2: Split Scenes & Generate Final Prompts",
      krTitle: "🎬 Scene Plan (Korean)",
      enTitle: "🌐 Final English Prompts (Copy to AI Video Tool)",
      copyEN: "Copy Final Prompts",
      reaperQuotes: [
        "Any regrets today?",
        "Time flies, doesn't it...",
        "Let me show you your memories.",
        "Flashbacks don't lie 💀",
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
    outputEN: document.getElementById("outputEN"),
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

  // --- AI 호출 (창의성을 살리기 위해 temperature 소폭 상승) ---
  async function callAI(systemPrompt, userText, temperature = 0.5) {
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
        temperature: temperature
      };
    } else if (type === "gemini") {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
      payload = { 
        contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${userText}` }] }],
        generationConfig: { temperature: temperature }
      };
    }

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "AI 응답 오류");

    return type === "gemini" ? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
  }

  // --- 🔥 1단계: 초정밀 캐릭터 & 스타일 프롬프트 추출 ---
  elements.extractBtn.addEventListener("click", async () => {
    if (!elements.diary.value.trim()) return alert("일기를 먼저 작성해주세요!");
    const lang = elements.langSelect.value;
    elements.extractBtn.innerText = lang === "ko" ? "캐릭터 상세 분석 중..." : "Extracting Details...";
    
    const styleText = elements.characterStyle.value === "custom" ? elements.customStyle.value : elements.characterStyle.value;
    
    // 지시문 대폭 강화: 다수의 캐릭터와 디테일한 묘사 강제
    const sysPrompt = `You are a master AI prompt engineer for video generation (like Midjourney, SVD). 
Your task is to analyze the user's diary and inputs, and create a highly detailed, comma-separated list of visual tags representing ALL CHARACTERS mentioned and the OVERALL STYLE.

CRITICAL RULES:
1. Identify every distinct character.
2. For each character, detail their: age, gender, ethnicity, detailed facial features (eyes, jawline, expression), hairstyle and hair color, body type, and highly specific clothing/outfit details.
3. Incorporate the requested visual style tags at the end.
4. Output ONLY the comma-separated English tags. NO conversational text.

Output Format Example:
[Character 1] 1boy, 30s korean man, tired expression, dark circles under eyes, sharp jawline, short messy black hair, slim body, wearing a wrinkled white t-shirt and grey sweatpants, [Character 2] 1girl, 20s woman, bright smile, long wavy brown hair, wearing a red knitted sweater, [Style] ${elements.videoStyle.value}, ${styleText}`;
    
    const userPrompt = `Diary: ${elements.diary.value}\nCharacter Hints: ${elements.characterDesc.value}`;

    try {
      const result = await callAI(sysPrompt, userPrompt, 0.4);
      elements.fixedPrompt.value = result.trim();
      elements.generateScenesBtn.disabled = false;
    } catch (e) {
      alert(e.message);
    } finally {
      elements.extractBtn.innerText = translations[lang].extractBtn;
    }
  });

  // --- 🔥 2단계 & 3단계: 디테일한 한글 씬 기획 및 영문 프롬프트 변환 ---
  elements.generateScenesBtn.addEventListener("click", async () => {
    const text = elements.diary.value.trim();
    const fixedBasePrompt = elements.fixedPrompt.value.trim();
    if (!text || !fixedBasePrompt) return alert("1단계를 먼저 완료해주세요!");

    const lang = elements.langSelect.value;
    elements.generateScenesBtn.innerText = lang === "ko" ? "씬 기획 및 영상 프롬프트 생성 중..." : "Generating Scenes...";
    
    // 단순 문장 쪼개기가 아닌, 문맥을 어느정도 유지하며 씬을 분할
    const rawScenes = text.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length > 5);
    document.getElementById("sceneCount").innerText = lang === "ko" ? `총 ${rawScenes.length}개의 씬이 기획됩니다.` : `Total ${rawScenes.length} scenes planned.`;

    let krOutput = "", enOutput = "";

    // 씬 기획용 시스템 프롬프트 (한글 기획 + 영문 번역을 한 번에 요청하여 API 호출 횟수 최적화)
    const sysPrompt = `You are an expert film director and AI video prompt engineer. 
I will give you a short scene description. You must output EXACTLY in this format:

[한국어 씬 플랜]
- 장소 및 환경: (상세한 배경 묘사)
- 분위기 및 조명: (빛의 느낌, 색감 등)
- 행동 및 카메라: (캐릭터의 구체적인 행동, 감정, 카메라 앵글)

[English AI Prompt]
(Translate ONLY the environment, lighting, and action/camera into highly descriptive, comma-separated English tags for an AI video generator. Do not mention character appearance here.)`;

    for (let i = 0; i < rawScenes.length; i++) {
      try {
        const aiResponse = await callAI(sysPrompt, `Scene context: ${rawScenes[i]}`, 0.6);
        
        // AI 응답 파싱 (한국어 부분과 영어 부분을 나눔)
        const parts = aiResponse.split("[English AI Prompt]");
        const krPlan = parts[0].replace("[한국어 씬 플랜]", "").trim();
        const enAction = parts[1] ? parts[1].trim() : "Failed to generate action tags.";

        krOutput += `[ Scene ${i + 1} - 원문: ${rawScenes[i]} ]\n${krPlan}\n--------------------\n`;
        elements.outputKR.value = krOutput;

        enOutput += `[ Scene ${i + 1} ]\n${fixedBasePrompt}, ${enAction.replace(/\n/g, ' ')}\n--------------------\n`;
        elements.outputEN.value = enOutput;
      } catch (e) {
        krOutput += `[ Scene ${i + 1} ]\n오류 발생: ${e.message}\n\n`;
        enOutput += `[ Scene ${i + 1} ]\nError: ${e.message}\n\n`;
      }
    }
    elements.generateScenesBtn.innerText = translations[lang].generateScenesBtn;
  });

  // 복사
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
