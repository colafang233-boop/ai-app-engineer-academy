import { prediction, reveal, research, sources, transfer } from './column-04-rag-common.js';

export const ragLessons28To33 = [
  {
    id: 'lesson-28', number: 28, columnId: 'column-04', shortTitle: '多语言 Embedding 评测',
    title: '中文、英文、跨语言、中英混输都叫“多语言”，评测为什么必须拆开？',
    titleHtml: '不要选排行榜冠军，<span class="cr-marker">要选通过业务切片的模型</span>',
    eyebrow: 'MULTILINGUAL EMBEDDING BENCHMARK · LESSON 28',
    description: '比较多种模型规模、维度、query instruction、归一化、延迟、内存和索引成本。',
    officialReference: research(sources.mteb, sources.mmteb, sources.miracl, sources.bgeM3, sources.qwen3, sources.jinaV3),
    stages: [
      prediction('多语言模型在平均榜单领先，是否意味着中文单语检索一定超过专用中文模型？', 'MTEB 研究本身就显示没有模型统治所有任务。', 'no', [
        { value: 'yes', label: '平均分高即可' }, { value: 'no', label: '不一定', description: '必须按任务、语言和部署约束重测' }, { value: 'largest', label: '选参数最大即可' },
      ], '✓ 对。模型选择是质量—延迟—成本的场景决策。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-embedding-benchmark', title: '在三类语言切片上运行 Embedding 擂台', description: '调整模型、维度、归一化和 instruction，分别满足中文、跨语言和混输 SLA。', config: {} },
      reveal('Embedding 是检索表示，不是通用智能排行榜', '不同任务、语料和语言切片的最优模型可能不同。', '<p>BGE-M3 支持 dense、sparse 和 multi-vector；Qwen3 系列提供多种规模和 reranker；Jina v3 支持多语言、长上下文和任务适配。课程只把它们作为候选，最终选择必须来自自己的检索评测。</p>'),
      transfer('模型换成更低维度后延迟下降，但跨语言 Recall 明显下降，应该怎么决定？', '必须看业务门槛，而不是单一成本。', 'tradeoff', [
        { value: 'tradeoff', label: '按切片质量门槛、SLA 和成本共同选择或路由' }, { value: 'low', label: '永远选最低维度', feedback: '可能不满足质量门槛。' }, { value: 'high', label: '永远选最高维度', feedback: '可能浪费存储和延迟预算。' },
      ], '✓ 对。生产选择是受约束的 Pareto 决策。'),
    ],
  },
  {
    id: 'lesson-29', number: 29, columnId: 'column-04', shortTitle: 'Dense、Sparse 与 Multi-vector',
    title: '为什么错误码 BM25 很强，跨语言语义 Dense 很强，代码又可能需要 Multi-vector？',
    titleHtml: '看见不同表示如何打分，<span class="cr-marker">才能理解召回差异</span>',
    eyebrow: 'RETRIEVAL REPRESENTATIONS · LESSON 29',
    description: '对照 lexical、dense、learned sparse、multi-vector 与 hybrid，查看词项、整体语义和 token 级贡献。',
    officialReference: research(sources.bgeM3, sources.colbert, sources.elasticHybrid),
    stages: [
      prediction('BM25 是旧技术，所以生产 RAG 应该统一替换成 Dense 吗？', '精确词、型号和代码符号仍然是 lexical 的强项。', 'no', [
        { value: 'yes', label: 'Dense 全面替代 BM25' }, { value: 'no', label: '不能这样推导', description: '表示方式必须与 Query 类型匹配' }, { value: 'sparse', label: '只用 learned sparse' },
      ], '✓ 对。现代检索通常是多表示协作而不是新旧替代。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-representation-policy', title: '观察四类 Query 在不同表示下的候选和得分来源', description: '切换错误码、制度、合同和代码，查看 lexical、dense、sparse 与 token-to-token 匹配。', config: {} },
      reveal('表示决定“相似”究竟是什么意思', '单向量、词项权重和 token 级匹配保留的信息不同。', '<p>Dense 把整段压缩成一个向量；Sparse 保留可解释词项权重；Multi-vector/late interaction 保留多个 token 表示，细粒度更强但索引更大。Hybrid 允许按 Query 类型组合多路召回。</p>'),
      transfer('查询包含精确型号和自然语言故障描述，合理基线是什么？', '两种信号都重要。', 'hybrid', [
        { value: 'hybrid', label: 'Lexical + Dense 的 hybrid 候选集，再用评测决定融合' }, { value: 'dense', label: '只用 Dense', feedback: '可能弱化型号和错误码。' }, { value: 'lexical', label: '只用 Lexical', feedback: '可能漏掉同义故障描述。' },
      ], '✓ 对。先保留互补信号，再评估融合。'),
    ],
  },
  {
    id: 'lesson-30', number: 30, columnId: 'column-04', shortTitle: '索引与向量库设计',
    title: '选了 Qdrant、Milvus 或 pgvector，为什么检索系统仍可能从根上设计错？',
    titleHtml: '数据库不是架构，<span class="cr-marker">索引契约才是</span>',
    eyebrow: 'SEARCH INDEX DESIGN · LESSON 30',
    description: '配置稳定 ID、metadata、ACL pre-filter、相似度、normalization、ANN 候选、量化、别名和迁移。',
    officialReference: research(sources.elasticHybrid, sources.elasticRrf),
    stages: [
      prediction('向量相似度使用 dot product，但是否归一化没有记录，会有问题吗？', '相似度含义依赖向量处理约定。', 'yes', [
        { value: 'no', label: '没有问题' }, { value: 'yes', label: '有问题', description: 'metric 与 normalization 必须形成契约' }, { value: 'db', label: '数据库会自动猜正确方式' },
      ], '✓ 对。表示、写入和查询必须共享相似度约定。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-index-design', title: '设计与数据库品牌无关的索引 Schema', description: '调整 ID、metadata、ACL、metric、ANN 候选和量化，观察 Recall、内存和泄漏风险。', config: {} },
      reveal('索引设计连接数据、表示、权限和生命周期', '数据库只是这些契约的实现载体。', '<p>稳定 ID 支持幂等更新与删除；metadata 支持语言、来源、版本和 parent-child；ACL 应进入 pre-filter；ANN 参数平衡内存、延迟和召回；Embedding 升级需要索引别名与双索引迁移。</p>'),
      transfer('多租户知识库先全库 ANN，再在应用层 post-filter，最大风险是什么？', '候选生成阶段已经越过权限边界。', 'leak', [
        { value: 'leak', label: '越权候选、低召回和潜在信息泄漏' }, { value: 'none', label: '没有风险', feedback: '检索层已经看到了不应访问的数据。' }, { value: 'tokens', label: '只会多消耗 Token', feedback: '安全风险更严重。' },
      ], '✓ 对。权限过滤是索引与检索设计的一部分。'),
    ],
  },
  {
    id: 'lesson-31', number: 31, columnId: 'column-04', shortTitle: '增量索引与迁移',
    title: '文档修改、删除或更换 Embedding 后，怎么避免重复、脏数据和不可回滚？',
    titleHtml: '知识库不是一次性导入，<span class="cr-marker">而是持续变化的数据产品</span>',
    eyebrow: 'INDEX LIFECYCLE · LESSON 31',
    description: '模拟重复导入、局部修改、删除、模型升级、双索引验证、流量切换和回滚。',
    officialReference: research(sources.ragchecker, sources.elasticHybrid),
    stages: [
      prediction('源文档删除后，只要不再展示文档列表，可以保留旧 Chunk 向量吗？', '旧向量仍可能被检索并生成陈旧答案。', 'no', [
        { value: 'yes', label: '可以保留' }, { value: 'no', label: '不可以', description: '删除必须传播到全部关联索引单元' }, { value: 'ttl', label: '等缓存自然过期即可' },
      ], '✓ 对。删除、新鲜度和版本必须有可验证生命周期。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-index-lifecycle', title: '执行一次可验证、可切换、可回滚的索引升级', description: '注入重复、修改和删除，再配置 checksum、upsert、双写、评测、alias 与回滚。', config: {} },
      reveal('索引需要数据工程语义', '幂等、删除、版本和回滚与模型同样重要。', '<p>使用稳定 ID 和 checksum 识别真实变化；更新与删除必须覆盖所有子 Chunk；Embedding 版本变化通常需要重建新索引，用同一 Golden Set 对比后再切换 alias，并保留快速回滚。</p>'),
      transfer('更换 Embedding 维度后，能直接把新向量写进旧字段吗？', 'Schema 和距离空间已经变化。', 'new-index', [
        { value: 'new-index', label: '构建版本化新索引，验证后切换流量' }, { value: 'overwrite', label: '逐条覆盖旧字段且立即生效', feedback: '迁移中会混合两个不可比向量空间。' }, { value: 'ignore', label: '维度不同不影响', feedback: '索引 Schema 通常无法接受。' },
      ], '✓ 对。模型升级是索引迁移，不是一个配置热更新。'),
    ],
  },
  {
    id: 'lesson-32', number: 32, columnId: 'column-04', shortTitle: '按 Query 路由召回',
    title: '错误码、概念解释、跨语言、代码符号和实时余额，为什么不该走同一条检索链？',
    titleHtml: '先识别 Query，<span class="cr-marker">再选择一阶段召回</span>',
    eyebrow: 'FIRST-STAGE RETRIEVAL ROUTER · LESSON 32',
    description: '调整规则顺序，批量重跑精确、语义、跨语言、代码和结构化实时查询。',
    officialReference: research(sources.beir, sources.miracl, sources.elasticHybrid),
    stages: [
      prediction('一个 global topK 和一个 Retriever 能覆盖所有 Query 类型吗？', '不同 Query 依赖的匹配信号不同。', 'no', [
        { value: 'yes', label: '统一配置最简单' }, { value: 'no', label: '不能保证', description: '需要按 Query 类型路由或组合' }, { value: 'bigger', label: '只要把 topK 调大' },
      ], '✓ 对。路由是检索架构，不是 Prompt 小技巧。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-first-stage-router', title: '调整检索路由规则并批量重跑', description: '让精确、实时和代码规则优先于宽泛语义规则，观察误路由后果。', config: {} },
      reveal('一阶段召回负责尽量不漏掉候选', '路由错误会在最早阶段丢失证据。', '<p>错误码优先 lexical，跨语言概念可用 dense/hybrid，代码需要 symbol + code embedding，实时事实应转 SQL/API。路由结果还应进入评测与 Trace，避免系统悄悄走错链路。</p>'),
      transfer('Query 同时包含 ERR-NVML-001 和“为什么会失败”，合理做法是什么？', '精确和语义信号同时存在。', 'hybrid', [
        { value: 'hybrid', label: '保留 lexical 精确召回，并增加 dense 语义候选' }, { value: 'dense', label: '只用 Dense', feedback: '可能弱化错误码。' }, { value: 'sql', label: '转 SQL', feedback: '答案来自技术文档，不是结构化业务表。' },
      ], '✓ 对。Query 可以触发组合路由。'),
    ],
  },
  {
    id: 'lesson-33', number: 33, columnId: 'column-04', shortTitle: 'Hybrid Fusion',
    title: 'BM25 分数 12.4、Dense 分数 0.82，直接相加为什么没有意义？',
    titleHtml: '融合的不是两个数字，<span class="cr-marker">而是两套排名信号</span>',
    eyebrow: 'HYBRID FUSION · LESSON 33',
    description: '比较 RRF 与归一化线性融合，调整 lexical/dense 权重和 rank constant，观察不同 Query 切片的收益与退化。',
    officialReference: research(sources.elasticRrf, sources.elasticHybrid),
    stages: [
      prediction('不同 Retriever 的原始分数可以不归一化直接线性相加吗？', '分数量纲和分布通常不可比。', 'no', [
        { value: 'yes', label: '直接相加即可' }, { value: 'no', label: '不应直接相加', description: '使用 rank fusion 或明确归一化' }, { value: 'max', label: '只取分数更大的 Retriever' },
      ], '✓ 对。融合策略必须明确分数与排名语义。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-hybrid-fusion', title: '手动调整 RRF 与线性融合', description: '比较 lexical、dense 和 fused 排名，分别通过错误码、跨语言和合同切片。', config: {} },
      reveal('RRF 是稳健基线，不是永远最优', '有领域标注数据时可验证动态权重或学习融合。', '<p>RRF 只使用排名位置，避免原始分数量纲问题；线性融合需要先归一化，再为不同信号设置权重。任何融合参数都应在 Query 切片上评测，而不是只看全局平均。</p>'),
      transfer('几乎没有标注数据、两个 Retriever 分数不可比，合理起点是什么？', '先选择稳健、低调参基线。', 'rrf', [
        { value: 'rrf', label: 'RRF，并评估 rank window 与 rank constant' }, { value: 'raw', label: '原始分数直接相加', feedback: '量纲不可比。' }, { value: 'dense', label: '删除 lexical', feedback: '会丢失互补精确信号。' },
      ], '✓ 对。RRF 是起点，仍需评测参数和切片。'),
    ],
  },
];
