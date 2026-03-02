// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 모델 리스트 프록시
app.get("/api/models", async (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).json({ error: "API key required" });

  let url = "";
  let headers = { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" };

  if (key.startsWith("sk-")) url = "https://api.openai.com/v1/models";
  else if (key.startsWith("gsk")) url = "https://api.groq.com/v1/models";
  else if (key.startsWith("gm-")) url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  else return res.status(400).json({ error: "Unsupported key type" });

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({ error: errData });
    }
    const data = await response.json();

    // 공통 모델 배열 정규화
    let models = [];
    if (key.startsWith("gm-")) models = data.models || [];
    else models = data.data || [];

    res.json({ models });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
