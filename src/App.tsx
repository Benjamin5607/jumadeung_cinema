import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react-native';

const App = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [tools, setTools] = useState(['Grok', 'ChatGPT', 'DALL-E']);
  const [selectedTool, setSelectedTool] = useState('');
  const [checklist, setChecklist] = useState([]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
  };

  const handleConvert = () => {
    if (selectedTool === 'ChatGPT') {
      setOutputText(`Converted text using ChatGPT: ${inputText}`);
    } else if (selectedTool === 'DALL-E') {
      setOutputText(`Converted text using DALL-E: ${inputText}`);
    }
  };

  const handleAddToChecklist = () => {
    setChecklist([...checklist, inputText]);
    setInputText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
  };

  return (
    <div className='flex flex-col justify-center items-center h-screen w-screen bg-gray-200'>
      <div className='bg-white p-4 rounded-lg shadow-md w-1/2 h-1/2 flex flex-col justify-center items-center'>
        <input
          type='text'
          value={inputText}
          onChange={handleInputChange}
          className='w-full p-2 border border-gray-400 rounded-lg'
          placeholder='Enter text to convert'
        />
        <select
          value={selectedTool}
          onChange={(e) => handleToolSelect(e.target.value)}
          className='w-full p-2 border border-gray-400 rounded-lg mt-4'
        >
          <option value=''>Select a tool</option>
          {tools.map((tool) => (
            <option key={tool} value={tool}>{tool}</option>
          ))}
        </select>
        <button
          onClick={handleConvert}
          className='w-full p-2 bg-blue-500 text-white rounded-lg mt-4'
        >
          Convert
        </button>
        <button
          onClick={handleAddToChecklist}
          className='w-full p-2 bg-green-500 text-white rounded-lg mt-4'
        >
          Add to Checklist
        </button>
        <button
          onClick={handleCopy}
          className='w-full p-2 bg-purple-500 text-white rounded-lg mt-4'
        >
          Copy Output
        </button>
        <div className='mt-4'>Checklist:</div>
        <ul>
          {checklist.map((item, index) => (
            <li key={index} className='mt-2'>{item}</li>
          ))}
        </ul>
        <div className='mt-4'>Output:</div>
        <div className='w-full p-2 border border-gray-400 rounded-lg'>{outputText}</div>
      </div>
    </div>
  );
};

export default App;
