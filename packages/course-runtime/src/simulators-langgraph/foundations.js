import { artifactChips, metricGrid, once, q, saveArtifact, scenarioTabs, setResult, teachingNotice } from './shared.js';
import { mountGraphExecutionCanvas, mountStateChannelBoard } from './components.js';

export function mountOrchestrationDecision({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { id: 'extract', label: '单次字段抽取', answer: 'plain', detail: '一次模型调用 + Schema，无循环或持久化。' },
    { id: 'tool', label: '两个只读工具 Agent', answer: 'agent', detail: '标准模型—工具循环，createAgent 足够。' },
    { id: 'approval', label: '数小时审批', answer: 'graph', detail: '需要 interrupt、checkpoint 和恢复。' },
    { id: 'legacy', label: '旧业务流程渐进改造', answer: 'functional', detail: '保留 if/for，先加入 task 与 entrypoint。' },
    { id: 'report', label: '动态研究报告', answer: 'graph', detail: 'Planner、Send、并行 worker 与汇合。' },
    { id: 'faq', label: '固定 2-Step RAG', answer: 'plain', detail: '固定检索后生成，不需要动态图。' },
  ];
  const choices = [['plain', '普通函数 / 2-Step'], ['agent', 'LangChain createAgent'], ['functional', 'Functional API'], ['graph', 'StateGraph']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>编排复杂度诊断室</b><small>选择最小可靠抽象，不以图的数量评价专业度</small></div><button class="lg-primary" data-save>保存决策</button></div><div class="lg-grid"><section><table class="lg-table"><thead><tr><th>任务</th><th>方案</th><th>解释</th></tr></thead><tbody>${scenarios.map((item) => `<tr data-row="${item.id}"><td><b>${item.label}</b></td><td><select data-choice="${item.id}"><option value="">选择...</option>${choices.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-note="${item.id}">等待判断</td></tr>`).join('')}</tbody></table>${teachingNotice()}</section><aside>${metricGrid([{ label: '自定义状态', value: 'StateGraph' }, { label: '简单工具循环', value: 'createAgent' }, { label: '渐进改造', value: 'Functional' }])}<div class="lg-result" data-result>完成六个场景。</div></aside></div></div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-save]').onclick = () => {
    let correct = 0;
    const decisions = {};
    scenarios.forEach((item) => {
      const value = q(root, `[data-choice="${item.id}"]`).value;
      const ok = value === item.answer;
      decisions[item.id] = value;
      root.querySelector(`[data-row="${item.id}"]`).className = ok ? 'pass' : 'fail';
      q(root, `[data-note="${item.id}"]`).textContent = ok ? item.detail : '抽象层级与约束不匹配';
      if (ok) correct += 1;
    });
    if (correct !== scenarios.length) return setResult(result, 'warn', `当前 ${correct}/${scenarios.length} 正确。先判断路径、状态、暂停和并行是否真的需要图。`);
    const artifact = saveArtifact(artifacts, 'orchestrationDecision', { decisions, rule: 'start-high-level-drop-low-only-when-needed' }, config);
    setResult(result, 'good', '✓ 已形成 LangGraph 适用性决策，不会把简单任务过度图化。');
    complete(artifact);
  };
}

