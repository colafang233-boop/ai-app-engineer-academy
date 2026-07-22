# 专栏四：RAG 知识库工程（官方文档对齐版）

## 1. 为什么必须重做

原规划把 RAG 压缩成 7 个关键词：文档、切分、Embedding、检索、引用与验证。这种安排只能做出一个最小演示，无法指导学员交付真实知识库。

生产 RAG 至少同时包含五条链路：

1. **数据链路**：来源接入、解析、标准化、元数据、权限与版本。
2. **索引链路**：切分、Embedding、稳定 ID、增量写入、删除与迁移。
3. **检索链路**：过滤、语义搜索、关键词搜索、混合召回、查询改写与重排。
4. **生成链路**：上下文预算、去重、引用、拒答、文档内 Prompt Injection 防护。
5. **质量链路**：检索评估、答案评估、可观测性、延迟、成本、回滚与数据新鲜度。

因此，本专栏从 7 课扩展为 **14 课**。课程数量服务于能力边界，不再为了固定总课时压缩知识。

---

## 2. 官方调研结论

### 2.1 RAG 不是一种固定架构

LangChain 官方将 RAG 区分为：

- **2-Step RAG**：先检索、后生成；控制强、延迟可预测。
- **Agentic RAG**：模型决定是否以及如何检索；灵活但调用次数与延迟不稳定。
- **Hybrid RAG**：加入查询增强、检索验证和答案验证等中间环节。

第四专栏以 **知识库工程 + 2-Step RAG** 为主，讲清可测试、可预测、可交付的检索系统。Agentic RAG、自纠错循环和自定义状态图留到第五专栏 LangGraph。

官方文档：

- https://docs.langchain.com/oss/javascript/langchain/retrieval
- https://docs.langchain.com/oss/javascript/langchain/knowledge-base

### 2.2 LangChain v1 的包边界会直接影响 RAG 教程

- `langchain` v1 主包聚焦现代 Agent 构件。
- `Document` 等基础抽象来自 `@langchain/core`。
- Text Splitters 使用独立包 `@langchain/textsplitters`。
- 模型、Embedding 和向量库优先使用独立 provider 包，例如 `@langchain/openai`、`@langchain/qdrant`、`@langchain/mongodb`。
- MemoryVectorStore、旧式 Retrievers 和 Indexing API 位于 `@langchain/classic`。
- `@langchain/community` 已进入 sunset/deprecated 状态，不应再作为新项目的默认依赖。

官方文档：

- https://docs.langchain.com/oss/javascript/releases/langchain-v1
- https://docs.langchain.com/oss/javascript/migrate/langchain-v1
- https://docs.langchain.com/oss/javascript/integrations/providers/overview
- https://docs.langchain.com/oss/javascript/integrations/vectorstores

### 2.3 Loader 与 Splitter 必须分层

v1 迁移指南已移除 `BaseDocumentLoader.loadAndSplit()`，推荐流程是：

```text
loader.load()
→ 解析质量检查
→ 标准化 Document
→ splitter.splitDocuments()
→ chunk 质量检查
```

课程不会继续传播“Loader 顺便切分”的旧式写法。

官方文档：

- https://docs.langchain.com/oss/javascript/migrate/langchain-v1
- https://docs.langchain.com/oss/javascript/integrations/document_loaders
- https://docs.langchain.com/oss/javascript/integrations/splitters

### 2.4 切分不是只调 chunkSize

官方建议通用文本优先从 `RecursiveCharacterTextSplitter` 开始，但生产系统还需要根据文档结构、代码语言、表格、标题层级和引用定位验证切分质量。

官方文档：

- https://docs.langchain.com/oss/javascript/integrations/splitters
- https://docs.langchain.com/oss/javascript/integrations/splitters/recursive_text_splitter
- https://docs.langchain.com/oss/javascript/integrations/splitters/code_splitter

### 2.5 VectorStore 不只是 similaritySearch

LangChain 的统一 VectorStore 接口至少覆盖：

- `addDocuments`
- `delete`
- `similaritySearch`
- 转换为 Retriever

