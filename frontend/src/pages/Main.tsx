/**
 * Main.tsx — 主界面
 *
 * 上下分屏布局：上方 60% 3D 地球，下方 40% 对话面板。
 * 可拖拽分割线调整比例（拖拽时显示半透明遮罩防止 iframe 抢焦点）。
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Globe from '../components/Globe';
import ChatPanel from '../components/ChatPanel';
import { useWebSocket } from '../hooks/useWebSocket';

/* ─── Constants ─── */

const MIN_RATIO = 0.2; // 地球区域最小占比
const MAX_RATIO = 0.85; // 地球区域最大占比
const DEFAULT_RATIO = 0.6; // 默认 6:4 分屏

/* ─── Component ─── */

const Main: React.FC = () => {
  const [splitRatio, setSplitRatio] = useState(DEFAULT_RATIO);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef(0);
  const dragStartRatioRef = useRef(DEFAULT_RATIO);

  const { messages, sendMessage, connectionStatus } = useWebSocket({
    maxRetries: 5,
    initialRetryDelay: 1000,
    maxRetryDelay: 30000,
  });

  /* ─── 拖拽分割线 ─── */

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragStartRatioRef.current = splitRatio;

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragStartYRef.current = clientY;
    },
    [splitRatio]
  );

  useEffect(() => {
    if (!isDragging) return;

    const container = containerRef.current;
    if (!container) return;

    const containerHeight = container.clientHeight;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const deltaY = clientY - dragStartYRef.current;
      const deltaRatio = deltaY / containerHeight;
      const newRatio = Math.max(MIN_RATIO, Math.min(MAX_RATIO, dragStartRatioRef.current + deltaRatio));
      setSplitRatio(newRatio);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#0a0a0a] overflow-hidden select-none"
    >
      {/* 半透明遮罩 — 拖拽时防止 iframe 抢焦点 */}
      {isDragging && (
        <div
          className="absolute inset-0 z-50 bg-transparent"
          aria-hidden="true"
          style={{ cursor: 'row-resize' }}
        />
      )}

      {/* 上方：3D 地球区域 */}
      <div
        className="w-full overflow-hidden"
        style={{ height: `${splitRatio * 100}%` }}
        role="region"
        aria-label="3D 地球探索区域"
      >
        <Globe className="w-full h-full" />
      </div>

      {/* 可拖拽分割线 */}
      <div
        className="group relative z-40 w-full h-1.5 cursor-row-resize flex items-center justify-center"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        role="separator"
        aria-valuenow={Math.round(splitRatio * 100)}
        aria-valuemin={Math.round(MIN_RATIO * 100)}
        aria-valuemax={Math.round(MAX_RATIO * 100)}
        aria-label="拖拽调整地球和对话面板比例"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            setSplitRatio((r) => Math.min(MAX_RATIO, r + 0.02));
          } else if (e.key === 'ArrowDown') {
            setSplitRatio((r) => Math.max(MIN_RATIO, r - 0.02));
          }
        }}
      >
        {/* 分割线视觉表现 */}
        <div
          className={`w-full h-px transition-colors duration-200 ${
            isDragging ? 'bg-cyan-400/60' : 'bg-white/20 group-hover:bg-cyan-400/40'
          }`}
        />
        {/* 中央抓手图标 */}
        <div
          className={`absolute w-8 h-5 rounded-full border flex items-center justify-center
                      transition-all duration-200 ${
                        isDragging
                          ? 'bg-cyan-400/20 border-cyan-400/50 scale-110'
                          : 'bg-white/10 border-white/20 group-hover:bg-white/20 group-hover:border-white/30'
                      }`}
          aria-hidden="true"
        >
          <div className="flex gap-0.5">
            <div className="w-0.5 h-2 rounded-full bg-current opacity-40" />
            <div className="w-0.5 h-2 rounded-full bg-current opacity-40" />
            <div className="w-0.5 h-2 rounded-full bg-current opacity-40" />
          </div>
        </div>
      </div>

      {/* 下方：对话面板 */}
      <div
        className="w-full overflow-hidden"
        style={{ height: `${(1 - splitRatio) * 100}%` }}
        role="region"
        aria-label="对话面板区域"
      >
        <ChatPanel
          messages={messages}
          onSend={sendMessage}
          connectionStatus={connectionStatus}
        />
      </div>
    </div>
  );
};

export default Main;