export function mountGraphMentalModel({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>StateGraph 单步播放器</b><small>观察 START、串行、并行 Superstep、汇合与 END</small></div><div><button class="lg-secondary" data-reset>重置</button><button class="lg-primary" data-step>下一 Superstep</button></div></div><div data-canvas></div><div class="lg-result" data-result>从 START 开始单步执行。</div>${teachingNotice()}</div>`;
  const player = mountGraphExecutionCanvas(q(root, '[data-canvas]'), {
    initialState: { query: '退款何时到账', route: null, sources: [], evidence: [], answer: null },
    nodes: [
      { id: 'start', label: 'START', kind: 'BOUNDARY' }, { id: 'classify', label: 'Classify', note: '写 route' },
      { id: 'lexical', label: 'Lexical Search', note: '并行分支' }, { id: 'dense', label: 'Dense Search', note: '并行分支' },
      { id: 'merge', label: 'Merge Evidence', note: 'Reducer 汇合' }, { id: 'generate', label: 'Generate', note: '写 answer' }, { id: 'end', label: 'END', kind: 'BOUNDARY' },
    ],
    steps: [
      { nodes: ['start'], label: 'START', detail: '创建初始 State', update: {} },
      { nodes: ['classify'], label: 'Classify', detail: 'route=hybrid', update: { route: 'hybrid' } },
      { nodes: ['lexical', 'dense'], label: 'Parallel retrieval', detail: '同一 Superstep 并行', apply: (state) => ({ ...state, sources: ['lexical', 'dense'], evidence: ['ERR-42 exact', 'refund timing semantic'] }) },
      { nodes: ['merge'], label: 'Fan-in', detail: '合并候选并去重', apply: (state) => ({ ...state, evidence: [...new Set(state.evidence)] }) },
      { nodes: ['generate'], label: 'Generate', detail: '基于 Evidence 生成答案', update: { answer: '预计 3–5 个工作日到账' } },
      { nodes: ['end'], label: 'END', detail: '无 next node，图结束', update: {} },
    ],
  });
  const result = q(root, '[data-result]');
  q(root, '[data-reset]').onclick = () => { player.reset(); setResult(result, '', '已重置到 START。'); };
  q(root, '[data-step]').onclick = () => {
    const state = player.step();
    if (!state.done) return setResult(result, 'warn', `已执行 Superstep ${player.getIndex()}，继续观察 State update。`);
    const artifact = saveArtifact(artifacts, 'graphExecutionMentalModel', { finalState: state.state, concepts: ['state', 'node', 'edge', 'superstep', 'start', 'end'] }, config);
    setResult(result, 'good', '✓ 已完成整张图。并行节点在同一 Superstep 运行，State 在边界合并。');
    complete(artifact);
  };
}

export function mountStateReducer({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>State Channel 合并实验</b><small>同一轮三个节点同时更新 State</small></div><button class="lg-primary" data-run>运行并发更新</button></div><div data-board></div><div class="lg-result" data-result>为每个字段选择 reducer。</div>${teachingNotice()}</div>`;
  const board = mountStateChannelBoard(q(root, '[data-board]'), [
    { id: 'route', label: 'route', type: 'string', note: '单一路由结果', initial: null, correct: 'overwrite' },
    { id: 'sources', label: 'sources', type: 'string[]', note: '并行检索来源', initial: [], correct: 'union' },
    { id: 'sections', label: 'completedSections', type: 'string[]', note: 'worker 输出', initial: [], correct: 'append' },
    { id: 'calls', label: 'llmCalls', type: 'number', note: '累计调用数', initial: 0, correct: 'sum' },
    { id: 'messages', label: 'messages', type: 'Message[]', note: '消息语义', initial: [], correct: 'messages' },
  ]);
  const result = q(root, '[data-result]');
  q(root, '[data-run]').onclick = () => {
    const values = board.run({ route: ['hybrid'], sources: [['lexical'], ['dense'], ['lexical']], sections: [['A'], ['B'], ['C']], calls: [1, 1, 1], messages: [[{ role: 'user', content: 'hi' }], [{ role: 'assistant', content: 'hello' }]] });
    const expected = { route: 'overwrite', sources: 'union', sections: 'append', calls: 'sum', messages: 'messages' };
    const correct = Object.entries(expected).filter(([name, reducer]) => values[name].reducer === reducer).length;
    if (correct !== Object.keys(expected).length) return setResult(result, 'warn', `Reducer ${correct}/${Object.keys(expected).length} 正确。数组“追加”和“去重集合”不是同一种语义。`);
    const artifact = saveArtifact(artifacts, 'stateReducerContract', { reducers: expected, final: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.value])) }, config);
    setResult(result, 'good', '✓ 并行更新已稳定合并，没有覆盖 worker 结果。');
    complete(artifact);
  };
}

