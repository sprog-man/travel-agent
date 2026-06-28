/**
 * ChatPanel.tsx — 对话面板组件
 *
 * 展示 Agent 消息（Markdown 渲染）和用户消息，
 * 底部输入框 + 发送按钮，消息列表自动滚动到底部。
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ChatMessage } from '../services/api';
import type { ConnectionStatus } from '../hooks/useWebSocket';

/* ─── Props ─── */

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  connectionStatus: ConnectionStatus;
}

/* ─── 子组件 ─── */

/** 连接状态指示器 */
const StatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
  const config: Record<ConnectionStatus, { color: string; label: string }> = {
    connecting: { color: 'bg-yellow-400', label: '连接中...' },
    connected: { color: 'bg-emerald-400', label: '已连接' },
    disconnected: { color: 'bg-gray-500', label: '未连接' },
    reconnecting: { color: 'bg-orange-400', label: '重连中...' },
  };

  const { color, label } = config[status];

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400" role="status" aria-label={label}>
      <span className={`w-2 h-2 rounded-full ${color}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
};

/** 工具调用状态展示 */
const ToolCallBadge: React.FC<{ toolName: string; status: 'running' | 'success' | 'error' }> = ({
  toolName,
  status,
}) => {
  const icon =
    status === 'running' ? (
      <span className="inline-block w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
    ) : status === 'success' ? (
      <span className="text-emerald-400" aria-hidden="true">&#10003;</span>
    ) : (
      <span className="text-red-400" aria-hidden="true">&#10007;</span>
    );

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 mt-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-400">
      {icon}
      <span>{toolName}</span>
    </div>
  );
};

/** 行程卡片 */
const ItineraryCard: React.FC<{ data: ChatMessage['itinerary'] }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 max-w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">
        {data.destination} 行程规划
      </h4>
      <p className="text-xs text-gray-400 mb-3">{data.summary}</p>
      <div className="space-y-3">
        {data.days.map((day) => (
          <div key={day.day}>
            <p className="text-xs font-semibold text-white mb-1">
              Day {day.day}: {day.title}
            </p>
            <div className="space-y-1 pl-3 border-l border-white/10">
              {day.activities.map((act, idx) => (
                <div key={idx} className="text-xs text-gray-300">
                  <span className="text-gray-500">{act.time}</span>{' '}
                  {act.place} — {act.description}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── 简易 Markdown 渲染 ─── */

/** 将简易 Markdown 文本渲染为 JSX（支持粗体、代码块、列表） */
function renderMarkdown(text: string): React.ReactNode {
  // Split by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    // Code block
    if (part.startsWith('```') && part.endsWith('```')) {
      const code = part.slice(3, -3).replace(/^\w+\n/, ''); // remove language line
      return (
        <pre
          key={i}
          className="mt-2 p-3 rounded-lg bg-black/50 border border-white/10 text-xs text-gray-300 overflow-x-auto"
        >
          <code>{code.trim()}</code>
        </pre>
      );
    }

    // Inline formatting
    const lines = part.split('\n');
    return lines.map((line, j) => {
      // Bold
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      // Inline code
      const withCode = formatted.replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-cyan-300 text-xs">$1</code>');

      // Unordered list item
      if (/^[\s]*[-*]\s/.test(line)) {
        return (
          <div key={`${i}-${j}`} className="flex gap-2 mt-1">
            <span className="text-gray-500" aria-hidden="true">&#8226;</span>
            <span dangerouslySetInnerHTML={{ __html: withCode }} />
          </div>
        );
      }

      // Ordered list item
      const orderedMatch = line.match(/^(\d+)\.\s/);
      if (orderedMatch) {
        return (
          <div key={`${i}-${j}`} className="flex gap-2 mt-1">
            <span className="text-gray-500 text-xs min-w-[1.2em]">{orderedMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: withCode.replace(/^\d+\.\s/, '') }} />
          </div>
        );
      }

      // Heading
      if (line.startsWith('### ')) {
        return (
          <p key={`${i}-${j}`} className="text-sm font-bold text-white mt-3 mb-1">
            {line.slice(4)}
          </p>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <p key={`${i}-${j}`} className="text-base font-bold text-white mt-4 mb-1">
            {line.slice(3)}
          </p>
        );
      }

      // Empty line
      if (line.trim() === '') {
        return <div key={`${i}-${j}`} className="h-2" />;
      }

      // Normal text
      return (
        <p
          key={`${i}-${j}`}
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: withCode || line }}
        />
      );
    });
  });
}

/* ─── 单条消息气泡 ─── */

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  if (message.role === 'system') {
    return (
      <div className="flex justify-center my-2" role="alert">
        <span className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {message.content}
        </span>
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm text-gray-200 ${
          isUser
            ? 'bg-cyan-500/20 border border-cyan-400/30 rounded-br-sm'
            : 'bg-white/[0.04] border border-white/10 rounded-bl-sm'
        }`}
        role={isUser ? undefined : 'article'}
        aria-label={isUser ? undefined : 'Agent 回复'}
      >
        {message.content && renderMarkdown(message.content)}
        {message.toolCalls?.map((tc, i) => (
          <ToolCallBadge key={i} toolName={tc.toolName} status={tc.status} />
        ))}
        {message.itinerary && <ItineraryCard data={message.itinerary} />}
      </div>
    </div>
  );
};

/* ─── 主组件 ─── */

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSend, connectionStatus }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
    inputRef.current?.focus();
  }, [input, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const isEmpty = messages.length === 0;

  return (
    <div
      className="flex flex-col h-full bg-[#0a0a0a] border-t border-white/10"
      role="region"
      aria-label="对话面板"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h2 className="text-sm font-semibold text-white tracking-wide">AI 旅行助手</h2>
        <StatusIndicator status={connectionStatus} />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4" role="log" aria-label="消息列表">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center select-none">
            <div className="text-4xl mb-4 opacity-30" aria-hidden="true">&#127758;</div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              点击地球探索目的地，或输入你的旅行想法
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述你想要的旅行..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-sm text-white placeholder-gray-500
                       focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07]
                       transition-colors duration-200"
            aria-label="输入消息"
            autoComplete="off"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                       bg-cyan-500/20 border border-cyan-400/30
                       hover:bg-cyan-500/30 hover:border-cyan-400/50
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-200
                       active:scale-95"
            aria-label="发送消息"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
