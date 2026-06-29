import React from 'react';
import Marker, { MarkerData } from './Marker';

interface MarkerLayerProps {
  markers: MarkerData[];
  onMarkerClick?: (marker: MarkerData) => void;
}

/**
 * MarkerLayer — 标记图层管理
 *
 * 职责：
 * - 渲染所有标记点
 * - 管理标记交互
 * - 分层显示（Country/City/POI）
 */
const MarkerLayer: React.FC<MarkerLayerProps> = ({ markers, onMarkerClick }) => {
  return (
    <group>
      {markers.map((marker) => (
        <Marker key={marker.id} data={marker} onClick={onMarkerClick} />
      ))}
    </group>
  );
};

export default MarkerLayer;
