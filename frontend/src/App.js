import React from 'react';
import './App.css';
import FraudDetector from './FraudDetector';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Fraud Detection System</h1>
        <p>Enter transaction features to check for potential fraud</p>
      </header>
      <main>
        <FraudDetector />
      </main>
    </div>
  );
}

export default App;

export default App;
