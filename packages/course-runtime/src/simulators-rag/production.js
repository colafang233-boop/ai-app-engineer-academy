import {
  artifactChips,
  bindScenarioTabs,
  ensureTeachingDataNotice,
  once,
  percent,
  query,
  renderMetricCards,
  renderScenarioTabs,
  saveArtifact,
  setResult,
  updateMetric,
} from '../components/simulator-kit.js';
import { corpusDocuments, ragScenarios } from './data.js';

export function mountSpecialCorpusLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { id: 'table', label: '复杂表格', correct: { parse: 'cells', chunk: 'table-aware', representation: 'text+schema', retrieval: 'hybrid', citation: 'cell-range' } },
    { id: 'code', label: '代码库', correct: { parse: 'ast', chunk: 'symbol', representation: 'code+lexical', retrieval: 'code-hybrid', citation: 'file-lines' } },
    { id: 'scan', label: '扫描 PDF', correct: { parse: 'ocr-layout', chunk: 'layout-aware', representation: 'text+image', retrieval: 'hybrid', citation: 'page-region' } },
    { id: 'visual', label: '图文报告', correct: { parse: 'vision-page', chunk: 'page-region', representation: 'multi-vector-vision', retrieval: 'visual', citation: 'page-region' } },
    { id: 'mixed', label: '中英混合制度', correct: { parse: 'bilingual', chunk: 'structure', representation: 'multilingual', retrieval: 'hybrid', citation: 'section' } },
  ];
  const options = {
    parse: [['plain', '纯文本抽取'], ['cells', '表格单元格+表头'], ['ast', 'AST/符号'], ['ocr-layout', 'OCR+布局'], ['vision-page', '页面视觉编码'], ['bilingual', '双语结构解析']],
    chunk: [['fixed', '固定长度'], ['table-aware', '表格结构'], ['symbol', '符号/函数'], ['layout-aware', '布局块'], ['page-region', '页面区域'], ['structure', '标题/章节']],
    representation: [['dense', '普通 dense'], ['text+schema', '文本+Schema'], ['code+lexical', '代码向量+符号词项'], ['text+image', '文本+图像'], ['multi-vector-vision', '视觉多向量'], ['multilingual', '多语言向量']],
    retrieval: [['dense', 'Dense'], ['hybrid', 'Hybrid'], ['code-hybrid', 'Code hybrid'], ['visual', '视觉 late interaction']],
    citation: [['chunk', 'Chunk'], ['cell-range', '表格单元格范围'], ['file-lines', '文件+行号'], ['page-region', '页码+区域'], ['section', '章节']],
  };
  let active = scenarios[0];
  const decisions = new Map();

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>特殊语料分诊台</b><small>表格、代码、图片和扫描件不能一律拍平成普通文本</small></div><button class="v1-primary" data-save type="button">保存五类专项策略</button></div>
      ${renderScenarioTabs(scenarios, active.id)}
      <div class="v1-grid"><section>
        <div class="rag-profile-grid">${Object.entries(options).map(([key, values]) => `<label><span>${({ parse: '解析', chunk: '切分', representation: '表示', retrieval: '检索', citation: '引用单位' })[key]}</span><select class="v1-select" data-field="${key}"><option value="">请选择</option>${values.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>`).join('')}</div>
        <div class="rag-corpus-preview" data-preview></div>
      </section><aside>
        <div class="rag-pipeline-gates"><article data-gate="parse"><span>01</span><b>Parse</b><small>等待</small></article><article data-gate="chunk"><span>02</span><b>Chunk</b><small>等待</small></article><article data-gate="retrieve"><span>03</span><b>Retrieve</b><small>等待</small></article><article data-gate="cite"><span>04</span><b>Cite</b><small>等待</small></article></div>
        <div class="v1-result" data-result>每一种语料都需要一条独立的结构保真链路。</div>
        ${artifactChips(artifacts, ['rerankingBenchmarkReport'])}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function current() { return Object.fromEntries([...root.querySelectorAll('[data-field]')].map((select) => [select.dataset.field, select.value])); }
  function render() {
    const saved = decisions.get(active.id) ?? {};
    root.querySelectorAll('[data-field]').forEach((select) => { select.value = saved[select.dataset.field] ?? ''; });
    const value = current();
    const preview = {
      table: '<table><tr><th>Week</th><th>Penalty</th></tr><tr><td>1–20</td><td>0.5%</td></tr></table>',
      code: '<pre>beforeModel(ctx) → runtime.context.tenant_id\nlookup_refund(order_id, runtime)</pre>',
      scan: '<div class="rag-scan-page">OCR: “1O% cap” <mark>低置信度 O/0</mark><span>page 18</span></div>',
      visual: '<div class="rag-visual-page"><b>Revenue chart</b><i>图例、布局与文本共同表达信息</i></div>',
      mixed: '<article><b>Remote Work / 远程办公</b><p>Allowance begins after probation / 补贴在转正后生效</p></article>',
    }[active.id];
    query(root, '[data-preview]').innerHTML = preview;
    const correct = Object.entries(active.correct).filter(([key, expected]) => value[key] === expected);
    const gates = {
      parse: value.parse === active.correct.parse,
      chunk: value.chunk === active.correct.chunk,
      retrieve: value.representation === active.correct.representation && value.retrieval === active.correct.retrieval,
      cite: value.citation === active.correct.citation,
    };
    Object.entries(gates).forEach(([id, ok]) => {
      const gate = query(root, `[data-gate="${id}"]`);
      gate.className = ok ? 'pass' : '';
      gate.querySelector('small').textContent = ok ? '匹配' : '等待';
    });
    setResult(result, correct.length === 5 ? 'good' : 'warn', `当前匹配 ${correct.length}/5。错误的解析单位会一路传导到引用。`);
  }
  bindScenarioTabs(root, scenarios, active.id, (scenario) => { decisions.set(active.id, current()); active = scenario; render(); });
  root.querySelectorAll('[data-field]').forEach((select) => select.addEventListener('change', () => { decisions.set(active.id, current()); render(); }));
  query(root, '[data-save]').addEventListener('click', () => {
    decisions.set(active.id, current());
    const passed = scenarios.every((scenario) => Object.entries(scenario.correct).every(([key, expected]) => decisions.get(scenario.id)?.[key] === expected));
    if (!passed) {
      setResult(result, 'warn', '请完成全部五类语料。不能把页面视觉、表格 Schema 或代码符号丢掉。');
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'specialCorpusRetrievalPolicy',
      lessonId: config.lessonId,
      value: { scenarios: Object.fromEntries(decisions), preserveNativeStructure: true },
    });
    setResult(result, 'good', '✓ 已形成表格、代码、扫描件、视觉页面和混合语言的专项检索策略。');
    complete(artifact);
  });
  render();
}

export function mountEvidenceAssemblyLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { id: 'support', label: '技术支持', budget: 220, required: ['d-nvml', 'd-driver-clean'], minimumSources: 2 },
    { id: 'legal', label: '法律合同', budget: 260, required: ['d-liquidated-damages', 'd-definition-delay'], minimumSources: 2 },
  ];
  const tokenCost = { 'd-nvml': 86, 'd-driver-clean': 94, 'd-omen-audio': 72, 'd-liquidated-damages': 98, 'd-definition-delay': 90, 'd-general-cap': 105 };
  const candidates = corpusDocuments.filter((item) => tokenCost[item.id]);
  let active = scenarios[0];
  let selected = new Set();
  let parentExpansion = false;
  let dedupe = false;
  let diverse = false;
  let citations = false;
  let abstain = false;
  const passed = new Map();

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>Evidence Assembly 工作台</b><small>召回正确不等于最终上下文正确；还要去重、扩展、预算和引用</small></div><button class="v1-primary" data-save type="button">组装并验证 Evidence</button></div>
      ${renderScenarioTabs(scenarios, active.id)}
      <div class="v1-grid"><section>
        <div class="rag-candidate-pool" data-pool></div>
        <div class="v1-checklist"><label><input type="checkbox" data-option="parent"> Parent expansion</label><label><input type="checkbox" data-option="dedupe"> 去重近似 Chunk</label><label><input type="checkbox" data-option="diverse"> 来源多样性</label><label><input type="checkbox" data-option="citations"> 保留精确 citation span</label><label><input type="checkbox" data-option="abstain"> 证据不足时拒答</label></div>
      </section><aside>
        <div class="context-window rag-evidence-window"><div class="window-head"><b>最终 Evidence</b><span data-budget></span></div><div data-evidence></div></div>
        ${renderMetricCards([
          { id: 'coverage', label: 'Evidence Coverage', value: '—' },
          { id: 'tokens', label: 'Token Budget', value: '—' },
          { id: 'citation', label: 'Citation Coverage', value: '—' },
          { id: 'pollution', label: 'Context Pollution', value: '—' },
        ])}
        <div class="v1-result" data-result>手动选择候选，观察“多塞几条”如何挤掉真正证据。</div>
        ${artifactChips(artifacts, ['specialCorpusRetrievalPolicy'])}
        ${ensureTeachingDataNotice()}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function available() {
    return active.id === 'support'
      ? candidates.filter((item) => ['d-nvml', 'd-driver-clean', 'd-omen-audio'].includes(item.id))
      : candidates.filter((item) => ['d-liquidated-damages', 'd-definition-delay', 'd-general-cap'].includes(item.id));
  }
  function renderPool() {
    query(root, '[data-pool]').innerHTML = available().map((item) => `<button type="button" class="message-card ${selected.has(item.id) ? 'selected' : ''}" data-candidate="${item.id}"><span>${item.source}</span><b>${item.title}</b><small>${tokenCost[item.id]} tokens</small></button>`).join('');
    root.querySelectorAll('[data-candidate]').forEach((button) => button.addEventListener('click', () => {
      selected.has(button.dataset.candidate) ? selected.delete(button.dataset.candidate) : selected.add(button.dataset.candidate);
      render();
    }));
  }
  function state() {
    const picked = available().filter((item) => selected.has(item.id));
    const used = picked.reduce((sum, item) => sum + tokenCost[item.id], 0) + (parentExpansion ? 35 : 0);
    const found = active.required.filter((id) => selected.has(id)).length;
    const pollution = picked.filter((item) => !active.required.includes(item.id)).length;
    const coverage = found / active.required.length;
    const citationCoverage = citations ? coverage : 0;
    return { picked, used, found, pollution, coverage, citationCoverage };
  }
  function render() {
    renderPool();
    const value = state();
    query(root, '[data-budget]').textContent = `${value.used} / ${active.budget} tokens`;
    query(root, '[data-evidence]').innerHTML = value.picked.length
      ? value.picked.map((item) => `<article class="window-item ${active.required.includes(item.id) ? '' : 'evicted'}"><span>${item.source}</span><b>${item.title}</b><small>${tokenCost[item.id]} tokens${citations ? ' · citation ready' : ''}</small></article>`).join('')
      : '<article class="window-item evicted"><b>尚未选择证据</b></article>';
    updateMetric(root, 'coverage', percent(value.coverage), '答案所需事实是否完整');
    updateMetric(root, 'tokens', `${value.used}/${active.budget}`, value.used <= active.budget ? '预算内' : '超出预算');
    updateMetric(root, 'citation', percent(value.citationCoverage), '回答句子能否追溯到证据');
    updateMetric(root, 'pollution', value.pollution, '无关证据会干扰生成');
    const ready = value.coverage === 1 && value.used <= active.budget && value.pollution === 0 && parentExpansion && dedupe && diverse && citations && abstain;
    setResult(result, ready ? 'good' : 'warn', ready
      ? 'Evidence 完整、预算内、无污染，并具备引用与拒答出口。'
      : '继续调整：相关候选、预算、去重、扩展、引用和拒答是独立控制轴。');
  }
  bindScenarioTabs(root, scenarios, active.id, (scenario) => { active = scenario; selected = new Set(); render(); });
  root.querySelectorAll('[data-option]').forEach((input) => input.addEventListener('change', () => {
    ({ parent: (v) => { parentExpansion = v; }, dedupe: (v) => { dedupe = v; }, diverse: (v) => { diverse = v; }, citations: (v) => { citations = v; }, abstain: (v) => { abstain = v; } })[input.dataset.option](input.checked);
    render();
  }));
  query(root, '[data-save]').addEventListener('click', () => {
    const value = state();
    const ready = value.coverage === 1 && value.used <= active.budget && value.pollution === 0 && parentExpansion && dedupe && diverse && citations && abstain;
    if (!ready) {
      setResult(result, 'warn', '当前 Evidence 仍不满足完整、预算、纯度、引用或拒答要求。');
      return;
    }
    passed.set(active.id, { selected: [...selected], budget: active.budget, ...value, parentExpansion, dedupe, diverse, citations, abstain });
    if (passed.size < scenarios.length) {
      setResult(result, 'good', `✓ ${active.label} Evidence 已保存。切换另一个风险场景。`);
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'evidenceAndCitationContract',
      lessonId: config.lessonId,
      value: { scenarios: Object.fromEntries(passed), answerOnlyFromEvidence: true, abstainOnInsufficientEvidence: true },
    });
    setResult(result, 'good', '✓ 已建立 Evidence Assembly、引用定位、预算和拒答契约。');
    complete(artifact);
  });
  render();
}

