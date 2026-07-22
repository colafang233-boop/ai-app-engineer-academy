import {
  artifactChips,
  bindScenarioTabs,
  ensureTeachingDataNotice,
  linearFuse,
  once,
  percent,
  precisionAtK,
  query,
  recallAtK,
  renderCandidateTable,
  renderMetricCards,
  renderScenarioTabs,
  rrfFuse,
  saveArtifact,
  setResult,
  updateMetric,
} from '../components/simulator-kit.js';
import { mountRankDiffViewer } from '../components/rag/rank-diff-viewer.js';
import {
  denseRanks,
  documentsByIds,
  lexicalRanks,
  ragScenarios,
  rerankScores,
} from './data.js';

export function mountIndexLifecycleLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const operations = [
    { id: 'checksum', label: '用 checksum 判断内容是否真正变化' },
    { id: 'upsert', label: '同一 stable ID 执行幂等 upsert' },
    { id: 'delete', label: '删除源文档时删除全部关联 Chunk' },
    { id: 'dual', label: 'Embedding 升级时双索引写入' },
    { id: 'verify', label: '新旧索引使用同一 Golden Set 对比' },
    { id: 'alias', label: '通过 alias / traffic switch 切换' },
    { id: 'rollback', label: '保留旧索引与快速回滚路径' },
  ];
  let state = { active: 'index-v1', oldCount: 1200, newCount: 0, deleted: 0, duplicate: 0 };

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>增量索引控制台</b><small>新增、修改、删除与模型升级必须保持一致性和可回滚</small></div><div><button class="v1-secondary" data-reset type="button">重置</button><button class="v1-primary" data-run type="button">执行迁移</button></div></div>
      <div class="v1-grid"><section>
        <div class="v1-checklist">${operations.map((item) => `<label><input type="checkbox" data-operation="${item.id}"> ${item.label}</label>`).join('')}</div>
        <div class="v1-row"><button class="v1-secondary" data-event="duplicate" type="button">重复导入同一文件</button><button class="v1-secondary" data-event="modify" type="button">修改一个章节</button><button class="v1-secondary" data-event="remove" type="button">删除源文档</button></div>
      </section><aside>
        <div class="rag-index-versions"><article class="active" data-index="v1"><span>INDEX V1</span><b data-v1-count>1,200</b><small>当前生产</small></article><article data-index="v2"><span>INDEX V2</span><b data-v2-count>0</b><small>待构建</small></article></div>
        <pre class="v1-code" data-log>等待事件。</pre>
        <div class="v1-result" data-result>先制造重复、修改和删除，再设计无脏数据迁移。</div>
        ${artifactChips(artifacts, ['searchIndexSchema'])}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function render() {
    query(root, '[data-v1-count]').textContent = state.oldCount.toLocaleString();
    query(root, '[data-v2-count]').textContent = state.newCount.toLocaleString();
    root.querySelectorAll('[data-index]').forEach((item) => item.classList.toggle('active', item.dataset.index === state.active.replace('index-', '')));
  }
  root.querySelectorAll('[data-event]').forEach((button) => button.addEventListener('click', () => {
    const event = button.dataset.event;
    if (event === 'duplicate') {
      state.duplicate += 1;
      query(root, '[data-log]').textContent = 'Duplicate upload detected: same checksum. Without idempotency, chunk count would increase.';
    } else if (event === 'modify') {
      state.oldCount += 3;
      query(root, '[data-log]').textContent = 'One section changed: replace only its stable chunk IDs, preserve unaffected chunks.';
    } else {
      state.deleted += 12;
      query(root, '[data-log]').textContent = 'Source document removed: tombstone and delete all child chunks before freshness SLA expires.';
    }
    setResult(result, 'warn', '故障已注入。现在配置生命周期策略。');
    render();
  }));
  query(root, '[data-reset]').addEventListener('click', () => {
    state = { active: 'index-v1', oldCount: 1200, newCount: 0, deleted: 0, duplicate: 0 };
    root.querySelectorAll('[data-operation]').forEach((input) => { input.checked = false; });
    query(root, '[data-log]').textContent = '已重置。';
    render();
  });
  query(root, '[data-run]').addEventListener('click', () => {
    const selected = new Set([...root.querySelectorAll('[data-operation]:checked')].map((item) => item.dataset.operation));
    const all = operations.every((item) => selected.has(item.id));
    const eventsInjected = state.duplicate > 0 && state.deleted > 0 && state.oldCount > 1200;
    if (!all || !eventsInjected) {
      setResult(result, 'warn', `生命周期步骤 ${selected.size}/${operations.length}；请先注入重复、修改和删除三种事件。`);
      return;
    }
    state.newCount = state.oldCount - state.deleted;
    state.active = 'index-v2';
    query(root, '[data-log]').textContent = [
      '1. checksum/dedup passed',
      '2. dual-write index-v1 + index-v2',
      '3. Golden Set regression passed',
      '4. alias switched to index-v2',
      '5. index-v1 retained for rollback',
    ].join('\n');
    render();
    const artifact = saveArtifact({
      artifacts,
      key: 'indexLifecyclePolicy',
      lessonId: config.lessonId,
      value: { operations: [...selected], activeIndex: state.active, rollbackIndex: 'index-v1', staleDataSlaMinutes: 15 },
    });
    setResult(result, 'good', '✓ 新索引已验证并切换，重复、删除、版本升级和回滚都有明确路径。');
    complete(artifact);
  });
  render();
}

