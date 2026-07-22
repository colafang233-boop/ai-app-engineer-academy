# 专栏四：RAG 交互式教学系统

## 1. 核心教学目标

第四专栏不采用“名词解释 → 代码示例 → 课后题”的线性结构，而采用：

```text
先猜结果
→ 手动调整参数
→ 观察召回、排序、成本和错误的变化
→ 解释指标与机制
→ 换一个场景验证结论是否仍成立
→ 保存工程决策
```

学员不是记住 `chunkSize`、`topK` 或某个模型名字，而是建立以下能力：

- 看见一个业务问题时，知道先检查哪些变量。
- 能解释参数变化为什么改变召回结果。
- 能区分“一阶段召回”“重排”“上下文组装”三个阶段。
- 能用评测数据推翻自己的直觉。
- 能判断一个策略在哪些场景有效、在哪些场景会失败。

---

## 2. 统一实验界面

每个 RAG 实验都使用同一套高层交互骨架，但内部可视化必须按概念定制。

### 2.1 场景面板

学员可以切换：

- 技术支持错误码。
- 中英文企业制度。
- 法律合同。
- 代码库。
- 表格与扫描 PDF。
- 小型稳定知识库。

切换场景时，语料、查询、相关性标注、SLA、风险和正确策略都必须改变，避免在单一 FAQ Demo 上形成错误直觉。

### 2.2 参数控制台

根据课程动态显示：

- slider：Chunk 长度、overlap、候选数量、rerank 数量、阈值、权重。
- switch：是否启用 lexical、dense、query rewrite、rerank、parent expansion。
- selector：Embedding、reranker、fusion、distance metric、索引策略。
- drag-and-drop：手动调整 Chunk 边界、结果顺序、Evidence 顺序。
- editable query：修改查询语言、关键词、拼写、缩写和歧义表达。

### 2.3 检索过程可视化

至少展示：

```text
Query
→ Query Analysis / Transformation
→ First-stage Recall
→ Fusion
→ Rerank
→ Evidence Assembly
→ Answer / Abstain
```

每个阶段显示输入、输出、耗时、候选数量和丢失原因。

### 2.4 指标面板

参数变化后实时重算：

- Recall@K。
- Precision@K。
- MRR。
- nDCG。
- Groundedness。
- Citation coverage。
- P50 / P95 latency。
- Token cost。
- Index size。
- Estimated throughput。

不允许只用“看起来回答更好”作为实验结论。

### 2.5 反事实对比

实验必须支持 A/B 锁定对比：

```text
方案 A：原配置
方案 B：修改后配置
```

并突出：

- 哪些相关结果被新增召回。
- 哪些原有结果被挤出。
- 排名发生了什么变化。
- 延迟和成本增加了多少。
- 某个语言或查询切片是否变差。

### 2.6 失败解释器

失败不能只提示“答案错误”，要标出失败发生在哪一层：

- ingestion failure。
- chunk boundary failure。
- representation failure。
- first-stage recall failure。
- fusion failure。
- rerank failure。
- context budget failure。
- generation / grounding failure。
- ACL leakage。

---

## 3. 前置知识交互组件

### 3.1 向量空间直觉板

用于解释：

- 向量不是“答案”，只是表示。
- cosine、dot product、L2 的差别。
- normalization 对 dot product 的影响。
- 相似度高不等于业务相关。
- 单向量压缩会丢失局部信息。

交互：拖动 Query 点、Document 点和决策边界，实时观察排序变化。

### 3.2 Token、Chunk 与 Document 层级图

用于解释：

```text
Document
├─ Section
│  ├─ Parent Chunk
│  │  ├─ Child Chunk
│  │  └─ Child Chunk
```

交互：调整边界后观察定义、表格标题、代码上下文是否被切断。

### 3.3 倒排索引拆解器

用于解释：

- term frequency。
- document frequency。
- IDF。
- BM25 为什么擅长错误码和专有词。
- 中文分词、英文缩写和符号对 lexical retrieval 的影响。

交互：点击词项查看 posting list 和得分贡献。

### 3.4 Dense / Sparse / Multi-vector 对照图

同一查询同时展示：

- BM25 命中的词项。
- dense 单向量近邻。
- learned sparse 扩展词。
- late interaction 的 token-to-token 匹配矩阵。

学员可以看见不同表示为什么召回不同候选。

### 3.5 排名指标实验器

通过拖动相关文档的位置理解：

- Recall 只关心找没找到。
- MRR 关心第一个相关结果。
- nDCG 关心多级相关性和位置。
- Precision 反映上下文污染。

---

## 4. 17 节课的专属交互装置

### 第 22 课：知识访问方案诊断急诊室

输入业务场景，学员在以下方案间分配：

- 直接长上下文。
- 普通搜索。
- SQL / API。
- RAG。
- 微调。
- 混合方案。

可调变量：知识规模、更新频率、答案是否结构化、引用要求、权限、延迟、错误代价。

核心体验：某些场景增加向量数据库反而降低可靠性。

### 第 23 课：Corpus × Query 画像台

学员手动标记：语言、查询类型、文档形态、更新频率、ACL、SLA、失败代价。

系统生成检索需求雷达图，并指出缺失信息。

### 第 24 课：Golden Set 标注工作台

学员为 Query 标记：

- fully relevant。
- partially relevant。
- hard negative。
- no answer。
- permission denied。

