import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import QuizLogicWrapper from "./QuizLogicWrapper";
import CongratsScreen from "./CongratsScreen";
import StartScreen from "./StartScreen"; // 👈 New import
import { wordPairs } from "./data";
import './App.css';

const App = () => {
  const totalWords = 500;

  const [currentLevel, setCurrentLevel] = useState(0);
  const [answers, setAnswers] = useState(new Array(wordPairs.length).fill(0));
  const [knownWords, setKnownWords] = useState(0);

  const [currentPair, setCurrentPair] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
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
  const [progressInput, setProgressInput] = useState("");

  const [hasStarted, setHasStarted] = useState(false); // 👈 track if user has clicked "Aloita"

  return (
    <Routes>
      <Route
        path="/"
        element={
          hasStarted ? (
            <QuizLogicWrapper
              currentLevel={currentLevel}
              setCurrentLevel={setCurrentLevel}
              answers={answers}
              setAnswers={setAnswers}
              knownWords={knownWords}
              setKnownWords={setKnownWords}
              currentPair={currentPair}
              setCurrentPair={setCurrentPair}
              feedback={feedback}
              setFeedback={setFeedback}
              exampleSentence={exampleSentence}
              setExampleSentence={setExampleSentence}
              choices={choices}
              setChoices={setChoices}
              showNextButton={showNextButton}
              setShowNextButton={setShowNextButton}
              translationPopup={translationPopup}
              setTranslationPopup={setTranslationPopup}
              flyingText={flyingText}
              setFlyingText={setFlyingText}
              musicStarted={musicStarted}
              setMusicStarted={setMusicStarted}
              progressInput={progressInput}
              setProgressInput={setProgressInput}
            />
          ) : (
            <StartScreen
              currentLevel={currentLevel}
              onStart={() => setHasStarted(true)}
            />
          )
        }
      />
      <Route
        path="/CongratsScreen"
        element={
          <CongratsScreen
            currentLevel={currentLevel}
            setCurrentLevel={setCurrentLevel}
          />
        }
      />
    </Routes>
  );
};

export default App;
