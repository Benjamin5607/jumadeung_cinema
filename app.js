document.addEventListener("DOMContentLoaded", function () {

const i18n = {
  ko: {
    title: "주마등 : 시네마",
    subtitle: "6초 인생 자동 타임라인 생성기 (무료 Groq 지원)",
    diaryLabel: "오늘의 일기",
    videoStyleLabel: "영상 스타일",
    characterStyleLabel: "캐릭터 스타일",
    characterDescLabel: "캐릭터 특징",
    generateBtn: "프롬프트 생성",
    outputKRLabel: "한글 프롬프트",
    outputENLabel: "영문 프롬프트",
    copyBtn: "복사하기",
    timelineMode: "🧠 2시간 자동 타임라인 모드",
    apiKeyPlaceholder: "여기에 API Key 입력",
    freeGrokLink: "무료 Groq API Key 발급: 여기서 신청",
    adTop: "상단 광고 영역",
    adBottom: "출력 아래 광고 영역"
  },
  en: {
    title: "Jumadeung : Cinema",
    subtitle: "6s Life Timeline Auto Generator (Free Groq Supported)",
    diaryLabel: "Today's Diary",
    videoStyleLabel: "Video Style",
    characterStyleLabel: "Character Style",
    characterDescLabel: "Character Description",
    generateBtn: "Generate Prompt",
    outputKRLabel: "Korean Prompt",
    outputENLabel: "English Prompt",
    copyBtn: "Copy",
    timelineMode: "🧠 2-hour Auto Timeline Mode",
    apiKeyPlaceholder: "Enter API Key here",
    freeGrokLink: "Get Free Groq API Key: Apply here",
    adTop: "Top Ad Slot",
    adBottom: "Bottom Ad Slot"
  }
};

const reaperQuotes = [
"이 장면도 결국 스쳐간다...",
"6초면 충분하지 않나?",
"모든 기억은 편집된다.",
"너의 인생은 지금 렌더링 중이다.",
"등불이 꺼지기 전, 다시 한번.",
"카메라는 항상 뒤에서 보고 있다.",
"이 또한 하나의 씬일 뿐.",
"흑백이 더 진짜다.",
"지금 이 순간도 6초다.",
"엔딩은 이미 정해져 있다."
];

const aiModels = {
  groq: { url:"https://api.groq.com/openai/v1/chat/completions", type:"completion" }, // 무료 Groq
  openai: { url:"https://api.openai.com/v1/completions", type:"completion" },
  gemini: { url:"https://gemini.googleapis.com/v1/completions", type:"completion" },
  azure: { url:"https://YOUR_AZURE_ENDPOINT.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/completions?api-version=2023-03-15-preview", type:"completion" },
  claude: { url:"https://api.anthropic.com/v1/complete", type:"completion" },
  hf: { url:"https://api-inference.huggingface.co/models/YOUR_MODEL", type:"text-generation" }
};

// 언어 변경
const langSelect = document.getElementById("langSelect");
langSelect.addEventListener("change",()=>updateUI(langSelect.value));

function updateUI(lang){
  const texts=i18n[lang];
  document.querySelector("h1").innerText = texts.title;
  document.querySelector(".subtitle").innerText = texts.subtitle;
  document.getElementById("diaryLabel").innerText = texts.diaryLabel;
  document.getElementById("videoStyleLabel").innerText = texts.videoStyleLabel;
  document.getElementById("characterStyleLabel").innerText = texts.characterStyleLabel;
  document.getElementById("characterDescLabel").innerText = texts.characterDescLabel;
  document.getElementById("generateBtn").innerText = texts.generateBtn;
  document.getElementById("outputKRLabel").innerText = texts.outputKRLabel;
  document.getElementById("outputENLabel").innerText = texts.outputENLabel;
  document.getElementById("copyKR").innerText = texts.copyBtn;
  document.getElementById("copyEN").innerText = texts.copyBtn;
  document.getElementById("apiKey").placeholder = texts.apiKeyPlaceholder;
  document.getElementById("freeGrokLink").innerHTML = `<a href="https://console.groq.com/keys" target="_blank">${texts.freeGrokLink}</a>`;
  document.getElementById("adTop").innerText = texts.adTop;
  document.getElementById("adBottom").innerText = texts.adBottom;
  document.querySelector("label[for=timelineMode]").innerText = texts.timelineMode;
}

// 초기 UI
updateUI("ko");

// 캐릭터 스타일 커스텀 표시
const characterStyleSelect=document.getElementById("characterStyle");
const customStyleInput=document.getElementById("customStyle");
characterStyleSelect.addEventListener("change",function(){
  customStyleInput.style.display=this.value==="custom"?"block":"none";
});

// 씬 분할
function splitIntoScenes(text){
  if(!text) return [];
  const sentences=text.split(/[.!?]/).filter(s=>s.trim()!=="");
  let scenes=[], currentScene={sentences:[], place:"", action:""};
  const placeKeywords=["회사","집","카페","공원","길","오피스","책상","폰부스","오두막","숲속"];
  const actionKeywords=["왔다갔다","일함","퇴근","걷","달리","앉","서","전화","읽","작성","쉬","웃","울"];
  sentences.forEach(sentence=>{
    let placeFound = placeKeywords.find(p=>sentence.includes(p));
    let actionFound = actionKeywords.find(a=>sentence.includes(a));
    if(placeFound && currentScene.sentences.length>0 && placeFound!==currentScene.place){
      scenes.push({...currentScene});
      currentScene={sentences:[sentence], place:placeFound, action: actionFound||""};
    } else {
      currentScene.sentences.push(sentence);
      if(placeFound) currentScene.place = placeFound;
      if(actionFound) currentScene.action = actionFound;
    }
  });
  if(currentScene.sentences.length>0) scenes.push(currentScene);
  return scenes;
}

const placeMap={회사:"office",집:"home",카페:"cafe",공원:"park",길:"street",오피스:"office",책상:"desk",폰부스:"phone booth",오두막:"cabin",숲속:"forest"};
const actionMap={서:"standing",앉:"sitting",걷:"walking slowly",왔다갔다:"walking back and forth",달리:"running quickly",웃:"laughing",울:"crying"};

async function callAI(scene,videoStyle,charStyle,charDesc){
  const model=document.getElementById("aiModel").value;
  const apiKey=document.getElementById("apiKey").value;
  if(!apiKey) return "[API Key가 필요합니다.]";
  const {url}=aiModels[model];
  const payload={model:"gpt-4",messages:[{role:"user",content:`
Convert diary scene into 6s English video prompt.
Diary Scene: "${scene.sentences.join(" ")}"
Style: ${videoStyle}
Visual: ${charStyle}
Character: ${charDesc}
Location: ${placeMap[scene.place]||"unknown"}
Action: ${actionMap[scene.action]||scene.sentences.join(" ")}
`}],max_tokens:500};
  const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify(payload)});
  const data=await res.json();
  return data.choices?.[0]?.message?.content || "[AI 프롬프트 생성 실패]";
}

