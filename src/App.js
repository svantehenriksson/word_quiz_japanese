import React, { useState, useEffect, useRef, useMemo } from "react";
import "./App.css";
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { wordPairs, wordTranslations } from './data'; // Import the data
import { congratulatoryMessages } from './congrats_messages'; // Import the congratulatory messages

import CongratsScreen from './CongratsScreen';


const App = () => {
  const totalWords = 500;

  const [currentLevel, setCurrentLevel] = useState(0); // 0 = Words 1–25

  // We'll split the 500 words into 20 levels of 25 words each
  // Variables introduced for style and in case we want to shorten levels later
 
  const wordsPerLevel = 25;
  const totalLevels = Math.ceil(wordPairs.length / wordsPerLevel);
  const start = currentLevel * wordsPerLevel;
  const end = start + wordsPerLevel;

  const levelWordPairs = useMemo(() => {
    const start = currentLevel * wordsPerLevel;
    const end = start + wordsPerLevel;
    return wordPairs.slice(start, end);
  }, [currentLevel]);

  const [flyingText, setFlyingText] = useState(null);

  const [knownWords, setKnownWords] = useState(0);
  const [answers, setAnswers] = useState(new Array(wordPairs.length).fill(0)); // Initialize based on wordPairs length
  const levelAnswers = answers.slice(start, end);
  const [currentPair, setCurrentPair] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressInput, setProgressInput] = useState("");
  const [choices, setChoices] = useState([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [translationPopup, setTranslationPopup] = useState({
    display: 'none', 
    text: '',
    left: '0px',
    top: '0px'
  });

  const navigate = useNavigate();

  const [musicStarted, setMusicStarted] = useState(false);

  const startMusic = () => {
    const audio = new Audio("/forest.mp3");
    audio.loop = true;
    audio.volume = 0.7;
    audio.play();
    setMusicStarted(true);
    console.log("Music with license CC-BY-3.0 by syncopika from https://opengameart.org/content/forest");
  };

  // Create refs for each word in the sentence
  const wordRefs = useRef([]);

  // Get random pair from wordPairs ensuring valid choices

  // Now we hardcode the levels here with the 25 coefficients,
  // should program this with better style:

  const getRandomPair = () => {
    const validIndices = levelWordPairs
      .map((_, index) => index)
      .filter((i) => answers[currentLevel * 25 + i] <= 2);
  
    if (validIndices.length === 0) {
      return levelWordPairs[Math.floor(Math.random() * levelWordPairs.length)];
    }
  
    const indexInLevel = validIndices[Math.floor(Math.random() * validIndices.length)];
    return levelWordPairs[indexInLevel];
  
    const randomIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
    return wordPairs[randomIndex];
  };
  

  // Shuffle choices and ensure correct answer is in options
  const generateChoices = (correctAnswer) => {
    const shuffledChoices = wordPairs
      .map((pair) => pair.finnish)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    if (!shuffledChoices.includes(correctAnswer)) {
      shuffledChoices[Math.floor(Math.random() * shuffledChoices.length)] = correctAnswer;
    }

    return shuffledChoices;
  };

  const showQuestion = () => {
    const pair = getRandomPair();
    setCurrentPair(pair);

    const correctAnswer = pair.finnish;
    setChoices(generateChoices(correctAnswer));

    setFeedback("");
    setExampleSentence("");
    setShowNextButton(false); // Hide "Next Word" button initially
    wordRefs.current = []; // Clear the refs on each question
  };

  // Check if the current level is complete, used inside checkAnswer if correct:
  const isLevelComplete = () => {
    const levelAnswers = answers.slice(start, end);

    return levelAnswers.every((value) => value >= 3);
  };

  const checkAnswer = (choice) => {
    const beerSound = new Audio('/beer-can-open-sound-230903.mp3');  // Correct answer sound
    const mosquitoSound = new Audio('/flying-mosquito-105770.mp3');  // Incorrect answer sound
    mosquitoSound.volume = 1; // Set this to a value between 0 and 1 (e.g., 0.8 for louder)

    if (musicStarted === false) {
      startMusic();
    }

    if (choice === currentPair.finnish) {
      setFeedback("Correct!");
      
      // Randomize congrats and show flying text
      const randomMsg = congratulatoryMessages[Math.floor(Math.random() * congratulatoryMessages.length)];

      const randomX = Math.floor(Math.random() * 80 + 10); // 10%–90%
      const randomY = Math.floor(Math.random() * 60 + 10); // 10%–70%
      setFlyingText({
        text: randomMsg,
        x: randomX,
        y: randomY
      });
      setTimeout(() => setFlyingText(null), 3000);

      if (isLevelComplete()) {
        navigate('/CongratsScreen', { state: { completedLevel: currentLevel } });
      }
      
      


      setAnswers(
        answers.map((answer, index) =>
          index === wordPairs.indexOf(currentPair) ? answer + 1 : answer
        )
      );
      setKnownWords(
        answers.filter((answer) => answer >= 3).length
      );
      beerSound.play(); // Play the correct answer sound
    } else {
      setFeedback(`Incorrect! The correct answer is "${currentPair.finnish}".`);
      setAnswers(
        answers.map((answer, index) =>
          index === wordPairs.indexOf(currentPair) ? 0 : answer
        )
      );
      mosquitoSound.play(); // Play the incorrect answer sound
      setTimeout(() => {
        mosquitoSound.pause();
        mosquitoSound.currentTime = 0;  // Reset the mosquito sound after it has played
      }, 7000);  // Adjust the delay if needed
    }
    updateProgress();
    showExampleSentence();
    setShowNextButton(true);  // Show the "Next Word" button
  };

  const showExampleSentence = () => {
    const words = currentPair.exampleFI.split(" ");
    setExampleSentence(
      words.map((word, index) => {
        wordRefs.current[index] = React.createRef(); // Attach ref for each word
        return (
          <span
            key={index}
            ref={wordRefs.current[index]} // Use the ref for each word
            onMouseOver={() => showTranslationPopup(word, wordRefs.current[index])}
            onMouseOut={hideTranslationPopup}
            className="example-word"
          >
            {word}{" "}
          </span>
        );
      })
    );
  };

  const showTranslationPopup = (word, wordRef) => {
    const cleanedWord = word.trim().replace(/[.,!?;:]$/, "");
    const translation = wordTranslations[cleanedWord] || "Translation not found";
    
    const rect = wordRef.current.getBoundingClientRect(); // Get the position of the hovered word

    setTranslationPopup({
      display: 'block',
      left: rect.left + window.pageXOffset + 'px',
      top: rect.bottom + window.pageYOffset + 5 + 'px',
      text: `${cleanedWord} — ${translation}`
    });
  };

  const hideTranslationPopup = () => {
    setTranslationPopup({
      display: 'none',
      text: ''
    });
  };

  const updateProgress = () => {
    const percentage = (knownWords / totalWords) * 100;
    setProgress(percentage);
  };

  const importProgress = () => {
    const value = parseInt(progressInput, 10);
    if (isNaN(value) || value < 0 || value > 500) {
      alert("Please enter an integer between 0 and 500.");
    } else {
      const newAnswers = new Array(totalWords).fill(0);
      for (let i = 0; i < value; i++) {
        newAnswers[i] = 3;
      }
      setAnswers(newAnswers);
      setKnownWords(newAnswers.filter((answer) => answer >= 3).length);
      updateProgress();
    }
  };

  useEffect(() => {
    if (wordPairs.length > 0) {
      showQuestion();
    } else {
      console.error("No word pairs available.");
    }
  }, [wordPairs]);

  const levelKnown = levelAnswers.filter((v) => v >= 3).length;
  const levelTouched = levelAnswers.filter((v) => v >= 1).length; 


  return (
    <div className="App">
      <h1>FLUENZO</h1>
      {/*<h2>Opi 500 suomen sanaa nopeasti!</h2>*/}   

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
          style={{ width: `${(levelTouched / wordsPerLevel) * 100}%` }}
        ></div>
        <div
          className="progress-bar known"
          style={{ width: `${(levelKnown / wordsPerLevel) * 100}%` }}
        ></div>
      </div>
      <p id="progress-text">
      Words correct once: {levelTouched} / 25 <br />
      Words learnt on this level: {levelKnown} / 25 <br />
      Total words learnt: {knownWords} <br />
      </p>

{/*
      <div id="import-progress-form" className="level-changer">
        <button 
          onClick={() => setCurrentLevel((prev) => Math.max(prev - 1, 0))} 
          disabled={currentLevel === 0}
        >
          -
        </button>
        <span>     Level {currentLevel + 1}     </span>
        <button 
          onClick={() => setCurrentLevel((prev) => Math.min(prev + 1, 19))} 
          disabled={currentLevel === 19}
        >
          +
        </button>
      </div>   */}

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

    {/*  <div id="import-progress-form">
        <p>Import progress from earlier session</p>
        <input
          type="number"
          min="0"
          max="500"
          value={progressInput}
          onChange={(e) => setProgressInput(e.target.value)}
          placeholder="#Words (0-500)"
        />
        <button onClick={importProgress}>Import</button>
      </div> */}


    </div>
  );
};

export default App;
