import { prediction, reveal, research, sources, transfer } from './column-04-rag-common.js';

export const ragLessons34To38 = [
  {
    id: 'lesson-34', number: 34, columnId: 'column-04', shortTitle: 'Query Transformation',
    title: '改写查询能提高召回，为什么也可能把错误码和否定条件改没？',
    titleHtml: 'Query 改写既是增强，<span class="cr-marker">也是语义漂移风险</span>',
    eyebrow: 'QUERY TRANSFORMATION · LESSON 34',
    description: '比较 normalize、translation、multi-query、HyDE 和 decomposition，并保存原始 Query 与漂移指标。',
    officialReference: research(sources.hyde, sources.miracl),
    stages: [
      prediction('错误码 ERR-NVML-001 可以交给 LLM 改写成“显卡驱动问题”再检索吗？', '关键标识符可能被泛化丢失。', 'risk', [
        { value: 'yes', label: '改写越自然越好' }, { value: 'risk', label: '有高风险', description: '应保留原 Query，并限制改写策略' }, { value: 'hyde', label: '所有 Query 都先 HyDE' },
      ], '✓ 对。改写必须可审计并测量 Query Drift。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-query-transformation', title: '为四种查询选择最小必要转换', description: '精确标识符只规范化，跨语言翻译，模糊问题 multi-query，多跳问题 decomposition。', config: {} },
      reveal('不同转换解决不同的 Query—Document gap', '它们也会增加调用、延迟和错误。', '<p>Normalize 保留标识符；Translation 处理跨语言；Multi-query 扩展表达；HyDE 用假设文档连接零样本语义空间；Decomposition 拆多跳问题。任何转换都要保留原 Query 并比较 Recall 与 Drift。</p>'),
      transfer('多跳合同问题同时需要定义和赔偿上限，优先验证什么？', '问题包含两个独立证据目标。', 'decompose', [
        { value: 'decompose', label: '拆成定义与赔偿两个子查询，再合并证据' }, { value: 'spell', label: '只做拼写纠正', feedback: '没有解决多跳结构。' }, { value: 'hyde', label: '只生成一篇假设答案', feedback: '可能掩盖两个独立证据需求。' },
      ], '✓ 对。转换必须匹配 Query 失败模式。'),
    ],
  },
  {
    id: 'lesson-35', number: 35, columnId: 'column-04', shortTitle: 'Reranking 与候选预算',
    title: 'Reranker 更强，为什么不把全部百万文档都交给它排序？',
    titleHtml: '一阶段保证候选 Recall，<span class="cr-marker">重排只精炼有限候选</span>',
    eyebrow: 'RERANKING BENCHMARK · LESSON 35',
    description: '调节 first-stage topN、rerank topK、模型、batch 与 timeout，寻找不同语言和风险下的质量—延迟—成本 Pareto 区间。',
    officialReference: research(sources.cohereRerank, sources.qwen3, sources.colbert),
    stages: [
      prediction('相关文档没有进入 first-stage topN，换更强 Reranker 能找回来吗？', 'Reranker 只能重排它收到的候选。', 'no', [
        { value: 'yes', label: '可以自动找回' }, { value: 'no', label: '不能', description: '先保证候选 Recall' }, { value: 'llm', label: 'LLM Rerank 可以检索全库' },
      ], '✓ 对。一阶段漏召回是重排无法修复的上游错误。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-reranking-benchmark', title: '在三个切片上寻找 Rerank Pareto 区间', description: '选择 fast/multilingual/quality reranker，调整 topN、topK、batch 和 timeout。', config: {} },
      reveal('Reranking 是候选精炼层', '模型越贵、候选越多，质量和成本曲线越需要评测。', '<p>Cross-encoder 直接编码 Query—Document 对，通常比 bi-encoder 更细；多语言、高风险和长文档可能需要不同模型。不要默认 topN=20/topK=5，而要用 Candidate Recall、nDCG、P95 和成本共同决定。</p>'),
      transfer('Reranker 排序很好，但 Candidate Recall 只有 55%，首先改哪里？', '上游候选不足。', 'retrieval', [
        { value: 'retrieval', label: '扩大或改进一阶段召回，再重测 Rerank' }, { value: 'bigger', label: '只换更大 Reranker', feedback: '它看不到缺失文档。' }, { value: 'topk', label: '只把 rerank topK 调小', feedback: '会进一步减少证据。' },
      ], '✓ 对。先修上游 Recall，再优化排序。'),
    ],
  },
  {
    id: 'lesson-36', number: 36, columnId: 'column-04', shortTitle: '特殊语料专项检索',
    title: '表格、代码、图片、扫描 PDF 为什么不能都变成一串纯文本？',
    titleHtml: '保留原生结构，<span class="cr-marker">再选择表示与检索</span>',
    eyebrow: 'SPECIAL CORPORA · LESSON 36',
    description: '为表格、代码、扫描件、视觉报告和混合语言选择解析、切分、表示、检索与引用单位。',
    officialReference: research(sources.colpali, sources.colbert, sources.qwen3),
    stages: [
      prediction('图表页 OCR 出所有文字后，就与普通文本页完全等价了吗？', '布局、图例和视觉关系可能承载核心信息。', 'no', [
        { value: 'yes', label: '完全等价' }, { value: 'no', label: '不等价', description: '可能需要页面视觉或区域级表示' }, { value: 'caption', label: '只生成一句图片描述即可' },
      ], '✓ 对。视觉结构不是 OCR 文本的副产品。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-special-corpus', title: '为五类语料配置完整结构保真链路', description: '逐项选择解析、切分、表示、召回和引用单位，观察错误选择如何传导。', config: {} },
      reveal('特殊语料需要原生结构与引用单位', '检索单元不一定是普通文本 Chunk。', '<p>表格需要表头、单元格和 Schema；代码需要 AST、符号与行号；扫描件需要 OCR 质量和布局；视觉页面可以使用 page image multi-vector；混合语言需要跨语言表示与分词。</p>'),
      transfer('代码库回答“tenant_id 在哪里注入”，最有价值的引用是什么？', '需要可验证开发定位。', 'lines', [
        { value: 'lines', label: '文件路径、符号与精确行号范围' }, { value: 'chunk', label: '随机 Chunk ID', feedback: '难以回到代码位置验证。' }, { value: 'summary', label: '模型摘要，不附源码', feedback: '缺少可核对证据。' },
      ], '✓ 对。引用单位必须适配语料结构。'),
    ],
  },
  {
    id: 'lesson-37', number: 37, columnId: 'column-04', shortTitle: 'Evidence Assembly 与引用',
    title: '候选都召回了，为什么最终上下文仍可能答错、超预算或引用不完整？',
    titleHtml: 'top-k 不是最终上下文，<span class="cr-marker">Evidence 需要再次组装</span>',
    eyebrow: 'EVIDENCE ASSEMBLY · LESSON 37',
    description: '手动选择候选、parent expansion、去重、多样性、token budget、citation span 与 abstain。',
    officialReference: research(sources.lostMiddle, sources.ragchecker, sources.ragas),
    stages: [
      prediction('把 top-10 候选按排名直接拼进 Prompt，就是最可靠 Evidence 吗？', '重复、无关和缺少 parent 的候选会污染上下文。', 'no', [
        { value: 'yes', label: '直接拼接即可' }, { value: 'no', label: '不是', description: '需要覆盖、去重、预算、引用和拒答' }, { value: 'all', label: '候选越多越安全' },
      ], '✓ 对。Evidence Assembly 是独立工程阶段。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-evidence-assembly', title: '在 Token 预算内组装完整、纯净、可引用的 Evidence', description: '分别处理技术支持和法律合同，避免无关候选挤掉定义或操作步骤。', config: {} },
      reveal('上下文质量取决于覆盖与纯度', '模型无法自动知道哪些重复或无关候选应该删除。', '<p>Evidence Assembly 可做去重、parent expansion、多样性、来源覆盖、token budget 和 citation span。证据不足时要拒答，而不是让模型用参数知识填空。</p>'),
      transfer('检索到赔偿上限条款，但没有 Delay 定义，系统应怎么做？', '证据不完整。', 'retrieve-or-abstain', [
        { value: 'retrieve-or-abstain', label: '补充检索定义证据；仍不足则拒答并说明缺口' }, { value: 'guess', label: '根据常识猜 Delay', feedback: '法律高风险场景不能补猜。' }, { value: 'answer', label: '只回答 10%', feedback: '问题条件尚未被证据定义。' },
      ], '✓ 对。Evidence coverage 决定能否回答。'),
    ],
  },
  {
    id: 'lesson-38', number: 38, columnId: 'column-04', shortTitle: 'RAG 生产发布门禁',
    title: '平均分 90%，但跨语言退化、ACL 泄漏、索引陈旧，可以上线吗？',
    titleHtml: '证明系统可以上线，<span class="cr-marker">而不是证明 Demo 能回答</span>',
    eyebrow: 'RAG PRODUCTION RELEASE GATE · LESSON 38',
    description: '按语言、查询、权限和新鲜度切片审查 retrieval、groundedness、correctness、citation、latency、cost 与回滚。',
    officialReference: research(sources.ragchecker, sources.ragas, sources.mteb),
    stages: [
      prediction('总平均指标通过，就可以忽略 ACL 切片出现两次泄漏吗？', '安全门槛不是平均值。', 'no', [
        { value: 'yes', label: '平均分高即可' }, { value: 'no', label: '绝对不可以', description: '关键安全切片必须零泄漏' }, { value: 'log', label: '上线后记录日志即可' },
      ], '✓ 对。关键风险门槛必须单独阻断发布。'),
      { id: 'lab', type: 'simulator', simulator: 'rag-release-gate', title: '修复失败切片并提交发布决策', description: '处理跨语言退化、ACL 泄漏和新鲜度超标，准备回滚和分层监控后灰度发布。', config: {} },
      reveal('RAG 评估必须同时覆盖检索与生成模块', '任何一个阶段失效都可能产生可信外观的错误答案。', '<p>发布门禁至少包含 retrieval relevance、groundedness、answer correctness、citation accuracy、ACL leakage、P95 latency、cost 和 freshness。指标要按语言、Query、语料、权限和版本切片，并绑定灰度、监控和回滚。</p>'),
      transfer('Retrieval Recall 很高，但 Groundedness 低，首先定位哪一层？', '证据已找到但回答没有忠实使用。', 'generation', [
        { value: 'generation', label: 'Evidence Assembly / Prompt / 生成约束与引用层' }, { value: 'embedding', label: '只换 Embedding', feedback: '相关证据已经召回。' }, { value: 'topk', label: '盲目增加 topK', feedback: '可能进一步污染上下文。' },
      ], '✓ 对。评估指标应指向具体失败层。'),
    ],
  },
];
