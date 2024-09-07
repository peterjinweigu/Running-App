import React, { useEffect, useState} from 'react';
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
      <Link to="/route">
        <button className="config-button" onClick={ handleStart }>Start</button>
      </Link>
      <button className="config-button">Distance</button>
      <button className="config-button">Type</button>
    </div>
  );
}

const MapEmbed = () => {
  const [embed, setEmbed] = useState('');

  useEffect(() => {
    async function getEmbed() {
      setEmbed('');
      const response = await fetch("http://localhost:3000/api/43.47389747055288/-80.54434334162293/5000", {method: "get"});
      const data = await response.json();
      if (!flag) {
        setEmbed(data.embed);
      }
    };

    let flag = false;
    getEmbed();
    return () => {
      flag = true;
    }
  }, []);
  
  return (
    <div style={{ width: '80em', height: '40em' }}>
      <iframe
        src= {embed}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        aria-hidden="false"
        tabIndex="0"
        title="Route"
      ></iframe>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartMenu />} />
      <Route path="/configure" element={<ConfigMenu />} />
      <Route path="/route" element={<MapEmbed />} />
    </Routes>
  );
}

export default App;