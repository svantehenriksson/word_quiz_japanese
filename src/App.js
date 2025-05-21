import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { wordPairs, wordTranslations } from './data'; // Import the data

const App = () => {
  const totalWords = 500;
  const [knownWords, setKnownWords] = useState(0);
  const [answers, setAnswers] = useState(new Array(wordPairs.length).fill(0)); // Initialize based on wordPairs length
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

  // Create refs for each word in the sentence
  const wordRefs = useRef([]);

  // Get random pair from wordPairs ensuring valid choices
  const getRandomPair = () => {
    const validIndices = answers
      .map((value, index) => (value >= 0 && value <= 2 ? index : -1))
      .filter((index) => index !== -1);

    if (validIndices.length === 0) {
      // If no valid answers, return a random word pair or handle empty wordPairs
      if (wordPairs.length > 0) {
        return wordPairs[Math.floor(Math.random() * wordPairs.length)];
      } else {
        return { english: 'N/A', finnish: 'N/A', exampleFI: 'N/A', exampleEN: 'N/A' };
      }
    }

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

  const checkAnswer = (choice) => {
    const beerSound = new Audio('/beer-can-open-sound-230903.mp3');  // Correct answer sound
    const mosquitoSound = new Audio('/flying-mosquito-105770.mp3');  // Incorrect answer sound
    mosquitoSound.volume = 1; // Set this to a value between 0 and 1 (e.g., 0.8 for louder)

    if (choice === currentPair.finnish) {
      setFeedback("Correct!");
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

  return (
    <div className="App">
      <h1>FLUENZO</h1>
      <h2>Opi 500 suomen sanaa nopeasti!</h2>

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
          id="progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p id="progress-text">Sanat {knownWords}/500</p>

      <div id="import-progress-form">
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
      </div>


    </div>
  );
};

export default App;
