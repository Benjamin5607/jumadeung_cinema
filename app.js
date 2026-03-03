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

  // --- 기존 로직 (스타일 커스텀, 모델 로드) ---
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
    const lang = elements.langSelect.value;
    elements.extractBtn.innerText = lang === "ko" ? "추출 중..." : "Extracting...";
    
    const styleText = elements.characterStyle.value === "custom" ? elements.customStyle.value : elements.characterStyle.value;
    const sysPrompt = `You are a prompt engineer for AI image generators. 
Based on the diary and inputs, create a comma-separated list of visual tags representing the MAIN CHARACTER and OVERALL STYLE. 
DO NOT include any actions or background. 
Format Example: 1boy, 30 years old, messy hair, wearing a suit, ${elements.videoStyle.value}, ${styleText}`;
    
    const userPrompt = `Diary: ${elements.diary.value}\nCharacter Hints: ${elements.characterDesc.value}`;

    try {
      const result = await callAI(sysPrompt, userPrompt);
      elements.fixedPrompt.value = result.trim();
      elements.generateScenesBtn.disabled = false;
    } catch (e) {
      alert(e.message);
    } finally {
      elements.extractBtn.innerText = translations[lang].extractBtn;
    }
  });

  // --- 2단계: 씬 분할 및 최종 조립 ---
  elements.generateScenesBtn.addEventListener("click", async () => {
    const text = elements.diary.value.trim();
    const fixedBasePrompt = elements.fixedPrompt.value.trim();
    if (!text || !fixedBasePrompt) return alert("1단계를 먼저 완료해주세요!");

    const lang = elements.langSelect.value;
    elements.generateScenesBtn.innerText = lang === "ko" ? "최종 씬 생성 중..." : "Generating Scenes...";
    
    const scenes = text.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length > 2);
    document.getElementById("sceneCount").innerText = lang === "ko" ? `총 ${scenes.length}개의 씬이 감지되었습니다.` : `Total ${scenes.length} scenes detected.`;

    let krOutput = "", enOutput = "";
    const sysPrompt = `Translate the character's action and background setting into comma-separated English visual tags for an AI video generator. 
DO NOT describe the character's appearance, ONLY the action, camera, and environment.`;

    for (let i = 0; i < scenes.length; i++) {
      krOutput += `[ Scene ${i + 1} ]\n내용: ${scenes[i]}\n\n`;
      elements.outputKR.value = krOutput;

      try {
        const translatedAction = await callAI(sysPrompt, scenes[i]);
        enOutput += `[ Scene ${i + 1} ]\n${fixedBasePrompt}, ${translatedAction.replace(/\n/g, '')}\n\n`;
        elements.outputEN.value = enOutput;
      } catch (e) {
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

  // --- 저승사자 랜덤 멘트 기능 ---
  const reaperBubble = document.getElementById("reaperBubble");
  const reaperImg = document.getElementById("reaperImg");
  let reaperInterval;

  function showReaperMessage() {
    const lang = elements.langSelect.value;
    const quotes = translations[lang].reaperQuotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    reaperBubble.innerText = randomQuote;
    reaperBubble.classList.add("show");
    
    setTimeout(() => {
      reaperBubble.classList.remove("show");
    }, 4000); // 4초 후 숨김
  }

  // 12초마다 멘트
  reaperInterval = setInterval(showReaperMessage, 12000);

  // 클릭 시 즉시 멘트
  reaperImg.addEventListener("click", () => {
    showReaperMessage();
    clearInterval(reaperInterval);
    reaperInterval = setInterval(showReaperMessage, 12000); // 타이머 리셋
  });
});
