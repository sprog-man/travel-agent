import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationInfoCardProps {
  location: {
    lat: number;
    lng: number;
    name?: string;
    photo?: string;
    description?: string;
  };
  onClose: () => void;
}

/**
 * LocationInfoCard — 地图点击位置信息卡片
 *
 * 规范：frontend-spec.md § 5, § 7
 * - z-30 层级
 * - 宽度 320px
 * - 显示位置照片、名称、描述
 * - scale + fade 动画进入
 * - ESC 键或点击外部关闭
 */
const LocationInfoCard: React.FC<LocationInfoCardProps> = ({ location, onClose }) => {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center">
        {/* Backdrop — 点击关闭 */}
        <motion.div
          className="absolute inset-0 pointer-events-auto"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Card */}
        <motion.div
          className="relative pointer-events-auto w-[320px]
                     bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {/* Photo */}
          {location.photo ? (
            <img
              src={location.photo}
              alt={location.name || 'Location'}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-white/5 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white/20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-8 h-8 rounded-full
                         bg-black/50 backdrop-blur-sm
                         flex items-center justify-center
                         hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Name */}
            <h3 className="text-lg font-medium text-white mb-2">
              {location.name || 'Unknown Location'}
            </h3>

            {/* Coordinates */}
            <p className="text-xs text-white/40 mb-3 font-mono">
              {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
            </p>

            {/* Description */}
            {location.description && (
              <p className="text-sm text-white/60 mb-4 line-clamp-3">
                {location.description}
              </p>
            )}

            {/* CTA Button */}
            <button
              className="w-full py-2.5 rounded-lg
                         bg-white text-[#0A0A0A] font-medium text-sm
                         hover:opacity-85 active:scale-97
                         transition-all"
            >
              Plan this trip
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LocationInfoCard;
