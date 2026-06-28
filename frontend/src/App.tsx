import { useState, useCallback, useRef, useEffect } from 'react';
import Landing from './pages/Landing';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [fading, setFading] = useState(false);
  const landingRef = useRef<HTMLDivElement>(null);

  const handleExplore = useCallback(() => {
    setFading(true);
  }, []);

  // After fade-out transition completes, unmount Landing
  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(() => {
      setShowLanding(false);
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
      {!showLanding && (
        <div className="w-full h-full flex items-center justify-center text-white">
          <p className="text-lg opacity-60">主界面将在后续迭代中实现。</p>
        </div>
      )}
    </div>
  );
}

export default App;
