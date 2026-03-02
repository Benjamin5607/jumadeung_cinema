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

characterStyleSelect.addEventListener("change", ()=>{
    customStyleInput.style.display = characterStyleSelect.value==="custom"?"block":"none";
});

function detectKeyType(key){
  if(key.startsWith("sk-")) return "openai";
  if(key.startsWith("gq-")) return "groq";
  if(key.startsWith("gm-")) return "gemini";
  return "unknown";
}

async function fetchModels(key){
  const type = detectKeyType(key);
  if(type==="unknown") throw new Error("지원하지 않는 Key");

  let url = "";
  let headers = {"Content-Type":"application/json"};
  if(type==="openai") url="/api/openai/models";
  else if(type==="groq") url="/api/groq/models";
  else if(type==="gemini") url="/api/gemini/models";

  headers["Authorization"] = `Bearer ${key}`;
  const res = await fetch(url,{headers});
  if(!res.ok) throw new Error(`${type} 모델 불러오기 실패`);

  const data = await res.json();
  return (data.data||data.models||[]).map(m=>({id:m.id,name:m.id}));
}

document.getElementById("loadModels").addEventListener("click",async ()=>{
  try{
    const models = await fetchModels(apiKeyInput.value.trim());
    aiModelSelect.innerHTML="";
    models.forEach(m=>{
      const opt = document.createElement("option");
      opt.value = m.id; opt.text = m.name;
      aiModelSelect.appendChild(opt);
    });
  }catch(e){alert(e.message);}
});

function splitIntoScenes(text){
  if(!text) return [];
  return text.split(/[.!?]/).filter(s=>s.trim()!=="").map(s=>({sentences:[s.trim()],place:"미상",action:s.trim()}));
}

async function callAI(scene){
  const modelId = aiModelSelect.value;
  const apiKey = apiKeyInput.value.trim();
  if(!apiKey) return "[API Key 필요]";
  if(!modelId) return "[모델 선택 필요]";

  const res = await fetch(`/api/ai?model=${modelId}`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({apiKey,scene})
  });
  const data = await res.json();
  return data.result || "[AI 프롬프트 생성 실패]";
}

generateBtn.addEventListener("click",async ()=>{
  const scenes = splitIntoScenes(diary.value);
  let kr="",en="";
  for(let i=0;i<scenes.length;i++){
    const scene = scenes[i];
    const style = characterStyleSelect.value==="custom"?customStyleInput.value:characterStyleSelect.value;
    kr+=`Scene ${i+1} (${i*6}-${(i+1)*6}s)
스타일: ${videoStyle.value}
비주얼: ${style}
캐릭터: ${characterDesc.value}
장소: ${scene.place}
행동 특성: ${scene.action}
내용: ${scene.sentences.join(" ")}
----------------
`;
    const enPrompt = await callAI(scene);
    en+=`Scene ${i+1} (${i*6}-${(i+1)*6}s)\n${enPrompt}\n----------------\n`;
  }
  outputKR.value = kr;
  outputEN.value = en;
});
