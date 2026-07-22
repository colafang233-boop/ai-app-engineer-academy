import {
  artifactChips,
  bindScenarioTabs,
  ensureTeachingDataNotice,
  escapeHtml,
  once,
  percent,
  query,
  recallAtK,
  renderMetricCards,
  renderScenarioTabs,
  saveArtifact,
  setResult,
  updateMetric,
} from '../components/simulator-kit.js';
import { mountChunkBoundaryEditor } from '../components/rag/chunk-boundary-editor.js';
import { chunkBlocks, corpusDocuments, ragScenarios } from './data.js';

export function mountKnowledgeAccessDecisionLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    ...ragScenarios.slice(0, 3),
    { id: 'small', label: '小型稳定知识库', query: '20 页产品说明书，日均 30 次问答，要求引用。', correct: 'long-context' },
    { id: 'sql', label: '实时订单余额', query: '订单 ORD-2026-881 当前应付余额是多少？', correct: 'sql-api' },
  ].map((scenario) => ({
    ...scenario,
    correct: scenario.correct ?? ({ support: 'hybrid-rag', policy: 'rag', legal: 'rag-review' }[scenario.id]),
  }));
  const decisions = new Map();
  let active = scenarios[0];

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>知识访问方案诊断急诊室</b><small>不是所有外部知识问题都应该先上向量数据库</small></div><button class="v1-primary" data-save type="button">保存五个场景决策</button></div>
      ${renderScenarioTabs(scenarios, active.id)}
      <div class="v1-grid"><section>
        <span class="v1-label">业务问题</span><article class="v1-card"><b data-query></b><small data-profile></small></article>
        <span class="v1-label">选择知识访问方式</span>
        <div class="v1-card-list" data-options>
          ${[
            ['long-context', '直接长上下文', '小语料、低频、可缓存时可能最简单'],
            ['search', '普通关键词搜索', '只需要返回文档，不生成答案'],
            ['sql-api', 'SQL / 业务 API', '结构化实时事实应该直接查询权威系统'],
            ['rag', '检索增强生成', '从非结构化知识中检索证据并生成回答'],
            ['hybrid-rag', 'Hybrid RAG', '精确标识符与语义问题并存'],
            ['rag-review', '高召回 RAG + 人工复核', '高风险场景需要证据和审批'],
          ].map(([value, label, note]) => `<label class="v1-card"><input type="radio" name="access-mode" value="${value}"> <b>${label}</b><small>${note}</small></label>`).join('')}
        </div>
      </section><aside>
        ${renderMetricCards([
          { id: 'complexity', label: '系统复杂度', value: '—', note: '组件与运维负担' },
          { id: 'freshness', label: '数据新鲜度', value: '—', note: '权威源更新时间' },
          { id: 'risk', label: '错误代价', value: '—', note: '错答与漏答的影响' },
        ])}
        <div class="v1-result" data-result>先完成所有场景。系统会让你看到“技术越多”并不等于“方案越好”。</div>
        ${ensureTeachingDataNotice()}
      </aside></div>
    </div>`;

  const result = query(root, '[data-result]');
  function render() {
    query(root, '[data-query]').textContent = active.query;
    query(root, '[data-profile]').textContent = active.id === 'small'
      ? '20 页 · 低频 · 稳定 · 需要引用'
      : active.id === 'sql'
        ? '实时结构化事实 · 必须精确'
        : `${active.language ?? ''} · ${active.queryType ?? ''} · SLA ${active.sla ?? '—'}ms`;
    root.querySelectorAll('input[name="access-mode"]').forEach((input) => {
      input.checked = decisions.get(active.id) === input.value;
    });
    const complexity = { 'long-context': 1, search: 1, 'sql-api': 2, rag: 3, 'hybrid-rag': 4, 'rag-review': 5 }[decisions.get(active.id)] ?? 0;
    updateMetric(root, 'complexity', complexity ? `${complexity}/5` : '—', complexity <= 2 ? '优先简单方案' : '需要持续评估和运维');
    updateMetric(root, 'freshness', active.id === 'sql' ? '实时' : active.id === 'small' ? '稳定' : '版本化', '不同权威源需要不同更新链路');
    updateMetric(root, 'risk', active.risk ?? (active.id === 'sql' ? '高' : '低'), '高风险场景不能只看平均准确率');
  }
  bindScenarioTabs(root, scenarios, active.id, (scenario) => { active = scenario; render(); });
  root.querySelectorAll('input[name="access-mode"]').forEach((input) => input.addEventListener('change', () => {
    decisions.set(active.id, input.value);
    const correct = input.value === active.correct;
    setResult(result, correct ? 'good' : 'warn', correct
      ? `✓ ${active.label} 的方案与知识形态匹配。继续切换场景。`
      : '当前方案忽略了知识是否结构化、语料规模、风险或实时性。');
    render();
  }));
  query(root, '[data-save]').addEventListener('click', () => {
    const passed = scenarios.every((scenario) => decisions.get(scenario.id) === scenario.correct);
    if (!passed) {
      setResult(result, 'warn', `已完成 ${decisions.size}/${scenarios.length} 个场景，仍有方案不匹配。`);
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'knowledgeAccessDecision',
      lessonId: config.lessonId,
      value: { decisions: Object.fromEntries(decisions), principle: 'problem-first-not-vector-first' },
    });
    setResult(result, 'good', '✓ 已形成知识访问决策：长上下文、搜索、SQL/API 与 RAG 各有边界。');
    complete(artifact);
  });
  render();
}

export function mountRetrievalProblemProfileLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = ragScenarios;
  let active = scenarios[0];
  const profiles = new Map();
  const dimensions = [
    ['language', '语言', ['中文', '英文', '跨语言', '中英混输']],
    ['query', '查询类型', ['精确标识符', '实体定位', '概念语义', '对比汇总', '多跳']],
    ['corpus', '语料形态', ['FAQ/手册', '制度/合同', '代码', '表格/图片']],
    ['risk', '失败代价', ['更怕漏答', '更怕错答', '两者都高']],
    ['acl', '权限', ['公共', '租户级', '部门/用户级']],
    ['sla', 'SLA', ['<500ms', '0.5–2s', '>2s']],
  ];

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>Corpus × Query 画像台</b><small>技术选型前先把检索问题描述完整</small></div><button class="v1-primary" data-save type="button">生成检索需求画像</button></div>
      ${renderScenarioTabs(scenarios, active.id)}
      <div class="v1-grid"><section>
        <article class="v1-card"><b data-query></b><small>为当前场景选择六个关键维度</small></article>
        <div class="rag-profile-grid">${dimensions.map(([id, label, options]) => `<label><span>${label}</span><select class="v1-select" data-dimension="${id}"><option value="">请选择</option>${options.map((option) => `<option>${option}</option>`).join('')}</select></label>`).join('')}</div>
      </section><aside>
        <div class="rag-profile-radar" data-radar></div>
        <div class="v1-result" data-result>缺少画像时，“选哪个模型”是无法回答的问题。</div>
        ${artifactChips(artifacts, ['knowledgeAccessDecision'])}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function currentValues() {
    return Object.fromEntries([...root.querySelectorAll('[data-dimension]')].map((select) => [select.dataset.dimension, select.value]));
  }
  function render() {
    query(root, '[data-query]').textContent = active.query;
    const saved = profiles.get(active.id) ?? {};
    root.querySelectorAll('[data-dimension]').forEach((select) => { select.value = saved[select.dataset.dimension] ?? ''; });
    const values = currentValues();
    const filled = Object.values(values).filter(Boolean).length;
    query(root, '[data-radar]').innerHTML = dimensions.map(([id, label]) => `<article class="${values[id] ? 'ready' : ''}"><span>${label}</span><b>${escapeHtml(values[id] || '未定义')}</b></article>`).join('');
    setResult(result, filled === dimensions.length ? 'good' : 'warn', `当前画像完整度 ${filled}/${dimensions.length}。${filled === dimensions.length ? '可以进入评测集设计。' : '缺失维度会让后续参数比较失真。'}`);
  }
  bindScenarioTabs(root, scenarios, active.id, (scenario) => {
    profiles.set(active.id, currentValues());
    active = scenario;
    render();
  });
  root.querySelectorAll('[data-dimension]').forEach((select) => select.addEventListener('change', () => {
    profiles.set(active.id, currentValues());
    render();
  }));
  query(root, '[data-save]').addEventListener('click', () => {
    profiles.set(active.id, currentValues());
    const completeProfiles = [...profiles.values()].filter((profile) => Object.values(profile).filter(Boolean).length === dimensions.length);
    if (completeProfiles.length < 2) {
      setResult(result, 'warn', '至少完成两个不同场景，才能看见检索方案为什么不能全局统一。');
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'retrievalProblemProfile',
      lessonId: config.lessonId,
      value: { scenarios: Object.fromEntries(profiles), dimensions: dimensions.map(([id]) => id) },
    });
    setResult(result, 'good', '✓ 已保存多场景检索画像，后续所有实验都必须按语言、查询和风险切片评估。');
    complete(artifact);
  });
  render();
}

export function mountGoldenDatasetLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const cases = [
    { id: 'q1', query: 'NVML mismatch', document: 'd-nvml', answer: 'fully' },
    { id: 'q2', query: 'remote work allowance during probation', document: 'd-probation', answer: 'partially' },
    { id: 'q3', query: '违约金上限', document: 'd-general-cap', answer: 'hard-negative' },
    { id: 'q4', query: '公司是否报销宠物保险？', document: null, answer: 'no-answer' },
    { id: 'q5', query: '查看其他租户的退款记录', document: 'd-refund-tool', answer: 'permission-denied' },
  ];
  const labels = [
    ['fully', '完全相关'], ['partially', '部分相关'], ['hard-negative', '难负例'], ['no-answer', '无答案'], ['permission-denied', '无权限'],
  ];

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>Golden Set 标注工作台</b><small>评测集必须包含难例、无答案和权限样例</small></div><button class="v1-primary" data-run type="button">计算检索指标</button></div>
      <div class="v1-table-wrap"><table class="v1-table"><thead><tr><th>Query</th><th>候选证据</th><th>相关性标签</th><th>状态</th></tr></thead><tbody>
        ${cases.map((item, index) => `<tr data-row="${index}"><td><b>${item.query}</b></td><td>${item.document ?? '语料中不存在答案'}</td><td><select class="v1-select" data-label="${index}"><option value="">请选择</option>${labels.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-state="${index}">等待</td></tr>`).join('')}
      </tbody></table></div>
      <div class="v1-grid"><section>
        <label class="v1-label">评测切片</label><div class="v1-checklist"><label><input type="checkbox" data-slice="language"> 按语言</label><label><input type="checkbox" data-slice="query"> 按查询类型</label><label><input type="checkbox" data-slice="acl"> 按权限</label><label><input type="checkbox" data-slice="no-answer"> 无答案单独统计</label></div>
      </section><aside>
        ${renderMetricCards([
          { id: 'recall', label: 'Recall@3', value: '—' },
          { id: 'mrr', label: 'MRR', value: '—' },
          { id: 'coverage', label: '切片覆盖', value: '0/4' },
        ])}
        <div class="v1-result" data-result>先完成五种标注，再配置切片。</div>
        ${artifactChips(artifacts, ['retrievalProblemProfile'])}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  query(root, '[data-run]').addEventListener('click', () => {
    let correct = 0;
    cases.forEach((item, index) => {
      const selected = query(root, `[data-label="${index}"]`).value;
      const ok = selected === item.answer;
      query(root, `[data-row="${index}"]`).className = ok ? 'pass' : 'fail';
      query(root, `[data-state="${index}"]`).textContent = ok ? '✓' : '重新判断';
      if (ok) correct += 1;
    });
    const slices = [...root.querySelectorAll('[data-slice]:checked')].map((item) => item.dataset.slice);
    updateMetric(root, 'recall', correct === cases.length ? '83%' : '—', '教学基线候选结果');
    updateMetric(root, 'mrr', correct === cases.length ? '0.78' : '—', '第一个相关结果的位置');
    updateMetric(root, 'coverage', `${slices.length}/4`, '不能只看总平均');
    if (correct !== cases.length || slices.length !== 4) {
      setResult(result, 'warn', `相关性标注 ${correct}/${cases.length}；评测切片 ${slices.length}/4。`);
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'retrievalEvaluationDataset',
      lessonId: config.lessonId,
      value: { cases, slices, metrics: ['recall@k', 'precision@k', 'mrr', 'ndcg', 'acl_leakage'] },
    });
    setResult(result, 'good', '✓ Golden Set 已覆盖相关、难负例、无答案和越权场景。');
    complete(artifact);
  });
}

export function mountDocumentIngestionLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const checks = [
    { id: 'structure', label: '保留标题、段落、表格和代码结构', required: true },
    { id: 'source', label: '保留 source、page、section 与 version', required: true },
    { id: 'acl', label: 'ACL metadata 在索引前写入', required: true },
    { id: 'ocr', label: 'OCR 置信度低时进入人工质检', required: true },
    { id: 'stable', label: '生成稳定 document_id 与 checksum', required: true },
    { id: 'flatten', label: '把表格全部拍平成无结构文本', required: false },
  ];
  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>文档解析质检站</b><small>解析丢失的结构，后续 Embedding 无法凭空恢复</small></div><button class="v1-primary" data-check type="button">执行入库质检</button></div>
      <div class="rag-document-compare"><section><span>原始页面</span><article><h4>12.4 Delay Damages</h4><p>For Delay, damages accrue weekly.</p><table><tr><th>Week</th><th>Rate</th></tr><tr><td>1–20</td><td>0.5%</td></tr></table><small>Confidential · Legal only · page 18</small></article></section><section><span>解析输出</span><pre data-parsed>Title: 12.4 Delay Damages\nText: For Delay...\nTable: [missing]\nACL: [missing]\nPage: [missing]</pre></section></div>
      <div class="v1-grid"><section><div class="v1-checklist">${checks.map((item) => `<label><input type="checkbox" data-check-id="${item.id}"> ${item.label}</label>`).join('')}</div></section><aside>
        <div class="rag-pipeline-gates"><article data-gate="parse"><span>01</span><b>Parse</b><small>等待</small></article><article data-gate="metadata"><span>02</span><b>Metadata</b><small>等待</small></article><article data-gate="security"><span>03</span><b>ACL</b><small>等待</small></article><article data-gate="identity"><span>04</span><b>Identity</b><small>等待</small></article></div>
        <div class="v1-result" data-result>选择哪些质量要求必须在切分和索引前完成。</div>
        ${artifactChips(artifacts, ['retrievalEvaluationDataset'])}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  query(root, '[data-check]').addEventListener('click', () => {
    const selected = new Set([...root.querySelectorAll('[data-check-id]:checked')].map((item) => item.dataset.checkId));
    const required = checks.filter((item) => item.required).map((item) => item.id);
    const ok = required.every((id) => selected.has(id)) && !selected.has('flatten');
    const gates = {
      parse: selected.has('structure'),
      metadata: selected.has('source') && selected.has('ocr'),
      security: selected.has('acl'),
      identity: selected.has('stable'),
    };
    Object.entries(gates).forEach(([id, passed]) => {
      const gate = query(root, `[data-gate="${id}"]`);
      gate.className = passed ? 'pass' : 'fail';
      gate.querySelector('small').textContent = passed ? '通过' : '缺失';
    });
    query(root, '[data-parsed]').textContent = ok
      ? 'Title: 12.4 Delay Damages\nSection path: Supply Agreement > Remedies\nTable rows: preserved\nACL: legal\nPage: 18\nVersion: 9\nChecksum: 7bb...'
      : '解析契约仍会丢失结构、来源或权限。';
    if (!ok) {
      setResult(result, 'warn', '解析契约不完整。尤其不能把 ACL 和稳定 ID 推迟到检索之后。');
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'documentIngestionContract',
      lessonId: config.lessonId,
      value: { required, gates, stableIds: true, aclBeforeIndex: true, ocrQualityGate: true },
    });
    setResult(result, 'good', '✓ 文档结构、来源、版本、ACL 与稳定身份已经进入统一入库契约。');
    complete(artifact);
  });
}

export function mountBaselineChunkingLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { id: 'contract', label: '法律合同', blocks: chunkBlocks.contract, targetBreaks: [0, 2], relevant: ['definition', 'rule'] },
    { id: 'support', label: '技术手册', blocks: chunkBlocks.support, targetBreaks: [1], relevant: ['heading', 'paragraph', 'code', 'procedure'] },
  ];
  let active = scenarios[0];
  const completed = new Set();
  let editor;
  let overlap = 0;
  let latest = null;

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>Chunk 边界显微镜</b><small>手动移动边界，观察召回、引用完整度与索引膨胀</small></div><button class="v1-primary" data-save type="button">保存当前 Chunk 策略</button></div>
      ${renderScenarioTabs(scenarios, active.id)}
      <div class="v1-grid"><section>
        <label class="v1-label">Overlap <b data-overlap-label>0</b> blocks</label><input type="range" min="0" max="2" value="0" data-overlap>
        <div data-editor></div>
      </section><aside>
        ${renderMetricCards([
          { id: 'chunks', label: 'Chunk 数量', value: '—' },
          { id: 'recall', label: 'Recall@3', value: '—' },
          { id: 'citation', label: '引用完整度', value: '—' },
          { id: 'inflation', label: '索引膨胀', value: '—' },
        ])}
        <div class="v1-result" data-result>点击段落之间的横线切换 Chunk 边界。</div>
        ${artifactChips(artifacts, ['documentIngestionContract'])}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function evaluate(state) {
    latest = state;
    const breaks = state.breaks;
    const exact = breaks.length === active.targetBreaks.length && breaks.every((value, index) => value === active.targetBreaks[index]);
    const chunkCount = state.chunks.length;
    const recall = exact ? 1 : Math.max(0.5, 1 - Math.abs(chunkCount - (active.targetBreaks.length + 1)) * 0.2);
    const citation = exact ? 0.94 : breaks.includes(0) ? 0.72 : 0.56;
    const inflation = 1 + overlap * 0.28 + (chunkCount - 1) * 0.08;
    updateMetric(root, 'chunks', chunkCount, '边界越多，索引单元越多');
    updateMetric(root, 'recall', percent(recall), '相关证据能否进入候选集');
    updateMetric(root, 'citation', percent(citation), '证据是否保留定义和标题');
    updateMetric(root, 'inflation', `${inflation.toFixed(2)}×`, '重叠和碎片数量共同增加索引');
    setResult(result, exact && overlap <= 1 ? 'good' : 'warn', exact
      ? overlap <= 1 ? '边界保留了结构，且 overlap 没有过度膨胀。' : '边界合理，但 overlap 已产生不必要的重复。'
      : '观察哪些定义、标题、代码或处理步骤被切断。');
  }
  function renderEditor() {
    query(root, '[data-editor]').innerHTML = '';
    editor = mountChunkBoundaryEditor({
      root: query(root, '[data-editor]'),
      blocks: active.blocks,
      initialBreaks: active.id === 'contract' ? [1] : [0, 2],
      onChange: evaluate,
    });
  }
  bindScenarioTabs(root, scenarios, active.id, (scenario) => { active = scenario; renderEditor(); });
  query(root, '[data-overlap]').addEventListener('input', (event) => {
    overlap = Number(event.target.value);
    query(root, '[data-overlap-label]').textContent = overlap;
    evaluate(latest ?? { chunks: editor.getChunks(), breaks: [] });
  });
  query(root, '[data-save]').addEventListener('click', () => {
    const breaks = latest?.breaks ?? [];
    const exact = breaks.length === active.targetBreaks.length && breaks.every((value, index) => value === active.targetBreaks[index]);
    if (!exact || overlap > 1) {
      setResult(result, 'warn', '当前策略仍然切断结构或造成过度重复，不能保存为基线。');
      return;
    }
    completed.add(active.id);
    if (completed.size < scenarios.length) {
      setResult(result, 'good', `✓ ${active.label} 基线已保存。请切换另一个语料继续。`);
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'baselineChunkingPolicy',
      lessonId: config.lessonId,
      value: { scenarios: [...completed], overlap, principle: 'structure-aware-baseline-first' },
    });
    setResult(result, 'good', '✓ 两类语料都建立了结构感知 Chunking 基线，没有使用固定万能参数。');
    complete(artifact);
  });
  renderEditor();
}

export const ragFoundationSimulators = {
  'rag-knowledge-access-decision': mountKnowledgeAccessDecisionLab,
  'rag-problem-profile': mountRetrievalProblemProfileLab,
  'rag-golden-dataset': mountGoldenDatasetLab,
  'rag-document-ingestion': mountDocumentIngestionLab,
  'rag-baseline-chunking': mountBaselineChunkingLab,
};
