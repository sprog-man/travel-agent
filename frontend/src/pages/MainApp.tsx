import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Map from '../components/Map';
import TopNavBar from '../components/TopNavBar';
import ChatPanel from '../components/ChatPanel';
import LocationInfoCard from '../components/LocationInfoCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { useWebSocket } from '../hooks/useWebSocket';

interface LocationState {
  destination?: string;
}

const MainApp: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  const { messages, sendMessage, connectionStatus, connect } = useWebSocket();

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>(null);

  const handleLocationClick = (lat: number, lng: number) => {
    const name = `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
    setSelectedLocation({ lat, lng, name });

    const msg = `我想去坐标 (${lat.toFixed(4)}, ${lng.toFixed(4)}) 旅行，请帮我规划行程`;

    if (connectionStatus === 'disconnected') {
      // connect 的第二个参数会在连接建立后自动发送
      connect(String(lat), msg);
    } else {
      sendMessage(msg);
    }
  };

  const handleCloseCard = () => {
    setSelectedLocation(null);
  };

  React.useEffect(() => {
    if (state?.destination) {
      const msg = `我想去${state.destination}旅行，请帮我规划行程`;
      if (connectionStatus === 'disconnected') {
        connect(state.destination, msg);
      } else {
        sendMessage(msg);
      }
    }
  }, [state?.destination, connectionStatus, connect, sendMessage]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#0A0A0A]">
      <TopNavBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Map (60%) */}
        <div className="relative w-[60%] h-full">
          <ErrorBoundary
            fallback={
              <div className="flex items-center justify-center h-full bg-[#0A0A0A] text-white">
                <div className="text-center">
                  <p className="text-sm text-white/60">Map failed to load</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                  >
                    Reload
                  </button>
                </div>
              </div>
            }
          >
            <Map onLocationClick={handleLocationClick} />
          </ErrorBoundary>

          {selectedLocation && (
            <LocationInfoCard
              location={selectedLocation}
              onClose={handleCloseCard}
            />
          )}
        </div>

        {/* Right Panel - Chat (40%) */}
        <div className="w-[40%] h-full border-l border-white/10">
          <ChatPanel
            messages={messages}
            sendMessage={sendMessage}
            connectionStatus={connectionStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default MainApp;
