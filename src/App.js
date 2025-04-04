import '@fontsource/fira-code';
import './App.css';
import { useState, useEffect, useRef } from 'react';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [activeDot, setActiveDot] = useState(null);
  const [dots, setDots] = useState(Array(36).fill(false)); // false = blue, true = red (6x6 grid)
  const [shaking, setShaking] = useState(false);
  const [consecutiveHits, setConsecutiveHits] = useState(0);
  const timerRef = useRef(null);
  const shakeTimerRef = useRef(null);
  const previousActiveDotRef = useRef(null);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setDots(Array(36).fill(false));
    setActiveDot(null);
    setConsecutiveHits(0);
    previousActiveDotRef.current = null;
    selectRandomDot();
  };

  const selectRandomDot = () => {
    // Find all blue dots (false values)
    const blueDots = dots.reduce((acc, dot, index) => {
      if (!dot) acc.push(index);
      return acc;
    }, []);
    
    if (blueDots.length === 0) {
      // All dots are red, game won
      setGameWon(true);
      return;
    }
    
    // Pick a random blue dot that's not the previous one
    let randomIndex;
    let dotIndex;
    
    do {
      randomIndex = Math.floor(Math.random() * blueDots.length);
      dotIndex = blueDots[randomIndex];
    } while (dotIndex === previousActiveDotRef.current && blueDots.length > 1);
    
    previousActiveDotRef.current = dotIndex;
    setActiveDot(dotIndex);
    
    // Calculate times based on consecutive hits (20% shorter each time)
    const colorChangeTime = Math.max(2000 * Math.pow(0.8, consecutiveHits), 400);
    const shakeTime = Math.max(3000 * Math.pow(0.8, consecutiveHits), 600);
    
    // Start the timer for color change
    timerRef.current = setTimeout(() => {
      // Change dot to red
      setDots(prevDots => {
        const newDots = [...prevDots];
        newDots[dotIndex] = true;
        return newDots;
      });
      
      // Start shaking
      setShaking(true);
      
      // Set timer for game over if not clicked
      shakeTimerRef.current = setTimeout(() => {
        setGameOver(true);
        setShaking(false);
      }, shakeTime);
    }, colorChangeTime);
  };

  const handleDotClick = (index) => {
    if (!gameStarted || gameOver || gameWon) return;
    
    if (index === activeDot) {
      // Clear timers
      clearTimeout(timerRef.current);
      clearTimeout(shakeTimerRef.current);
      
      // Instantly reset the dot to blue
      setDots(prevDots => {
        const newDots = [...prevDots];
        newDots[index] = false;
        return newDots;
      });
      
      // Increment consecutive hits
      const newConsecutiveHits = consecutiveHits + 1;
      setConsecutiveHits(newConsecutiveHits);
      
      // Check for win condition (10 consecutive hits)
      if (newConsecutiveHits >= 10) {
        setGameWon(true);
        setShaking(false);
        return;
      }
      
      // Select a new random dot
      setShaking(false);
      setActiveDot(null);
      selectRandomDot();
    }
  };

  const resetGame = () => {
    setGameOver(false);
    setGameWon(false);
    setGameStarted(false);
    setActiveDot(null);
    setShaking(false);
    setDots(Array(36).fill(false));
    setConsecutiveHits(0);
    previousActiveDotRef.current = null;
    clearTimeout(timerRef.current);
    clearTimeout(shakeTimerRef.current);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(shakeTimerRef.current);
    };
  }, []);

  return (
    <div className="App">
      <div className="game-container">
        <h1 className="name">JEEVANCHY GAMES</h1>
        <div className="tv-frame">
          <div className="tv-screen">
            <div className="dot-grid">
              {Array(6).fill().map((_, rowIndex) => (
                <div key={rowIndex} className="dot-row">
                  {Array(6).fill().map((_, colIndex) => {
                    const index = rowIndex * 6 + colIndex;
                    const isActive = index === activeDot;
                    const isRed = dots[index];
                    return (
                      <div 
                        key={colIndex} 
                        className={`dot ${isActive && shaking ? 'shaking' : ''} ${isRed ? 'red' : ''}`}
                        onClick={() => handleDotClick(index)}
                      ></div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <button className="start-button" onClick={startGame}>START</button>
      </div>
      
      {gameOver && (
        <div className="game-over-popup">
          <div className="popup-content">
            <h2>You lost!</h2>
            <button className="start-button" onClick={resetGame}>Play Again?</button>
          </div>
        </div>
      )}
      
      {gameWon && (
        <div className="game-over-popup">
          <div className="popup-content">
            <h2>You won!</h2>
            <p>You hit 10 dots in a row!</p>
            <button className="start-button" onClick={resetGame}>Play Again?</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
