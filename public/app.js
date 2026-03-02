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

  characterStyleSelect.addEventListener("change",()=>{
    customStyleInput.style.display=characterStyleSelect.value==="custom"?"block":"none";
  });

  // 모델 리스트 로드 (프록시)
  document.getElementById("loadModels").addEventListener("click",async()=>{
    const key=apiKeyInput.value.trim();
    if(!key){alert("API Key 필요");return;}
    try{
      const res=await fetch(`/api/models?key=${key}`);
      const data=await res.json();
      if(data.error){alert(data.error);return;}
      aiModelSelect.innerHTML="";
      data.models.forEach(m=>{
        const opt=document.createElement("option");
        opt.value=m.id;
        opt.text=m.name || m.id;
        aiModelSelect.appendChild(opt);
      });
    }catch(e){alert("모델 불러오기 실패: "+e.message);}
  });

  function splitIntoScenes(text){
    if(!text) return [];
    return text.split(/[.!?]/).filter(s=>s.trim()!=="").map(s=>({sentences:[s.trim()],place:"미상",action:s.trim()}));
  }

  async function callAI(scene){
    const modelId=aiModelSelect.value;
    const apiKey=apiKeyInput.value.trim();
    if(!apiKey) return "[API Key 필요]";
    if(!modelId) return "[모델 선택 필요]";

    // 서버 프록시 사용
    try{
      const res=await fetch("/api/models?key="+apiKey); // 실제는 서버에서 POST 처리해야 하지만 프록시 구조 유지
      return "[영문 프롬프트 생성 예시]"; // 임시: 실제 GPT 호출은 서버 POST에서 처리
    }catch(e){
      return "[AI 프롬프트 생성 실패]";
    }
  }

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
});
