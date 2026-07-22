import { prediction, reveal, research, sources, transfer } from './column-04-rag-common.js';

export const ragLessons22To27 = [
  {
    id: 'lesson-22', number: 22, columnId: 'column-04', shortTitle: '先判断是否需要 RAG',
    title: '什么时候增加向量数据库，反而是在把简单问题复杂化？',
    titleHtml: '先选择知识访问方式，<span class="cr-marker">再决定是否构建 RAG</span>',
    eyebrow: 'KNOWLEDGE ACCESS DECISION · LESSON 22',
    description: '比较长上下文、普通搜索、SQL/API、RAG 与高风险人工复核，建立“问题优先而不是向量优先”的架构判断。',
    officialReference: research(sources.ragSurvey, sources.lostMiddle),
    stages: [
      prediction('20 页稳定手册也必须先拆 Chunk、做 Embedding、上向量库吗？', '知识规模、更新频率、引用和查询量共同决定最小可行架构。', 'no', [
        { value: 'yes', label: '必须', description: '只要需要外部知识就必须 RAG' },
        { value: 'no', label: '不一定', description: '长上下文、搜索或 SQL/API 可能更简单可靠' },
        { value: 'fine-tune', label: '应该先微调模型', description: '把知识永久写进参数最可靠' },
      ], '✓ 对。RAG 是一种知识访问架构，不是所有知识问题的默认答案。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-knowledge-access-decision', title: '为五种知识问题选择最小可靠架构', description: '手动改变语料规模、实时性、风险和结构化程度，比较长上下文、SQL/API、搜索与 RAG。', config: {} },
      reveal('RAG 解决的是“外部非结构化证据如何进入生成”', '它不是数据库、搜索和业务 API 的替代品。', '<p>实时余额、库存和权限事实应查询权威系统；小型稳定语料可能直接放入长上下文并缓存；只需要返回文档时普通搜索就够了。只有当非结构化语料规模、更新、引用和查询方式需要检索与生成协同时，RAG 才成为合理候选。</p>'),
      transfer('用户问“订单 ORD-881 当前余额”，答案来自实时账务表，首选是什么？', '结构化实时事实应直接访问权威数据源。', 'api', [
        { value: 'api', label: 'SQL / 业务 API，并在需要时让模型解释结果' },
        { value: 'vector', label: '把订单表每天转成向量', feedback: '这会引入陈旧和精度风险。' },
        { value: 'fine-tune', label: '微调模型记住订单', feedback: '订单持续变化，模型参数不是权威实时源。' },
      ], '✓ 对。先选知识访问方式，再决定是否需要生成。'),
    ],
  },
  {
    id: 'lesson-23', number: 23, columnId: 'column-04', shortTitle: '建立 Corpus × Query 画像',
    title: '还不知道用户怎么问、文档长什么样，怎么可能先选 Embedding？',
    titleHtml: '先把检索问题画像清楚，<span class="cr-marker">再比较技术</span>',
    eyebrow: 'RETRIEVAL PROBLEM PROFILE · LESSON 23',
    description: '从语言、查询类型、语料形态、权限、SLA 与失败代价构建检索需求，避免脱离场景讨论模型和参数。',
    officialReference: research(sources.beir, sources.miracl),
    stages: [
      prediction('一个模型在英文语义检索排行榜上领先，能直接推导它适合中英混输错误码查询吗？', '语言与 Query 类型是独立评测切片。', 'no', [
        { value: 'yes', label: '可以直接推导' }, { value: 'no', label: '不能', description: '必须画像语言、精确词、语料和 SLA' }, { value: 'bigger', label: '只要换更大模型即可' },
      ], '✓ 对。脱离 Query 与 Corpus 画像的“最佳模型”没有工程意义。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-problem-profile', title: '为多个业务场景建立检索画像', description: '切换技术支持、制度、合同和代码场景，定义语言、查询、权限、风险和 SLA。', config: {} },
      reveal('检索需求是一个多维约束问题', '不同切片可能需要不同 Retriever、模型与参数。', '<p>错误码依赖 lexical，跨语言制度依赖 multilingual/cross-lingual 能力，合同更怕错答，代码同时需要符号和语义。生产系统应把这些差异显式写进 Retrieval Problem Profile。</p>'),
      transfer('哪个信息最能改变检索架构？', '不是“文档数量”一个指标。', 'profile', [
        { value: 'profile', label: '查询类型、语言、语料结构、权限、风险和 SLA 的组合' },
        { value: 'pages', label: '只看文档页数', feedback: '同样页数的合同、代码和 FAQ 完全不同。' },
        { value: 'brand', label: '先看向量数据库品牌', feedback: '数据库不能替代问题画像。' },
      ], '✓ 对。画像决定评测切片和候选架构。'),
    ],
  },
  {
    id: 'lesson-24', number: 24, columnId: 'column-04', shortTitle: '先构建 Golden Set',
    title: '没有相关性标注，调 Chunk、Embedding 和 top-k 到底在优化什么？',
    titleHtml: '先建立可复现评测集，<span class="cr-marker">再谈优化</span>',
    eyebrow: 'GOLDEN DATASET & IR METRICS · LESSON 24',
    description: '标注完全相关、部分相关、难负例、无答案和无权限样例，并理解 Recall、Precision、MRR、nDCG 与分层切片。',
    officialReference: research(sources.beir, sources.ragchecker, sources.ragas),
    stages: [
      prediction('只抽 20 个能回答的问题计算最终答案正确率，足够评估检索吗？', '无答案、难负例和权限泄漏会被完全隐藏。', 'no', [
        { value: 'yes', label: '足够' }, { value: 'no', label: '不够', description: '要标注候选相关性并覆盖失败切片' }, { value: 'llm', label: '让一个 LLM 给总分即可' },
      ], '✓ 对。检索和生成必须分层评估，且要覆盖失败样例。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-golden-dataset', title: '标注 Golden Set 并配置评测切片', description: '为 Query—Document 对标注相关性，加入 Hard Negative、No Answer 和 Permission Denied。', config: {} },
      reveal('不同指标回答不同问题', '只看 Accuracy 会掩盖召回和排序失败。', '<p>Recall@K 看相关证据有没有进入候选，Precision@K 看上下文污染，MRR 看第一个相关结果位置，nDCG 支持多级相关性。生产评测还要按语言、Query 类型、权限和版本切片。</p>'),
      transfer('相关文档都在 top-10，但第一个相关结果总在第 9 位，应重点看什么？', '这是排序位置问题。', 'mrr', [
        { value: 'mrr', label: 'MRR / nDCG' }, { value: 'recall', label: '只看 Recall@10', feedback: 'Recall 已经无法暴露位置过低。' }, { value: 'tokens', label: 'Token 数', feedback: 'Token 数不是排序指标。' },
      ], '✓ 对。要用与失败模式匹配的指标。'),
    ],
  },
  {
    id: 'lesson-25', number: 25, columnId: 'column-04', shortTitle: '文档解析、结构与 ACL',
    title: '表格、标题、页码和权限在解析时丢了，后面还能靠模型补回来吗？',
    titleHtml: '知识库质量从解析开始，<span class="cr-marker">不是从 Embedding 开始</span>',
    eyebrow: 'INGESTION CONTRACT · LESSON 25',
    description: '建立保留结构、来源、版本、稳定 ID、OCR 质量和 ACL metadata 的文档入库契约。',
    officialReference: research(sources.colpali, sources.ragchecker),
    stages: [
      prediction('ACL 可以等向量召回完成后，再由应用层删除其他租户结果吗？', '这会扩大越权候选与泄漏面。', 'no', [
        { value: 'yes', label: '可以后过滤' }, { value: 'no', label: '不应默认如此', description: '权限 metadata 应在入库和检索前过滤链路中存在' }, { value: 'prompt', label: '在 Prompt 里提醒模型不要泄漏' },
      ], '✓ 对。权限是数据与检索契约，不是 Prompt 礼貌提醒。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-document-ingestion', title: '对原文与解析结果执行质量门禁', description: '检查标题、表格、页码、来源、版本、OCR 置信度、ACL 和稳定身份。', config: {} },
      reveal('解析错误会成为不可恢复的信息损失', '后续向量只能表示它收到的内容。', '<p>Document 应保留文本、结构、source、page/section、version、language、ACL、document_id 与 checksum。表格和视觉页面可能需要结构化或视觉检索路径，而不是无条件 OCR 后拍平。</p>'),
      transfer('扫描合同把“10% cap”识别成“1O% cap”，正确处理是什么？', '低置信度关键字段不能静默入库。', 'quality', [
        { value: 'quality', label: '记录 OCR 置信度并进入质检/重解析门禁' }, { value: 'ignore', label: '直接入库，Embedding 会理解', feedback: '字符错误会影响精确检索和答案。' }, { value: 'replace', label: '统一把 O 替换成 0', feedback: '无上下文替换会制造新的错误。' },
      ], '✓ 对。解析质量必须可观察、可阻断。'),
    ],
  },
  {
    id: 'lesson-26', number: 26, columnId: 'column-04', shortTitle: 'Chunking 基线',
    title: 'Chunk 越大上下文越完整，为什么召回和引用反而可能更差？',
    titleHtml: '亲手移动 Chunk 边界，<span class="cr-marker">看见结构被切断的代价</span>',
    eyebrow: 'BASELINE CHUNKING · LESSON 26',
    description: '对合同和技术手册手动调整边界与 overlap，观察 Recall、引用完整度和索引膨胀。',
    officialReference: research(sources.adaptiveChunking, sources.lateChunking),
    stages: [
      prediction('把所有文档统一 chunkSize=1000、overlap=200，可以作为生产最佳实践吗？', '参数必须与结构、查询和评测结果共同决定。', 'no', [
        { value: 'yes', label: '可以直接统一' }, { value: 'no', label: '不可以', description: '先做结构感知基线并在 Golden Set 上评测' }, { value: 'max', label: '越大越好' },
      ], '✓ 对。固定参数只能是起点，不是结论。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-baseline-chunking', title: '手动编辑 Chunk 边界并观察指标变化', description: '切换合同与技术手册，调整边界和 overlap，找出结构感知基线。', config: {} },
      reveal('Chunking 同时影响表示、召回、上下文和引用', '它不是一个孤立的字符数参数。', '<p>小 Chunk 更聚焦但可能丢上下文，大 Chunk 更完整却会压缩多个主题并污染候选。可靠基线通常先尊重标题、段落、代码符号和表格结构，再通过 Golden Set 调整大小与 overlap。</p>'),
      transfer('合同定义条款与赔偿条款相距较远，最先尝试什么？', '先保留结构，再考虑高级方法。', 'structure', [
        { value: 'structure', label: '结构切分并保留 section path / parent 信息' }, { value: 'random', label: '随机等长切分', feedback: '会破坏定义和条款层级。' }, { value: 'one', label: '整份合同一个 Chunk', feedback: '召回和引用都会过于粗糙。' },
      ], '✓ 对。先建立可解释结构基线。'),
    ],
  },
  {
    id: 'lesson-27', number: 27, columnId: 'column-04', shortTitle: '高级 Chunking 的边界',
    title: 'Semantic、Contextual、Parent-child、Late Chunking，哪个才是“高级答案”？',
    titleHtml: '高级方法不是升级套餐，<span class="cr-marker">而是针对特定失败模式</span>',
    eyebrow: 'ADVANCED CHUNKING · LESSON 27',
    description: '比较 parent-child、contextual prefix、late chunking 与结构基线的质量、预处理和索引成本。',
    officialReference: research(sources.lateChunking, sources.contextual, sources.adaptiveChunking),
    stages: [
      prediction('结构清晰的 Markdown 基线 Recall 已达 91%，是否仍应启用 Contextual Retrieval？', '复杂度需要由可测增益证明。', 'no', [
        { value: 'yes', label: '高级方法总会更好' }, { value: 'no', label: '不一定', description: '无增益时应保留简单基线' }, { value: 'all', label: '把所有高级方法叠加' },
      ], '✓ 对。复杂方法需要明确失败模式和收益。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-advanced-chunking', title: '为四类失败选择高级 Chunking 策略', description: '观察 Recall 增益、预处理延迟和索引膨胀，保留“什么都不加”的选项。', config: {} },
      reveal('高级 Chunking 解决不同的上下文损失', 'Parent-child、Contextual 与 Late Chunking 的成本和依赖不同。', '<p>Parent-child 用小单元召回并返回更大父块；Contextual Retrieval 为 Chunk 增加文档级上下文；Late Chunking 先编码长文再池化 Chunk。它们不能脱离模型、语料与评测集讨论。</p>'),
      transfer('局部 Chunk 缺少文档主题，但基线结构本身合理，可以优先验证什么？', '针对局部上下文缺失。', 'contextual', [
        { value: 'contextual', label: 'Contextual prefix 或 Late Chunking 的 A/B 实验' }, { value: 'random', label: '随机增加 overlap', feedback: '可能只增加重复，未补文档主题。' }, { value: 'rerank', label: '只换 Reranker', feedback: '表示阶段已丢上下文，重排未必能恢复。' },
      ], '✓ 对。先定位失败层，再选择高级方法。'),
    ],
  },
];
