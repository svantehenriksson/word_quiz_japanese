import React from "react";
import { useNavigate } from "react-router-dom";

const CongratsScreen = ({ currentLevel, setCurrentLevel }) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    setCurrentLevel(currentLevel + 1);
    navigate("/");
  };

  return (
    <div className="App">
      <h1>🎉 Congratulations! 🎉</h1>
      <p>You completed level {currentLevel + 1}!</p>
      <button onClick={handleContinue}>Start Level {currentLevel + 2}</button>
    </div>
  );
};

export default CongratsScreen;