export function mountRagReleaseGateLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const slices = [
    { id: 'zh', label: '中文', retrieval: 0.91, groundedness: 0.94, correctness: 0.90, citation: 0.93, leak: 0, p95: 1480, cost: 0.72, freshness: 8 },
    { id: 'cross', label: '跨语言', retrieval: 0.78, groundedness: 0.89, correctness: 0.82, citation: 0.87, leak: 0, p95: 2210, cost: 0.95, freshness: 8 },
    { id: 'acl', label: '权限边界', retrieval: 0.88, groundedness: 0.91, correctness: 0.88, citation: 0.90, leak: 2, p95: 1720, cost: 0.76, freshness: 8 },
    { id: 'fresh', label: '高频更新', retrieval: 0.86, groundedness: 0.90, correctness: 0.87, citation: 0.89, leak: 0, p95: 1690, cost: 0.79, freshness: 47 },
  ];
  let active = slices[0];
  let fixes = { cross: false, acl: false, fresh: false };
  let decision = '';

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>RAG 生产发布门禁</b><small>检索、生成、引用、安全、新鲜度、延迟和成本必须分别通过</small></div><button class="v1-primary" data-release type="button">提交发布决策</button></div>
      ${renderScenarioTabs(slices, active.id)}
      <div class="v1-grid"><section>
        ${renderMetricCards([
          { id: 'retrieval', label: 'Retrieval relevance', value: '—' },
          { id: 'grounded', label: 'Groundedness', value: '—' },
          { id: 'correct', label: 'Answer correctness', value: '—' },
          { id: 'citation', label: 'Citation accuracy', value: '—' },
          { id: 'leak', label: 'ACL leakage', value: '—' },
          { id: 'latency', label: 'P95 latency', value: '—' },
          { id: 'freshness', label: 'Freshness lag', value: '—' },
          { id: 'cost', label: 'Relative cost', value: '—' },
        ])}
        <div class="v1-checklist">
          <label><input type="checkbox" data-fix="cross"> 为跨语言切片启用经验证的 multilingual route</label>
          <label><input type="checkbox" data-fix="acl"> 把 ACL 改为检索前 pre-filter 并重跑泄漏集</label>
          <label><input type="checkbox" data-fix="fresh"> 将增量索引新鲜度 SLA 降到 15 分钟</label>
          <label><input type="checkbox" data-check="rollback"> 准备索引、模型和 Prompt 回滚</label>
          <label><input type="checkbox" data-check="monitor"> 上线监控按语言、Query、权限和版本切片</label>
        </div>
      </section><aside>
        <span class="v1-label">发布决策</span><div class="v1-card-list"><label class="v1-card"><input type="radio" name="release" value="release"> <b>直接全量发布</b></label><label class="v1-card"><input type="radio" name="release" value="gray"> <b>灰度发布</b></label><label class="v1-card"><input type="radio" name="release" value="rollback"> <b>回滚</b></label><label class="v1-card"><input type="radio" name="release" value="experiment"> <b>继续实验</b></label></div>
        <div class="rag-release-summary" data-summary></div>
        <div class="v1-result" data-result>默认有跨语言退化、ACL 泄漏和索引陈旧，禁止直接发布。</div>
        ${artifactChips(artifacts, ['evidenceAndCitationContract'])}
        ${ensureTeachingDataNotice()}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function adjusted(slice) {
    return {
      ...slice,
      retrieval: slice.id === 'cross' && fixes.cross ? 0.88 : slice.retrieval,
      correctness: slice.id === 'cross' && fixes.cross ? 0.89 : slice.correctness,
      leak: slice.id === 'acl' && fixes.acl ? 0 : slice.leak,
      freshness: slice.id === 'fresh' && fixes.fresh ? 12 : slice.freshness,
    };
  }
  function pass(slice) {
    return slice.retrieval >= 0.85 && slice.groundedness >= 0.88 && slice.correctness >= 0.86 && slice.citation >= 0.87 && slice.leak === 0 && slice.p95 <= 2500 && slice.freshness <= 15 && slice.cost <= 1.1;
  }
  function render() {
    const value = adjusted(active);
    updateMetric(root, 'retrieval', percent(value.retrieval), '目标 ≥ 85%');
    updateMetric(root, 'grounded', percent(value.groundedness), '回答是否受证据支持');
    updateMetric(root, 'correct', percent(value.correctness), '业务正确性');
    updateMetric(root, 'citation', percent(value.citation), '引用是否精确');
    updateMetric(root, 'leak', value.leak, '必须为 0');
    updateMetric(root, 'latency', `${value.p95}ms`, '目标 ≤ 2500ms');
    updateMetric(root, 'freshness', `${value.freshness}min`, '目标 ≤ 15min');
    updateMetric(root, 'cost', `${value.cost.toFixed(2)}×`, '预算 ≤ 1.10×');
    const all = slices.map(adjusted);
    const passed = all.filter(pass).length;
    query(root, '[data-summary]').innerHTML = `<b>${passed}/${slices.length} 切片通过</b><p>${all.filter((slice) => !pass(slice)).map((slice) => slice.label).join('、') || '所有关键切片已通过门禁。'}</p>`;
    setResult(result, passed === slices.length ? 'good' : 'warn', passed === slices.length ? '所有切片已通过，可以进入灰度发布。' : '存在关键切片失败，禁止用总平均掩盖问题。');
  }
  bindScenarioTabs(root, slices, active.id, (slice) => { active = slice; render(); });
  root.querySelectorAll('[data-fix]').forEach((input) => input.addEventListener('change', () => { fixes[input.dataset.fix] = input.checked; render(); }));
  root.querySelectorAll('input[name="release"]').forEach((input) => input.addEventListener('change', () => { decision = input.value; render(); }));
  query(root, '[data-release]').addEventListener('click', () => {
    const allPassed = slices.map(adjusted).every(pass);
    const rollback = query(root, '[data-check="rollback"]').checked;
    const monitor = query(root, '[data-check="monitor"]').checked;
    if (!allPassed || decision !== 'gray' || !rollback || !monitor) {
      setResult(result, 'warn', '只有关键切片全部通过，并准备回滚与分层监控后，才允许先灰度发布。');
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'ragProductionReleaseGate',
      lessonId: config.lessonId,
      value: { decision: 'gray', slices: Object.fromEntries(slices.map((slice) => [slice.id, adjusted(slice)])), rollback, monitor, gates: ['retrieval', 'groundedness', 'correctness', 'citation', 'acl', 'latency', 'cost', 'freshness'] },
    });
    setResult(result, 'good', '✓ RAG 系统已通过分层质量门禁，采用灰度发布并保留回滚与切片监控。');
    complete(artifact);
  });
  render();
}

export const ragProductionSimulators = {
  'rag-special-corpus': mountSpecialCorpusLab,
  'rag-evidence-assembly': mountEvidenceAssemblyLab,
  'rag-release-gate': mountRagReleaseGateLab,
};
