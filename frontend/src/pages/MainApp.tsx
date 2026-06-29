import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Map from '../components/Map';
import TopNavBar from '../components/TopNavBar';
import ChatPanel from '../components/ChatPanel';
import LocationInfoCard from '../components/LocationInfoCard';

interface LocationState {
  destination?: string;
}

/**
 * MainApp — 主应用页面
 *
 * 规范：frontend-spec.md § 4.2
 * - 全屏地图 (z-0)
 * - TopNavBar (z-40)
 * - ChatPanel (z-50, 浮动右下角)
 * - LocationInfoCard (z-30, 地图点击后显示)
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
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Map — 全屏背景 (z-0) */}
      <div className="absolute inset-0 z-0">
        <Map onLocationClick={handleLocationClick} />
      </div>

      {/* Top Navigation Bar (z-40) */}
      <TopNavBar />

      {/* Location Info Card (z-30) */}
      {selectedLocation && (
        <LocationInfoCard
          location={selectedLocation}
          onClose={handleCloseCard}
        />
      )}

      {/* Chat Panel (z-50) */}
      <ChatPanel />
    </div>
  );
};

export default MainApp;
