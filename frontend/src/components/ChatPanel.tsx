import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ChatPanel — 浮动聊天面板
 *
 * 规范：frontend-spec.md § 5, § 7
 * - 折叠态：圆形浮动按钮 (w-14 h-14)
 * - 展开态：面板 (w-[380px] max-h-[560px])
 * - z-50 层级
 * - Framer Motion spring 动画 (stiffness: 400, damping: 30)
 */
const ChatPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    // TODO: 连接后端 WebSocket
    console.log('Send:', inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isExpanded ? (
          // 折叠态 - 圆形按钮
          <motion.button
            key="toggle"
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14
                       bg-white/10 backdrop-blur-xl border border-white/10
                       rounded-full
                       flex items-center justify-center
                       hover:bg-white/15 transition-colors
                       shadow-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            aria-label="Open chat"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </motion.button>
        ) : (
          // 展开态 - 面板
          <motion.div
            key="panel"
            className="w-[380px] max-h-[560px]
                       bg-[#111] backdrop-blur-2xl border border-white/10
                       rounded-2xl shadow-2xl
                       flex flex-col overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-medium text-white">AI Travel Assistant</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 rounded-full
                           flex items-center justify-center
                           hover:bg-white/10 transition-colors"
                aria-label="Minimize"
              >
                <svg
                  className="w-4 h-4 text-white/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {/* Placeholder */}
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-white/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-white/40 max-w-xs">
                  Click on the map to start planning your journey
                </p>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-end gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  rows={1}
                  className="flex-1 px-3 py-2 rounded-lg
                             bg-white/5 border border-white/10
                             text-white text-sm placeholder-white/30
                             focus:outline-none focus:border-white/20
                             transition-colors resize-none"
                  style={{ maxHeight: '100px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="px-3 py-2 rounded-lg
                             bg-white text-[#0A0A0A] font-medium text-sm
                             hover:opacity-85
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-opacity
                             flex items-center gap-1"
                  aria-label="Send"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPanel;
