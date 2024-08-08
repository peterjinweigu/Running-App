import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import logo from './assets/runner.png';

function StartMenu() {
  return (
    <div className="StartMenu">
      <h1>LOOPER</h1>
      <Link to="/configure">
        <button className="start-button">Start</button>
      </Link>
      <img className="logo" src={logo} alt="Runner Logo" />
    </div>
  );
}

function ConfigMenu() {
  // Set all buttons to equal width (equal to longest button)
  // useEffect(() => {
  //   const buttons = document.querySelectorAll('.config-button');
  //   let maxWidth = 0;

  //   // Find the maximum width
  //   buttons.forEach(button => {
  //     const buttonWidth = button.offsetWidth;
  //     if (buttonWidth > maxWidth) {
  //       maxWidth = buttonWidth;
  //     }
  //   });

  //   buttons.forEach(button => {
  //     button.style.width = `${maxWidth}px`;
  //   });
  // }, []);

  const handleStart = () => {
    // Should show page with your location on google maps
  };

  return (
    <div className="ConfigMenu">
      <button className="config-button" onClick={ handleStart }>Start</button>
      <button className="config-button">Distance</button>
      <button className="config-button">Type</button>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartMenu />} />
      <Route path="/configure" element={<ConfigMenu />} />
    </Routes>
  );
}

export default App;