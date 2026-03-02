document.addEventListener("DOMContentLoaded", function () {

  const characterStyleSelect = document.getElementById("characterStyle");
  const customStyleInput = document.getElementById("customStyle");
  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");

  // 캐릭터 스타일 토글
  characterStyleSelect.addEventListener("change", function () {
    if (this.value === "custom") {
      customStyleInput.style.display = "block";
    } else {
      customStyleInput.style.display = "none";
    }
  });

  // 텍스트를 8초 씬 단위로 분할
  function splitIntoScenes(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== "");
    let scenes = [];
    for (let i = 0; i < sentences.length; i += 3) {
      scenes.push(sentences.slice(i, i + 3).join(". ") + ".");
    }
    return scenes;
  }

  // 씬 분할 + 프롬프트 생성
  generateBtn.addEventListener("click", function () {
    const diary = document.getElementById("diary").value;
    const videoStyle = document.getElementById("videoStyle").value;
    const characterStyleSelectVal = characterStyleSelect.value;
    const customStyle = customStyleInput.value;
    const characterDesc = document.getElementById("characterDesc").value;

    const characterStyle = characterStyleSelectVal === "custom" ? customStyle : characterStyleSelectVal;

    const scenes = splitIntoScenes(diary);

    let finalText = "";
    scenes.forEach((scene, index) => {
      finalText += `
Scene ${index + 1} (${index * 8}-${(index + 1) * 8}s)

8초 길이 영상 생성.
스타일: ${videoStyle}
비주얼 스타일: ${characterStyle}
캐릭터: ${characterDesc}

장면 내용:
${scene}

카메라 워킹과 감정 중심 연출.
-----------------------
`;
    });

    document.getElementById("output").value = finalText;
  });

  // 프롬프트 복사
  copyBtn.addEventListener("click", function () {
    const textarea = document.getElementById("output");
    textarea.select();
    document.execCommand("copy");
    alert("복사 완료! Grok에 붙여넣으세요.");
  });

});
