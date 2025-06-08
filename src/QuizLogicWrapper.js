import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';

import './App.css';

import { wordPairs, wordTranslations } from './data';
import { congratulatoryMessages } from './congrats_messages';
import QuizScreen from './QuizScreen';

const QuizLogicWrapper = () => {
  const totalWords = 500;
  const wordsPerLevel = 25;
  const [currentLevel, setCurrentLevel] = useState(0);
  const [knownWords, setKnownWords] = useState(0);
  const [answers, setAnswers] = useState(new Array(wordPairs.length).fill(0));
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
  const [flyingText, setFlyingText] = useState(null);
  const [musicStarted, setMusicStarted] = useState(false);

  const navigate = useNavigate();
  const wordRefs = useRef([]);

  const start = currentLevel * wordsPerLevel;
  const end = start + wordsPerLevel;
  const levelAnswers = answers.slice(start, end);
  const levelKnown = levelAnswers.filter((v) => v >= 3).length;
  const levelTouched = levelAnswers.filter((v) => v >= 1).length;

  const levelWordPairs = useMemo(() => {
    return wordPairs.slice(start, end);
  }, [currentLevel]);

  const startMusic = () => {
    const audio = new Audio("/forest.mp3");
    audio.loop = true;
    audio.volume = 0.7;
    audio.play();
    setMusicStarted(true);
    console.log("Music with license CC-BY-3.0 by syncopika from https://opengameart.org/content/forest");
  };

  const getRandomPair = () => {
    const validIndices = levelWordPairs
      .map((_, index) => index)
      .filter((i) => answers[currentLevel * 25 + i] <= 2);

    if (validIndices.length === 0) {
      return levelWordPairs[Math.floor(Math.random() * levelWordPairs.length)];
    }

    const indexInLevel = validIndices[Math.floor(Math.random() * validIndices.length)];
    return levelWordPairs[indexInLevel];
  };

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
    setChoices(generateChoices(pair.finnish));
    setFeedback("");
    setExampleSentence("");
    setShowNextButton(false);
    wordRefs.current = [];
  };

  const isLevelComplete = () => {
    const levelAnswers = answers.slice(start, end);
    console.log("This is what isLevelComplete returns:", levelAnswers.every((value) => value >= 3));
    return levelAnswers.every((value) => value >= 3);
  };

  const checkAnswer = (choice) => {
    const beerSound = new Audio('/beer-can-open-sound-230903.mp3');
    const mosquitoSound = new Audio('/flying-mosquito-105770.mp3');
    mosquitoSound.volume = 1;

    if (!musicStarted) {
      startMusic();
    }

    if (choice === currentPair.finnish) {
      setFeedback("Correct!");

      const randomMsg = congratulatoryMessages[Math.floor(Math.random() * congratulatoryMessages.length)];
      const randomX = Math.floor(Math.random() * 80 + 10);
      const randomY = Math.floor(Math.random() * 60 + 10);
      setFlyingText({ text: randomMsg, x: randomX, y: randomY });
      setTimeout(() => setFlyingText(null), 3000);

      const newAnswers = answers.map((answer, index) =>
        index === wordPairs.indexOf(currentPair) ? answer + 1 : answer
      );
      setAnswers(newAnswers);
      setKnownWords(newAnswers.filter((answer) => answer >= 3).length);
      beerSound.play();

      if (isLevelComplete()) {
        console.log("Level complete!");
        navigate('/CongratsScreen', { state: { completedLevel: currentLevel } });
      }
    } else {
      setFeedback(`Incorrect! The correct answer is "${currentPair.finnish}".`);
      setAnswers(answers.map((answer, index) =>
        index === wordPairs.indexOf(currentPair) ? 0 : answer
      ));
      mosquitoSound.play();
      setTimeout(() => {
        mosquitoSound.pause();
        mosquitoSound.currentTime = 0;
      }, 7000);
    }

    updateProgress();
    showExampleSentence();
    setShowNextButton(true);
  };

  const showExampleSentence = () => {
    const words = currentPair.exampleFI.split(" ");
    setExampleSentence(
      words.map((word, index) => {
        wordRefs.current[index] = React.createRef();
        return (
          <span
            key={index}
            ref={wordRefs.current[index]}
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
    const rect = wordRef.current.getBoundingClientRect();

    setTranslationPopup({
      display: 'block',
      left: rect.left + window.pageXOffset + 'px',
      top: rect.bottom + window.pageYOffset + 5 + 'px',
      text: `${cleanedWord} — ${translation}`
    });
  };

  const hideTranslationPopup = () => {
    setTranslationPopup({ display: 'none', text: '' });
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
  }, []);

  return (
    <QuizScreen
      currentLevel={currentLevel}
      currentPair={currentPair}
      choices={choices}
      checkAnswer={checkAnswer}
      feedback={feedback}
      exampleSentence={exampleSentence}
      translationPopup={translationPopup}
      showNextButton={showNextButton}
      showQuestion={showQuestion}
      levelTouched={levelTouched}
      levelKnown={levelKnown}
      knownWords={knownWords}
      flyingText={flyingText}
    />
  );
};

export default QuizLogicWrapper;
