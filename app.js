document.addEventListener("DOMContentLoaded", function () {

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

const characterStyleSelect = document.getElementById("characterStyle");
const customStyleInput = document.getElementById("customStyle");
characterStyleSelect.addEventListener("change", function(){
  customStyleInput.style.display = this.value === "custom" ? "block" : "none";
});

// 장면 분할 로직
function splitIntoScenes(text){
  if(!text) return [];
  const sentences = text.split(/[.!?]/).filter(s => s.trim() !== "");
  let scenes=[];
  let currentScene = {sentences:[], place:"", action:""};

  const placeKeywords = ["회사","집","카페","공원","길","오피스","책상","폰부스","오두막","숲속"];
  const actionKeywords = ["왔다갔다","일함","퇴근","걷","달리","앉","서","전화","읽","작성","쉬","웃","울"];

  sentences.forEach(sentence=>{
    let placeFound = placeKeywords.find(p=>sentence.includes(p));
    let actionFound = actionKeywords.find(a=>sentence.includes(a));

    if(placeFound && currentScene.sentences.length>0 && placeFound !== currentScene.place){
      scenes.push({...currentScene});
      currentScene = {sentences:[sentence], place:placeFound, action: actionFound||""};
    } else {
      currentScene.sentences.push(sentence);
      if(placeFound) currentScene.place = placeFound;
      if(actionFound) currentScene.action = actionFound;
    }
  });
  if(currentScene.sentences.length>0) scenes.push(currentScene);
  return scenes;
}

// 장소/행동 영어 매핑 (간단 fallback)
const placeMap = {
  "회사":"office","집":"home","카페":"cafe","공원":"park","길":"street",
  "오피스":"office","책상":"desk","폰부스":"phone booth","오두막":"cabin","숲속":"forest"
};
const actionMap = {
  "서":"standing","앉":"sitting","걷":"walking slowly","왔다갔다":"walking back and forth",
  "달리":"running quickly","웃":"laughing","울":"crying"
};

// AI API 호출
async function generateEnglishPrompt(scene, videoStyle, charStyle, charDesc){
  const apiUrl = document.getElementById("apiUrl").value;
  const apiKey = document.getElementById("apiKey").value;

  if(!apiUrl || !apiKey) return "[영문 프롬프트 생성을 위해 API URL과 Key가 필요합니다.]";

  const payload = {
    prompt: `Convert this diary scene into a 6-second English video prompt.
Diary Scene: "${scene.sentences.join(" ")}"
Style: ${videoStyle}
Visual: ${charStyle}
Character: ${charDesc}
Location: ${placeMap[scene.place] || "unknown"}
Action: ${actionMap[scene.action] || scene.sentences.join(" ")}
Split into 6-second scene.
`,
    max_tokens:500
  };

  const response = await fetch(apiUrl, {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${apiKey}`
    },
    body:JSON.stringify(payload)
  });

  const data = await response.json();
  return data.text || "[AI에서 프롬프트를 생성하지 못했습니다.]";
}

// 프롬프트 생성
document.getElementById("generateBtn").addEventListener("click", async function(){
  const diary = document.getElementById("diary").value;
  const videoStyle = document.getElementById("videoStyle").value;
  const charStyle = characterStyleSelect.value === "custom" ? customStyleInput.value : characterStyleSelect.value;
  const charDesc = document.getElementById("characterDesc").value;
  const timelineMode = document.getElementById("timelineMode").checked;

  let scenes = splitIntoScenes(diary);
  if(timelineMode && scenes.length>1200) scenes=scenes.slice(0,1200);

  let finalKR="", finalEN="";

  for(let i=0;i<scenes.length;i++){
    const scene=scenes[i];
    finalKR+=`Scene ${i+1} (${i*6}-${(i+1)*6}s)
6초 영상 생성.
스타일: ${videoStyle}
비주얼: ${charStyle}
캐릭터: ${charDesc}
장소: ${scene.place || "미상"}
행동 특성: ${scene.action || scene.sentences.join(" ")}
내용: ${scene.sentences.join(" ")}
----------------
`;

    const enPrompt = await generateEnglishPrompt(scene, videoStyle, charStyle, charDesc);
    finalEN+=`Scene ${i+1} (${i*6}-${(i+1)*6}s)\n${enPrompt}\n----------------\n`;
  }

  document.getElementById("outputKR").value=finalKR;
  document.getElementById("outputEN").value=finalEN;
  document.getElementById("sceneCount").innerText=`총 씬 수: ${scenes.length}개`;
  document.getElementById("totalDuration").innerText=`총 길이: ${(scenes.length*6/60).toFixed(1)}분`;
  document.getElementById("grimMessage").innerText=reaperQuotes[Math.floor(Math.random()*reaperQuotes.length)];
});

// 복사 버튼
document.getElementById("copyKR").addEventListener("click", function(){
  const t=document.getElementById("outputKR");
  t.select(); document.execCommand("copy"); alert("한글 프롬프트 복사 완료");
});
document.getElementById("copyEN").addEventListener("click", function(){
  const t=document.getElementById("outputEN");
  t.select(); document.execCommand("copy"); alert("영문 프롬프트 복사 완료");
});

});
