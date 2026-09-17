import React, { useState } from 'react';
import Cron from './lib';
import './lib/cron-builder.css';
import './App.css';

interface State {
  value?: string;
}

function App() {
  const [state, setState] = useState<State>({});

  return (
    <div className="app-container">
      <Cron
        onChange={(e, text) => {
          setState((prev) => ({ ...prev, value: e }));
          console.log('Cron value:', e);
          console.log('Human readable:', text);
        }}
        value={state.value}
        showResultText={true}
        showResultCron={true}
      />
    </div>
  );
}

export default App;
