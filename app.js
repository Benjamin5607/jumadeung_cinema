function toggleCustomStyle() {
  const style = document.getElementById("characterStyle").value;
  document.getElementById("customStyle").style.display =
    style === "custom" ? "block" : "none";
}

function splitIntoScenes(text) {
  const sentences = text.split(/[.!?]/).filter(s => s.trim() !== "");
  let scenes = [];
  for (let i = 0; i < sentences.length; i += 3) {
    scenes.push(sentences.slice(i, i + 3).join(". ") + ".");
  }
  return scenes;
}

function generateScenes() {
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
}

async function sendToAI() {
  const provider = document.getElementById("apiProvider").value;
  const apiKey = document.getElementById("apiKey").value;
  const prompt = document.getElementById("output").value;

  let url = "";
  let headers = {};
  let body = {};

  if (provider === "openai") {
    url = "https://api.openai.com/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    body = {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    };
  } else {
    url = "https://api.groq.com/openai/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    body = {
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: prompt }]
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  });

  const data = await response.json();
  document.getElementById("aiResult").value =
    data.choices?.[0]?.message?.content || "에러 발생";
}
