const ragArtifactMeta = {
  knowledgeAccessDecision: { label: '知识访问架构决策', description: '长上下文、搜索、SQL/API、RAG 与人工复核的使用边界' },
  retrievalProblemProfile: { label: 'Corpus × Query 检索画像', description: '语言、查询类型、语料、ACL、风险和 SLA' },
  retrievalEvaluationDataset: { label: 'RAG Golden Evaluation Dataset', description: '相关性、难负例、无答案、权限与切片评测集' },
  documentIngestionContract: { label: '文档入库与权限契约', description: '结构、来源、版本、OCR、稳定 ID 与 ACL' },
  baselineChunkingPolicy: { label: 'Chunking 基线策略', description: '合同与技术手册的结构感知边界和 overlap 基线' },
  advancedChunkingDecision: { label: '高级 Chunking 使用边界', description: 'Parent-child、Contextual、Late Chunking 与简单基线的场景决策' },
  embeddingBenchmarkReport: { label: '多语言 Embedding 评测报告', description: '中文、跨语言和中英混输的质量、延迟、维度与成本' },
  retrievalRepresentationPolicy: { label: '检索表示与路由策略', description: 'Dense、Lexical、Sparse、Multi-vector 与 Hybrid' },
  searchIndexSchema: { label: '检索索引 Schema', description: '稳定 ID、相似度、ANN、metadata、ACL、量化与 alias' },
  indexLifecyclePolicy: { label: '增量索引生命周期', description: '幂等写入、删除、双索引、验证、切换与回滚' },
  firstStageRetrievalRouter: { label: '一阶段召回路由器', description: '精确、语义、跨语言、代码和实时 Query 的路由规则' },
  hybridFusionPolicy: { label: 'Hybrid Fusion 策略', description: 'RRF、线性融合、权重和 Query 切片决策' },
  queryTransformationPolicy: { label: 'Query Transformation 策略', description: 'Normalize、Translation、Multi-query、HyDE 与 Decomposition' },
  rerankingBenchmarkReport: { label: 'Reranking 评测报告', description: 'Candidate Recall、nDCG、P95、成本和候选预算' },
  specialCorpusRetrievalPolicy: { label: '特殊语料检索策略', description: '表格、代码、扫描件、视觉页面与混合语言' },
  evidenceAndCitationContract: { label: 'Evidence 与引用契约', description: '去重、扩展、多样性、Token 预算、Citation 与拒答' },
  ragProductionReleaseGate: { label: 'RAG 生产发布门禁', description: 'Retrieval、Groundedness、Correctness、ACL、Latency、Cost 与 Freshness' },
};

const lessonResults = Object.fromEntries([
  ['lesson-22', '知识访问架构决策'],
  ['lesson-23', 'Corpus × Query 检索画像'],
  ['lesson-24', 'RAG Golden Evaluation Dataset'],
  ['lesson-25', '文档入库与权限契约'],
  ['lesson-26', 'Chunking 基线策略'],
  ['lesson-27', '高级 Chunking 使用边界'],
  ['lesson-28', '多语言 Embedding 评测报告'],
  ['lesson-29', '检索表示与路由策略'],
  ['lesson-30', '检索索引 Schema'],
  ['lesson-31', '增量索引生命周期'],
  ['lesson-32', '一阶段召回路由器'],
  ['lesson-33', 'Hybrid Fusion 策略'],
  ['lesson-34', 'Query Transformation 策略'],
  ['lesson-35', 'Reranking 评测报告'],
  ['lesson-36', '特殊语料检索策略'],
  ['lesson-37', 'Evidence 与引用契约'],
  ['lesson-38', 'RAG 生产发布门禁'],
]);

