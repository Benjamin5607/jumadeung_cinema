import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

function App() {
  const [message, setMessage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleGenerateText = () => {
    if (!prompt) return;
    setLoading(true);
    const token = 'YOUR_API_TOKEN'; // 실제 API 토큰을 사용하세요
    const apiEndpoint = 'https://api.example.com/llama'; // 실제 API 엔드포인트를 사용하세요
    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt })
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.response) {
        setResponse(data.response);
      } else {
        setError('Invalid response from API');
      }
    })
    .catch(error => {
      setError(error.message);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center bg-gray-100'>
      <div className='w-1/2 h-1/2 bg-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center'>
        <h1 className='text-2xl font-bold mb-4'>LLaMA API Demo</h1>
        <textarea
          className='w-full h-1/2 p-2 border border-gray-300 rounded-lg'
          value={prompt}
          onChange={handlePromptChange}
          placeholder='Enter your prompt here...'
        ></textarea>
        <button
          className='w-full h-12 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700'
          onClick={handleGenerateText}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Text'}
        </button>
        <div className='w-full h-1/2 p-2 mt-4 border border-gray-300 rounded-lg'>
          <h2 className='text-xl font-bold mb-2'>Response:</h2>
          {error ? (
            <p className='text-red-500'>{error}</p>
          ) : (
            <p>{response}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;