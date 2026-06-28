/**
 * api.ts — HTTP + WebSocket 通信服务层
 *
 * 提供 REST API 调用和 WebSocket 连接创建函数，
 * 以及所有消息类型定义（TypeScript discriminated union）。
 */

/* ─── 消息类型定义 ─── */

/** Agent 流式消息（逐 token 追加） */
interface AgentMessage {
  type: 'agent_message';
  content: string;
  requestId: string;
  timestamp: string;
}

/** 工具调用通知 */
interface ToolCallMessage {
  type: 'tool_call';
  toolName: string;
  args: Record<string, unknown>;
  requestId: string;
  timestamp: string;
}

/** 行程数据 */
interface ItineraryMessage {
  type: 'itinerary';
  data: ItineraryData;
  requestId: string;
  timestamp: string;
}

/** 错误消息 */
interface ErrorMessage {
  type: 'error';
  message: string;
  code?: string;
  requestId: string;
  timestamp: string;
}

/** 所有 WebSocket 消息的联合类型 */
type WSMessage = AgentMessage | ToolCallMessage | ItineraryMessage | ErrorMessage;

/** 行程数据结构 */
interface ItineraryData {
  destination: string;
  days: ItineraryDay[];
  summary: string;
  generatedAt: string;
}

/** 单日行程 */
interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

/** 单项活动 */
interface ItineraryActivity {
  time: string;
  place: string;
  description: string;
  tips?: string;
}

/** 聊天消息（前端展示用） */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCallInfo[];
  itinerary?: ItineraryData;
}

/** 工具调用信息（展示用） */
interface ToolCallInfo {
  toolName: string;
  status: 'running' | 'success' | 'error';
  result?: string;
}

/** HTTP API 请求参数 */
interface GuideRequest {
  destination: string;
  preferences?: string[];
  days?: number;
}

/** HTTP API 响应 */
interface GuideResponse {
  success: boolean;
  data?: ItineraryData;
  error?: string;
}

/** LLM 配置 */
interface LLMConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

/* ─── 常量 ─── */

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';
const WS_BASE = import.meta.env.VITE_WS_BASE ?? 'ws://localhost:8000';

/* ─── HTTP API ─── */

/**
 * 发送旅行攻略请求（HTTP POST）
 * @param request 攻略请求参数
 * @returns 攻略响应
 */
async function fetchGuide(request: GuideRequest): Promise<GuideResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    return (await response.json()) as GuideResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Network error: ${message}` };
  }
}

/**
 * 获取 LLM 配置
 */
async function fetchLLMConfig(): Promise<LLMConfig | null> {
  try {
    const response = await fetch(`${API_BASE}/api/llm-config`);
    if (!response.ok) return null;
    return (await response.json()) as LLMConfig;
  } catch {
    return null;
  }
}

/**
 * 更新 LLM 配置
 */
async function updateLLMConfig(config: LLMConfig): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/llm-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/* ─── WebSocket ─── */

/**
 * 创建 WebSocket 连接用于实时对话
 * @param destination 目的地
 * @returns WebSocket 实例
 */
function createPlanWebSocket(destination: string): WebSocket {
  const params = new URLSearchParams({ destination });
  return new WebSocket(`${WS_BASE}/api/plan?${params.toString()}`);
}

export type {
  WSMessage,
  AgentMessage,
  ToolCallMessage,
  ItineraryMessage,
  ErrorMessage,
  ItineraryData,
  ItineraryDay,
  ItineraryActivity,
  ChatMessage,
  ToolCallInfo,
  GuideRequest,
  GuideResponse,
  LLMConfig,
};

export { fetchGuide, fetchLLMConfig, updateLLMConfig, createPlanWebSocket, API_BASE, WS_BASE };