export function mountNodeBoundary({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const steps = ['读取邮件', '分类意图', '检索订单', '生成回复', '发送邮件'];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>节点边界编辑器</b><small>选择在哪些步骤之间保留 checkpoint 边界</small></div><button class="lg-primary" data-run>注入发送前故障</button></div><div class="lg-boundary-editor">${steps.map((step, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><b>${step}</b>${index < steps.length - 1 ? `<label><input type="checkbox" data-boundary="${index}"> 在此拆分节点</label>` : ''}</article>`).join('')}</div><div class="lg-grid compact"><section><label class="lg-check"><input type="checkbox" data-idempotent> 发送邮件使用 idempotency key</label><label class="lg-check"><input type="checkbox" data-raw> State 保存原始业务数据，不保存拼接后的 Prompt</label></section><aside><div data-metrics></div><div class="lg-result" data-result>边界越少，代码更短，但故障时重复工作更多。</div></aside></div>${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-run]').onclick = () => {
    const boundaries = [...root.querySelectorAll('[data-boundary]:checked')].map((item) => Number(item.dataset.boundary));
    const nodeCount = boundaries.length + 1;
    const lastBoundary = boundaries.filter((index) => index < 3).at(-1) ?? -1;
    const repeatedSteps = 4 - (lastBoundary + 1);
    q(root, '[data-metrics]').innerHTML = metricGrid([
      { label: '节点数', value: nodeCount }, { label: '故障重复步骤', value: repeatedSteps }, { label: 'Trace 颗粒度', value: nodeCount >= 4 ? '清晰' : '过粗' },
    ]);
    const good = boundaries.includes(0) && boundaries.includes(1) && boundaries.includes(2) && boundaries.includes(3) && q(root, '[data-idempotent]').checked && q(root, '[data-raw]').checked;
    if (!good) return setResult(result, 'warn', '还不安全：读取、分类、检索、生成、发送应有可观察边界；发送必须幂等，State 保存原始数据。');
    const artifact = saveArtifact(artifacts, 'nodeBoundaryPolicy', { boundaries, idempotency: true, stateStoresRawData: true, recoveryRepeatSteps: 1 }, config);
    setResult(result, 'good', '✓ 故障只需重跑发送节点，外部副作用有幂等保护。');
    complete(artifact);
  };
}

export function mountRoutingCommand({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const cases = [
    { id: 'fixed', title: 'A 完成后总是进入 B', answer: 'edge', reason: '普通 Edge' },
    { id: 'branch', title: '根据 state.intent 选择退款或投诉', answer: 'conditional', reason: 'Conditional Edge' },
    { id: 'parallel', title: '根据分类同时查询账单和技术库', answer: 'conditional', reason: '条件边可以返回多个节点' },
    { id: 'update-route', title: '写入 grade/feedback 后决定重试或结束', answer: 'command', reason: 'Command 同时 update + goto' },
    { id: 'parent', title: '子图完成后跳到父图 review 节点', answer: 'command', reason: 'Command.PARENT' },
    { id: 'loop', title: '生成—评价循环最多 3 次', answer: 'command', reason: '显式路由 + 业务预算' },
  ];
  const choices = [['edge', 'Normal Edge'], ['conditional', 'Conditional Edge'], ['command', 'Command'], ['prompt', 'Prompt 暗示']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>控制流机制分拣台</b><small>把路由从 Prompt 中移到可测试结构</small></div><button class="lg-primary" data-check>检查路由</button></div><table class="lg-table"><thead><tr><th>场景</th><th>机制</th><th>原因</th></tr></thead><tbody>${cases.map((item) => `<tr data-row="${item.id}"><td><b>${item.title}</b></td><td><select data-choice="${item.id}"><option value="">选择...</option>${choices.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-reason="${item.id}">等待</td></tr>`).join('')}</tbody></table><label class="lg-check"><input type="checkbox" data-limit> 循环同时配置业务停止条件和 recursion limit</label><div class="lg-result" data-result>完成六种机制判断。</div>${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-check]').onclick = () => {
    let correct = 0;
    const decisions = {};
    cases.forEach((item) => {
      const value = q(root, `[data-choice="${item.id}"]`).value;
      decisions[item.id] = value;
      const ok = value === item.answer;
      root.querySelector(`[data-row="${item.id}"]`).className = ok ? 'pass' : 'fail';
      q(root, `[data-reason="${item.id}"]`).textContent = ok ? item.reason : '控制流机制不匹配';
      if (ok) correct += 1;
    });
    if (correct !== cases.length || !q(root, '[data-limit]').checked) return setResult(result, 'warn', `路由 ${correct}/${cases.length} 正确。循环还必须有业务停止条件和 recursion limit。`);
    const artifact = saveArtifact(artifacts, 'routingCommandPolicy', { decisions, recursionLimit: true }, config);
    setResult(result, 'good', '✓ 固定边、条件边与 Command 已形成清晰边界。');
    complete(artifact);
  };
}

export function mountParallelSend({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>动态 Fan-out / Fan-in 控制台</b><small>Planner 运行后才知道 worker 数量</small></div><button class="lg-primary" data-run>运行报告生成</button></div><div class="lg-grid"><section><label>章节数量 <b data-workers-label>4</b><input type="range" min="2" max="8" value="4" data-workers></label><label>并发上限 <b data-concurrency-label>3</b><input type="range" min="1" max="8" value="3" data-concurrency></label><select data-mode><option value="serial">串行循环</option><option value="fixed">固定并行边</option><option value="send">Send 动态 worker</option></select><select data-reducer><option value="overwrite">overwrite</option><option value="concat">concat reducer</option></select><label class="lg-check"><input type="checkbox" data-partial> 单个 worker 失败时记录错误并允许部分结果</label></section><aside><div data-metrics></div><div class="lg-worker-grid" data-grid></div><div class="lg-result" data-result>配置动态 worker。</div></aside></div>${artifactChips(artifacts, ['stateReducerContract'])}${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  const workersInput = q(root, '[data-workers]');
  const concurrencyInput = q(root, '[data-concurrency]');
  workersInput.oninput = () => { q(root, '[data-workers-label]').textContent = workersInput.value; };
  concurrencyInput.oninput = () => { q(root, '[data-concurrency-label]').textContent = concurrencyInput.value; };
  q(root, '[data-run]').onclick = () => {
    const workers = Number(workersInput.value);
    const concurrency = Number(concurrencyInput.value);
    const mode = q(root, '[data-mode]').value;
    const reducer = q(root, '[data-reducer]').value;
    const partial = q(root, '[data-partial]').checked;
    const waves = Math.ceil(workers / Math.max(1, concurrency));
    const latency = mode === 'serial' ? workers * 420 : waves * 460;
    q(root, '[data-grid]').innerHTML = Array.from({ length: workers }, (_, index) => `<article class="${index === 2 && partial ? 'warn' : 'good'}"><span>WORKER ${index + 1}</span><b>Section ${index + 1}</b><small>${index === 2 && partial ? 'timeout → error record' : 'completed'}</small></article>`).join('');
    q(root, '[data-metrics]').innerHTML = metricGrid([{ label: '估算耗时', value: `${latency}ms` }, { label: '并行波次', value: waves }, { label: '保留结果', value: reducer === 'concat' ? workers : 1 }]);
    const good = mode === 'send' && reducer === 'concat' && partial && concurrency >= 2 && concurrency <= workers;
    if (!good) return setResult(result, 'warn', '动态任务应使用 Send；汇合字段使用 concat reducer；还要定义部分失败和合理并发。');
    const artifact = saveArtifact(artifacts, 'parallelSendPolicy', { workers, concurrency, mode, reducer, partialFailure: 'record-and-continue', estimatedLatencyMs: latency }, config);
    setResult(result, 'good', '✓ Planner 动态创建 worker，输出通过 reducer 汇合，失败不会静默丢失。');
    complete(artifact);
  };
}

export function mountWorkflowPatterns({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { id: 'translate', label: '翻译→术语检查→格式检查', answer: 'chain' },
    { id: 'moderate', label: '三个独立安全维度同时评分', answer: 'parallel' },
    { id: 'support', label: '退款/物流/技术问题进入不同流程', answer: 'routing' },
    { id: 'report', label: '动态规划未知数量章节并汇总', answer: 'orchestrator' },
    { id: 'copy', label: '生成文案，评价后反复改进到达标', answer: 'evaluator' },
    { id: 'research', label: '路径未知，模型自主选择多个工具', answer: 'agent' },
  ];
  const patterns = [['chain', 'Prompt Chaining'], ['parallel', 'Parallelization'], ['routing', 'Routing'], ['orchestrator', 'Orchestrator-worker'], ['evaluator', 'Evaluator-optimizer'], ['agent', 'Dynamic Agent']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Workflow Pattern 选择器</b><small>根据控制权、任务数量和成功标准选择模式</small></div><button class="lg-primary" data-save>保存模式目录</button></div><div class="lg-pattern-grid">${scenarios.map((item) => `<article data-card="${item.id}"><b>${item.label}</b><select data-choice="${item.id}"><option value="">选择...</option>${patterns.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select><small data-note="${item.id}">等待</small></article>`).join('')}</div><div class="lg-result" data-result>不是所有多步骤任务都需要 Agent。</div>${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-save]').onclick = () => {
    const catalog = {};
    let correct = 0;
    scenarios.forEach((item) => {
      const value = q(root, `[data-choice="${item.id}"]`).value;
      catalog[item.id] = value;
      const ok = value === item.answer;
      root.querySelector(`[data-card="${item.id}"]`).className = ok ? 'good' : 'bad';
      q(root, `[data-note="${item.id}"]`).textContent = ok ? '匹配' : '控制模式不匹配';
      if (ok) correct += 1;
    });
    if (correct !== scenarios.length) return setResult(result, 'warn', `当前 ${correct}/${scenarios.length} 正确。先问路径是否已知、任务数是否动态、是否需要评价循环。`);
    const artifact = saveArtifact(artifacts, 'workflowPatternCatalog', catalog, config);
    setResult(result, 'good', '✓ 六类 Workflow/Agent 模式已按任务结构完成匹配。');
    complete(artifact);
  };
}

export const langGraphFoundationSimulators = {
  'lg-orchestration-decision': mountOrchestrationDecision,
  'lg-graph-mental-model': mountGraphMentalModel,
  'lg-state-reducer': mountStateReducer,
  'lg-node-boundary': mountNodeBoundary,
  'lg-routing-command': mountRoutingCommand,
  'lg-parallel-send': mountParallelSend,
  'lg-workflow-patterns': mountWorkflowPatterns,
};