真实系统还必须自行定义稳定 ID、集合/命名空间、租户字段、权限过滤、索引版本和 Embedding 迁移方案。

官方文档：

- https://docs.langchain.com/oss/javascript/integrations/vectorstores
- https://docs.langchain.com/oss/javascript/integrations/retrievers

### 2.6 Reranking 是独立阶段

召回阶段负责“尽量不要漏”，重排阶段负责“把真正相关内容送进有限上下文”。课程会明确区分 candidate retrieval 与 final context selection。

官方文档：

- https://docs.langchain.com/oss/javascript/integrations/document_compressors/cohere_rerank

### 2.7 RAG 评估必须拆开

LangSmith 官方将 RAG 评估拆成：

1. **Retrieval relevance**：检索文档是否与问题相关。
2. **Groundedness/Faithfulness**：答案是否由检索文档支持。
3. **Answer relevance/Helpfulness**：答案是否真正回应问题。
4. **Correctness**：答案是否符合参考答案。

只评价最终答案会掩盖召回失败；只评价召回则不能发现生成幻觉。

官方文档：

- https://docs.langchain.com/langsmith/evaluate-rag-tutorial
- https://docs.langchain.com/langsmith/evaluation-approaches
- https://docs.langchain.com/langsmith/evaluation-concepts

---

## 3. 适用版本

课程版本基线日期：**2026-07-23**。

```json
{
  "langchain": "1.5.3",
  "@langchain/core": "1.2.3",
  "@langchain/textsplitters": "1.0.1",
  "@langchain/classic": "1.0.40",
  "@langchain/openai": "1.5.5",
  "langsmith": "0.8.3",
  "zod": "4.4.3",
  "node": "22.x"
}
```

版本策略：

- `@langchain/community` 不纳入默认教学基线。
- 使用 MemoryVectorStore 时明确说明它来自 `@langchain/classic`，只用于本地教学和接口演示。
- 生产向量库通过独立 provider package 接入，不把某一家数据库写死为 LangChain 唯一方案。
- 每节课显示适用版本、官方链接、能力边界和升级提醒。

---

## 4. 专栏边界

### 本专栏负责

- 文档与 Chunk 数据契约。
- Loader、解析与摄取质量门禁。
- 结构感知切分。
- Embedding 与向量表示迁移。
- VectorStore 生命周期。
- 增量索引、更新和删除。
- 过滤、语义、关键词和混合召回。
- 查询改写与重排。
- 上下文组装、引用和拒答。
- 可预测的 2-Step RAG。
- RAG 离线评估、线上监控与发布门禁。

### 本专栏不负责

- 自定义 LangGraph 节点、边和循环。
- Agent 自主决定检索时机。
- 自纠错 RAG Graph。
- 多 Agent 检索编排。
- MCP Server 实现。

这些能力属于第五、六专栏。

---

## 5. 14 节正式课程