export function mountFirstStageRouterLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { id: 'error-code', label: '错误码/型号', query: 'ERR-NVML-001 570.86', correct: 'lexical' },
    { id: 'concept', label: '概念解释', query: '为什么驱动库版本不一致会导致 nvidia-smi 失败？', correct: 'dense' },
    { id: 'cross', label: '跨语言制度', query: '试用期 remote allowance', correct: 'hybrid' },
    { id: 'realtime', label: '实时订单余额', query: 'ORD-881 现在应付多少？', correct: 'sql-api' },
    { id: 'code', label: '代码符号与调用流', query: 'tenant_id before lookup_refund', correct: 'code-hybrid' },
  ];
  const routes = [
    ['lexical', 'Lexical / BM25'], ['dense', 'Dense'], ['hybrid', 'Lexical + Dense'], ['code-hybrid', 'Symbol + Code Embedding'], ['sql-api', 'SQL / API'], ['none', '不检索'],
  ];
  let order = ['error-code', 'realtime', 'code', 'cross', 'concept'];

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>查询类型路由器</b><small>先识别 Query，再选择一阶段召回，不要全局固定一个 Retriever</small></div><button class="v1-primary" data-run type="button">批量重跑查询</button></div>
      <div class="v1-grid"><section><div class="rule-stack" data-rules></div></section><aside>
        <div class="v1-table-wrap"><table class="v1-table"><thead><tr><th>Query</th><th>期望路由</th><th>实际</th><th>状态</th></tr></thead><tbody data-rows></tbody></table></div>
        <div class="v1-result" data-result>规则顺序故意不理想：宽泛语义规则可能吞掉精确查询。</div>
        ${artifactChips(artifacts, ['indexLifecyclePolicy'])}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function inferredRoute(item) {
    for (const id of order) {
      if (id === 'error-code' && /ERR-|NVML|\d+\.\d+/.test(item.query)) return 'lexical';
      if (id === 'realtime' && /现在|余额|应付|ORD-/.test(item.query)) return 'sql-api';
      if (id === 'code' && /tenant_id|lookup_refund/.test(item.query)) return 'code-hybrid';
      if (id === 'cross' && /[\u4e00-\u9fff].*[A-Za-z]|[A-Za-z].*[\u4e00-\u9fff]/.test(item.query)) return 'hybrid';
      if (id === 'concept') return 'dense';
    }
    return 'none';
  }
  function renderRules() {
    query(root, '[data-rules]').innerHTML = order.map((id, index) => {
      const item = scenarios.find((scenario) => scenario.id === id);
      return `<article class="rule-card"><span>${index + 1}</span><div><b>${item.label}</b><small>${routes.find(([value]) => value === item.correct)?.[1]}</small></div><div><button type="button" data-up="${id}" ${index === 0 ? 'disabled' : ''}>↑</button><button type="button" data-down="${id}" ${index === order.length - 1 ? 'disabled' : ''}>↓</button></div></article>`;
    }).join('');
    root.querySelectorAll('[data-up]').forEach((button) => button.addEventListener('click', () => move(button.dataset.up, -1)));
    root.querySelectorAll('[data-down]').forEach((button) => button.addEventListener('click', () => move(button.dataset.down, 1)));
  }
  function move(id, delta) {
    const index = order.indexOf(id);
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    renderRules();
    run(false);
  }
  function run(finalize = true) {
    const rows = scenarios.map((item) => ({ ...item, actual: inferredRoute(item) }));
    const passed = rows.filter((item) => item.actual === item.correct).length;
    query(root, '[data-rows]').innerHTML = rows.map((item) => `<tr class="${item.actual === item.correct ? 'pass' : 'fail'}"><td><b>${item.label}</b><small>${item.query}</small></td><td>${item.correct}</td><td>${item.actual}</td><td>${item.actual === item.correct ? '✓' : '✗'}</td></tr>`).join('');
    setResult(result, passed === rows.length ? 'good' : 'warn', `${passed}/${rows.length} 路由正确。${passed === rows.length ? '精确、结构化和代码规则都优先于宽泛语义规则。' : '调整规则顺序，避免宽泛规则提前命中。'}`);
    if (finalize && passed === rows.length) {
      const artifact = saveArtifact({
        artifacts,
        key: 'firstStageRetrievalRouter',
        lessonId: config.lessonId,
        value: { order, routes: Object.fromEntries(rows.map((item) => [item.id, item.actual])) },
      });
      complete(artifact);
    }
  }
  query(root, '[data-run]').addEventListener('click', () => run(true));
  renderRules();
  run(false);
}

