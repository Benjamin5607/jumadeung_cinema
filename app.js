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
"지금 이 순간도 8초다.",
"엔딩은 이미 정해져 있다."
];

const characterStyleSelect = document.getElementById("characterStyle");
const customStyleInput = document.getElementById("customStyle");

characterStyleSelect.addEventListener("change", function(){
  customStyleInput.style.display = this.value === "custom" ? "block" : "none";
});

function splitIntoScenes(text){
  const sentences = text.split(/[.!?]/).filter(s => s.trim() !== "");
  let scenes=[];
  for(let i=0;i<sentences.length;i+=3){
    scenes.push(sentences.slice(i,i+3).join(". ") + ".");
  }
  return scenes;
}

document.getElementById("generateBtn").addEventListener("click", function(){
  const diary = document.getElementById("diary").value;
  const videoStyle = document.getElementById("videoStyle").value;
  const timelineMode = document.getElementById("timelineMode").checked;
  const charStyle = characterStyleSelect.value === "custom" ? customStyleInput.value : characterStyleSelect.value;
  const characterDesc = document.getElementById("characterDesc").value;

  let scenes = splitIntoScenes(diary);
  if(timelineMode && scenes.length > 900){ scenes=scenes.slice(0,900); }

  let finalText="";
  scenes.forEach((scene,index)=>{
    finalText+=`Scene ${index+1} (${index*8}-${(index+1)*8}s)
8초 영상 생성.
스타일:${videoStyle}
비주얼:${charStyle}
캐릭터:${characterDesc}
내용:${scene}
----------------
`;
  });

  document.getElementById("output").value=finalText;
  document.getElementById("sceneCount").innerText=`총 씬 수: ${scenes.length}개`;
  document.getElementById("totalDuration").innerText=`총 길이: ${(scenes.length*6/60).toFixed(1)}분`;
  document.getElementById("grimMessage").innerText=reaperQuotes[Math.floor(Math.random()*reaperQuotes.length)];
});

document.getElementById("copyBtn").addEventListener("click", function(){
  const textarea=document.getElementById("output");
  textarea.select();
  document.execCommand("copy");
  alert("복사 완료. Grok에 붙여넣으세요.");
});

});
