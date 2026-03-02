document.addEventListener("DOMContentLoaded",()=>{
const langSelect=document.getElementById("langSelect");
const diary=document.getElementById("diary");
const videoStyle=document.getElementById("videoStyle");
const characterStyleSelect=document.getElementById("characterStyle");
const customStyleInput=document.getElementById("customStyle");
const characterDesc=document.getElementById("characterDesc");
const timelineMode=document.getElementById("timelineMode");
const apiKeyInput=document.getElementById("apiKey");
const aiModelSelect=document.getElementById("aiModel");
const generateBtn=document.getElementById("generateBtn");
const outputKR=document.getElementById("outputKR");
const outputEN=document.getElementById("outputEN");

characterStyleSelect.addEventListener("change",()=>{customStyleInput.style.display=characterStyleSelect.value==="custom"?"block":"none";});

// 키 유형 감지
function detectKeyType(key){
  if(key.startsWith("sk-")) return "openai";
  if(key.startsWith("gsk-")) return "groq";
  if(key.startsWith("gm-")) return "gemini";
  return "unknown";
}

// 서버별 모델 리스트 불러오기
async function fetchModels(key){
  const type=detectKeyType(key);
  if(type==="unknown") throw new Error("지원하지 않는 Key");
  let url="";
  if(type==="openai") url="https://api.openai.com/v1/models";
  else if(type==="groq") url="https://api.groq.com/v1/models";
  else if(type==="gemini") url="https://generativelanguage.googleapis.com/v1beta/models?key="+key;

  const res=await fetch(url,{headers:{Authorization:`Bearer ${key}`}});
  if(!res.ok) throw new Error(`${type} 서버 모델 불러오기 실패`);
  const data=await res.json();

  let list=[];
  if(type==="groq" || type==="openai") list=data.data||[];
  else if(type==="gemini") list=data.models||[];
  return list.map(m=>({id:m.id||m.name,name:m.id||m.name}));
}

// 모델 리스트 로드
document.getElementById("loadModels").addEventListener("click",async()=>{
  const key=apiKeyInput.value.trim();
  if(!key){alert("API Key 필요");return;}
  try{
    const models=await fetchModels(key);
    aiModelSelect.innerHTML="";
    models.forEach(m=>{const opt=document.createElement("option");opt.value=m.id;opt.text=m.name;aiModelSelect.appendChild(opt);});
  }catch(e){alert(e.message);}
});

// 씬 분할
function splitIntoScenes(text){
  if(!text)return[];
  return text.split(/[.!?]/).filter(s=>s.trim()!=="").map(s=>({sentences:[s.trim()],place:"미상",action:s.trim()}));
}

// AI 호출
async function callAI(scene){
  const modelId=aiModelSelect.value;
  const apiKey=apiKeyInput.value.trim();
  if(!apiKey) return "[API Key 필요]";
  if(!modelId) return "[모델 선택 필요]";
  const type=detectKeyType(apiKey);
  let url="";
  if(type==="openai") url=`https://api.openai.com/v1/chat/completions`;
  else if(type==="groq") url=`https://api.groq.com/v1/models/${modelId}/completions`;
  else if(type==="gemini") url=`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateMessage`;

  const payload={model:modelId,messages:[{role:"user",content:scene.sentences.join(" ")}],max_tokens:500};
  const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify(payload)});
  const data=await res.json();
  return data.choices?.[0]?.message?.content || "[AI 프롬프트 생성 실패]";
}

// 프롬프트 생성
generateBtn.addEventListener("click",async()=>{
  const scenes=splitIntoScenes(diary.value);
  let kr="",en="";
  for(let i=0;i<scenes.length;i++){
    const scene=scenes[i];
    const style=characterStyleSelect.value==="custom"?customStyleInput.value:characterStyleSelect.value;
    kr+=`Scene ${i+1} (${i*6}-${(i+1)*6}s)
스타일: ${videoStyle.value}
비주얼: ${style}
캐릭터: ${characterDesc.value}
장소: ${scene.place}
행동 특성: ${scene.action}
내용: ${scene.sentences.join(" ")}
----------------
`;
    const enPrompt=await callAI(scene);
    en+=`Scene ${i+1} (${i*6}-${(i+1)*6}s)\n${enPrompt}\n----------------\n`;
  }
  outputKR.value=kr;
  outputEN.value=en;
});
