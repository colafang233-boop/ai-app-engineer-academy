# AI 应用开发学院

面向 Java / CRUD 开发者的互动式 AI 应用工程课程。从模型调用与 Prompt 开始，逐步进入 LangChain、RAG、LangGraph、MCP，最终完成一个可评估、可审计、可恢复、可回滚的企业 AI Service Desk。

## 当前完成度

- 7 个完整专栏
- 108 节互动课程
- 7 场专栏综合考试
- 110 项累计工程成果
- Cloudflare Workers Static Assets 自动部署
- Chromium 全流程、390px 移动端溢出和浏览器控制台回归检查

线上入口：

```text
https://ai-app-engineer-academy.colafang233.workers.dev/
```

## 七个专栏

| 专栏 | 课程范围 | 课程数 | 核心内容 |
|---|---:|---:|---|
| 01 · 从 CRUD 到模型请求 | 1–4 | 4 | 概率系统、技术路线、最小 TypeScript、Messages 与上下文窗口 |
| 02 · Prompt 与输出契约工程 | 5–9 | 5 | Prompt 结构、规则优先级、Schema、Few-shot、回归评估 |
| 03 · LangChain JavaScript v1 | 10–21 | 12 | Messages、Models、Structured Output、Streaming、Tools、Agent、Middleware、Memory、Safety、LangSmith |
| 04 · RAG 检索与知识库工程 | 22–38 | 17 | 问题画像、Golden Set、解析、Chunking、Embedding、Hybrid、Rerank、Evidence 与发布门禁 |
| 05 · LangGraph 与 Agentic RAG | 39–58 | 20 | State、Reducer、Graph/Functional API、Durable Execution、Interrupt、Time Travel、Memory、多 Agent 与可控检索 |
| 06 · MCP 协议与企业集成 | 59–83 | 25 | Host/Client/Server、Tools/Resources/Prompts、Transport、OAuth、真实 Host 接入、Cloudflare、安全与迁移 |
| 07 · 企业 AI 解决方案与生产交付 | 84–108 | 25 | 产品边界、领域模型、权限、事务、知识治理、四条业务闭环、评估、SLO、安全、发布和事故响应 |

## 最终连续项目

最后一个专栏围绕 **NovaTech Enterprise AI Service Desk** 展开，包含四条完整业务闭环：

1. 有权限的企业制度问答与引用/拒答；
2. 可恢复的 IT 故障排查与工单交接；
3. 特权访问申请、审批、IAM 执行、核验和自动撤销；
4. GitHub / CI 多 MCP 部署失败诊断与受审批的写操作。

课程不是框架 API 清单。每节课遵循：

```text
先判断 → 动手实验 → 原理揭示 → 迁移应用 → 保存工程成果
```

## 运行方式

在仓库根目录启动静态服务器：

```bash
python3 -m http.server 8000
```

正式顺序学习：

```text
http://localhost:8000/apps/runtime-academy/
```

完整质量审阅（开放 108 课和 7 场考试）：

```text
http://localhost:8000/apps/runtime-academy/?review=1
```

课程导览：

```text
http://localhost:8000/apps/runtime-academy/?preview=1
```

开发者调试：

```text
http://localhost:8000/apps/runtime-academy/?debug=1
```

## 当前技术基线

课程中的版本结论都带有基线日期和官方文档链接。当前主要教学基线包括：

```text
Node.js 22.x
langchain 1.5.3
@langchain/core 1.2.3
@langchain/langgraph 1.4.8
Zod 4.4.3
MCP current protocol 2025-11-25
@modelcontextprotocol/sdk 1.29.0
```

MCP `2026-07-28` 规范已经进入 Release Candidate，包含无状态核心、Extensions、Tasks 调整以及 Roots / Sampling / Logging 的弃用计划。当前课程仍以现行正式版 `2025-11-25` 为生产主线，但必须在新规范正式发布后重新执行版本审查。

## 仓库结构

```text
apps/runtime-academy/             正式课程产品入口
packages/course-runtime/          课程运行时、进度、成果和交互组件
courses/ai-app-engineering/       课程配置、研究基线、场景与产品文案
docs/                             架构、交互、QA 与完整课程审查
tools/                            静态检查、浏览器旅程和 Cloudflare 构建
```

`apps/academy/` 保留早期单文件版本，仅用于历史对照和回退。

## 构建与部署

```bash
npm run build
npx wrangler deploy
```

Cloudflare 部署产物生成在：

```text
dist/
```

## 质量原则

1. 课程共享教学语法，但每个知识点使用对应的实验装置。
2. 答错必须允许重试，不能让状态机死锁。
3. 前课成果能够进入后课，形成连续工程项目。
4. 正式界面只使用学员语言，不暴露 Runtime、ArtifactStore 等内部实现。
5. 版本化框架和协议必须展示适用日期与官方依据。
6. 安全、权限、恢复和发布结论不能由平均分掩盖零容忍失败。
7. 正式入口默认顺序解锁；`?review=1` 仅用于课程质量审阅。

## 自动检查

核心检查由 `.github/workflows/runtime-checks.yml` 执行，包括：

```bash
node tools/test_course_runtime.mjs
node tools/test_runtime_full.mjs
node tools/test_product_surface.mjs
node tools/test_formal_dashboard.mjs
node tools/test_exam_integrity.mjs
node tools/test_column03_official.mjs
node tools/test_column04_rag.mjs
node tools/test_column05_langgraph.mjs
node tools/test_column06_mcp.mjs
node tools/test_column07_enterprise_foundations.mjs
node tools/test_column07_enterprise.mjs
npm run build
```

浏览器回归覆盖 LangChain、RAG、LangGraph、MCP 和最终企业专栏的完整课程旅程。

## 审查状态

完整课程审查在分支：

```text
audit/full-course-review
```

审查范围包括内容正确性、版本时效、前置知识、考试有效性、交互真实性、无障碍、移动端可读性、进度持久化、构建复现性和发布门禁。
