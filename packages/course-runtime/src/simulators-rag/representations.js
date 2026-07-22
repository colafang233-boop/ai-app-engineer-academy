import {
  artifactChips,
  bindScenarioTabs,
  ensureTeachingDataNotice,
  once,
  percent,
  query,
  renderCandidateTable,
  renderMetricCards,
  renderScenarioTabs,
  saveArtifact,
  setResult,
  updateMetric,
} from '../components/simulator-kit.js';
import { mountRankDiffViewer } from '../components/rag/rank-diff-viewer.js';
import { mountScoreContributionInspector } from '../components/rag/score-contribution-inspector.js';
import {
  corpusDocuments,
  denseRanks,
  documentsByIds,
  embeddingCandidates,
  lexicalRanks,
  ragScenarios,
  sparseRanks,
} from './data.js';

export function mountAdvancedChunkingLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { id: 'legal-definition', label: '合同定义跨段', correct: 'parent-child', baseline: [0.68, 42, 1.0], advanced: [0.92, 58, 1.25] },
    { id: 'ambiguous-manual', label: '手册局部段落缺上下文', correct: 'contextual', baseline: [0.71, 36, 1.0], advanced: [0.89, 71, 1.48] },
    { id: 'long-policy', label: '长制度文档', correct: 'late', baseline: [0.74, 40, 1.0], advanced: [0.87, 95, 1.18] },
    { id: 'clean-markdown', label: '结构清晰 Markdown', correct: 'baseline', baseline: [0.91, 24, 1.0], advanced: [0.91, 68, 1.42] },
  ];
  const strategies = [
    ['baseline', '保持结构切分基线'], ['parent-child', 'Parent-child retrieval'], ['semantic', 'Semantic chunking'], ['contextual', 'Contextual prefix'], ['late', 'Late chunking'],
  ];
  let active = scenarios[0];
  const decisions = new Map();

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>高级 Chunking 对照实验</b><small>复杂方法只有在特定失败模式下才值得付出成本</small></div><button class="v1-primary" data-save type="button">保存策略边界</button></div>
      ${renderScenarioTabs(scenarios, active.id)}
      <div class="v1-grid"><section>
        <span class="v1-label">选择策略</span><div class="v1-card-list">${strategies.map(([value, label]) => `<label class="v1-card"><input type="radio" name="advanced-chunk" value="${value}"> <b>${label}</b></label>`).join('')}</div>
        <div class="rag-ab-panels"><article><span>A · 基线</span><b data-a-recall>—</b><small>Recall@5</small></article><article><span>B · 当前策略</span><b data-b-recall>—</b><small>Recall@5</small></article></div>
      </section><aside>
        ${renderMetricCards([
          { id: 'gain', label: 'Recall 增益', value: '—' },
          { id: 'latency', label: '预处理延迟', value: '—' },
          { id: 'index', label: '索引体积', value: '—' },
        ])}
        <div class="v1-result" data-result>先判断失败来自“局部 Chunk 缺上下文”还是根本不需要高级方法。</div>
        ${artifactChips(artifacts, ['baselineChunkingPolicy'])}
        ${ensureTeachingDataNotice()}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function render() {
    root.querySelectorAll('input[name="advanced-chunk"]').forEach((input) => { input.checked = decisions.get(active.id) === input.value; });
    const selected = decisions.get(active.id);
    const advanced = selected === 'baseline' ? active.baseline : selected === active.correct ? active.advanced : [active.baseline[0] + 0.03, active.baseline[1] + 50, active.baseline[2] + 0.35];
    query(root, '[data-a-recall]').textContent = percent(active.baseline[0]);
    query(root, '[data-b-recall]').textContent = selected ? percent(advanced[0]) : '—';
    updateMetric(root, 'gain', selected ? `${Math.round((advanced[0] - active.baseline[0]) * 100)}pt` : '—', '质量必须与成本一起看');
    updateMetric(root, 'latency', selected ? `${advanced[1]}ms` : '—', '索引前处理开销');
    updateMetric(root, 'index', selected ? `${advanced[2].toFixed(2)}×` : '—', '额外上下文或多层索引');
  }
  bindScenarioTabs(root, scenarios, active.id, (scenario) => { active = scenario; render(); });
  root.querySelectorAll('input[name="advanced-chunk"]').forEach((input) => input.addEventListener('change', () => {
    decisions.set(active.id, input.value);
    const ok = input.value === active.correct;
    setResult(result, ok ? 'good' : 'warn', ok
      ? `✓ ${active.label} 的失败模式与 ${input.parentElement.textContent.trim()} 匹配。`
      : active.correct === 'baseline'
        ? '这个语料的结构切分基线已经很好，复杂方案只增加成本。'
        : '当前策略没有针对真正的上下文丢失方式。');
    render();
  }));
  query(root, '[data-save]').addEventListener('click', () => {
    const passed = scenarios.every((scenario) => decisions.get(scenario.id) === scenario.correct);
    if (!passed) {
      setResult(result, 'warn', `已正确完成 ${scenarios.filter((scenario) => decisions.get(scenario.id) === scenario.correct).length}/${scenarios.length} 个场景。`);
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'advancedChunkingDecision',
      lessonId: config.lessonId,
      value: { decisions: Object.fromEntries(decisions), default: 'baseline', requireMeasuredGain: true },
    });
    setResult(result, 'good', '✓ 已形成高级 Chunking 使用边界：先证明基线失败，再支付复杂度。');
    complete(artifact);
  });
  render();
}

export function mountEmbeddingBenchmarkLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const slices = [
    { id: 'zh', label: '中文检索', metric: 'zh', minimum: 0.84, sla: 70 },
    { id: 'cross', label: '跨语言', metric: 'crossLingual', minimum: 0.80, sla: 130 },
    { id: 'mixed', label: '中英混输', metric: 'mixed', minimum: 0.78, sla: 130 },
  ];
  let active = slices[0];
  let selected = embeddingCandidates[0].id;
  let dimension = 768;
  const passed = new Map();

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>多语言向量模型擂台</b><small>排行榜只缩小候选范围，业务 Golden Set 才能做决定</small></div><button class="v1-primary" data-run type="button">运行当前切片</button></div>
      ${renderScenarioTabs(slices, active.id)}
      <div class="v1-grid"><section>
        <div class="v1-card-list" data-models></div>
        <label class="v1-label">输出维度 <b data-dim-label>768</b></label><input type="range" min="384" max="4096" step="384" value="768" data-dim>
        <div class="v1-row"><label><input type="checkbox" data-normalize> 归一化向量</label><label><input type="checkbox" data-query-instruction> 使用模型要求的 query instruction</label></div>
      </section><aside>
        ${renderMetricCards([
          { id: 'quality', label: '切片 Recall@10', value: '—' },
          { id: 'latency', label: 'P95 编码延迟', value: '—' },
          { id: 'memory', label: '模型/服务内存', value: '—' },
          { id: 'index', label: '相对索引体积', value: '—' },
        ])}
        <div class="v1-result" data-result>分别通过中文、跨语言和中英混输切片。</div>
        ${artifactChips(artifacts, ['retrievalEvaluationDataset', 'advancedChunkingDecision'])}
        ${ensureTeachingDataNotice()}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function model() { return embeddingCandidates.find((item) => item.id === selected); }
  function renderModels() {
    query(root, '[data-models]').innerHTML = embeddingCandidates.map((item) => `<button type="button" class="v1-card ${item.id === selected ? 'selected' : ''}" data-model="${item.id}"><b>${item.label}</b><small>${item.dimension} dim · ${item.latency}ms · ${item.memory || 'API'}GB · languages ${item.languages.join('/')}</small></button>`).join('');
    root.querySelectorAll('[data-model]').forEach((button) => button.addEventListener('click', () => { selected = button.dataset.model; dimension = Math.min(model().dimension, dimension); render(); }));
  }
  function render() {
    renderModels();
    query(root, '[data-dim]').value = dimension;
    query(root, '[data-dim-label]').textContent = dimension;
    const item = model();
    const compression = Math.max(0.78, dimension / item.dimension);
    const quality = item[active.metric] * compression;
    const latency = item.latency * Math.max(0.7, dimension / item.dimension);
    updateMetric(root, 'quality', percent(quality), `目标 ≥ ${percent(active.minimum)}`);
    updateMetric(root, 'latency', `${Math.round(latency)}ms`, `SLA ≤ ${active.sla}ms`);
    updateMetric(root, 'memory', item.memory ? `${item.memory}GB` : '托管 API', item.cost ? `$${item.cost}/单位` : '本地部署');
    updateMetric(root, 'index', `${(dimension / 768).toFixed(1)}×`, '维度直接影响向量存储');
  }
  bindScenarioTabs(root, slices, active.id, (slice) => { active = slice; render(); });
  query(root, '[data-dim]').addEventListener('input', (event) => { dimension = Number(event.target.value); render(); });
  query(root, '[data-run]').addEventListener('click', () => {
    const item = model();
    const normalize = query(root, '[data-normalize]').checked;
    const instruction = query(root, '[data-query-instruction]').checked;
    const compression = Math.max(0.78, dimension / item.dimension);
    const quality = item[active.metric] * compression + (instruction ? 0.015 : 0);
    const latency = item.latency * Math.max(0.7, dimension / item.dimension);
    const ok = quality >= active.minimum && latency <= active.sla && normalize && instruction;
    if (!ok) {
      setResult(result, 'warn', '当前候选在质量、延迟、归一化或 query instruction 上没有同时满足该切片。');
      return;
    }
    passed.set(active.id, { model: selected, dimension, quality, latency, normalize, instruction });
    if (passed.size < slices.length) {
      setResult(result, 'good', `✓ ${active.label} 已通过。继续验证其他语言切片。`);
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'embeddingBenchmarkReport',
      lessonId: config.lessonId,
      value: { slices: Object.fromEntries(passed), conclusion: 'no-universal-best-model', evaluatedCandidates: embeddingCandidates.map((item) => item.id) },
    });
    setResult(result, 'good', '✓ 已按中文、跨语言和混输切片完成 Embedding 选择，没有把排行榜第一当生产答案。');
    complete(artifact);
  });
  render();
}

