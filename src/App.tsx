import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

function App() {
  const [language, setLanguage] = useState('ko');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [diary, setDiary] = useState('');
  const [style, setStyle] = useState('');
  const [quotes, setQuotes] = useState(['Quote 1', 'Quote 2', 'Quote 3']);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [checklist, setChecklist] = useState([]);

  const handleQuoteClick = () => {
    setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleAddChecklist = () => {
    setChecklist((prevChecklist) => [...prevChecklist, { id: Date.now(), text: prompt }]);
    setPrompt('');
  };

  const handleRemoveChecklist = (id: number) => {
    setChecklist((prevChecklist) => prevChecklist.filter((item) => item.id !== id));
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="text-3xl font-bold mb-4">{language === 'ko' ? '영상 프롬프트를 입력하세요' : 'Enter video prompt'}</div>
      <textarea className="w-1/2 h-40 p-4 border border-gray-400 rounded" value={prompt} onChange={handlePromptChange} placeholder="Enter your prompt"></textarea>
      <div className="flex justify-center mb-4">
        <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={handleAddChecklist}>Add to Checklist</button>
      </div>
      <ul className="list-none">
        {checklist.map((item) => (
          <li key={item.id} className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium">{item.text}</span>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleRemoveChecklist(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="flex justify-center mb-4">
        <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={handleQuoteClick}>{quotes[quoteIndex]}</button>
      </div>
    </div>
  );
}

export default App;
