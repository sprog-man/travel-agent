import React, { useState } from 'react';

/**
 * ChatPanel — 固定右侧聊天面板
 *
 * 布局：占据右侧 40% 宽度，全高
 * - Header：标题
 * - Messages：消息列表（flex-1, 滚动）
 * - Input：输入框区域
 */
const ChatPanel: React.FC = () => {
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
    <div className="flex flex-col h-full bg-[#111]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-lg font-medium text-white">AI Travel Assistant</h2>
        <p className="text-xs text-white/40 mt-1">
          Click on the map to start planning your journey
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {/* Placeholder */}
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white/40"
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
          <p className="text-sm text-white/50 max-w-xs">
            Click anywhere on the map to explore destinations and get AI-powered travel recommendations
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-end gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your trip..."
            rows={2}
            className="flex-1 px-4 py-3 rounded-xl
                       bg-white/5 border border-white/10
                       text-white text-sm placeholder-white/30
                       focus:outline-none focus:border-white/20
                       transition-colors resize-none"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="px-5 py-3 rounded-xl
                       bg-white text-[#0A0A0A] font-medium text-sm
                       hover:opacity-85
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-opacity
                       flex items-center gap-2"
            aria-label="Send"
          >
            <svg
              className="w-5 h-5"
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
    </div>
  );
};

export default ChatPanel;