export function mountRepresentationPolicyLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = ragScenarios;
  let active = scenarios[0];
  const correct = { support: 'hybrid', policy: 'dense', legal: 'hybrid', code: 'multi-vector' };
  const decisions = new Map();
  const choices = [
    ['lexical', 'BM25 / lexical'], ['dense', 'Dense 单向量'], ['sparse', 'Learned sparse'], ['multi-vector', 'Multi-vector / late interaction'], ['hybrid', 'Hybrid 多路召回'],
  ];

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>Dense、Sparse 与 Multi-vector 表示选择器</b><small>同一个 Query 在不同表示下会命中完全不同的候选</small></div><button class="v1-primary" data-save type="button">保存表示策略</button></div>
      ${renderScenarioTabs(scenarios, active.id)}
      <div class="v1-grid"><section>
        <article class="v1-card"><b data-query></b><small data-hint></small></article>
        <div class="v1-card-list">${choices.map(([value, label]) => `<label class="v1-card"><input type="radio" name="representation" value="${value}"> <b>${label}</b></label>`).join('')}</div>
        <div data-score-inspector></div>
      </section><aside>
        <div data-candidates></div>
        <div class="v1-result" data-result>注意错误码、缩写、跨语言语义和代码符号并不是同一种匹配问题。</div>
        ${artifactChips(artifacts, ['embeddingBenchmarkReport'])}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function ranking(mode) {
    const ids = mode === 'lexical' ? lexicalRanks[active.id]
      : mode === 'sparse' ? sparseRanks[active.id]
        : mode === 'dense' ? denseRanks[active.id]
          : mode === 'multi-vector' ? (active.id === 'code' ? ['d-runtime-context', 'd-refund-tool', 'd-order-service', 'd-nvml'] : denseRanks[active.id])
            : [...new Set([...lexicalRanks[active.id].slice(0, 2), ...denseRanks[active.id].slice(0, 2)])];
    return documentsByIds(ids).map((item) => ({ ...item, relevant: active.relevantIds.includes(item.id) }));
  }
  function render() {
    query(root, '[data-query]').textContent = active.query;
    query(root, '[data-hint]').textContent = `${active.language} · ${active.queryType}`;
    const decision = decisions.get(active.id);
    const previewMode = decision ?? 'dense';
    root.querySelectorAll('input[name="representation"]').forEach((input) => { input.checked = input.value === decision; });
    query(root, '[data-candidates]').innerHTML = renderCandidateTable(ranking(previewMode), { scoreLabel: '模拟得分' });
    mountScoreContributionInspector({
      root: query(root, '[data-score-inspector]'),
      active: previewMode === 'hybrid' ? 'lexical' : previewMode,
      modes: [
        { id: 'lexical', label: 'BM25', title: '词项贡献', explanation: '错误码和符号依赖精确词项。', contributions: [{ label: 'NVML', value: active.id === 'support' ? 0.96 : 0.18 }, { label: 'tenant_id', value: active.id === 'code' ? 0.92 : 0.05 }] },
        { id: 'dense', label: 'Dense', title: '整体语义相似度', explanation: '单向量压缩整段语义，但可能弱化局部符号。', contributions: [{ label: 'semantic intent', value: active.id === 'policy' ? 0.91 : 0.72 }, { label: 'exact identifier', value: 0.33 }] },
        { id: 'sparse', label: 'Sparse', title: '学习后的词项权重', explanation: '保留词项可解释性，并允许语义扩展。', contributions: [{ label: 'remote ↔ 远程', value: active.id === 'policy' ? 0.84 : 0.21 }, { label: 'allowance', value: 0.78 }] },
        { id: 'multi-vector', label: 'Multi-vector', title: 'Token-to-token late interaction', explanation: '细粒度匹配更强，但索引和计算成本更高。', contributions: [{ label: 'tenant_id ↔ tenant_id', value: active.id === 'code' ? 0.98 : 0.30 }, { label: 'injected ↔ beforeModel', value: active.id === 'code' ? 0.87 : 0.40 }] },
      ],
    });
  }
  bindScenarioTabs(root, scenarios, active.id, (scenario) => { active = scenario; render(); });
  root.querySelectorAll('input[name="representation"]').forEach((input) => input.addEventListener('change', () => {
    decisions.set(active.id, input.value);
    setResult(result, input.value === correct[active.id] ? 'good' : 'warn', input.value === correct[active.id]
      ? `✓ ${active.label} 的表示策略匹配查询特征。`
      : '当前选择会丢失精确词、跨语言语义或代码 token 级关系。');
    render();
  }));
  query(root, '[data-save]').addEventListener('click', () => {
    if (!scenarios.every((scenario) => decisions.get(scenario.id) === correct[scenario.id])) {
      setResult(result, 'warn', '请完成四类 Query 的表示选择，不能用一个 Retriever 覆盖全部场景。');
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'retrievalRepresentationPolicy',
      lessonId: config.lessonId,
      value: { routes: Object.fromEntries(decisions), supports: ['lexical', 'dense', 'sparse', 'multi-vector', 'hybrid'] },
    });
    setResult(result, 'good', '✓ 已建立按查询类型路由的多表示策略。');
    complete(artifact);
  });
  render();
}

