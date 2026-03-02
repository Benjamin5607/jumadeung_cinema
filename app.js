// 키 타입 감지
function detectKeyType(key){
  if(!key) return "unknown";
  if(key.startsWith("sk-")) return "openai";
  if(key.startsWith("gsk-")) return "groq";
  if(key.startsWith("gm-")) return "gemini";
  return "unknown";
}

// 모델 리스트 불러오기
async function fetchModels(key){
  const type = detectKeyType(key);
  if(type==="unknown") throw new Error("지원하지 않는 키 형식입니다.");

  let url="", headers={"Content-Type":"application/json"};
  if(type==="openai") { url="https://api.openai.com/v1/models"; headers["Authorization"]=`Bearer ${key}`; }
  else if(type==="groq") { url="https://api.groq.com/v1/models"; headers["Authorization"]=`Bearer ${key}`; }
  else if(type==="gemini") { url=`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`; }

  const res=await fetch(url,{method:"GET", headers});
  if(!res.ok) throw new Error(`${type} 서버 연결 실패 (Status:${res.status})`);
  const data=await res.json();
  let modelList=(type==="gemini"? data.models : data.data)||[];
  return modelList.map(m=>({id:m.id, name:m.id}));
}

// UI 엘리먼트
const loadModelsBtn=document.getElementById("loadModels");
const apiKeyInput=document.getElementById("apiKey");
const aiModelSelect=document.getElementById("aiModel");
const diaryInput=document.getElementById("diaryInput");
const generateScenesBtn=document.getElementById("generateScenes");
const promptOutput=document.getElementById("promptOutput");
const sceneCounter=document.getElementById("sceneCounter");

// 모델 불러오기
loadModelsBtn.addEventListener("click",async()=>{
  const key=apiKeyInput.value.trim();
  try{
    const models=await fetchModels(key);
    aiModelSelect.innerHTML="";
    models.forEach(m=>{
      const opt=document.createElement("option");
      opt.value=m.id; opt.text=m.name;
      aiModelSelect.appendChild(opt);
    });
  }catch(e){ alert(e.message); }
});

// 랜덤 저승사자 멘트
const grimQuotes=["오늘도 지나간 삶을 지켜보겠네…","너의 선택은 이미 정해져 있다…","조금만 더 노력해봐도 소용없지…"];
setInterval(()=>{
  document.getElementById("grim-quote").innerText=grimQuotes[Math.floor(Math.random()*grimQuotes.length)];
},5000);

// 씬 생성 (6초 단위)
generateScenesBtn.addEventListener("click",()=>{
  const text=diaryInput.value.trim();
  if(!text) return alert("일기를 입력해주세요!");
  const scenes=Math.ceil(text.length/50); // 임시 분할 로직
  let prompt="";
  for(let i=0;i<scenes;i++){
    prompt+=`Scene ${i+1} (0-${6*(i+1)}s)\n6초 영상 생성.\n내용: ${text.slice(i*50,(i+1)*50)}\n----------------\n`;
  }
  promptOutput.value=prompt;
  sceneCounter.innerText=`씬 수: ${scenes}`;
});
