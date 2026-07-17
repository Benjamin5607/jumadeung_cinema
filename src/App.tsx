import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

const App = () => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleCompletion = () => {
    setIsCompleted(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">마무리 다 했냐?</h1>
      {isCompleted ? (
        <div className="bg-green-100 p-4 rounded flex items-center">
          <CheckCircle size={20} className="mr-2" />
          <span>네, 마무리했습니다.</span>
        </div>
      ) : (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleCompletion}>
          마무리했습니다.
        </button>
      )}
    </div>
  );
};

export default App;