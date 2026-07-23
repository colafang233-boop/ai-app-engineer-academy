import { artifactChips, metricGrid, once, q, saveArtifact, setResult, teachingNotice } from './shared.js';
import { mountCheckpointForkTree } from './components.js';

export function mountApiChoice({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const cases = [
    { id: 'visual', label: '需要可视化共享 State 与动态边', answer: 'graph' },
    { id: 'legacy', label: '已有 if/for 代码渐进加入 checkpoint', answer: 'functional' },
    { id: 'mixed', label: '外层图编排，内部复用旧工作流', answer: 'hybrid' },
    { id: 'private', label: '节点间需要共享私有 channel', answer: 'graph' },
    { id: 'short', label: '线性函数只需 task retry', answer: 'functional' },
    { id: 'subgraph', label: '显式父子图和状态映射', answer: 'graph' },
  ];
  const choices = [['graph', 'Graph API'], ['functional', 'Functional API'], ['hybrid', 'Hybrid']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>API 选择矩阵</b><small>选择表达方式，不比较“高级程度”</small></div><button class="lg-primary" data-check>检查选择</button></div><div class="lg-decision-grid">${cases.map((item) => `<article data-card="${item.id}"><b>${item.label}</b><div>${choices.map(([value, label]) => `<label><input type="radio" name="api-${item.id}" value="${value}"> ${label}</label>`).join('')}</div></article>`).join('')}</div><div class="lg-result" data-result>完成六个场景。</div>${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-check]').onclick = () => {
    let correct = 0;
    const decisions = {};
    cases.forEach((item) => {
      const value = root.querySelector(`input[name="api-${item.id}"]:checked`)?.value;
      decisions[item.id] = value;
      const ok = value === item.answer;
      root.querySelector(`[data-card="${item.id}"]`).className = ok ? 'good' : 'bad';
      if (ok) correct += 1;
    });
    if (correct !== cases.length) return setResult(result, 'warn', `当前 ${correct}/${cases.length} 正确。可视化共享 State 偏 Graph，渐进改造偏 Functional，两者可混用。`);
    const artifact = saveArtifact(artifacts, 'langGraphApiDecision', decisions, config);
    setResult(result, 'good', '✓ Graph、Functional 与 Hybrid 的适用边界已形成。');
    complete(artifact);
  };
}

export function mountDurableExecution({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const operations = [
    { id: 'clock', label: '读取当前时间', kind: 'nondeterministic', needsTask: true },
    { id: 'api', label: '调用外部库存 API', kind: 'io', needsTask: true },
    { id: 'parse', label: '解析已有 JSON', kind: 'pure', needsTask: false },
    { id: 'email', label: '发送确认邮件', kind: 'side-effect', needsTask: true },
    { id: 'branch', label: '根据已保存 grade 做 if 分支', kind: 'control', needsTask: false },
  ];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Durable Replay 故障实验</b><small>在审批后模拟进程崩溃并恢复</small></div><button class="lg-primary" data-run>崩溃并恢复</button></div><div class="lg-grid"><section><div class="lg-task-list">${operations.map((item) => `<label data-op="${item.id}"><input type="checkbox" data-task="${item.id}"> <b>${item.label}</b><small>${item.kind}</small></label>`).join('')}</div><label class="lg-check"><input type="checkbox" data-idempotency> 外部写操作使用 idempotency key</label><label class="lg-check"><input type="checkbox" data-serializable> task 输出全部 JSON-serializable</label><label class="lg-check"><input type="checkbox" data-retry> 瞬时错误有限重试，确定性错误不重试</label></section><aside><div class="lg-replay-log" data-log></div><div data-metrics></div><div class="lg-result" data-result>标出必须进入 task 的不确定工作。</div></aside></div>${artifactChips(artifacts, ['nodeBoundaryPolicy'])}${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-run]').onclick = () => {
    const selected = [...root.querySelectorAll('[data-task]:checked')].map((item) => item.dataset.task);
    const correctTasks = operations.filter((item) => item.needsTask).map((item) => item.id);
    const exact = selected.length === correctTasks.length && correctTasks.every((id) => selected.includes(id));
    q(root, '[data-log]').innerHTML = [
      ['1', 'parse input', 'replayed safely'], ['2', 'inventory API', selected.includes('api') ? 'task result reused' : 'called twice'],
      ['3', 'interrupt review', 'resumed'], ['4', 'send email', q(root, '[data-idempotency]').checked ? 'deduplicated' : 'duplicate risk'],
    ].map(([n, label, state]) => `<article><span>${n}</span><b>${label}</b><small>${state}</small></article>`).join('');
    q(root, '[data-metrics]').innerHTML = metricGrid([{ label: '重复 API 调用', value: selected.includes('api') ? 0 : 1 }, { label: '重复邮件风险', value: q(root, '[data-idempotency]').checked ? '低' : '高' }, { label: '可恢复', value: exact ? '是' : '否' }]);
    const good = exact && q(root, '[data-idempotency]').checked && q(root, '[data-serializable]').checked && q(root, '[data-retry]').checked;
    if (!good) return setResult(result, 'warn', '恢复仍不安全：时间/API/邮件应进入 task；写操作要幂等；输出可序列化；Retry 要分类。');
    const artifact = saveArtifact(artifacts, 'durableExecutionPolicy', { tasks: correctTasks, idempotency: true, serializable: true, retryPolicy: 'bounded-transient-only' }, config);
    setResult(result, 'good', '✓ 重放复用已保存 task 结果，外部副作用不会重复。');
    complete(artifact);
  };
}

export function mountCheckpointThread({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const threads = {
    'thread-a': { owner: 'Alice', checkpoints: [{ id: 'a1', next: ['classify'], values: { query: '退款进度' } }, { id: 'a2', next: ['review'], values: { route: 'refund', evidence: 2 } }] },
    'thread-b': { owner: 'Bob', checkpoints: [{ id: 'b1', next: ['retrieve'], values: { query: 'ERR-42' } }, { id: 'b2', next: ['generate'], values: { route: 'technical', evidence: 3 } }] },
    'thread-c': { owner: 'Carol', checkpoints: [{ id: 'c1', next: [], values: { query: '公司假期', answer: '...' } }] },
  };
  let active = 'thread-a';
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Thread Checkpoint 浏览器</b><small>查看 values、next、tasks 与恢复位置</small></div><div><button class="lg-secondary" data-restart>模拟服务重启</button><button class="lg-primary" data-restore>恢复当前线程</button></div></div><div class="lg-tabs">${Object.entries(threads).map(([id, value]) => `<button type="button" data-thread="${id}" class="lg-secondary ${id === active ? 'active' : ''}">${value.owner}</button>`).join('')}</div><div class="lg-grid"><section><div class="lg-checkpoint-list" data-list></div></section><aside><pre class="lg-code" data-state>{}</pre><div class="lg-result" data-result>选择 checkpoint 查看 StateSnapshot。</div></aside></div>${teachingNotice()}</div>`;
  let runtimeAvailable = true;
  let selected = null;
  const result = q(root, '[data-result]');
  function render() {
    q(root, '[data-list]').innerHTML = threads[active].checkpoints.map((item, index) => `<button type="button" data-snapshot="${index}"><span>${item.id}</span><b>next: ${item.next.join(',') || 'END'}</b><small>${JSON.stringify(item.values)}</small></button>`).join('');
    root.querySelectorAll('[data-snapshot]').forEach((button) => button.onclick = () => {
      selected = threads[active].checkpoints[Number(button.dataset.snapshot)];
      root.querySelectorAll('[data-snapshot]').forEach((item) => item.classList.toggle('active', item === button));
      q(root, '[data-state]').textContent = JSON.stringify({ values: selected.values, next: selected.next, tasks: selected.next.map((node) => ({ node, status: 'pending' })), thread_id: active }, null, 2);
      setResult(result, '', `已选择 ${selected.id}。`);
    });
  }
  root.querySelectorAll('[data-thread]').forEach((button) => button.onclick = () => {
    active = button.dataset.thread;
    selected = null;
    root.querySelectorAll('[data-thread]').forEach((item) => item.classList.toggle('active', item === button));
    q(root, '[data-state]').textContent = '{}';
    render();
  });
  q(root, '[data-restart]').onclick = () => { runtimeAvailable = false; q(root, '[data-state]').textContent = '{}'; setResult(result, 'warn', '进程内状态已清空，Checkpoint 数据仍在。'); };
  q(root, '[data-restore]').onclick = () => {
    if (!selected) return setResult(result, 'warn', '先选择一个 checkpoint。');
    runtimeAvailable = true;
    q(root, '[data-state]').textContent = JSON.stringify({ restored: true, thread_id: active, checkpoint: selected }, null, 2);
    if (active !== 'thread-b' || selected.id !== 'b2') return setResult(result, 'warn', '请恢复 Bob 的 b2，验证独立线程和 next=generate。');
    const artifact = saveArtifact(artifacts, 'checkpointThreadContract', { threadIsolation: true, selected: selected.id, snapshotFields: ['values', 'next', 'tasks', 'metadata'], databaseBacked: true }, config);
    setResult(result, 'good', '✓ 服务重启后从 Bob 的独立 checkpoint 恢复到 generate。');
    complete(artifact);
  };
  render();
}

export function mountInterruptHitl({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const cases = [
    { id: 'refund', label: '退款 1000 元，审批人改为 100 元', answer: 'edit' },
    { id: 'delete', label: '删除历史记录', answer: 'reject' },
    { id: 'email', label: '已审核的通知邮件', answer: 'approve' },
    { id: 'missing', label: '缺少合同编号，需要用户补充', answer: 'respond' },
  ];
  let index = 0;
  const decisions = [];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Typed Interrupt 审批台</b><small>interrupt payload → 外部决策 → Command(resume)</small></div><button class="lg-primary" data-resume>恢复当前 Interrupt</button></div><div class="lg-grid"><section><div class="lg-interrupt-card"><span data-index>1 / 4</span><b data-case></b><pre data-payload></pre></div><div class="lg-choice-row">${['approve', 'edit', 'reject', 'respond'].map((value) => `<label><input type="radio" name="resume-decision" value="${value}"> ${value}</label>`).join('')}</div><label class="lg-check"><input type="checkbox" data-first> interrupt 在副作用之前执行</label><label class="lg-check"><input type="checkbox" data-typed> resume value 使用 Zod/typed schema 验证</label></section><aside><div class="lg-pipeline"><span>NODE START</span><i>→</i><span>interrupt()</span><i>→</i><span>CHECKPOINT</span><i>→</i><span>Command(resume)</span></div><div class="lg-result" data-result>处理四种恢复决策。</div></aside></div>${artifactChips(artifacts, ['checkpointThreadContract'])}${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  function render() {
    const item = cases[index];
    q(root, '[data-index]').textContent = `${index + 1} / ${cases.length}`;
    q(root, '[data-case]').textContent = item.label;
    q(root, '[data-payload]').textContent = JSON.stringify({ type: 'approval', action: item.id, allowed: ['approve', 'edit', 'reject', 'respond'] }, null, 2);
    root.querySelectorAll('input[name="resume-decision"]').forEach((input) => { input.checked = false; });
  }
  q(root, '[data-resume]').onclick = () => {
    const value = root.querySelector('input[name="resume-decision"]:checked')?.value;
    if (!value) return setResult(result, 'warn', '先选择恢复决策。');
    if (!q(root, '[data-first]').checked || !q(root, '[data-typed]').checked) return setResult(result, 'warn', 'Interrupt 应先于副作用，resume value 必须类型化验证。');
    const item = cases[index];
    if (value !== item.answer) return setResult(result, 'warn', `当前决策不匹配 ${item.label}。`);
    decisions.push({ case: item.id, decision: value });
    if (index < cases.length - 1) {
      index += 1;
      render();
      return setResult(result, 'good', `✓ ${item.id} 已恢复，继续下一种 interrupt。`);
    }
    const artifact = saveArtifact(artifacts, 'interruptResumeContract', { decisions, typed: true, sideEffectAfterInterrupt: true }, config);
    setResult(result, 'good', '✓ approve、edit、reject、respond 全部通过 Command(resume) 恢复。');
    complete(artifact);
  };
  render();
}

export function mountTimeTravel({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const checkpoints = [
    { id: 'cp-1', label: 'Input', state: 'route=null', snapshot: { query: '退款没到账', route: null, evidence: [] } },
    { id: 'cp-2', label: 'Classified', state: 'route=complaint', snapshot: { query: '退款没到账', route: 'complaint', evidence: [] } },
    { id: 'cp-3', label: 'Retrieved', state: '0 evidence', snapshot: { query: '退款没到账', route: 'complaint', evidence: [] } },
  ];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Checkpoint Time Travel</b><small>Replay 原状态，Fork 修改后的反事实状态</small></div><div><button class="lg-secondary" data-replay>Replay</button><button class="lg-primary" data-fork>Fork as refund</button></div></div><div data-tree></div><div class="lg-grid compact"><section><div class="lg-branch-results"><article><span>ORIGINAL</span><b data-original>—</b><small>complaint → no evidence</small></article><article><span>FORK</span><b data-fork-result>—</b><small>refund → retrieve → answer</small></article></div></section><aside><label class="lg-check"><input type="checkbox" data-audit> 保存 parent checkpoint、state diff 和新 branch ID</label><div class="lg-result" data-result>选择 cp-2 后分别 Replay 与 Fork。</div></aside></div>${teachingNotice()}</div>`;
  const tree = mountCheckpointForkTree(q(root, '[data-tree]'), checkpoints);
  const result = q(root, '[data-result]');
  let replayed = false;
  let forked = false;
  q(root, '[data-replay]').onclick = () => {
    const selected = tree.getSelected();
    if (!selected || selected.id !== 'cp-2') return setResult(result, 'warn', '请选择 cp-2 Classified checkpoint。');
    replayed = true;
    q(root, '[data-original]').textContent = 'no answer';
    setResult(result, 'warn', 'Replay 保留 route=complaint，后续重新执行但仍无证据。');
  };
  q(root, '[data-fork]').onclick = () => {
    const selected = tree.getSelected();
    if (!selected || selected.id !== 'cp-2') return setResult(result, 'warn', '请选择 cp-2 Classified checkpoint。');
    forked = true;
    q(root, '[data-fork-result]').textContent = '3–5 days';
    if (!replayed || !q(root, '[data-audit]').checked) return setResult(result, 'warn', '先 Replay 原分支，并保存 Fork 审计信息。');
    const artifact = saveArtifact(artifacts, 'timeTravelDebugPlan', { checkpoint: 'cp-2', replay: true, fork: { update: { route: 'refund' }, result: '3–5 days' }, audit: true }, config);
    setResult(result, 'good', '✓ 原分支已复现，新分支通过修改 State 探索反事实路径。');
    complete(artifact);
  };
}

export function mountStreamingUi({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const events = [
    { id: 'classify', label: 'classify node 写 route', answer: 'updates' },
    { id: 'token', label: 'generate node 输出 token', answer: 'messages' },
    { id: 'progress', label: '3 个检索源完成 2 个', answer: 'custom' },
    { id: 'snapshot', label: '审批前完整 State', answer: 'values' },
    { id: 'diagnostic', label: 'checkpoint 与 task 调试信息', answer: 'debug' },
  ];
  const modes = ['values', 'updates', 'messages', 'custom', 'debug'];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Node Streaming 前端路由器</b><small>把执行状态、Token 和业务进度送到不同 UI</small></div><button class="lg-primary" data-check>运行前端映射</button></div><div class="lg-grid"><section><table class="lg-table"><thead><tr><th>事件</th><th>Stream mode</th></tr></thead><tbody>${events.map((item) => `<tr data-row="${item.id}"><td><b>${item.label}</b></td><td><select data-mode="${item.id}"><option value="">选择...</option>${modes.map((mode) => `<option value="${mode}">${mode}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table><label class="lg-check"><input type="checkbox" data-status> UI 区分 pending/running/interrupted/error/completed</label><label class="lg-check"><input type="checkbox" data-dedupe> 按 run_id + node 去重</label></section><aside><div class="lg-node-cards"><article data-ui="classify"><span>CLASSIFY</span><b>pending</b></article><article data-ui="retrieve"><span>RETRIEVE</span><b>pending</b></article><article data-ui="generate"><span>GENERATE</span><b>pending</b></article></div><div class="lg-result" data-result>完成事件路由。</div></aside></div>${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-check]').onclick = () => {
    let correct = 0;
    const mapping = {};
    events.forEach((item) => {
      const value = q(root, `[data-mode="${item.id}"]`).value;
      mapping[item.id] = value;
      const ok = value === item.answer;
      root.querySelector(`[data-row="${item.id}"]`).className = ok ? 'pass' : 'fail';
      if (ok) correct += 1;
    });
    const guards = q(root, '[data-status]').checked && q(root, '[data-dedupe]').checked;
    if (correct !== events.length || !guards) return setResult(result, 'warn', `路由 ${correct}/${events.length} 正确。还要区分节点状态并防止重复事件。`);
    root.querySelector('[data-ui="classify"] b').textContent = 'completed';
    root.querySelector('[data-ui="retrieve"] b').textContent = '2/3 sources';
    root.querySelector('[data-ui="generate"] b').textContent = 'streaming tokens';
    const artifact = saveArtifact(artifacts, 'graphStreamingUiContract', { mapping, states: ['pending', 'running', 'interrupted', 'error', 'completed'], dedupe: true }, config);
    setResult(result, 'good', '✓ 图执行已经映射为节点级产品状态。');
    complete(artifact);
  };
}

export function mountMemoryScopes({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const memories = [
    { id: 'messages', label: '当前线程最近 8 条消息', answer: 'thread' },
    { id: 'order', label: '当前会话正在处理的订单号', answer: 'thread' },
    { id: 'language', label: '用户长期语言偏好', answer: 'user-store' },
    { id: 'terminology', label: '组织级术语表', answer: 'org-store' },
    { id: 'tool', label: '本次工具临时结果', answer: 'thread' },
    { id: 'public', label: '所有租户共用公开政策', answer: 'app-store' },
  ];
  const choices = [['thread', 'Thread State / Checkpointer'], ['user-store', '[userId, preferences]'], ['org-store', '[orgId, terminology]'], ['app-store', '[app, public]']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Memory Scope 分配台</b><small>生命周期和隔离决定存储位置</small></div><button class="lg-primary" data-save>保存 Memory Policy</button></div><table class="lg-table"><thead><tr><th>信息</th><th>Scope</th></tr></thead><tbody>${memories.map((item) => `<tr data-row="${item.id}"><td><b>${item.label}</b></td><td><select data-choice="${item.id}"><option value="">选择...</option>${choices.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table><div class="lg-grid compact"><section><label class="lg-check"><input type="checkbox" data-trim> Thread messages 配置 trim/summarize</label><label class="lg-check"><input type="checkbox" data-delete> 长期记忆支持查看、过期和删除</label><label class="lg-check"><input type="checkbox" data-db> 生产使用持久化 Checkpointer/Store</label></section><aside><div class="lg-result" data-result>把不同生命周期的信息放入正确 Scope。</div></aside></div>${artifactChips(artifacts, ['checkpointThreadContract'])}${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-save]').onclick = () => {
    let correct = 0;
    const scopes = {};
    memories.forEach((item) => {
      const value = q(root, `[data-choice="${item.id}"]`).value;
      scopes[item.id] = value;
      const ok = value === item.answer;
      root.querySelector(`[data-row="${item.id}"]`).className = ok ? 'pass' : 'fail';
      if (ok) correct += 1;
    });
    const controls = ['trim', 'delete', 'db'].every((id) => q(root, `[data-${id}]`).checked);
    if (correct !== memories.length || !controls) return setResult(result, 'warn', `Scope ${correct}/${memories.length} 正确。还要配置上下文压缩、记忆删除和持久化实现。`);
    const artifact = saveArtifact(artifacts, 'memoryScopePolicy', { scopes, threadPolicy: 'summarize+recent', persistent: true, deletion: true }, config);
    setResult(result, 'good', '✓ Thread State 与跨线程 Store 已按生命周期和租户边界分离。');
    complete(artifact);
  };
}

export const langGraphExecutionSimulators = {
  'lg-api-choice': mountApiChoice,
  'lg-durable-execution': mountDurableExecution,
  'lg-checkpoint-thread': mountCheckpointThread,
  'lg-interrupt-hitl': mountInterruptHitl,
  'lg-time-travel': mountTimeTravel,
  'lg-streaming-ui': mountStreamingUi,
  'lg-memory-scopes': mountMemoryScopes,
};
