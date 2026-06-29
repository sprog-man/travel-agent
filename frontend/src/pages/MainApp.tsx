import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Map from '../components/Map';
import TopNavBar from '../components/TopNavBar';
import ChatPanel from '../components/ChatPanel';
import LocationInfoCard from '../components/LocationInfoCard';
import ErrorBoundary from '../components/ErrorBoundary';

interface LocationState {
  destination?: string;
}

/**
 * MainApp — 主应用页面
 *
 * 布局：左右分屏
 * - 左侧：地图（60%）
 * - 右侧：ChatPanel（40%）
 * - TopNavBar 横跨整个页面
 */
const MainApp: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>(null);

  const handleLocationClick = (lat: number, lng: number) => {
    console.log(`Map clicked: lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)}`);

    // 显示位置信息卡片
    setSelectedLocation({ lat, lng, name: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})` });

    // TODO: 反向地理编码获取地点名称
    // TODO: 触发 AI 对话
  };

  const handleCloseCard = () => {
    setSelectedLocation(null);
  };

  // 如果从 Landing 传来目的地，自动飞往该位置
  React.useEffect(() => {
    if (state?.destination) {
      console.log('Navigate to destination:', state.destination);
      // TODO: 地理编码 + 地图飞往
    }
  }, [state?.destination]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#0A0A0A]">
      {/* Top Navigation Bar */}
      <TopNavBar />

      {/* Main Content - 左右分屏 */}
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

          {/* Location Info Card - 浮动在地图上 */}
          {selectedLocation && (
            <LocationInfoCard
              location={selectedLocation}
              onClose={handleCloseCard}
            />
          )}
        </div>

        {/* Right Panel - Chat (40%) */}
        <div className="w-[40%] h-full border-l border-white/10">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};

export default MainApp;
