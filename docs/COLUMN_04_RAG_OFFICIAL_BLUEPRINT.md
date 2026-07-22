# 专栏四：RAG 检索与知识库工程（框架中立版）

## 1. 定位修正

本专栏不再按照 LangChain、LlamaIndex 或某家向量数据库的 API 目录组织课程。

正确定位是：

> **以问题类型、语料特征和质量约束为起点，设计、评估并交付检索增强系统。**

LangChain 只是一种可选适配层。原生模型 SDK、Sentence Transformers、FlagEmbedding、搜索引擎、向量数据库以及自研服务都可以实现同一套检索契约。课程中所有核心结论必须在移除 LangChain 后仍然成立。

原规划把 RAG 压缩为“加载、切分、Embedding、向量库、检索、引用、评估”，仍然过于线性。真实项目中不存在一套通用最佳方案：

- FAQ、产品手册、法律合同、代码库、表格、扫描 PDF 的切分方式不同。
- 中文、英文、跨语言和混合语言查询对 Embedding 与 reranker 的要求不同。
- 型号、错误码、人名等精确词查询与自然语言语义查询的召回策略不同。
- 小知识库可能直接使用长上下文，根本不需要 RAG。
- 高更新频率、严格 ACL 和多租户场景首先是数据与权限问题，不是模型问题。
- 高召回候选集与最终上下文选择是两个不同阶段，不能用一个 top-k 参数代替。

因此课程从原计划 7 课重构为 **16 课**，并采用“先做场景诊断与评测集，再选技术”的顺序。

---

## 2. 课程总原则

### 2.1 Problem First

先回答：

- 用户问什么类型的问题？
- 答案存在于文档、数据库、接口，还是模型已有知识？
- 需要精确匹配、语义匹配、跨语言匹配还是结构化计算？
- 可以接受多大延迟、成本和错误率？
- 错答与漏答哪个代价更高？

再决定是否使用 RAG，以及采用何种检索架构。

### 2.2 Evaluation First

在选择 Chunk、Embedding 或 Vector DB 之前，先建立：

- 真实查询样本。
- 相关文档/段落标注。
- 难例、否定例和无答案例。
- 按语言、文档类型、查询类型和权限切片的数据集。
- Recall@K、MRR、nDCG、Precision、groundedness、correctness、latency 与 cost 指标。

不存在脱离自有数据集的“最佳 Embedding 模型”。公开排行榜只能用于缩小候选范围，不能替代业务评测。

### 2.3 Framework Neutral

课程核心层只使用以下抽象：

```text
Document
Chunk
Query
Candidate
RetrievalResult
RankedResult
Evidence
Citation
EvaluationCase
```

具体实现可以来自：

- 搜索引擎：Elasticsearch/OpenSearch/Lucene 等。
- 向量数据库：Qdrant、Milvus、Weaviate、MongoDB Atlas、Postgres/pgvector 等。
- Embedding/Reranker：云 API 或本地开源模型。
- 编排框架：LangChain、LlamaIndex、Haystack 或自研代码。

框架只负责适配，不负责替代检索设计。

### 2.4 Scenario Driven

每项技术都必须回答“什么场景值得用、什么场景不要用”：

- Fixed/recursive chunking。
- 结构切分、语义切分、parent-child、contextual chunking、late chunking。
- Dense、BM25、learned sparse、multi-vector/late interaction。
- Hybrid fusion、query rewrite、multi-query、HyDE、decomposition。
- Cross-encoder rerank、late-interaction rerank、LLM rerank。

---

## 3. 研究基线（2026-07-23）

本专栏不固定唯一模型版本，而是固定研究结论与候选模型目录，开发前需要重新核对模型卡和部署条件。

### 3.1 多语言单向量 Embedding

候选模型包括但不限于：

- **BGE-M3**：支持 100+ 语言，并同时提供 dense、sparse 和 multi-vector 表示；适合研究统一混合检索，但资源、索引与部署复杂度高于普通单向量模型。
  - https://arxiv.org/abs/2402.03216
  - https://huggingface.co/BAAI/bge-m3