const reaperMessage=document.getElementById("grimMessage");

document.getElementById("generateBtn").addEventListener("click", async function(){
  const diary=document.getElementById("diary").value;
  const videoStyle=document.getElementById("videoStyle").value;
  const charStyle=characterStyleSelect.value==="custom"?customStyleInput.value:characterStyleSelect.value;
  const charDesc=document.getElementById("characterDesc").value;
  const timelineMode=document.getElementById("timelineMode").checked;

  let scenes=splitIntoScenes(diary);
  if(timelineMode && scenes.length>1200) scenes=scenes.slice(0,1200);

  let finalKR="", finalEN="";
  for(let i=0;i<scenes.length;i++){
    const scene=scenes[i];
    finalKR+=`Scene ${i+1} (${i*6}-${(i+1)*6}s)
6초 영상 생성.
스타일: ${videoStyle}
비주얼: ${charStyle}
캐릭터: ${charDesc}
장소: ${scene.place||"미상"}
행동 특성: ${scene.action||scene.sentences.join(" ")}
내용: ${scene.sentences.join(" ")}
----------------
`;
    const enPrompt=await callAI(scene,videoStyle,charStyle,charDesc);
    finalEN+=`Scene ${i+1} (${i*6}-${(i+1)*6}s)\n${enPrompt}\n----------------\n`;
  }

  document.getElementById("outputKR").value=finalKR;
  document.getElementById("outputEN").value=finalEN;
  document.getElementById("sceneCount").innerText=`총 씬 수: ${scenes.length}개`;
  document.getElementById("totalDuration").innerText=`총 길이: ${(scenes.length*6/60).toFixed(1)}분`;
  reaperMessage.innerText=reaperQuotes[Math.floor(Math.random()*reaperQuotes.length)];
});

// 복사 버튼
document.getElementById("copyKR").addEventListener("click",()=>{const t=document.getElementById("outputKR");t.select();document.execCommand("copy");alert("한글 프롬프트 복사 완료");});
document.getElementById("copyEN").addEventListener("click",()=>{const t=document.getElementById("outputEN");t.select();document.execCommand("copy");alert("영문 프롬프트 복사 완료");});

});
