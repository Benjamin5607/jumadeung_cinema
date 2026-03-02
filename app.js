document.addEventListener("DOMContentLoaded", function () {

  const characterStyleSelect = document.getElementById("characterStyle");
  const customStyleInput = document.getElementById("customStyle");
  const generateBtn = document.querySelector("button");
  const sendBtn = document.querySelectorAll("button")[1];

  // 스타일 토글
  characterStyleSelect.addEventListener("change", function () {
    if (this.value === "custom") {
      customStyleInput.style.display = "block";
    } else {
      customStyleInput.style.display = "none";
    }
  });

  // 씬 분할 함수
  function splitIntoScenes(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim() !== "");
    let scenes = [];
    for (let i = 0; i < sentences.length; i += 3) {
      scenes.push(sentences.slice(i, i + 3).join(". ") + ".");
    }
    return scenes;
  }

  // 프롬프트 생성
  generateBtn.addEventListener("click", function () {

    const diary = document.getElementById("diary").value;
    const videoStyle = document.getElementById("videoStyle").value;
    const characterStyleSelect = document.getElementById("characterStyle").value;
    const customStyle = document.getElementById("customStyle").value;
    const characterDesc = document.getElementById("characterDesc").value;

    const characterStyle = characterStyleSelect === "custom"
      ? customStyle
      : characterStyleSelect;

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

  // BYOK API 전송
  sendBtn.addEventListener("click", async function () {

    const provider = document.getElementById("apiProvider").value;
    const apiKey = document.getElementById("apiKey").value;
    const prompt = document.getElementById("output").value;

    let url = provider === "openai"
      ? "https://api.openai.com/v1/chat/completions"
      : "https://api.groq.com/openai/v1/chat/completions";

    let model = provider === "openai"
      ? "gpt-4o-mini"
      : "mixtral-8x7b-32768";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    document.getElementById("aiResult").value =
      data.choices?.[0]?.message?.content || "에러 발생";
  });

});
