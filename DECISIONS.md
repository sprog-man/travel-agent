# Architecture Decision Log

Record of important design decisions and their rationale.

---

## 2026-06-28: Project Technology Stack

- **Decision**: React 18 + TypeScript + Vite + Three.js (react-globe.gl) for frontend; FastAPI + LangGraph + Python 3.11 for backend.
- **Reason**: Per SPEC.md — Three.js ecosystem best for 3D globe, FastAPI has native WebSocket support, LangGraph provides stateful graph workflows for Agent.
- **Constraints**: Requires Node.js 18+, Python 3.11+, Docker for containerization.
- **Alternatives considered**: Next.js (rejected — Vite faster for Three.js HMR), Flask (rejected — FastAPI async + WebSocket native), LangChain (rejected — LangGraph more explicit state control).
- **When to revisit**: When performance bottlenecks emerge or when LLM provider changes require different framework.

## 2026-06-28: Communication Protocol

- **Decision**: HTTP REST for `/api/guide` (lightweight globe click → Tavily search), WebSocket for `/api/plan` (full Agent workflow with streaming).
- **Reason**: Two different complexity levels — guide query is simple request/response, planning workflow requires multi-turn streaming with tool call visibility.
- **Constraints**: Client must handle both HTTP and WebSocket connections.
- **Alternatives considered**: SSE (rejected — WebSocket allows bidirectional feedback), gRPC (rejected — browser native WebSocket simpler).
- **When to revisit**: If real-time collaboration needed (switch to WebRTC) or if WebSocket scaling becomes an issue.

## 2026-06-28: LLM Provider Abstraction

- **Decision**: Abstract LLM behind `LLMProvider` base class with OpenAI/Anthropic implementations, configurable via `config/llm_config.json` with hot reload.
- **Reason**: SPEC.md requirement for frontend config page to switch providers without code changes.
- **Constraints**: All providers must implement `chat(messages, tools) → str` interface.
- **Alternatives considered**: LangChain LLMManager (rejected — adds dependency, abstract layer lightweight enough), direct API calls (rejected — need provider switching).
- **When to revisit**: When adding new provider types (Ollama, vLLM) — just add new subclass.
