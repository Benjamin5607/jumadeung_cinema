const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

app.get("/api/:service/models", async (req,res)=>{
  const key = req.headers.authorization?.split(" ")[1];
  if(!key) return res.status(400).json({error:"API Key 필요"});
  let url = "";
  const service = req.params.service;
  if(service==="openai") url="https://api.openai.com/v1/models";
  else if(service==="groq") url="https://api.groq.com/v1/models";
  else if(service==="gemini") url=`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const response = await fetch(url,{headers:{"Authorization":`Bearer ${key}`}});
  const data = await response.json();
  res.json(data);
});

app.post("/api/ai", async (req,res)=>{
  const {apiKey,scene} = req.body;
  const model = req.query.model;
  // 서버별 AI 호출 로직 추가 (Groq/OpenAI/Gemini 분기)
  // 예: fetch(url,{method:"POST", headers, body:JSON.stringify({...})})
  res.json({result:`[더미 AI 응답] for model ${model}`});
});

app.listen(3000,()=>console.log("Proxy server running on http://localhost:3000"));
