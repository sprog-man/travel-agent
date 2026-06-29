import React from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  onLocationClick?: (lat: number, lng: number) => void;
}

/**
 * ClickHandler — 捕获地图点击事件
 */
function ClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      console.log(`Clicked: lat=${lat.toFixed(2)}°, lng=${lng.toFixed(2)}°`);
      onClick?.(lat, lng);
    },
  });

  return null;
}

/**
 * Map — Leaflet 2D 地图组件
 *
 * 点击地图任意位置触发回调，传递经纬度
 */
const Map: React.FC<MapProps> = ({ onLocationClick }) => {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onLocationClick && <ClickHandler onClick={onLocationClick} />}
    </MapContainer>
  );
};

export default Map;
