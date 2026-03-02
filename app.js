function generatePrompt() {
  const diary = document.getElementById("diary").value;
  const style = document.getElementById("style").value;
  const character = document.getElementById("character").value;
  const mood = document.getElementById("mood").value;

  const finalPrompt = `
8초 길이의 시네마틱 영상 생성.

[기본 조건]
- 길이: 정확히 8초
- 흑백 기반
- 감정 중심 연출
- 대사 없음

[장면 내용]
${diary}

[캐릭터]
${character}

[영상 스타일]
${style}

[연출 요소]
${mood}

카메라 워킹과 감정 흐름이 자연스럽게 이어지도록 구성.
영화 한 장면처럼 디테일하게 묘사.
`;

  document.getElementById("result").value = finalPrompt;
}

function copyPrompt() {
  const textarea = document.getElementById("result");
  textarea.select();
  document.execCommand("copy");
  alert("복사 완료. Grok에 붙여넣으세요.");
}
