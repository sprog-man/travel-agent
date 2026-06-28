/**
 * useWebSocket.ts — WebSocket 连接管理 Hook
 *
 * 管理 WebSocket 生命周期：连接、消息接收、断线重连（指数退避）。
 * 返回连接状态、消息列表和发送函数。
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPlanWebSocket } from '../services/api';
import type { WSMessage, ChatMessage } from '../services/api';

/** 连接状态枚举 */
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

/** useWebSocket 返回值 */
interface UseWebSocketReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  connectionStatus: ConnectionStatus;
  connect: (destination: string) => void;
  disconnect: () => void;
}

/** Hook 配置 */
interface UseWebSocketOptions {
  /** 最大重连次数，默认 5 */
  maxRetries?: number;
  /** 初始重连延迟（ms），默认 1000 */
  initialRetryDelay?: number;
  /** 最大重连延迟（ms），默认 30000 */
  maxRetryDelay?: number;
}

/** 生成唯一消息 ID */
function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * useWebSocket — 管理与后端 Agent 的 WebSocket 通信
 *
 * @param options 配置选项
 * @returns 消息列表、发送函数、连接状态、连接控制函数
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    maxRetries = 5,
    initialRetryDelay = 1000,
    maxRetryDelay = 30000,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationRef = useRef('');
  const currentAssistantIdRef = useRef<string | null>(null);

  /** 清除重连定时器 */
  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  /** 处理接收到的 WebSocket 消息 */
  const handleMessage = useCallback((event: MessageEvent) => {
    let parsed: WSMessage;
    try {
      parsed = JSON.parse(event.data as string) as WSMessage;
    } catch {
      console.error('[useWebSocket] Failed to parse message:', event.data);
      return;
    }

    switch (parsed.type) {
      case 'agent_message': {
        const assistantId = currentAssistantIdRef.current;
        if (assistantId) {
          // 追加到当前 assistant 消息
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: msg.content + parsed.content }
                : msg
            )
          );
        } else {
          // 创建新的 assistant 消息
          const newId = generateMessageId();
          currentAssistantIdRef.current = newId;
          setMessages((prev) => [
            ...prev,
            {
              id: newId,
              role: 'assistant',
              content: parsed.content,
              timestamp: Date.now(),
            },
          ]);
        }
        break;
      }

      case 'tool_call': {
        const toolInfo = {
          toolName: parsed.toolName,
          status: 'running' as const,
        };
        const assistantId = currentAssistantIdRef.current;
        if (assistantId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, toolCalls: [...(msg.toolCalls ?? []), toolInfo] }
                : msg
            )
          );
        }
        break;
      }

      case 'itinerary': {
        setMessages((prev) => [
          ...prev,
          {
            id: generateMessageId(),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            itinerary: parsed.data,
          },
        ]);
        currentAssistantIdRef.current = null;
        break;
      }

      case 'error': {
        setMessages((prev) => [
          ...prev,
          {
            id: generateMessageId(),
            role: 'system',
            content: `Error: ${parsed.message}`,
            timestamp: Date.now(),
          },
        ]);
        currentAssistantIdRef.current = null;
        break;
      }

      default:
        break;
    }
  }, []);

  /** 建立 WebSocket 连接 */
  const connect = useCallback(
    (destination: string) => {
      // 关闭现有连接
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      clearRetryTimer();

      destinationRef.current = destination;
      retryCountRef.current = 0;
      currentAssistantIdRef.current = null;
      setConnectionStatus('connecting');

      const ws = createPlanWebSocket(destination);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        retryCountRef.current = 0;
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('[useWebSocket] Error:', error);
      };

      ws.onclose = (event) => {
        wsRef.current = null;
        currentAssistantIdRef.current = null;

        // 正常关闭
        if (event.code === 1000) {
          setConnectionStatus('disconnected');
          return;
        }

        // 需要重连
        if (retryCountRef.current < maxRetries) {
          setConnectionStatus('reconnecting');
          const delay = Math.min(
            initialRetryDelay * Math.pow(2, retryCountRef.current),
            maxRetryDelay
          );
          retryCountRef.current += 1;

          retryTimerRef.current = setTimeout(() => {
            connect(destinationRef.current);
          }, delay);
        } else {
          setConnectionStatus('disconnected');
        }
      };
    },
    [
      clearRetryTimer,
      handleMessage,
      maxRetries,
      initialRetryDelay,
      maxRetryDelay,
    ]
  );

  /** 发送用户消息 */
  const sendMessage = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn('[useWebSocket] WebSocket is not open, cannot send message');
        return;
      }

      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      currentAssistantIdRef.current = null;

      wsRef.current.send(JSON.stringify({ message: text }));
    },
    []
  );

  /** 断开连接 */
  const disconnect = useCallback(() => {
    clearRetryTimer();
    retryCountRef.current = 0;

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }

    setConnectionStatus('disconnected');
  }, [clearRetryTimer]);

  // 卸载时清理
  useEffect(() => {
    return () => {
      clearRetryTimer();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
  }, [clearRetryTimer]);

  return {
    messages,
    sendMessage,
    connectionStatus,
    connect,
    disconnect,
  };
}

export type { ConnectionStatus, UseWebSocketReturn, UseWebSocketOptions };
