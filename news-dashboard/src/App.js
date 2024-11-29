import React from 'react';
import './App.css';
import PollingControls from './components/PollingControls';
import ArticleTable from './components/ArticleTable';
import SentimentTimeline from './components/SentimentTimeline';
import SettingsControl from './components/SettingsControl';

function App() {
  return (
    <div className="App">
      <h1>News Polling and Classification Dashboard</h1>
      <SettingsControl />
      <PollingControls />
      <SentimentTimeline />
      <ArticleTable />
    </div>
  );
}

export default App;
