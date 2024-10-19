import React from 'react';
import QuestionnaireCreatorWithData from './QuestionnaireCreatorWithData';
import { AudioProvider } from './AudioContext';

function App() {
  return (
    <AudioProvider>
      <div className="App">
        <QuestionnaireCreatorWithData />
      </div>
    </AudioProvider>
  );
}

export default App;