- **jina-embeddings-v3**：多语言、长上下文、任务 LoRA 与可变维度；需要评估不同 task adapter、维度与语料的实际效果。
  - https://arxiv.org/abs/2409.10173
- **Qwen3-Embedding**：提供 0.6B/4B/8B 多种规模，覆盖多语言、跨语言和代码检索，并配套 reranker；instruction、资源占用和吞吐必须纳入测试。
  - https://arxiv.org/abs/2506.05176
  - https://github.com/QwenLM/Qwen3-Embedding

课程不会宣称其中任何一个模型在所有中文、多语言或跨语言业务中必然最好。

### 3.2 Sparse 与 Multi-vector

- BM25 对错误码、型号、专有名词和原文关键词仍然重要。
- Learned sparse 可以增加词项扩展能力，但索引结构和模型成本不同于传统 BM25。
- ColBERT 类 late interaction 使用 token 级多向量，通常比单向量表达更细，但索引空间、检索引擎和部署复杂度更高。
  - https://arxiv.org/abs/2112.01488
  - https://arxiv.org/abs/2408.16672

### 3.3 Chunking 不是单一参数问题

- 结构感知切分通常是可靠基线。
- Late Chunking 先在完整长上下文中编码，再生成 Chunk 表示，可减少局部 Chunk 丢失上下文的问题，但依赖模型与实现支持。
  - https://arxiv.org/abs/2409.04701
- Contextual Retrieval 为 Chunk 增加文档级上下文，并结合 lexical、dense 与 reranking；收益与成本必须在自身语料上复现。
  - https://www.anthropic.com/engineering/contextual-retrieval
- 2026 年的系统研究进一步显示，最优切分策略随 in-document 与 in-corpus retrieval 任务变化，复杂方法并不总是优于简单结构切分。
  - https://arxiv.org/abs/2602.16974

### 3.4 Hybrid Fusion 需要评测

RRF 简单、对不同分数量纲友好，但并不是所有数据集上的最佳融合方式；加权融合在有少量领域标注数据时可能更好。课程会比较 rank fusion 与 score fusion，而不是把 RRF 当固定答案。

- https://arxiv.org/abs/2210.11934

### 3.5 Reranking 不是“默认越多越好”

候选方法包括：

- Cross-encoder reranker。
- 多语言 reranker。
- Late interaction reranker。
- LLM-based relevance judge。

例如 Cohere 当前 Rerank 4.0 提供 multilingual pro/fast 取舍；Qwen3、BGE、Jina 也有本地 reranker。选择必须同时考虑语言、候选数量、文档长度、吞吐、成本和延迟。

- https://docs.cohere.com/docs/rerank
- https://github.com/QwenLM/Qwen3-Embedding

---

## 4. 场景诊断维度

所有实验首先建立场景画像：

| 维度 | 示例 | 影响 |
|---|---|---|
| 查询语言 | 中文、英文、跨语言、中英混输 | Embedding、分词、reranker、评测切片 |
| 查询类型 | 精确 ID、实体、概念解释、对比、汇总、多跳 | lexical/dense/hybrid、改写与分解 |
| 文档形态 | FAQ、Markdown、PDF、表格、代码、图片 | 解析、切分、表示与引用 |
| 语料规模 | 几十页、百万 Chunk | 是否需要 RAG、索引架构和成本 |
| 更新频率 | 静态、每日、实时 | 增量索引、缓存、新鲜度 |
| 权限 | 公共、租户、部门、用户级 ACL | filter、pre-filter 与泄漏测试 |
| 失败代价 | 可以漏答、不能错答、必须完整召回 | threshold、rerank、拒答与人工复核 |
| SLA | 300ms、2s、10s | 检索层数、模型大小、candidate 数量 |
| 部署 | 云 API、私有化、CPU、GPU | 模型与数据库选择 |

---

## 5. 专栏边界

### 本专栏负责

