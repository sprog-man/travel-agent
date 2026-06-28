import { useState } from 'react';
import Landing from './pages/Landing';

function App() {
  const [showLanding, setShowLanding] = useState(true);

  const handleExplore = () => {
    setShowLanding(false);
  };

  return (
    <div className="w-screen h-screen bg-black">
      {showLanding ? (
        <Landing onExplore={handleExplore} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white">
          <p className="text-lg opacity-60">主界面将在后续迭代中实现。</p>
        </div>
      )}
    </div>
  );
}

export default App;
