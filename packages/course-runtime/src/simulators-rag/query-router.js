import {
  artifactChips,
  once,
  query,
  saveArtifact,
  setResult,
} from '../components/simulator-kit.js';

export function mountFirstStageRouterLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { id: 'error-code', label: '错误码/型号', query: 'ERR-NVML-001 570.86', correct: 'lexical' },
    { id: 'concept', label: '概念解释', query: '为什么驱动库版本不一致会导致 nvidia-smi 失败？', correct: 'dense' },
    { id: 'cross', label: '跨语言制度', query: '试用期 remote allowance', correct: 'hybrid' },
    { id: 'realtime', label: '实时订单余额', query: 'ORD-881 现在应付多少？', correct: 'sql-api' },
    { id: 'code', label: '代码符号与调用流', query: 'tenant_id before lookup_refund', correct: 'code-hybrid' },
  ];
  const routeLabels = {
    lexical: 'Lexical / BM25',
    dense: 'Dense',
    hybrid: 'Lexical + Dense',
    'code-hybrid': 'Symbol + Code Embedding',
    'sql-api': 'SQL / API',
  };
  let order = ['cross', 'concept', 'error-code', 'realtime', 'code'];

  root.innerHTML = `
    <div class="v1-panel rag-lab">
      <div class="v1-toolbar"><div><b>查询类型路由器</b><small>先识别 Query，再选择一阶段召回，不要全局固定一个 Retriever</small></div><button class="v1-primary" data-run type="button">批量重跑查询</button></div>
      <div class="v1-grid"><section><div class="rule-stack" data-rules></div></section><aside>
        <div class="v1-table-wrap"><table class="v1-table"><thead><tr><th>Query</th><th>期望路由</th><th>实际</th><th>状态</th></tr></thead><tbody data-rows></tbody></table></div>
        <div class="v1-result" data-result>当前规则顺序故意有问题：宽泛的中英混输规则会先截走带英文术语的中文概念问题。</div>
        ${artifactChips(artifacts, ['indexLifecyclePolicy'])}
      </aside></div>
    </div>`;

  const result = query(root, '[data-result]');

  function inferredRoute(item) {
    for (const ruleId of order) {
      if (ruleId === 'error-code' && /ERR-|NVML|\d+\.\d+/.test(item.query)) return 'lexical';
      if (ruleId === 'realtime' && /现在|余额|应付|ORD-/.test(item.query)) return 'sql-api';
      if (ruleId === 'code' && /tenant_id|lookup_refund/.test(item.query)) return 'code-hybrid';
      if (ruleId === 'concept' && /为什么|解释|原理|how does|why/i.test(item.query)) return 'dense';
      if (ruleId === 'cross' && /[\u4e00-\u9fff].*[A-Za-z]|[A-Za-z].*[\u4e00-\u9fff]/.test(item.query)) return 'hybrid';
    }
    return 'none';
  }

  function renderRules() {
    query(root, '[data-rules]').innerHTML = order.map((id, index) => {
      const item = scenarios.find((scenario) => scenario.id === id);
      return `<article class="rule-card"><span>${index + 1}</span><div><b>${item.label}</b><small>${routeLabels[item.correct]}</small></div><div><button type="button" data-up="${id}" ${index === 0 ? 'disabled' : ''}>↑</button><button type="button" data-down="${id}" ${index === order.length - 1 ? 'disabled' : ''}>↓</button></div></article>`;
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
    setResult(result, passed === rows.length ? 'good' : 'warn', `${passed}/${rows.length} 路由正确。${passed === rows.length ? '精确、实时、代码和显式概念规则均优先于宽泛混输规则。' : '调整顺序：先识别高精度规则，再使用宽泛的跨语言兜底。'}`);
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

export const ragQueryRouterSimulator = {
  'rag-first-stage-router': mountFirstStageRouterLab,
};
