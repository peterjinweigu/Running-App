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
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [distance, setDistance] = useState('');
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

  const enterDistance = () => {
    setPopupVisible(true);
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
  };

  const handleDistanceChange = (e) => {
    setDistance(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Entered distance:', distance);
    setPopupVisible(false);
  };
  
  const enterType = () => {

  };

  return (
    <div className="ConfigMenu">
      <Link to="/route">
        <button className="config-button">Start</button>
      </Link>
      <div>
      <button className="config-button" onClick={ enterDistance }>Distance</button>
      
      {isPopupVisible && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>Enter Distance</p>
            <input
              type="text"
              value={distance}
              onChange={handleDistanceChange}
              placeholder="Enter distance"
            />
            <button className="popup-button" onClick={ handleSubmit }>Submit</button>
            <button className="popup-button" onClick={ handlePopupClose }>x</button>
          </div>
        </div>
      )}
      </div>
      <button className="config-button" onClick={ enterType }>Settings</button>
    </div>
  );
}

const MapEmbed = () => {
  const [embed, setEmbed] = useState('');

  // useEffect(() => {
  //   async function getEmbed() {
  //     setEmbed('');
  //     const response = [
  //       [ 43.47389747055288, -80.54434334162293 ],
  //       [ 43.46939783052408, -80.54434334162293 ],
  //       [ 43.46117056664383, -80.55707024553197 ],
  //       [ 43.47389747055288, -80.56289583273892 ]
  //     ]; //await fetch("http://localhost:5000/api/43.47389747055288/-80.54434334162293/5000", {method: "get"});
  //     const data = await response.json();
  //     if (!flag) {
  //       setEmbed(data.embed);
  //     }
  //   };

  //   let flag = false;
  //   getEmbed();
  //   return () => {
  //     flag = true;
  //   }
  // }, []);
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Link to="/configure">
        <button className="back-button">Back</button>
      </Link>
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