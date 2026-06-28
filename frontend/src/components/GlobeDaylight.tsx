/**
 * GlobeDaylight.tsx — 时区明暗光照组件
 *
 * 根据 UTC 时间计算太阳方位角，在 Globe 上渲染动态光照效果。
 * 白天面亮，夜晚面暗。
 */

import React, { useMemo } from 'react';

/* ─── Types ─── */

interface GlobeDaylightProps {
  /** 是否启用昼夜效果 */
  enabled?: boolean;
}

/** 太阳位置数据 */
interface SunPosition {
  /** 太阳方位角（度） */
  azimuth: number;
  /** 太阳高度角（度） */
  elevation: number;
  /** 太阳直射经度 */
  sunLng: number;
  /** 太阳直射纬度 */
  sunLat: number;
  /** 当前时间是否为白天（对参考点） */
  isDaytime: boolean;
}

/* ─── 太阳位置计算 ─── */

/**
 * 根据 UTC 时间计算太阳直射点坐标
 *
 * 基于简化天文公式：
 * - 经度 = (UTC hour / 24) * 360 - 180
 * - 纬度 = 23.44 * sin(dayOfYear - 81) (黄赤交角)
 */
function calculateSunPosition(date: Date = new Date()): SunPosition {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const dayOfYear = getDayOfYear(date);

  // 太阳直射经度：UTC 0:00 → -180, UTC 12:00 → 0, UTC 24:00 → 180
  const sunLng = (utcHours / 24) * 360 - 180;

  // 太阳直射纬度：基于黄赤交角 (23.44 度)
  const sunLat = 23.44 * Math.sin(((dayOfYear - 81) * Math.PI) / 180);

  // 方位角和高度角（简化计算）
  const azimuth = (utcHours / 24) * 360;

  // 高度角用于判断白天/黑夜
  // 太阳在赤道上方时，北半球夏天偏高
  const declination = sunLat;
  const elevation = 90 - Math.abs(declination);

  // 当前 UTC 时间是否为"白天"（太阳经度在 -90 ~ 90 范围）
  const isDaytime = sunLng > -90 && sunLng < 90;

  return { azimuth, elevation, sunLng, sunLat, isDaytime };
}

/**
 * 计算一年中的第几天
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/* ─── Component ─── */

/**
 * GlobeDaylight — 昼夜光照适配组件
 *
 * 此组件计算太阳位置数据，供 Globe 组件使用。
 * 在 react-globe.gl 上通过 polygonCapMaterial 或自定义 shader
 * 实现昼夜面的明暗差异。
 *
 * 使用方式：在 Globe 上绑定：
 *   hexPolygonsData([{ ...sunPosition })]
 *   或使用 customThreeObject 渲染光照效果
 */
const GlobeDaylight: React.FC<GlobeDaylightProps> = ({ enabled = true }) => {
  const sunPosition = useMemo(() => {
    if (!enabled) return null;
    return calculateSunPosition();
  }, [enabled]);

  if (!sunPosition) return null;

  return (
    <div
      className="hidden"
      data-sun-position={JSON.stringify(sunPosition)}
      aria-hidden="true"
    />
  );
};

export type { SunPosition };
export { calculateSunPosition };
export default GlobeDaylight;
