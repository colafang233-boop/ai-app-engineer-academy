# 专栏五：LangGraph v1 与 Agentic RAG 互动教学蓝图

## 1. 专栏定位

本专栏不是把 LangGraph API 按目录逐项讲解，也不是把普通 `createAgent` 改写成更复杂的图。

教学目标是让学习者获得四类工作能力：

1. 判断普通函数、Workflow、LangChain `createAgent`、Functional API 和 StateGraph 的适用边界。
2. 用 State、Node、Edge、Reducer、Superstep、Checkpoint 与 Thread 解释一次真实执行。
3. 设计可以暂停、恢复、重放、分支、并行和长期运行的状态型系统。
4. 把第四专栏的框架中立 RAG 契约升级为有路由、自纠错、Grounding 门禁和预算控制的 Agentic RAG。

适用版本基线（2026-07-23）：

```json
{
  "@langchain/langgraph": "1.4.8",
  "@langchain/core": "1.2.3",
  "langchain": "1.5.3",
  "zod": "4.4.3",
  "node": "22.x"
}
```

`createReactAgent` 不作为 v1 主线教学 API。常见工具循环优先使用 LangChain `createAgent`；需要自定义状态和控制流时才下沉 LangGraph。

## 2. 最佳学习顺序

官方 Quickstart 和 TypeScript Academy 从 Nodes、Edges、Conditional Edges、Memory 与 Interrupt 建立基础。本课程进一步按生产能力分为七层：

```text
编排适用性
→ State 与执行模型
→ 确定性 Workflow 模式
→ Durable Execution 与 Persistence
→ Human-in-the-loop 与 Time Travel
→ Subgraph、Multi-agent 与 Agentic RAG
→ Testing、Frontend、Deployment 与 Release Gate
```

每一课继续使用学院统一教学语法：

```text
先判断
→ 动手实验
→ 原理揭示
→ 迁移应用
→ 保存工程成果
```

## 3. 前置知识和名词策略

每节课在主实验之前显示两块内容：

- **开始本课前，你需要知道**：列出必要前置能力，不把未学概念当作默认常识。
- **本课专业名词**：用业务语言解释术语，并在实验中让术语对应可观察行为。

例如 Reducer 不只解释为“合并函数”，而是让三个并行节点同时写入数组、计数器和 Messages，观察 overwrite、append、sum、union 与 MessagesValue 的差异。

## 4. 20 节课程颗粒度

### 基础执行模型（39–45）

- 39：LangGraph 适用性判断。
- 40：State、Node、Edge、START、END 与 Superstep。
- 41：StateSchema、Channel 与 Reducer。
- 42：Node 颗粒度、副作用、幂等与 Checkpoint 边界。
- 43：固定 Edge、Conditional Edge 与 Command。
- 44：静态并行、动态 Send、fan-out/fan-in 与并发预算。
- 45：Prompt Chaining、Parallelization、Routing、Orchestrator-worker、Evaluator-optimizer 与 Agent。

### 可恢复执行（46–52）

- 46：Graph API 与 Functional API。
- 47：Durable Execution、task、确定性重放和副作用。
- 48：Checkpoint、Thread、StateSnapshot 与恢复。
- 49：Interrupt、类型化载荷与 Command resume。
- 50：Time Travel Replay 与 Fork。
- 51：values、updates、messages、custom、debug 与前端节点状态。
- 52：短期 Thread State 与长期 Store namespace。

### 复杂系统与生产交付（53–58）

- 53：Subgraph State mapping 与 persistence modes。
- 54：Single Agent、Router、Subagents、Handoffs 与 Workflow。
- 55：Agentic RAG 知识路由。
- 56：Retrieve–Grade–Correct 有限循环。
- 57：Evidence sufficiency、Groundedness、Citation、Relevance 与 Abstention。
- 58：测试、迁移、Trace、Streaming、应用结构、部署、灰度与回滚。

## 5. 交互组件复用

继续复用已有 CourseRuntime：PredictionGate、RetryableQuiz、ArtifactStore、ProgressStore、考试、项目成果抽屉、规则排序、参数控制、Trace、故障注入和发布门禁。

只新增三类 LangGraph 专用可视化：

- `GraphExecutionCanvas`：播放 Superstep 和 StateSnapshot。
- `StateChannelBoard`：实验不同 Reducer 的合并结果。
- `CheckpointForkTree`：选择历史 Checkpoint，比较 Replay 与 Fork。

## 6. 工程成果链

本专栏输出 20 份可继续用于后续 MCP 和综合项目的工程契约：

```text
Orchestration Decision
Graph Execution Mental Model
State Reducer Contract
Node Boundary Policy
Routing & Command Policy
Parallel Send Policy
Workflow Pattern Catalog
Graph/Functional API Decision
Durable Execution Policy
Checkpoint & Thread Contract
Interrupt & Resume Contract
Time Travel Debug Plan
Streaming UI Contract
Memory Scope Policy
Subgraph Composition Policy
Multi-agent Architecture Decision
Agentic Retrieval Router
Retrieval Correction Loop
Evidence & Grounding Loop
LangGraph Production Blueprint
```

## 7. 临时质量审阅模式

第五专栏完成后，课程默认进入 `qualityReviewModeDefault=true`：

- 所有已开发课程和考试直接开放。
- 总控台一次展示五个已开发专栏。
- 第六、七专栏只显示路线，不生成虚假占位课。
- URL 加 `?review=0` 可恢复原来的逐课、逐专栏解锁逻辑。

该模式用于内容验收，不会删除 ProgressStore、考试结果或正式学习路径实现。

## 8. 质量门禁

- 课程编号连续为 39–58，共 20 课。
- 每课有 2 个以上前置知识、3 个以上术语和至少 2 个官方资料入口。
- 20 个实验必须产生 20 个不同项目成果。
- 不允许出现已弃用 `createReactAgent` 主线示例。
- 浏览器测试必须完成全部实验和综合考试。
- 验证旧 1–38 课回归、Cloudflare 构建、控制台错误和 390px 横向溢出。
