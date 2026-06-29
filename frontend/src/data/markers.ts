import { MarkerData } from '../components/three/Marker';

/**
 * 示例标记数据
 *
 * 包含：热门城市、地标景点
 */
export const sampleMarkers: MarkerData[] = [
  // 亚洲
  { id: 'beijing', type: 'city', name: '北京', lat: 39.9042, lng: 116.4074, color: '#ff6b6b', size: 0.025 },
  { id: 'tokyo', type: 'city', name: '东京', lat: 35.6762, lng: 139.6503, color: '#ff6b6b', size: 0.025 },
  { id: 'singapore', type: 'city', name: '新加坡', lat: 1.3521, lng: 103.8198, color: '#ff6b6b', size: 0.02 },
  { id: 'dubai', type: 'city', name: '迪拜', lat: 25.2048, lng: 55.2708, color: '#ff6b6b', size: 0.02 },

  // 欧洲
  { id: 'paris', type: 'city', name: '巴黎', lat: 48.8566, lng: 2.3522, color: '#4ecdc4', size: 0.025 },
  { id: 'london', type: 'city', name: '伦敦', lat: 51.5074, lng: -0.1278, color: '#4ecdc4', size: 0.025 },
  { id: 'rome', type: 'city', name: '罗马', lat: 41.9028, lng: 12.4964, color: '#4ecdc4', size: 0.02 },

  // 美洲
  { id: 'newyork', type: 'city', name: '纽约', lat: 40.7128, lng: -74.0060, color: '#95e1d3', size: 0.025 },
  { id: 'la', type: 'city', name: '洛杉矶', lat: 34.0522, lng: -118.2437, color: '#95e1d3', size: 0.02 },
  { id: 'riodejaneiro', type: 'city', name: '里约热内卢', lat: -22.9068, lng: -43.1729, color: '#95e1d3', size: 0.02 },

  // 大洋洲
  { id: 'sydney', type: 'city', name: '悉尼', lat: -33.8688, lng: 151.2093, color: '#f38181', size: 0.02 },

  // 非洲
  { id: 'cairo', type: 'city', name: '开罗', lat: 30.0444, lng: 31.2357, color: '#aa96da', size: 0.02 },
];
