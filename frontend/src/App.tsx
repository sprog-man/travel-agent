import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MainApp from './pages/MainApp';

/**
 * App — 应用入口
 *
 * 路由系统：/ (Landing) → /app (MainApp) → /itinerary/:id
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<MainApp />} />
        {/* <Route path="/itinerary/:id" element={<ItineraryPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