export function mountIndexDesignLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const requirements = [
    { id: 'stable-id', label: '稳定 document_id / chunk_id', required: true },
    { id: 'metadata', label: '语言、来源、版本、parent_id metadata', required: true },
    { id: 'prefilter', label: 'ACL / tenant pre-filter', required: true },
    { id: 'normalize', label: 'cosine/dot product 约定与 normalization 一致', required: true },
    { id: 'alias', label: '索引别名支持模型升级切换', required: true },
    { id: 'postfilter', label: '先全库向量召回，再在应用层过滤租户', required: false },
  ];
  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>检索索引设计台</b><small>数据库品牌不是设计；ID、Schema、过滤和迁移契约才是</small></div><button class="v1-primary" data-check type="button">验证索引 Schema</button></div>
      <div class="v1-grid"><section>
        <div class="v1-checklist">${requirements.map((item) => `<label><input type="checkbox" data-requirement="${item.id}"> ${item.label}</label>`).join('')}</div>
        <span class="v1-label">向量相似度</span><select class="v1-select" data-metric><option value="">请选择</option><option value="cosine">cosine + normalized vectors</option><option value="dot">dot product + normalized vectors</option><option value="mismatch">dot product + untracked normalization</option></select>
        <span class="v1-label">近似索引策略</span><select class="v1-select" data-ann><option value="hnsw">HNSW · 低延迟读、内存更高</option><option value="ivf">IVF-like · 训练/分桶、适合不同规模约束</option><option value="flat">Flat · 小数据精确基线</option></select>
        <div class="v1-row"><label>候选扩大系数 <input type="range" min="1" max="8" value="3" data-candidates><b data-candidates-label>3</b></label><label><input type="checkbox" data-quantize> 启用量化并重新评测</label></div>
      </section><aside>
        <pre class="v1-code" data-schema>{}</pre>
        ${renderMetricCards([
          { id: 'memory', label: '相对内存', value: '—' },
          { id: 'recall', label: 'ANN Recall', value: '—' },
          { id: 'leak', label: 'ACL 泄漏风险', value: '—' },
        ])}
        <div class="v1-result" data-result>先建立与具体数据库无关的索引契约。</div>
        ${artifactChips(artifacts, ['retrievalRepresentationPolicy'])}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  query(root, '[data-candidates]').addEventListener('input', (event) => { query(root, '[data-candidates-label]').textContent = event.target.value; });
  query(root, '[data-check]').addEventListener('click', () => {
    const selected = new Set([...root.querySelectorAll('[data-requirement]:checked')].map((item) => item.dataset.requirement));
    const required = requirements.filter((item) => item.required).map((item) => item.id);
    const metric = query(root, '[data-metric]').value;
    const ann = query(root, '[data-ann]').value;
    const candidateFactor = Number(query(root, '[data-candidates]').value);
    const quantized = query(root, '[data-quantize]').checked;
    const ok = required.every((id) => selected.has(id)) && !selected.has('postfilter') && ['cosine', 'dot'].includes(metric) && candidateFactor >= 2;
    const memory = ann === 'flat' ? 1.0 : ann === 'hnsw' ? 1.8 : 1.35;
    const recall = Math.min(0.99, 0.78 + candidateFactor * 0.035 - (quantized ? 0.025 : 0));
    updateMetric(root, 'memory', `${(memory * (quantized ? 0.55 : 1)).toFixed(2)}×`, '量化减少内存但必须重测质量');
    updateMetric(root, 'recall', percent(recall), '候选扩大提高召回并增加延迟');
    updateMetric(root, 'leak', selected.has('postfilter') || !selected.has('prefilter') ? '高' : '低', '权限过滤必须进入检索层');
    query(root, '[data-schema]').textContent = JSON.stringify({
      document_id: 'stable', chunk_id: 'stable', parent_id: 'optional', vector_metric: metric || 'unset', ann, candidate_factor: candidateFactor,
      metadata: ['tenant_id', 'acl', 'language', 'source', 'version'], alias: selected.has('alias'), quantized,
    }, null, 2);
    if (!ok) {
      setResult(result, 'warn', '索引契约仍存在身份、过滤、相似度或候选召回风险。');
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'searchIndexSchema',
      lessonId: config.lessonId,
      value: { metric, ann, candidateFactor, quantized, requirements: required, prefilter: true, aliases: true },
    });
    setResult(result, 'good', '✓ 已完成框架与数据库无关的索引 Schema、ACL 与迁移契约。');
    complete(artifact);
  });
}

export const ragRepresentationSimulators = {
  'rag-advanced-chunking': mountAdvancedChunkingLab,
  'rag-embedding-benchmark': mountEmbeddingBenchmarkLab,
  'rag-representation-policy': mountRepresentationPolicyLab,
  'rag-index-design': mountIndexDesignLab,
};
