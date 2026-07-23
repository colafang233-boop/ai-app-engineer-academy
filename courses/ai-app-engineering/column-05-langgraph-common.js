export const langGraphVersion = '@langchain/langgraph@1.4.8 · @langchain/core@1.2.3 · langchain@1.5.3 · zod@4.4.3 · Node 22.x';

export const sources = {
  overview: { label: 'LangGraph Overview', url: 'https://docs.langchain.com/oss/javascript/langgraph/overview' },
  v1: { label: 'LangGraph v1 Release', url: 'https://docs.langchain.com/oss/javascript/releases/langgraph-v1' },
  quickstart: { label: 'LangGraph Quickstart', url: 'https://docs.langchain.com/oss/javascript/langgraph/quickstart' },
  academy: { label: 'LangGraph Essentials · TypeScript', url: 'https://academy.langchain.com/courses/quickstart-langgraph-essentials-typescript' },
  graphApi: { label: 'Graph API Overview', url: 'https://docs.langchain.com/oss/javascript/langgraph/graph-api' },
  useGraph: { label: 'Use the Graph API', url: 'https://docs.langchain.com/oss/javascript/langgraph/use-graph-api' },
  thinking: { label: 'Thinking in LangGraph', url: 'https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph' },
  workflows: { label: 'Workflows and Agents', url: 'https://docs.langchain.com/oss/javascript/langgraph/workflows-agents' },
  functional: { label: 'Functional API Overview', url: 'https://docs.langchain.com/oss/javascript/langgraph/functional-api' },
  useFunctional: { label: 'Use the Functional API', url: 'https://docs.langchain.com/oss/javascript/langgraph/use-functional-api' },
  persistence: { label: 'Persistence and Checkpoints', url: 'https://docs.langchain.com/oss/javascript/langgraph/persistence' },
  interrupts: { label: 'Interrupts', url: 'https://docs.langchain.com/oss/javascript/langgraph/interrupts' },
  timeTravel: { label: 'Replay and Fork with Time Travel', url: 'https://docs.langchain.com/oss/javascript/langgraph/use-time-travel' },
  streaming: { label: 'LangGraph Streaming', url: 'https://docs.langchain.com/oss/javascript/langgraph/streaming' },
  frontend: { label: 'Graph Execution Frontend', url: 'https://docs.langchain.com/oss/javascript/langgraph/frontend/graph-execution' },
  memory: { label: 'LangGraph Memory', url: 'https://docs.langchain.com/oss/javascript/langgraph/add-memory' },
  subgraphs: { label: 'Use Subgraphs', url: 'https://docs.langchain.com/oss/javascript/langgraph/use-subgraphs' },
  router: { label: 'Multi-agent Router', url: 'https://docs.langchain.com/oss/javascript/langchain/multi-agent/router' },
  subagents: { label: 'Subagents', url: 'https://docs.langchain.com/oss/javascript/langchain/multi-agent/subagents' },
  rag: { label: 'Custom Agentic RAG with LangGraph', url: 'https://docs.langchain.com/oss/javascript/langgraph/agentic-rag' },
  retrieval: { label: 'RAG Architecture Comparison', url: 'https://docs.langchain.com/oss/javascript/langchain/retrieval' },
  test: { label: 'Testing LangGraph', url: 'https://docs.langchain.com/oss/javascript/langgraph/test' },
  structure: { label: 'Application Structure', url: 'https://docs.langchain.com/oss/javascript/langgraph/application-structure' },
};

export const prediction = (title, description, correctValue, options, correctText, incorrectText = '先保留这个判断，下面通过实验验证。') => ({
  id: 'prediction', type: 'prediction', title, description, correctValue, options, correctText, incorrectText,
});

export const reveal = (title, description, html) => ({ id: 'reveal', type: 'content', title, description, html });

export const transfer = (title, description, correctValue, options, correctText) => ({
  id: 'transfer', type: 'quiz', title, description, correctValue, options, correctText,
});

export const official = (...links) => ({
  appliesTo: langGraphVersion,
  links,
  note: '本课按 2026-07-23 可用的 LangGraph JavaScript v1 官方文档与稳定包设计。升级依赖前必须重新核对 Release Notes、API Reference 与迁移说明。',
});

export const term = (name, definition) => ({ name, definition });