export function mountHybridFusionLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = ragScenarios.slice(0, 3);
  let active = scenarios[0];
  const passed = new Map();
  let mode = 'rrf';
  let lexicalWeight = 50;
  let denseWeight = 50;
  let rankConstant = 20;

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>Hybrid Fusion 实验室</b><small>Rank fusion 和 score fusion 的参数含义完全不同</small></div><button class="v1-primary" data-save type="button">保存当前场景</button></div>
      ${renderScenarioTabs(scenarios, active.id)}
      <div class="v1-grid"><section>
        <div class="v1-row"><label><input type="radio" name="fusion-mode" value="rrf" checked> RRF rank fusion</label><label><input type="radio" name="fusion-mode" value="linear"> 归一化线性融合</label></div>
        <label class="v1-label">Lexical 权重 <b data-lex-label>50</b></label><input type="range" min="0" max="100" value="50" data-lex>
        <label class="v1-label">Dense 权重 <b data-dense-label>50</b></label><input type="range" min="0" max="100" value="50" data-dense>
        <label class="v1-label">RRF rank constant <b data-rrf-label>20</b></label><input type="range" min="1" max="80" value="20" data-rrf>
        <div data-rank-diff></div>
      </section><aside>
        ${renderMetricCards([
          { id: 'recall', label: 'Recall@3', value: '—' },
          { id: 'precision', label: 'Precision@3', value: '—' },
          { id: 'stability', label: '分数量纲敏感性', value: '—' },
        ])}
        <div class="v1-result" data-result>对错误码、跨语言和合同查询分别寻找合理的融合方式。</div>
        ${artifactChips(artifacts, ['firstStageRetrievalRouter'])}
        ${ensureTeachingDataNotice()}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function lists() {
    const lexical = documentsByIds(lexicalRanks[active.id]).map((item, index) => ({ ...item, score: 9 - index * 1.8, relevant: active.relevantIds.includes(item.id) }));
    const dense = documentsByIds(denseRanks[active.id]).map((item, index) => ({ ...item, score: 0.93 - index * 0.13, relevant: active.relevantIds.includes(item.id) }));
    const fused = mode === 'rrf'
      ? rrfFuse([lexical, dense], rankConstant)
      : linearFuse([lexical, dense], [lexicalWeight / 100, denseWeight / 100]);
    fused.forEach((item) => { item.relevant = active.relevantIds.includes(item.id); });
    return { lexical, dense, fused };
  }
  function render() {
    query(root, '[data-lex-label]').textContent = lexicalWeight;
    query(root, '[data-dense-label]').textContent = denseWeight;
    query(root, '[data-rrf-label]').textContent = rankConstant;
    const { lexical, dense, fused } = lists();
    mountRankDiffViewer({ root: query(root, '[data-rank-diff]'), columns: [
      { id: 'lexical', label: 'Lexical', items: lexical },
      { id: 'dense', label: 'Dense', items: dense },
      { id: 'fused', label: mode === 'rrf' ? 'RRF' : 'Linear', items: fused },
    ] });
    updateMetric(root, 'recall', percent(recallAtK(fused, active.relevantIds, 3)), '一阶段召回是否覆盖证据');
    updateMetric(root, 'precision', percent(precisionAtK(fused, active.relevantIds, 3)), '候选污染程度');
    updateMetric(root, 'stability', mode === 'rrf' ? '低' : '中/高', mode === 'rrf' ? '不依赖原始分数量纲' : '必须正确归一化与调权');
  }
  bindScenarioTabs(root, scenarios, active.id, (scenario) => { active = scenario; render(); });
  root.querySelectorAll('input[name="fusion-mode"]').forEach((input) => input.addEventListener('change', () => { mode = input.value; render(); }));
  query(root, '[data-lex]').addEventListener('input', (event) => { lexicalWeight = Number(event.target.value); render(); });
  query(root, '[data-dense]').addEventListener('input', (event) => { denseWeight = Number(event.target.value); render(); });
  query(root, '[data-rrf]').addEventListener('input', (event) => { rankConstant = Number(event.target.value); render(); });
  query(root, '[data-save]').addEventListener('click', () => {
    const { fused } = lists();
    const recall = recallAtK(fused, active.relevantIds, 3);
    const precision = precisionAtK(fused, active.relevantIds, 3);
    const scenarioOk = active.id === 'support'
      ? mode === 'rrf' && recall === 1
      : active.id === 'policy'
        ? mode === 'linear' && denseWeight >= 55 && recall === 1
        : recall === 1 && precision >= 2 / 3;
    if (!scenarioOk) {
      setResult(result, 'warn', '当前融合在该查询切片上没有同时保持召回和候选纯度。不要只看总平均。');
      return;
    }
    passed.set(active.id, { mode, lexicalWeight, denseWeight, rankConstant, recall, precision });
    if (passed.size < scenarios.length) {
      setResult(result, 'good', `✓ ${active.label} 已保存。切换下一场景继续。`);
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'hybridFusionPolicy',
      lessonId: config.lessonId,
      value: { scenarios: Object.fromEntries(passed), defaultBaseline: 'rrf', allowDynamicWeights: true },
    });
    setResult(result, 'good', '✓ 已证明 RRF 是稳健基线，但有标注数据时可按 Query 类型调节线性融合。');
    complete(artifact);
  });
  render();
}

