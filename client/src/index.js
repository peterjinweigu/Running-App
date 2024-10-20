import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App, { DistanceProvider } from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Router>
      <DistanceProvider>
        <App />
      </DistanceProvider>
    </Router>
);

// Bring back strict mode for deployment, otherwise its double calling
// Our backend