随后切换指标，观察同一系统为什么在总平均值很好、在跨语言切片却失败。

### 第 25 课：文档解析质检站

左右对比原文与解析结果：

- 标题层级。
- 表格单元格。
- 页码与来源。
- 代码块。
- OCR 错字。
- ACL metadata。

学员决定哪些解析错误会导致后续检索不可修复。

### 第 26 课：Chunk 边界显微镜

学员拖动 Chunk 边界，调整：

- chunk size。
- overlap。
- separator 优先级。
- 标题是否继承。

实时显示 Recall、索引膨胀、引用完整度和上下文污染。

### 第 27 课：高级 Chunking 对照实验

并排比较：

- parent-child。
- semantic chunking。
- contextual prefix。
- late chunking。

必须同时显示收益、额外索引、预处理成本、模型依赖和失败案例。

### 第 28 课：多语言向量模型擂台

固定同一 Golden Set，学员选择候选模型与设置：

- monolingual / multilingual。
- query instruction。
- embedding dimension。
- normalization。
- local / API deployment。

分别查看中文、英文、跨语言、中英混输和代码切片。

### 第 29 课：检索表示选择器

同一查询展示 lexical、dense、learned sparse、multi-vector 的结果。

学员为不同 Query 类型配置路由规则，而不是全局选择一个 Retriever。

### 第 30 课：检索索引设计台

配置：

- stable document ID / chunk ID。
- vector metric。
- normalized or not。
- metadata schema。
- pre-filter / post-filter。
- tenant partition。
- quantization。
- HNSW / IVF 类参数的抽象级影响。

界面同步显示内存、召回率、写入速度和权限风险。

### 第 31 课：增量索引控制台

模拟新增、修改、删除、重复导入和模型升级。

学员处理：checksum、dedup、upsert、delete tombstone、双索引、重建、流量切换和回滚。

### 第 32 课：查询类型路由器

输入不同 Query：错误码、实体、概念解释、跨语言、对比、多跳。

学员配置 lexical / dense / hybrid / SQL / no retrieval 路由，并观察误路由代价。

### 第 33 课：Hybrid Fusion 实验室

学员手动调整：

- lexical weight。
- dense weight。
- RRF k。
- normalization。
- query-type dynamic weighting。

结果区显示 rank fusion 与 score fusion 的差异，以及不同查询切片的收益和退化。

### 第 34 课：Query Transformation 风险台

切换：

- normalize。
- spell correction。
- translation。
- multi-query。
- HyDE。
- decomposition。

必须展示“改写后召回变好”和“改写丢失关键标识符”两类结果。

### 第 35 课：Candidate Rerank 竞技场

调节：

- first-stage topN。
- rerank topK。
- cross-encoder / multilingual / late interaction / LLM judge。
- batch size。
- timeout。

绘制质量—延迟—成本曲线，寻找 Pareto 区间，而不是找一个固定参数。

### 第 36 课：特殊语料分诊台

对表格、代码、图片、扫描 PDF 和混合语言文档分别选择：

- 解析方式。
- 切分方式。
- 表示方式。
- 检索方式。
- 引用单位。

错误选择会直接展示结构损坏和错误引用。

### 第 37 课：Evidence Assembly 工作台

从候选集中手动组装最终上下文：

- 去重。
- parent expansion。
- diversity。
- token budget。
- source coverage。
- citation span。
- threshold / abstain。

系统显示“召回正确但上下文组装失败”的独立错误类型。

### 第 38 课：RAG 发布门禁

综合仪表盘按语言、语料、查询、权限和版本切片展示：

- retrieval relevance。
- groundedness。
- answer correctness。
- citation accuracy。
- ACL leakage。
- latency / cost。
- freshness。

学员必须决定：发布、灰度、回滚或继续实验。

---

## 5. 交互组件的复用层

计划沉淀以下 Runtime primitives：

```text
ScenarioSwitcher
CorpusViewer
QueryEditor
ParameterWorkbench
PipelineTrace
ChunkBoundaryEditor
VectorSpaceMap
LexicalScoreInspector
CandidateList
RankDiffViewer
MetricDashboard
SliceExplorer
LatencyCostCurve
FailureAttributionPanel
ExperimentSnapshot
ABComparison
```

这些组件负责交互能力，但不会把课程做成统一模板。每节课仍必须有自己的核心视觉隐喻。

---

## 6. 实验快照与项目成果

每次有效实验保存：

```text
scenario
query
corpusVersion
parameters
retrievedCandidates
rankedCandidates
evidence
metrics
latency
cost
failureAttribution
learnerDecision
```

后续课程直接读取前一课的快照。例如：

- Chunking 课生成的候选索引，进入 Embedding Benchmark。
- Embedding Benchmark 的结果，进入 Hybrid Fusion。
- Fusion 的候选集，进入 Reranking。
- Reranking 的结果，进入 Evidence Assembly。
- 全部快照最终进入 Production Release Gate。

---

## 7. 教学质量约束

- 参数不能只改变 UI 文案，必须真正改变候选、排序或指标。
- 每个实验至少有一个反直觉结果。
- 每项技术必须包含适用与不适用场景。
- 每课至少支持 A/B 对比和恢复默认基线。
- 不能隐藏失败样本，只展示平均指标。
- 不能把模拟指标伪装成真实模型基准；模拟数据必须明确标注为教学数据。
- 后续接入真实模型和向量库时，必须复用同一 EvaluationCase 和实验快照协议。
