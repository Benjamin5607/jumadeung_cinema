import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

function App() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [checks, setChecks] = useState([]);
  const [artistName, setArtistName] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const handleArtistNameChange = (e) => {
    setArtistName(e.target.value);
  };

  const handleFinish = () => {
    setIsFinished(true);
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl mb-4'>마무리 다 했냐?</h1>
      <div className='flex flex-col items-center justify-center mb-4'>
        <input
          type='text'
          value={artistName}
          onChange={handleArtistNameChange}
          placeholder='Artist Name'
          className='mt-4 p-2 border border-gray-400 rounded-lg'
        />
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={handleFinish}
        >
          Finish
        </button>
      </div>
      {isFinished ? (
        <div className='text-2xl'>마무리 완료!</div>
      ) : (
        <div className='text-2xl'>아직 마무리 안 됨</div>
      )}
    </div>
  );
}

export default App;