| 课次 | 课程 | 真正要掌握的能力 | 互动实验 | 项目成果 |
|---|---|---|---|---|
| 22 | RAG 架构与失败地图 | 区分 Retrieval、2-Step、Agentic、Hybrid；按控制、延迟和质量选择架构 | RAG 架构决策室 | `ragArchitectureDecision` |
| 23 | Document 与元数据契约 | 定义 `pageContent`、`metadata`、`id`、source、tenant、ACL、version、checksum | 文档契约审查台 | `documentContract` |
| 24 | Loader、解析与摄取门禁 | 分离 load、parse、normalize、quality gate；处理空文档、乱码、重复和失败页 | 摄取流水线故障排查 | `ingestionQualityGate` |
| 25 | 结构感知切分 | 比较固定长度、递归、Markdown/代码结构；调节 size、overlap 与引用边界 | Chunk 显微镜 | `chunkingPolicy` |
| 26 | Embedding 与表示迁移 | 区分 `embedQuery`/`embedDocuments`、维度、距离、批量、版本迁移与双写 | 向量空间与迁移实验 | `embeddingPolicy` |
| 27 | VectorStore 数据模型 | 设计集合、稳定 chunk ID、metadata filter、add/delete/search、租户隔离 | 向量库 Schema 设计台 | `vectorStoreSchema` |
| 28 | 增量索引与新鲜度 | 使用 checksum、source version、upsert/delete、索引版本和重建策略 | 增量同步控制台 | `indexingLifecycle` |
| 29 | 语义检索调优 | 调节 top-k、score threshold、MMR、metadata filter，理解 precision/recall 权衡 | 检索参数竞技场 | `semanticRetrievalPolicy` |
| 30 | 关键词、混合召回与 ACL | 比较 dense、sparse/BM25、hybrid；确保 ACL 在返回结果前执行 | 混合召回融合台 | `hybridAccessPolicy` |
| 31 | 查询分析与改写 | 对歧义、缩写、多意图问题选择 normalize、rewrite、multi-query、decompose 或不改写 | 查询改写路由器 | `queryTransformationPolicy` |
| 32 | Reranking 与 Context Compression | 先宽召回再重排；按相关性、token 成本和多样性选择最终上下文 | 候选重排实验室 | `rerankingPolicy` |
| 33 | 上下文、引用、拒答与安全 | 去重、排序、token budget、source label、引用可追溯、无证据拒答、文档指令隔离 | 证据组装与引用台 | `contextCitationContract` |
| 34 | 可预测的 2-Step RAG | 构建 retrieve → validate → assemble → generate → cite；处理空召回和低置信结果 | 2-Step RAG 流水线 | `twoStepRagContract` |
| 35 | RAG 评估与生产发布 | 数据集、retrieval relevance、groundedness、relevance、correctness、延迟、成本和回滚 | RAG 发布门禁 | `ragEvaluationReleaseGate` |

---

## 6. 课程级项目

14 课共同完成一个“企业产品文档知识库问答系统”。

场景约束：

- 多租户 SaaS。
- 文档来自 PDF、Markdown、HTML 与内部 FAQ。
- 每个 Chunk 必须保留 source、page/section、tenant、ACL 和版本。
- 用户只能检索自己有权限的内容。
- 答案必须附引用；证据不足必须明确拒答。
- 文档更新与删除必须能增量同步。
- 发布前必须通过检索和生成双层评估。

最终产物不是一个 Demo，而是一份可实现的生产契约：

```text
Ingestion Contract
+ Chunking Policy
+ Embedding Migration Plan
+ Vector Store Schema
+ Index Lifecycle
+ Retrieval Policy
+ Access Policy
+ Query Transformation
+ Reranking Policy
+ Citation Contract
+ 2-Step RAG Contract
+ Evaluation Release Gate
```

---

## 7. 交互设计原则

每课继续遵循：

```text
先判断 → 动手实验 → 原理揭示 → 迁移应用
```

但实验不能只是选择题：

- 需要显示 Chunk 边界、重叠和丢失信息。
- 需要实时变化候选结果、分数、过滤和重排顺序。
- 需要制造空文档、重复文档、旧版本、权限泄漏和低置信检索。
- 需要让学员看到检索错误如何传导为生成幻觉。
- 需要保存每课策略，后续实验读取前一课成果。

---

## 8. 质量门禁

静态检查：

- 14 课编号必须是 22–35。
- 每课必须声明版本与官方链接。
- 每课必须注册独立实验装置和项目成果。
- 不允许把 `@langchain/community` 写成推荐默认依赖。
- Loader 课程必须使用 `load()` 后独立切分的当前路径。
- 必须明确 `@langchain/classic` 的兼容定位。

浏览器完整旅程：

- 通过第三专栏考试。
- 完成 22–35 课全部实验和迁移题。
- 生成 14 项项目成果。
- 通过第四专栏综合考试。
- 自动解锁第五专栏。
- 检查官方链接、控制台错误和 390px 移动端溢出。

---

## 9. 开发顺序

1. 先提交本蓝图并锁定课程边界。
2. 编写 `column-04-rag-official.js`。
3. 分三组开发实验装置：摄取与索引、检索与上下文、评估与发布。
4. 接入总控台、项目成果和版本横幅。
5. 增加静态课程检查。
6. 增加 14 课 Playwright 完整旅程。
7. 通过 CI 后创建独立 Draft PR。