function preview(name, value) {
  if (name === 'knowledgeAccessDecision') return `<p>已完成 <b>${Object.keys(value?.decisions ?? {}).length}</b> 类知识访问方案判断，不再默认向量优先。</p>`;
  if (name === 'retrievalProblemProfile') return `<p>已建立 <b>${Object.keys(value?.scenarios ?? {}).length}</b> 个 Corpus × Query 场景画像。</p>`;
  if (name === 'retrievalEvaluationDataset') return `<p>Golden Set 包含 <b>${value?.cases?.length ?? 0}</b> 类相关、难负例、无答案与权限样例。</p>`;
  if (name === 'documentIngestionContract') return '<p>结构、来源、版本、OCR、稳定 ID 与 ACL 已进入索引前质量门禁。</p>';
  if (name === 'baselineChunkingPolicy') return `<p>已在 ${value?.scenarios?.join('、') ?? '多类语料'} 上建立结构感知基线。</p>`;
  if (name === 'advancedChunkingDecision') return '<p>高级 Chunking 只在基线失败且可测收益成立时启用。</p>';
  if (name === 'embeddingBenchmarkReport') return `<p>已完成 <b>${Object.keys(value?.slices ?? {}).length}</b> 个语言切片的质量—延迟—成本评测。</p>`;
  if (name === 'retrievalRepresentationPolicy') return '<p>已按 Query 类型路由 Dense、Lexical、Sparse、Multi-vector 与 Hybrid。</p>';
  if (name === 'searchIndexSchema') return `<p>${value?.ann ?? 'ANN'} · ${value?.metric ?? 'metric'} · ACL pre-filter · alias migration。</p>`;
  if (name === 'indexLifecyclePolicy') return `<p>当前索引：<b>${value?.activeIndex ?? '已切换'}</b>；回滚索引已保留。</p>`;
  if (name === 'firstStageRetrievalRouter') return `<p>已配置 <b>${Object.keys(value?.routes ?? {}).length}</b> 类 Query 的一阶段召回路由。</p>`;
  if (name === 'hybridFusionPolicy') return '<p>RRF 作为稳健基线，线性融合仅在切片标注支持时启用。</p>';
  if (name === 'queryTransformationPolicy') return '<p>Query 改写按失败模式启用，并保存原始 Query 与 Drift 审计。</p>';
  if (name === 'rerankingBenchmarkReport') return `<p>已为 <b>${Object.keys(value?.slices ?? {}).length}</b> 个切片找到 Rerank Pareto 区间。</p>`;
  if (name === 'specialCorpusRetrievalPolicy') return '<p>表格、代码、扫描件、视觉页面和混合语言均保留原生结构。</p>';
  if (name === 'evidenceAndCitationContract') return '<p>Evidence 组装包含覆盖、纯度、预算、引用和无证据拒答。</p>';
  if (name === 'ragProductionReleaseGate') return `<p>发布决策：<b>${value?.decision ?? '待定'}</b>；关键切片、回滚和监控已纳入门禁。</p>`;
  return null;
}

export function installRagColumnProduct(app) {
  const baseMeta = app.artifactMeta.bind(app);
  const basePreview = app.artifactPreview.bind(app);
  const baseResult = app.resultForLesson.bind(app);

  app.artifactMeta = function ragArtifactMetadata(name) {
    return ragArtifactMeta[name] ?? baseMeta(name);
  };

  app.artifactPreview = function ragArtifactPreview(name, value) {
    return preview(name, value) ?? basePreview(name, value);
  };

  app.resultForLesson = function ragResultForLesson(lessonId) {
    return lessonResults[lessonId] ?? baseResult(lessonId);
  };

  app.renderArtifacts = function renderAllProjectArtifacts() {
    const target = this.root.querySelector('[data-artifacts]');
    const progressTarget = this.root.querySelector('[data-artifact-progress]');
    if (!target || !progressTarget) return;
    const data = this.artifacts.get();
    const names = this.artifactNames();
    const targetCount = 40;
    const percent = Math.min(100, Math.round(names.length / targetCount * 100));
    progressTarget.innerHTML = `<span>项目完成度</span><i><em style="width:${percent}%"></em></i><b>${names.length} / ${targetCount}</b>`;
    target.innerHTML = names.length
      ? names.map((name, index) => this.renderArtifactCard(name, data[name], index)).join('')
      : '<div class="empty-artifacts"><span>◇</span><b>你的项目成果会出现在这里</b><p>每完成一次可验证实验，都会保存一份可在后续课程继续使用的工程决策。</p></div>';
  };
}
