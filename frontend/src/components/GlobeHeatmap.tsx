/**
 * GlobeHeatmap.tsx — 热力图图层组件
 *
 * 在 Globe 上渲染 Hexbin 热力图层，颜色从蓝（冷）到红（热）渐变。
 * 接收 points 数据（lat, lng, weight），无数据时隐藏。
 */

import React, { useMemo } from 'react';

/* ─── Types ─── */

/** 热力图数据点 */
interface HeatmapPoint {
  lat: number;
  lng: number;
  /** 权重值 0~1 */
  weight: number;
}

interface GlobeHeatmapProps {
  /** 热力图数据点数组 */
  points: HeatmapPoint[];
  /** 是否可见 */
  visible?: boolean;
}

/* ─── 颜色渐变 ─── */

/**
 * 根据权重值生成蓝→青→黄→红渐变颜色
 * @param t 权重值 0~1
 * @returns CSS 颜色字符串
 */
function heatColor(t: number): string {
  // 三段渐变: blue(0) → cyan(0.33) → yellow(0.66) → red(1)
  const clamped = Math.max(0, Math.min(1, t));

  if (clamped < 0.33) {
    // Blue → Cyan
    const p = clamped / 0.33;
    const r = 0;
    const g = Math.round(100 + p * 111); // 100 → 211
    const b = 200 + Math.round(p * 38);  // 200 → 238
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (clamped < 0.66) {
    // Cyan → Yellow
    const p = (clamped - 0.33) / 0.33;
    const r = Math.round(p * 255);
    const g = 211 + Math.round(p * 44); // 211 → 255
    const b = 238 - Math.round(p * 238); // 238 → 0
    return `rgb(${r}, ${g}, ${b})`;
  }
  // Yellow → Red
  const p = (clamped - 0.66) / 0.34;
  return `rgb(255, ${Math.round(255 - p * 255)}, 0)`;
}

/* ─── Component ─── */

/**
 * GlobeHeatmap — 为 react-globe.gl 提供热力图数据的适配组件
 *
 * 此组件本身不渲染 DOM，而是输出标准化的热力图配置数据，
 * 供父级 Globe 组件使用 hexBinPointsData / hexBinPointWeight 等属性。
 *
 * 使用方式：在 Globe 组件上绑定 props：
 *   hexBinPointsData={heatmapData.points}
 *   hexBinPointWeight="weight"
 *   hexBinTopRadius={0.5}
 *   hexBinColor={heatColor}
 */
const GlobeHeatmap: React.FC<GlobeHeatmapProps> = ({ points, visible = true }) => {
  // 预计算热力图颜色映射
  const colorMap = useMemo(() => {
    if (!visible || points.length === 0) return [];
    return points.map((p) => ({
      ...p,
      color: heatColor(p.weight),
    }));
  }, [points, visible]);

  // 无数据时返回 null
  if (!visible || colorMap.length === 0) return null;

  // 此组件仅做数据处理和验证，实际渲染由 Globe 完成
  // 通过 React 18 的隐藏方式传递数据
  return (
    <div
      className="hidden"
      data-heatmap-points={JSON.stringify(colorMap)}
      aria-hidden="true"
    />
  );
};

export type { HeatmapPoint };
export { heatColor };
export default GlobeHeatmap;
