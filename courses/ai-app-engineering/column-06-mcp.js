import { mcpLessons59To65 } from './column-06-mcp-lessons-59-65.js';
import { mcpLessons66To72 } from './column-06-mcp-lessons-66-72.js';
import { mcpLessons73To78 } from './column-06-mcp-lessons-73-78.js';
import { mcpLessons79To83 } from './column-06-mcp-lessons-79-83.js';

export const mcpLessons = [...mcpLessons59To65, ...mcpLessons66To72, ...mcpLessons73To78, ...mcpLessons79To83];

export const mcpExam = {
  id: 'exam-column-06-mcp',
  columnId: 'column-06',
  title: '专栏六综合考试 · MCP 协议、接入、授权与部署',
  description: '通过线 80%。覆盖协议心智模型、Server/Client 原语、真实 Host 接入、TypeScript 开发、Transport、OAuth、机器身份、Cloudflare 部署、安全、测试与跨 Host 综合交付。',
  questions: [
    { text: "一个仅在单体服务内部使用的函数，什么时候最需要 MCP？", options: ["需要被多个 AI Host 标准复用时", "代码行数超过 20 行时", "使用 TypeScript 时"], correct: 0 },
    { text: "一个 Host 连接三个 Server，协议层通常有几个 Client 连接？", options: ["每个 Server 一个", "始终只有一个", "由 Server 共享一个"], correct: 0 },
    { text: "客户端未声明 Elicitation 时，Server 应怎么做？", options: ["不要调用并提供替代失败路径", "仍然直接调用", "改用日志模拟用户输入"], correct: 0 },
    { text: "固定课程 Markdown 最适合哪种原语？", options: ["Resource", "高风险写 Tool", "Sampling"], correct: 0 },
    { text: "用户显式选择的审查模板最适合哪种原语？", options: ["Prompt", "Root", "Task"], correct: 0 },
    { text: "Streamable HTTP 描述的是什么？", options: ["Transport", "OAuth Scope", "分发模式"], correct: 0 },
    { text: "ChatGPT Web 与 Codex CLI 的本地 stdio 能力是否完全相同？", options: ["不相同，需按 Host 官方能力验证", "完全相同", "只由 Server 决定"], correct: 0 },
    { text: "自己的 LangGraph 服务要控制重试与 Trace，应怎样接入 MCP？", options: ["在应用内嵌入 MCP Client", "只能使用 Hosted MCP", "让 Server 控制整个 Graph"], correct: 0 },
    { text: "普通远程 MCP Endpoint 与 ChatGPT App 的主要额外差异是什么？", options: ["App 增加扫描、治理、权限和发布层", "App 自动变成本地进程", "App 不再使用 MCP"], correct: 0 },
    { text: "何时不应把复杂 Agent 压扁成单个 Tool？", options: ["调用方需要完整 Thread/Turn/Diff/审批事件时", "Agent 内部有两个节点时", "任何时候都不应"], correct: 0 },
    { text: "stdio Server 的普通调试日志应写到哪里？", options: ["stderr", "stdout", "Tool 参数"], correct: 0 },
    { text: "写 Tool 超时后怎样避免重复副作用？", options: ["幂等键与状态查询", "无限重试", "让模型记住上次调用"], correct: 0 },
    { text: "academy://lessons/{lessonId} 属于什么？", options: ["Resource Template", "固定 Resource", "Prompt"], correct: 0 },
    { text: "Prompt 参数候选由 Server 提供，应使用什么？", options: ["Completion", "Sampling", "Roots"], correct: 0 },
    { text: "多个远程 Server 工具列表稳定但发现较慢，应如何优化？", options: ["缓存并在变更通知时失效", "永久写进 Prompt", "每个 token 重新发现"], correct: 0 },
    { text: "新远程 MCP 应优先什么 Transport？", options: ["Streamable HTTP", "旧 SSE only", "stdio over public internet"], correct: 0 },
    { text: "远程写调用断线后第一步是什么？", options: ["查询幂等键/Task 状态", "立即重复创建", "假设成功"], correct: 0 },
    { text: "Authentication、Authorization、Approval 的关系是什么？", options: ["身份、权限和本次同意三层不同门禁", "三个词完全同义", "只有 Tool Schema 一层"], correct: 0 },
    { text: "OAuth Access Token 的 aud 指向别的 API，MCP Server 应怎么做？", options: ["拒绝", "Scope 匹配就接受", "转发给下游"], correct: 0 },
    { text: "无交互 CI 定时扫描最适合什么身份？", options: ["机器身份 Client Credentials/Workload Identity", "员工个人长期 Token", "匿名写入"], correct: 0 },
    { text: "无状态只读课程 MCP 是否必须 Durable Objects？", options: ["不必须", "必须", "只能本地运行"], correct: 0 },
    { text: "Durable Object 会话完成后的永久业务记录应放哪里？", options: ["正式持久数据库", "模块全局变量", "模型上下文"], correct: 0 },
    { text: "Resource 中的 Prompt Injection 是否可能诱导敏感 Tool？", options: ["可能，Resource 应视为不可信数据", "不可能", "OAuth 会自动过滤"], correct: 0 },
    { text: "Inspector 调通一次能否替代协议、授权和故障测试？", options: ["不能", "可以", "只需再看截图"], correct: 0 },
    { text: "跨 Codex、ChatGPT、自研 Agent 的写 Tool怎样保持一致安全？", options: ["Server 统一 Scope/ACL/幂等，各 Host 执行审批", "每个 Host 各写一句 Prompt", "开放匿名写入"], correct: 0 },
  ],
};

export const mcpResearchBaseline = {
  asOf: '2026-07-23',
  protocol: '2025-11-25',
  packages: {
    '@modelcontextprotocol/sdk': '1.29.0',
    zod: '4.x',
    node: '22.x',
  },
  transports: ['stdio', 'Streamable HTTP'],
  integrationModes: ['native host configuration', 'embedded client', 'hosted MCP', 'app/plugin', 'gateway/tunnel', 'agent-as-server'],
  authModes: ['anonymous', 'API key', 'Bearer token', 'OAuth delegated', 'client credentials', 'workload identity', 'SSO/tunnel'],
  note: '当前正式协议仍是 2025-11-25，TypeScript SDK 生产主线为 v1.29.0。2026-07-28 Release Candidate 已发布，包含无状态核心、Extensions/Tasks 调整及 Roots、Sampling、Logging 弃用计划；正式版发布后必须重审本专栏。Host 支持矩阵接入前也必须重新核对。',
};

export function extendWithMcpColumn(course) {
  return {
    ...course,
    qualityReviewModeDefault: false,
    mcpResearchBaseline,
    columns: [
      ...course.columns,
      {
        id: 'column-06',
        title: '专栏六 · MCP 协议、工具服务与企业集成',
        description: '从 Host/Client/Server、Tools/Resources/Prompts 与生命周期，到 Codex、ChatGPT、自研 Agent、Hosted MCP、TypeScript Client/Server、OAuth、Cloudflare、Gateway、安全和跨 Host 综合项目。',
        lessonIds: mcpLessons.map((lesson) => lesson.id),
        examId: mcpExam.id,
        prerequisiteExamId: 'exam-column-05-langgraph',
      },
    ],
    lessons: [...course.lessons, ...mcpLessons],
    exams: [...course.exams, mcpExam],
  };
}