export function mountQueryTransformationLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { id: 'identifier', label: '错误码与型号', query: 'ERR-NVML-001 570.86', correct: ['normalize'] },
    { id: 'cross', label: '跨语言制度', query: '试用期 remote work allowance', correct: ['translate'] },
    { id: 'broad', label: '模糊概念问题', query: '远程办公支持有哪些？', correct: ['multi-query'] },
    { id: 'multi-hop', label: '多跳合同问题', query: '什么情况算 Delay，发生后赔偿上限是多少？', correct: ['decompose'] },
  ];
  const transforms = [
    ['normalize', '规范大小写/空格但保留标识符'],
    ['spell', '拼写纠正'],
    ['translate', '跨语言翻译'],
    ['multi-query', '生成多个语义改写'],
    ['hyde', 'HyDE 假设文档'],
    ['decompose', '拆分多跳子问题'],
  ];
  let active = scenarios[0];
  const decisions = new Map();

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>Query Transformation 风险台</b><small>改写可以补召回，也可能抹掉关键错误码、否定词和约束</small></div><button class="v1-primary" data-save type="button">保存四类策略</button></div>
      ${renderScenarioTabs(scenarios, active.id)}
      <div class="v1-grid"><section>
        <article class="v1-card"><b data-query></b></article>
        <div class="v1-checklist">${transforms.map(([id, label]) => `<label><input type="checkbox" data-transform="${id}"> ${label}</label>`).join('')}</div>
        <div class="rag-query-transform"><section><span>原始 Query</span><code data-original></code></section><section><span>转换后</span><code data-transformed></code></section></div>
      </section><aside>
        ${renderMetricCards([
          { id: 'recall', label: 'Recall@5', value: '—' },
          { id: 'drift', label: 'Query Drift', value: '—' },
          { id: 'cost', label: '额外模型调用', value: '—' },
        ])}
        <div class="v1-result" data-result>启用策略后观察召回收益与语义漂移。</div>
        ${artifactChips(artifacts, ['hybridFusionPolicy'])}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function selected() { return [...root.querySelectorAll('[data-transform]:checked')].map((item) => item.dataset.transform); }
  function transformedQuery(list) {
    if (active.id === 'identifier') return list.includes('spell') ? 'NVIDIA driver issue' : 'ERR-NVML-001 570.86';
    if (active.id === 'cross') return list.includes('translate') ? 'probation employee remote work allowance policy' : active.query;
    if (active.id === 'broad') return list.includes('multi-query') ? '远程办公补贴 | 设备支持 | 申请条件' : active.query;
    return list.includes('decompose') ? '子问题1: Delay 定义；子问题2: Delay 赔偿上限' : active.query;
  }
  function render() {
    const saved = decisions.get(active.id) ?? [];
    root.querySelectorAll('[data-transform]').forEach((input) => { input.checked = saved.includes(input.dataset.transform); });
    const list = selected();
    query(root, '[data-query]').textContent = active.query;
    query(root, '[data-original]').textContent = active.query;
    query(root, '[data-transformed]').textContent = transformedQuery(list);
    const correct = JSON.stringify([...list].sort()) === JSON.stringify([...active.correct].sort());
    const drift = active.id === 'identifier' && list.some((item) => ['spell', 'hyde', 'multi-query'].includes(item)) ? 0.82 : correct ? 0.08 : 0.38;
    const recall = correct ? 0.92 : drift > 0.7 ? 0.43 : 0.72;
    updateMetric(root, 'recall', percent(recall), '只比较同一 Golden Set');
    updateMetric(root, 'drift', percent(drift), '关键标识符和约束是否被改变');
    updateMetric(root, 'cost', list.filter((item) => ['translate', 'multi-query', 'hyde', 'decompose'].includes(item)).length, '额外 LLM/翻译步骤');
    setResult(result, correct ? 'good' : 'warn', correct ? '当前转换针对真正的查询问题，且没有过度改写。' : '当前策略要么没有补足召回，要么造成 Query Drift。');
  }
  bindScenarioTabs(root, scenarios, active.id, (scenario) => { active = scenario; render(); });
  root.querySelectorAll('[data-transform]').forEach((input) => input.addEventListener('change', () => { decisions.set(active.id, selected()); render(); }));
  query(root, '[data-save]').addEventListener('click', () => {
    decisions.set(active.id, selected());
    const passed = scenarios.every((scenario) => JSON.stringify([...(decisions.get(scenario.id) ?? [])].sort()) === JSON.stringify([...scenario.correct].sort()));
    if (!passed) {
      setResult(result, 'warn', '请完成四类 Query。精确标识符不应该被 HyDE 或泛化改写覆盖。');
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'queryTransformationPolicy',
      lessonId: config.lessonId,
      value: { scenarios: Object.fromEntries(decisions), preserveIdentifiers: true, measureDrift: true },
    });
    setResult(result, 'good', '✓ 已形成按失败模式启用的 Query Transformation 策略，并保留原始 Query 作为审计记录。');
    complete(artifact);
  });
  render();
}

export function mountRerankingBenchmarkLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const slices = [
    { id: 'support', label: '错误码支持', scenario: ragScenarios[0], correctModel: 'fast-cross', minTopN: 20, maxLatency: 150 },
    { id: 'policy', label: '跨语言制度', scenario: ragScenarios[1], correctModel: 'multi-cross', minTopN: 30, maxLatency: 260 },
    { id: 'legal', label: '高风险合同', scenario: ragScenarios[2], correctModel: 'quality-cross', minTopN: 40, maxLatency: 500 },
  ];
  const models = {
    none: { label: '不重排', quality: 0.72, perCandidate: 0, cost: 0 },
    'fast-cross': { label: 'Fast Cross-encoder', quality: 0.86, perCandidate: 3, cost: 0.2 },
    'multi-cross': { label: 'Multilingual Cross-encoder', quality: 0.91, perCandidate: 6, cost: 0.45 },
    'quality-cross': { label: 'Large Quality Reranker', quality: 0.95, perCandidate: 10, cost: 0.9 },
    'llm-judge': { label: 'LLM relevance judge', quality: 0.96, perCandidate: 35, cost: 3.2 },
  };
  let active = slices[0];
  let selectedModel = 'none';
  let topN = 10;
  let topK = 5;
  let batch = 4;
  let timeout = 300;
  const passed = new Map();

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>Candidate Rerank 竞技场</b><small>一阶段负责高召回，Reranker 只在有限候选上做更贵的判断</small></div><button class="v1-primary" data-run type="button">运行当前预算</button></div>
      ${renderScenarioTabs(slices, active.id)}
      <div class="v1-grid"><section>
        <div class="v1-card-list" data-models></div>
        <label class="v1-label">First-stage topN <b data-topn-label>10</b></label><input type="range" min="5" max="60" step="5" value="10" data-topn>
        <label class="v1-label">Rerank topK <b data-topk-label>5</b></label><input type="range" min="2" max="15" value="5" data-topk>
        <label class="v1-label">Batch size <b data-batch-label>4</b></label><input type="range" min="1" max="16" value="4" data-batch>
        <label class="v1-label">Timeout <b data-timeout-label>300</b>ms</label><input type="range" min="100" max="1000" step="50" value="300" data-timeout>
      </section><aside>
        ${renderMetricCards([
          { id: 'quality', label: 'nDCG@5', value: '—' },
          { id: 'recall', label: 'Candidate Recall', value: '—' },
          { id: 'latency', label: 'P95 增量延迟', value: '—' },
          { id: 'cost', label: '相对成本', value: '—' },
        ])}
        <div class="rag-pareto" data-pareto></div>
        <div class="v1-result" data-result>调节候选数量和模型，找到质量—延迟—成本的 Pareto 区间。</div>
        ${artifactChips(artifacts, ['queryTransformationPolicy'])}
        ${ensureTeachingDataNotice()}
      </aside></div>
    </div>`;
  const result = query(root, '[data-result]');
  function model() { return models[selectedModel]; }
  function metrics() {
    const item = model();
    const candidateRecall = Math.min(1, 0.45 + topN / 60);
    const quality = Math.min(0.98, item.quality * candidateRecall - Math.max(0, topK - 10) * 0.005);
    const latency = Math.round(item.perCandidate * topN / Math.max(1, Math.sqrt(batch)));
    const cost = item.cost * topN / 20;
    return { candidateRecall, quality, latency, cost };
  }
  function renderModels() {
    query(root, '[data-models]').innerHTML = Object.entries(models).map(([id, item]) => `<button type="button" class="v1-card ${id === selectedModel ? 'selected' : ''}" data-model="${id}"><b>${item.label}</b><small>quality ${item.quality} · ${item.perCandidate}ms/candidate · cost ${item.cost}</small></button>`).join('');
    root.querySelectorAll('[data-model]').forEach((button) => button.addEventListener('click', () => { selectedModel = button.dataset.model; render(); }));
  }
  function render() {
    renderModels();
    query(root, '[data-topn-label]').textContent = topN;
    query(root, '[data-topk-label]').textContent = topK;
    query(root, '[data-batch-label]').textContent = batch;
    query(root, '[data-timeout-label]').textContent = timeout;
    const value = metrics();
    updateMetric(root, 'quality', value.quality.toFixed(3), '排序质量');
    updateMetric(root, 'recall', percent(value.candidateRecall), '一阶段没召回，重排无法修复');
    updateMetric(root, 'latency', `${value.latency}ms`, `当前 timeout ${timeout}ms`);
    updateMetric(root, 'cost', `${value.cost.toFixed(2)}×`, '候选数直接放大成本');
    query(root, '[data-pareto]').innerHTML = `<div><span>质量</span><i><em style="width:${value.quality * 100}%"></em></i></div><div><span>速度</span><i><em style="width:${Math.max(0, 100 - value.latency / 6)}%"></em></i></div><div><span>成本效率</span><i><em style="width:${Math.max(0, 100 - value.cost * 20)}%"></em></i></div>`;
  }
  bindScenarioTabs(root, slices, active.id, (slice) => { active = slice; render(); });
  for (const [selector, setter] of [['[data-topn]', (v) => { topN = v; }], ['[data-topk]', (v) => { topK = v; }], ['[data-batch]', (v) => { batch = v; }], ['[data-timeout]', (v) => { timeout = v; }]]) {
    query(root, selector).addEventListener('input', (event) => { setter(Number(event.target.value)); render(); });
  }
  query(root, '[data-run]').addEventListener('click', () => {
    const value = metrics();
    const ok = selectedModel === active.correctModel && topN >= active.minTopN && topK <= 10 && value.latency <= active.maxLatency && value.latency <= timeout && value.candidateRecall >= 0.78;
    if (!ok) {
      setResult(result, 'warn', '当前配置在模型语言能力、候选 Recall、延迟或 topK 预算上不满足该切片。');
      return;
    }
    passed.set(active.id, { model: selectedModel, topN, topK, batch, timeout, ...value });
    if (passed.size < slices.length) {
      setResult(result, 'good', `✓ ${active.label} 已进入 Pareto 区间。继续其他切片。`);
      return;
    }
    const artifact = saveArtifact({
      artifacts,
      key: 'rerankingBenchmarkReport',
      lessonId: config.lessonId,
      value: { slices: Object.fromEntries(passed), rule: 'rerank-cannot-recover-missed-candidates' },
    });
    setResult(result, 'good', '✓ 已按语言、风险与 SLA 选择不同 Reranker 和候选预算。');
    complete(artifact);
  });
  render();
}

export const ragRetrievalSimulators = {
  'rag-index-lifecycle': mountIndexLifecycleLab,
  'rag-first-stage-router': mountFirstStageRouterLab,
  'rag-hybrid-fusion': mountHybridFusionLab,
  'rag-query-transformation': mountQueryTransformationLab,
  'rag-reranking-benchmark': mountRerankingBenchmarkLab,
};
