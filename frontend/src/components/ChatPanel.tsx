import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../services/api';
import type { ConnectionStatus } from '../hooks/useWebSocket';

interface ChatPanelProps {
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  connectionStatus: ConnectionStatus;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, sendMessage, connectionStatus }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusLabel: Record<ConnectionStatus, string> = {
    connected: 'Connected',
    connecting: 'Connecting...',
    reconnecting: 'Reconnecting...',
    disconnected: 'Offline',
  };

  return (
    <div className="flex flex-col h-full bg-[#111]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">AI Travel Assistant</h2>
          <p className="text-xs text-white/40 mt-1">
            Click on the map to start planning your journey
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
          connectionStatus === 'disconnected' ? 'bg-white/10 text-white/40' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {statusLabel[connectionStatus]}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-sm text-white/50 max-w-xs">
              Click anywhere on the map to explore destinations and get AI-powered travel recommendations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-white text-[#0A0A0A]'
                    : msg.role === 'system'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-white/5 text-white/90'
                }`}>
                  {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                  {/* Tool Calls */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.toolCalls.map((tc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tc.status === 'running' ? 'bg-yellow-400 animate-pulse' :
                            tc.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                          <span>{tc.toolName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Itinerary Card */}
                  {msg.itinerary && (
                    <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-white/40 mb-2">Generated Itinerary</p>
                      <p className="text-sm text-white/80 font-medium">{msg.itinerary.destination}</p>
                      <p className="text-xs text-white/50 mt-1">{msg.itinerary.summary}</p>
                      {msg.itinerary.days && msg.itinerary.days.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.itinerary.days.map((day) => (
                            <div key={day.day} className="text-xs text-white/60">
                              Day {day.day}: {day.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
