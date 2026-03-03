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
      fixedTitle: "🧬 고정 캐릭터 프롬프트 (위스크 오브젝트용)",
      fixedDesc: "AI가 분석한 캐릭터의 고유 외형입니다. 위스크의 'Object' 설정에 활용하세요.",
      fixedPromptPlaceholder: "1단계를 실행하면 여기에 고정 프롬프트가 생성됩니다.",
      generateScenesBtn: "2단계 : 씬 분할 및 최종 영문 프롬프트 생성",
      krTitle: "🎬 한글 씬 플랜",
      enTitle: "🌐 최종 영문 프롬프트 (Wisk 씬 입력용)",
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
      extractBtn: "Step 1: Extract Character for Wisk Object",
      fixedTitle: "🧬 Fixed Character Prompt (Wisk Object)",
      fixedDesc: "AI-extracted character traits. Use this for Wisk's 'Character Object' settings.",
      fixedPromptPlaceholder: "The fixed prompt will appear here after Step 1.",
      generateScenesBtn: "Step 2: Split Scenes & Generate Action Prompts",
      krTitle: "🎬 Scene Plan (Korean)",
      enTitle: "🌐 Final English Prompts (For Wisk Scenes)",
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

  // --- AI 호출 (Strict 모드: temperature 0.2) ---
  async function callAI(systemPrompt, userText, temperature = 0.2) {
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
        contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Context: ${userText}` }] }],
        generationConfig: { temperature: temperature }
      };
    }

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "AI 응답 오류");

    return type === "gemini" ? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
  }

  // --- 🔥 1단계: 위스크(Wisk) 캐릭터 오브젝트 추출 ---
  elements.extractBtn.addEventListener("click", async () => {
    if (!elements.diary.value.trim()) return alert("일기를 먼저 작성해주세요!");
    const lang = elements.langSelect.value;
    elements.extractBtn.innerText = lang === "ko" ? "위스크용 캐릭터 분석 중..." : "Extracting Character Object...";
    
    const styleText = elements.characterStyle.value === "custom" ? elements.customStyle.value : elements.characterStyle.value;
    const selectedVideoStyle = elements.videoStyle.value;
    
    const sysPrompt = `You are a professional prompt engineer for AI video generation. 
Your task is to extract a highly detailed, consistent visual profile for EACH character to be used as a "Fixed Object" in Wisk or Midjourney.

STRICT RULES:
1. Describe every character separately: [Character Name].
2. Focus ONLY on physical appearance: (Age, Gender, Ethnicity, Detailed facial features, Exact hair style/color, Body type, and specific Outfit/Clothing).
3. DO NOT include any background, action, or camera movements here.
4. YOU MUST append the following style keywords at the end: "${selectedVideoStyle}, ${styleText}".
5. Output format: A comma-separated list of keywords. NO conversations.

Example:
[Character 1: Moon] 30s man, black sharp short hair, oval face, focused eyes, slim build, wearing a black silk button-down shirt, ${selectedVideoStyle}, ${styleText}`;
    
    const userPrompt = `Diary: ${elements.diary.value}\nExtra Hints: ${elements.characterDesc.value}`;

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

  // --- 🔥 2단계: 스토리 변형 없는 씬 플랜 및 액션 프롬프트 생성 ---
  elements.generateScenesBtn.addEventListener("click", async () => {
    const text = elements.diary.value.trim();
    const fixedBasePrompt = elements.fixedPrompt.value.trim();
    if (!text || !fixedBasePrompt) return alert("1단계를 먼저 완료해주세요!");

    const lang = elements.langSelect.value;
    elements.generateScenesBtn.innerText = lang === "ko" ? "씬 생성 중..." : "Generating Scenes...";
    
    // 정규식으로 문장 단위로 깔끔하게 쪼개기
    const scenes = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
    document.getElementById("sceneCount").innerText = lang === "ko" ? `총 ${scenes.length}개의 씬이 감지되었습니다.` : `Total ${scenes.length} scenes detected.`;

    let krOutput = "", enOutput = "";

    const sysPrompt = `You are an AI video director. Translate the provided scene text into a cinematic plan.
STRICT RULES:
1. DO NOT change the story or add events that aren't in the input text. Stay 100% faithful to the diary.
2. Character looks are ALREADY FIXED. Focus ONLY on describing the background, lighting, camera angle, and the specific movement/action.
3. Output a detailed Korean scene plan.
4. Output a highly descriptive English prompt (comma-separated tags).

Output exactly in this format:
[한국어 씬 플랜]
- 장소 및 배경: (상세 묘사)
- 분위기 및 조명: (시각적 톤)
- 행동 특징: (원문 그대로의 행동 묘사)

[English AI Prompt]
(Environment keywords, lighting, camera lens, and the specific action taking place, e.g., low angle shot, cozy living room, warm orange lamp light, character laughing while pointing at a laptop screen)`;

    for (let i = 0; i < scenes.length; i++) {
      try {
        const aiResponse = await callAI(sysPrompt, `Scene Content: ${scenes[i].trim()}`, 0.2); 
        
        const parts = aiResponse.split("[English AI Prompt]");
        const krPlan = parts[0].replace("[한국어 씬 플랜]", "").trim();
        const enAction = parts[1] ? parts[1].trim() : "Action tags generation failed.";

        krOutput += `[ Scene ${i + 1} - 원문: ${scenes[i].trim()} ]\n${krPlan}\n--------------------\n`;
        elements.outputKR.value = krOutput;

        enOutput += `[ Scene ${i + 1} ]\n${fixedBasePrompt}, ${enAction.replace(/\n/g, ' ')}\n--------------------\n`;
        elements.outputEN.value = enOutput;
      } catch (e) {
        krOutput += `[ Scene ${i + 1} ]\nError: ${e.message}\n\n`;
        enOutput += `[ Scene ${i + 1} ]\nError: ${e.message}\n\n`;
      }
    }
    elements.generateScenesBtn.innerText = translations[lang].generateScenesBtn;
  });

  // 복사 기능
  elements.copyEN.addEventListener("click", () => {
    navigator.clipboard.writeText(elements.outputEN.value).then(() => {
      alert(elements.langSelect.value === "ko" ? "복사 완료!" : "Copied!");
    });
  });

  // --- 저승사자 랜덤 멘트 ---
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
