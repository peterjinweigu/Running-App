import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App, { DistanceProvider } from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <DistanceProvider>
        <App />
      </DistanceProvider>
    </Router>
  </React.StrictMode>
);
