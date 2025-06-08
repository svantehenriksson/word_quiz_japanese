
import QuizLogicWrapper from './QuizLogicWrapper';
import CongratsScreen from './CongratsScreen';

import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<QuizLogicWrapper />} />
      <Route path="/CongratsScreen" element={<CongratsScreen />} />
    </Routes>
  );
};


export default App;
