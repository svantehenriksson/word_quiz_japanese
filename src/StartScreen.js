import React, { useState } from 'react';
import { wordPairs } from './data';
import { levelDescriptions } from './LevelInfo';

const StartScreen = ({ currentLevel, onStart }) => {
  const [showWords, setShowWords] = useState(false);
  const wordsPerLevel = 10;
  const startIndex = currentLevel * wordsPerLevel;
  const endIndex = startIndex + wordsPerLevel;
  const wordsThisLevel = wordPairs.slice(startIndex, endIndex);

  console.log('Words for level', currentLevel + 1, ':', wordsThisLevel);

  const handleShowWords = () => setShowWords(!showWords);

  return (
    <div id="quiz">
      <h1>Fluenzo Level {currentLevel + 1}</h1>
      <div className="description" dangerouslySetInnerHTML={{ __html: levelDescriptions[currentLevel] }} />
      <div className="choices">
        <button onClick={onStart}>Aloita - Start</button>
        <button onClick={handleShowWords}>
          {showWords ? 'Piilota sanat - Hide words' : 'Näytä sanat ensin - Show words first'}
        </button>
      </div>
      {showWords && (
        <div style={{ marginTop: '30px', textAlign: 'left' }}>
          <h3>Sanat tässä tasossa:</h3>
          <ul>
            {wordsThisLevel.map((word, idx) => (
                <div key={idx}>
                    {idx + 1}. {word.finnish} – {word.english}
                </div>
                ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StartScreen;