- 判断是否应该使用 RAG。
- 构建 corpus/query profile 与 golden dataset。
- 文档解析、结构、metadata、ACL 与版本。
- Chunking 的基线、进阶方案和评估。
- 多语言与跨语言 Embedding 选择。
- Dense、sparse、multi-vector 表示。
- 向量/搜索索引、增量生命周期与迁移。
- First-stage recall、hybrid fusion、query transformation。
- Reranking 与上下文选择。
- 表格、代码、图片和混合语料的专项策略。
- 引用、拒答、安全、离线评估和生产监控。

### 后续专栏负责

- Agent 自主决定是否检索。
- 自纠错、多跳循环和 LangGraph 状态图。
- 多 Agent 检索协作。
- MCP 检索服务协议化。

---

## 6. 16 节正式课程

| 课次 | 课程主题 | 核心问题 | 互动实验 | 项目成果 |
|---|---|---|---|---|
| 22 | 什么时候根本不该做 RAG | 长上下文、搜索、SQL/API、微调与 RAG 如何选 | 方案诊断急诊室 | `knowledgeAccessDecision` |
| 23 | 先画像，再选技术 | 语料、查询、语言、风险、SLA 如何形成检索需求 | Corpus × Query 画像台 | `retrievalProblemProfile` |
| 24 | 先有评测集，后选模型 | 如何构造相关性标注、难例、无答案例与分层指标 | Golden Set 标注工作台 | `retrievalEvaluationDataset` |
| 25 | 文档解析、结构与权限 | PDF/HTML/表格/代码如何保留结构、来源、版本、ACL | 文档解析质检站 | `documentIngestionContract` |
| 26 | Chunking 基线怎么选 | 固定、递归、标题/段落/代码结构如何影响召回与引用 | Chunk 边界显微镜 | `baselineChunkingPolicy` |
| 27 | 什么时候需要高级 Chunking | parent-child、semantic、contextual、late chunking 的收益与代价 | 高级 Chunking 对照实验 | `advancedChunkingDecision` |
| 28 | 多语言 Embedding 怎么选 | 中文、跨语言、混输、长文、代码、维度与部署如何评测 | 多语言向量模型擂台 | `embeddingBenchmarkReport` |
| 29 | Dense、Sparse 还是 Multi-vector | 单向量、BM25/learned sparse、ColBERT/BGE-M3 模式如何取舍 | 表示方式选择器 | `retrievalRepresentationPolicy` |
| 30 | 索引与向量库如何设计 | metric、normalize、schema、stable ID、filter、tenant、quantization | 检索索引设计台 | `searchIndexSchema` |
| 31 | 数据更新后如何不脏 | checksum、去重、upsert、delete、双写、重建与回滚 | 增量索引控制台 | `indexLifecyclePolicy` |
| 32 | 查询不同，召回策略也不同 | 错误码、实体、概念、跨语言、多跳问题分别怎么召回 | 查询类型路由器 | `firstStageRetrievalRouter` |
| 33 | Hybrid 结果怎么融合 | lexical+dense、多路模型结果使用 RRF、加权或学习融合 | Hybrid Fusion 实验室 | `hybridFusionPolicy` |
| 34 | 什么时候应该改写查询 | normalize、multi-query、HyDE、decompose、translation 何时有效或有害 | Query Transformation 风险台 | `queryTransformationPolicy` |
| 35 | Reranker 怎么选、排多少候选 | cross-encoder、multilingual、late interaction、LLM rerank 的质量/成本 | Candidate Rerank 竞技场 | `rerankingBenchmarkReport` |
| 36 | 特殊语料不能当普通文本 | 表格、代码、图片、扫描 PDF、混合语言如何检索 | 多模态与结构化语料分诊台 | `specialCorpusRetrievalPolicy` |
| 37 | 上下文不是 top-k 直接拼接 | parent expansion、去重、多样性、token budget、引用、拒答与安全 | Evidence Assembly 工作台 | `evidenceAndCitationContract` |
| 38 | 如何证明系统可以上线 | retrieval、groundedness、correctness、切片评估、延迟、成本与监控 | RAG 发布门禁 | `ragProductionReleaseGate` |

---

## 7. 不同场景的参考决策，而非标准答案

### 场景 A：技术支持错误码

