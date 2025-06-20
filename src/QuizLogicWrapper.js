import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import { wordPairs, wordTranslations } from "./data";
// Changed completely the dataset to the new one, revert back if doesn't work:
import { wordPairs} from "./data2"
import { wordTranslations } from "./data2b";
import { congratulatoryMessages } from "./congrats_messages";
import QuizScreen from "./QuizScreen";

const QuizLogicWrapper = ({
  currentLevel,
  setCurrentLevel,
  answers,
  setAnswers,
  knownWords,
  setKnownWords,
  currentPair,
  setCurrentPair,
  feedback,
  setFeedback,
  exampleSentence,
  setExampleSentence,
  choices,
  setChoices,
  showNextButton,
  setShowNextButton,
  translationPopup,
  setTranslationPopup,
  flyingText,
  setFlyingText,
  musicStarted,
  setMusicStarted,
  progressInput,
  setProgressInput,
  //updateProgress
}) => {
  //const totalWords = 500;
  const wordsPerLevel = 10;
  const navigate = useNavigate();
  const wordRefs = useRef([]);

  const start = currentLevel * wordsPerLevel;
  const end = start + wordsPerLevel;
  const levelAnswers = answers.slice(start, end);
  const levelKnown = levelAnswers.filter((v) => v >= 3).length;
  const levelTouched = levelAnswers.filter((v) => v >= 1).length;

  const levelWordPairs = wordPairs.slice(start, end);

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
      .filter((i) => answers[start + i] <= 2);

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
    return levelAnswers.every((value) => value >= 3);
  };

  const checkAnswer = (choice) => {
    const beerSound = new Audio('/beer-can-open-sound-230903.mp3');
    const mosquitoSound = new Audio('/flying-mosquito-105770.mp3');
    mosquitoSound.volume = 1;

    if (!musicStarted) startMusic();

    if (choice === currentPair.finnish) {
      setFeedback("Correct!");

      const randomMsg = congratulatoryMessages[Math.floor(Math.random() * congratulatoryMessages.length)];
      const randomX = Math.floor(Math.random() * 80 + 10);
      const randomY = Math.floor(Math.random() * 60 + 10);
      setFlyingText({ text: randomMsg, x: randomX, y: randomY });
      setTimeout(() => setFlyingText(null), 3000);

      const updatedAnswers = answers.map((val, idx) =>
        idx === wordPairs.indexOf(currentPair) ? val + 1 : val
      );
      setAnswers(updatedAnswers);
      setKnownWords(updatedAnswers.filter((v) => v >= 3).length);
      beerSound.play();

      if (isLevelComplete()) {
        navigate('/CongratsScreen', { state: { completedLevel: currentLevel } });
      }
    } else {
      setFeedback(`Incorrect! The correct answer is "${currentPair.finnish}".`);
      setAnswers(
        answers.map((val, idx) =>
          idx === wordPairs.indexOf(currentPair) ? 0 : val
        )
      );
      mosquitoSound.play();
      setTimeout(() => {
        mosquitoSound.pause();
        mosquitoSound.currentTime = 0;
      }, 7000);
    }

    //updateProgress();
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
