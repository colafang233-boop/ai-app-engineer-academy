# 专栏三：LangChain v1 官方文档对齐版

## 适用版本

本专栏按 **2026-07-22** 可用的 LangChain JavaScript v1 文档和稳定包设计，课程示例以以下版本为准：

```json
{
  "langchain": "1.5.3",
  "@langchain/core": "1.2.3",
  "@langchain/langgraph": "1.4.8",
  "langsmith": "0.8.3",
  "zod": "4.4.3",
  "node": "22.x"
}
```

版本策略：

- `langchain` 使用 v1 精简后的 Agent 主线 API。
- `createAgent`、Middleware、Messages、Content Blocks、Structured Output、Streaming、Tools、Memory、Guardrails、HITL 和 Observability 都以当前 v1 文档为准。
- 旧式 Chains、Retrievers 和 Indexing API 已迁移到 `@langchain/classic`，不会混入本专栏主线；RAG 相关内容在第四专栏单独讲解。
- `createAgent` 基于 LangGraph 运行，但本专栏只讲 LangChain 高层 API；自定义 StateGraph、节点与边将在第五专栏展开。

## 官方文档总入口

- LangChain v1 更新说明：https://docs.langchain.com/oss/javascript/releases/langchain-v1
- LangChain v1 迁移指南：https://docs.langchain.com/oss/javascript/migrate/langchain-v1
- JavaScript LangChain 文档：https://docs.langchain.com/oss/javascript/langchain/overview
- LangChain v1 Changelog：https://docs.langchain.com/oss/javascript/releases/changelog

## 课程结构

### 第 10 课：LangChain v1 的边界与包结构

目标：正确区分 `langchain`、`@langchain/core`、模型集成包、`@langchain/langgraph`、`@langchain/classic` 和 LangSmith。

官方依据：

- https://docs.langchain.com/oss/javascript/releases/langchain-v1
- https://docs.langchain.com/oss/javascript/migrate/langchain-v1

互动实验：包归属分拣台。把 `createAgent`、Messages、旧 Chains、Graph、模型集成和 tracing 放进正确包中。

项目成果：`langchainArchitectureDecision`

### 第 11 课：Messages 与标准 Content Blocks

目标：掌握 System/Human/AI/Tool Message、`text`、`content`、`contentBlocks`、tool calls、usage metadata 和 response metadata。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/messages

互动实验：供应商消息归一化实验。将 OpenAI/Anthropic 原生内容转换为标准 text、reasoning、image、citation 与 tool block。

项目成果：`messageContractV1`

### 第 12 课：标准模型接口、Profiles 与 Batch

目标：掌握 `initChatModel`、`invoke`、`stream`、`batch`、RunnableConfig、并发限制、超时、usage 和模型能力 Profile。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/models
- https://docs.langchain.com/oss/javascript/releases/changelog

互动实验：模型能力与批处理调度台。根据任务选择支持结构化输出、工具、多模态和推理的模型，并配置批量并发。

项目成果：`modelRuntimeConfig`

### 第 13 课：模型与 Agent 的结构化输出

目标：区分模型 `withStructuredOutput` 与 Agent `responseFormat`，理解 Provider Strategy、Tool Strategy、Schema 错误与多结构输出冲突。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/structured-output
- https://docs.langchain.com/oss/javascript/langchain/models

互动实验：结构化输出策略选择器。根据模型 Profile、是否同时使用工具和错误类型选择策略。

项目成果：`structuredOutputPolicy`

### 第 14 课：Streaming、Stream Modes 与 Event Streaming

目标：掌握模型 `AIMessageChunk`、Agent `updates/messages/custom` 模式、组合多模式，以及应用层推荐的 `streamEvents(..., { version: "v3" })`。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/streaming
- https://docs.langchain.com/oss/javascript/langchain/event-streaming

互动实验：多通道事件控制台。把 token、Agent step、tool lifecycle 和自定义进度映射为不同 UI 区域。

项目成果：`eventStreamingContract`

### 第 15 课：Tools、Zod 与 Runtime Context

目标：掌握 `tool()`、Zod Schema、tool calls、ToolMessage、只读/写操作权限、运行时上下文和错误回传。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/tools

互动实验：工具最小权限与上下文注入台。修复参数 Schema，选择最小工具集合，并注入用户/租户上下文。

项目成果：`runtimeToolRegistry`

### 第 16 课：createAgent、Agent State 与停止条件

目标：理解 `createAgent` 的模型—工具循环、Messages State、自定义 State/Context、structuredResponse 和终止条件。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/agents
- https://docs.langchain.com/oss/javascript/releases/langchain-v1

互动实验：Agent State 单步执行器。观察 model node、tools node、state update、final response 和 iteration limit。

项目成果：`agentStateContract`

### 第 17 课：Middleware 与 Context Engineering

目标：掌握 Middleware 的 before/after/wrap hooks，以及动态 Prompt、模型选择、工具过滤、结果拦截和 early termination。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/middleware/overview
- https://docs.langchain.com/oss/javascript/langchain/middleware/built-in

互动实验：Middleware Hook 流水线。为请求配置动态 Prompt、模型路由、工具筛选和结果校验，并观察 hook 顺序影响。

项目成果：`middlewarePipeline`

### 第 18 课：短期记忆、Checkpointer 与 Thread

目标：掌握 Agent State、Checkpointer、`thread_id`、线程隔离、恢复执行、消息裁剪和摘要策略。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/short-term-memory
- https://docs.langchain.com/oss/javascript/concepts/memory

互动实验：多线程记忆实验。切换 thread ID、保存用户信息、恢复对话，并模拟窗口超限后的裁剪与摘要。

项目成果：`memoryPolicy`

### 第 19 课：Retries、Fallback 与调用限额

目标：掌握 model/tool retry、指数退避、jitter、失败处理、model fallback、model/tool call limit 和成本保护。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/middleware/built-in
- https://docs.langchain.com/oss/javascript/releases/changelog

互动实验：故障注入与恢复台。依次制造 429、503、工具超时和主模型故障，配置正确的 retry/fallback/limit 策略。

项目成果：`reliabilityPolicy`

### 第 20 课：Guardrails 与 Human-in-the-loop

目标：掌握 PII 检测、输入/输出/工具结果检查、Prompt Injection 防护、敏感工具审批，以及 approve/edit/reject/respond。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/guardrails
- https://docs.langchain.com/oss/javascript/langchain/human-in-the-loop

互动实验：敏感操作审批台。对删除、退款和邮件发送操作设置不同审批策略，处理 interrupt 并恢复执行。

项目成果：`safetyAndApprovalPolicy`

### 第 21 课：LangSmith Trace 与生产综合项目

目标：掌握 Trace、Run、模型/工具/Agent 决策节点、metadata、tags、项目隔离和问题定位；完成生产级客服 Agent 设计。

官方依据：

- https://docs.langchain.com/oss/javascript/langchain/observability
- https://docs.langchain.com/langsmith/observability-quickstart
- https://docs.langchain.com/langsmith/observability

互动实验：Trace 调试器与发布清单。定位一次 Agent 失败的具体 Run，并完成版本、可观测性、可靠性和安全检查。

项目成果：`langchainProductionBlueprint`

## 掌握标准

完成本专栏后可以称为：

> 具备使用 LangChain JavaScript v1 构建、调试和交付常见 Agent 应用的工作能力。

不能仅凭本专栏声称：

- 掌握自定义 LangGraph 编排
- 掌握完整 RAG 工程
- 掌握所有模型供应商特性
- 掌握线上容量规划和分布式部署

这些能力会在后续专栏继续完成。
