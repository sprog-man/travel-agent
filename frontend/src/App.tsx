import { useState, useCallback, useRef, useEffect } from 'react';
import Landing from './pages/Landing';
import Main from './pages/Main';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [fading, setFading] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const landingRef = useRef<HTMLDivElement>(null);

  const handleExplore = useCallback(() => {
    setFading(true);
  }, []);

  // After fade-out transition completes, unmount Landing and mount Main
  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(() => {
      setShowLanding(false);
      setShowMain(true);
    }, 600); // match transition duration
    return () => clearTimeout(timer);
  }, [fading]);

  return (
    <div className="w-screen h-screen bg-black">
      {showLanding && (
        <div
          ref={landingRef}
          className="w-full h-full transition-opacity duration-500 ease-in-out"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <Landing onExplore={handleExplore} />
        </div>
      )}
      {showMain && (
        <div
          className="w-full h-full"
          style={{ animation: 'fadeIn 0.5s ease-in-out' }}
        >
          <Main />
        </div>
      )}
    </div>
  );
}

export default App;
