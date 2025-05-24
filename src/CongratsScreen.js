import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CongratsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const level = location.state?.completedLevel ?? 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', {
        state: { advanceLevel: true }
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="congrats-screen">
      <h1>🎉 Congrats! 🎉</h1>
      <p>You completed level {level + 1}!</p>
    </div>
  );
};

export default CongratsScreen;
