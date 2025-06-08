// QuizScreen.js
import React from 'react';

const QuizScreen = ({
  currentLevel,
  currentPair,
  choices,
  checkAnswer,
  feedback,
  exampleSentence,
  translationPopup,
  showNextButton,
  showQuestion,
  levelTouched,
  levelKnown,
  knownWords,
  flyingText
}) => {
  return (
    <div className="App">
      <h1>FLUENZO</h1>
      <h2>Level {currentLevel + 1}</h2>

      <div id="quiz">
        <div className="question">{currentPair ? `What is the Finnish word for "${currentPair.english}"?` : ''}</div>
        <div className="choices">
          {choices.map((choice) => (
            <button key={choice} onClick={() => checkAnswer(choice)}>
              {choice}
            </button>
          ))}
        </div>
        <p id="feedback">{feedback}</p>
        <p className="example-sentence">{exampleSentence}</p>
      </div>

      <div className="translation-popup" style={{ 
        display: translationPopup.display, 
        left: translationPopup.left, 
        top: translationPopup.top 
      }}>
        {translationPopup.text}
      </div>
      <button
        id="next-button"
        onClick={showQuestion}
        style={{ display: showNextButton ? 'inline-block' : 'none' }}
      >
        Next Word
      </button>

      <div id="progress-bar-container">
        <div
          className="progress-bar touched"
          style={{ width: `${(levelTouched / 10) * 100}%` }}
        ></div>
        <div
          className="progress-bar known"
          style={{ width: `${(levelKnown / 10) * 100}%` }}
        ></div>
      </div>
      <p id="progress-text">
        Words correct once: {levelTouched} / 10 <br />
        Words learnt on this level: {levelKnown} / 10 <br />
        Total words learnt: {knownWords} <br />
      </p>

      {flyingText && (
        <div
          className="flying-text"
          style={{
            left: `${flyingText.x}%`,
            top: `${flyingText.y}%`
          }}
        >
          {flyingText.text}
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
