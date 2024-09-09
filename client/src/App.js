import React, { useContext, createContext, useEffect, useState} from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import logo from './assets/runner.png';

// For allowing user to enter distance
export const DistanceContext = createContext();

export const DistanceProvider = ({ children }) => {
  const [distance, setDistance] = useState(5000);

  return (
    <DistanceContext.Provider value={{ distance, setDistance }}>
      {children}
    </DistanceContext.Provider>
  );
};

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
  const { distance, setDistance } = useContext(DistanceContext);
  const [isPopupVisible, setPopupVisible] = useState(false);
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

  const handleDistanceChange = (e) => {
    setDistance(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Entered distance:', distance);
    setPopupVisible(false);
  };
  
  const enterSettings = () => {

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
            <p>Enter Distance (m)</p>
            <input
              type="text"
              value={distance}
              onChange={ handleDistanceChange }
              placeholder="Enter distance"
            />
            <button className="popup-button" onClick={ handleSubmit }>Ok</button>
          </div>
        </div>
      )}
      </div>
      <button className="config-button" onClick={ enterSettings }>Settings</button>
    </div>
  );
}

const MapEmbed = () => {
  const [embed, setEmbed] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('generating path');
  const { distance } = useContext(DistanceContext);

  useEffect(() => {
    async function getEmbed() {
      setEmbed('');
      setLoading(true);
      // Add loading running man (animated running man with "generating path...")

      const getLocation = () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              resolve({ latitude, longitude });
            },
            (err) => {
              reject(new Error('Error getting location: ' + err.message));
            }
          );
        });
      };

      try {
        //await new Promise((resolve) => setTimeout(resolve, 3000)); // mock api call
        var { latitude, longitude } = await getLocation(); 

        const response = await fetch(`http://localhost:4000/api/${latitude}/${longitude}/${distance}`, {method: 'get'});
        const data = await response.json();
        if (!flag) {
          setEmbed(data.embed);
        }
      } catch(error) {
        console.error("Error generating loop:", error)
      } finally {
        setLoading(false);
      }
    };

    let flag = false;
    getEmbed();
    return () => {
      flag = true;
    }
  }, [distance]);

  // // Animated loading text
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((prev) => {
          if (prev === 'generating path') return 'generating path.';
          if (prev === 'generating path.') return 'generating path..';
          if (prev === 'generating path..') return 'generating path...';
          return 'generating path';
        });
      }, 500); // Change text every 500ms

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [loading]);
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Link to="/configure">
        <button className="back-button">Back</button>
      </Link>
      <div className='loading'>
        {loading ? (
          <p>{loadingText}</p>
        ) : (
          <div style={{ width: '80rem', height: '40rem' }}>
            <iframe
              src={ embed }
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              aria-hidden="false"
              tabIndex="0"
              title="Route"
            ></iframe>
          </div>
        )}
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