特征：型号、版本号、错误码、命令行文本较多。

优先验证：

- BM25/lexical 是否已足够强。
- Dense + lexical hybrid 是否减少漏召回。
- 代码块、命令和错误码是否被 Chunking 切断。
- Reranker 是否会错误降低精确匹配结果。

### 场景 B：中英文企业制度问答

特征：用户中文提问，文档中英混合，答案必须引用。

优先验证：

- 多语言与 cross-lingual retrieval。
- 中文分词和英文缩写。
- Query instruction/translation 是否改善或损害结果。
- 中文和英文分别统计 Recall@K，而不是只看总平均。

### 场景 C：法律合同

特征：章节层级强、定义跨段、不能错答。

优先验证：

- 结构切分与 parent-child retrieval。
- 定义条款向后传播。
- 高 recall + reranking。
- 无证据拒答和引用定位。

### 场景 D：代码库

特征：符号名、调用关系、语言结构和自然语言并存。

优先验证：

- AST/符号级切分。
- lexical + code embedding。
- 文件/类/函数 parent-child。
- 是否需要图关系或专门 code retriever。

### 场景 E：小型稳定知识库

特征：总内容可放入模型上下文，查询量不高。

优先验证：

- 全量上下文 + caching 是否比 RAG 更简单、更准确。
- 不应为了使用向量数据库而制造系统复杂度。

---

## 8. 项目级成果

最终不是产出一个绑定 LangChain 的 Demo，而是一套可由任意技术栈实现的检索系统契约：

```text
Knowledge Access Decision
Retrieval Problem Profile
Golden Evaluation Dataset
Document Ingestion Contract
Baseline & Advanced Chunking Policies
Embedding Benchmark Report
Retrieval Representation Policy
Search Index Schema
Index Lifecycle Policy
First-stage Retrieval Router
Hybrid Fusion Policy
Query Transformation Policy
Reranking Benchmark Report
Special Corpus Policy
Evidence & Citation Contract
Production Release Gate
```

LangChain 示例只能作为这些契约的一种实现，不得反过来定义课程结构。

---

## 9. 开发约束

- 先完成框架中立的交互实验，再添加任何 LangChain 示例。
- 每项实验至少提供两种场景，不能只在一个 FAQ 数据集上得出结论。
- 多语言课程必须分别展示 monolingual、cross-lingual 和 mixed-language 查询。
- Chunking 实验必须可视化边界、结构丢失和召回结果变化。
- Embedding、fusion、rerank 实验必须显示离线指标与延迟/成本，不允许只凭主观观察。
- 不允许把某个排行榜第一名写成默认生产选择。
- 不允许把 `topK=4`、`chunkSize=1000`、`overlap=200` 等示例参数写成最佳实践。
- 不允许默认认为向量库等于 RAG，也不允许默认 dense retrieval 优于 lexical。

---

## 10. 质量门禁

静态检查：

- 课程编号必须为 22–38，共 17 课（含是否使用 RAG 的前置决策课）。
- 每课必须声明问题画像、适用场景、不适用场景和项目成果。
- 核心课程配置不得依赖 LangChain 类型或 API 名称。
- LangChain 只能出现在“实现参考”区域。
- 必须包含多语言、跨语言、dense、sparse、multi-vector、hybrid、rerank 与专项语料。

浏览器旅程：

- 完成全部 17 课实验。
- 至少跑过技术支持、多语言制度、合同和代码库四类场景。
- 生成 17 项成果。
- 通过第四专栏综合考试。
- 解锁第五专栏。
- 检查移动端、控制台错误和成果传递。

---

## 11. 开发顺序

1. 锁定本框架中立蓝图。
2. 构建统一的 scenario dataset 与 evaluation primitives。
3. 开发 Chunking/Embedding/Representation 三组基础实验。
4. 开发 Recall/Fusion/Transformation/Rerank 四组检索实验。
5. 开发特殊语料、Evidence Assembly 与 Production Gate。
6. 最后添加 LangChain、原生 SDK 和数据库适配示例。
7. 通过完整浏览器 CI 后再创建 Draft PR。
