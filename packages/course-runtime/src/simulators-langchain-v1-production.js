function once(callback) {
  let done = false;
  return (detail) => {
    if (done) return;
    done = true;
    callback?.(detail);
  };
}

function setResult(element, state, text) {
  element.className = `v1-result ${state}`;
  element.textContent = text;
}

export function mountThreadMemoryLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  let active = 'thread-a';
  let persisted = {};
  let runtimeState = {};

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>Thread Memory 与 Checkpointer 实验</b><small>短期记忆是线程级 State 持久化，不是一个共享聊天数组</small></div><div><button class="v1-secondary" data-restart type="button">模拟服务重启</button><button class="v1-primary" data-verify type="button">验证恢复</button></div></div>
      <div class="v1-grid"><section>
        <div class="v1-row"><label><input type="checkbox" data-checkpointer> 启用 Checkpointer</label><label><input type="checkbox" data-isolate> 为每个会话使用独立 thread_id</label></div>
        <span class="v1-label">上下文过长策略</span><select class="v1-select" data-policy><option value="none">无限追加</option><option value="trim">保留最近消息并 trim</option><option value="summarize">摘要旧消息并保留最近消息</option></select>
        <span class="v1-label">切换会话线程</span><div class="v1-thread-tabs"><button class="active" data-thread="thread-a" type="button">线程 A · Bob</button><button data-thread="thread-b" type="button">线程 B · Alice</button></div>
        <div class="v1-row"><button class="v1-secondary" data-write type="button">写入当前线程</button><button class="v1-secondary" data-read type="button">读取当前线程</button></div>
        <div class="v1-message-list" data-messages></div>
      </section><aside>
        <span class="v1-label">持久化快照</span><pre class="v1-code" data-state>{}</pre>
        <div class="v1-result" data-result>请分别写入两个线程，模拟重启，再验证隔离恢复。</div>
      </aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  function threadKey(id) {
    return root.querySelector('[data-isolate]').checked ? id : 'shared-thread';
  }
  function render() {
    const key = threadKey(active);
    const messages = runtimeState[key]?.messages ?? [];
    root.querySelector('[data-messages]').innerHTML = messages.length
      ? messages.map((message) => `<article><b>${message.role}</b><p>${message.content}</p></article>`).join('')
      : '<article><p>当前线程没有运行时消息。</p></article>';
    root.querySelector('[data-state]').textContent = JSON.stringify(persisted, null, 2);
  }
  root.querySelectorAll('[data-thread]').forEach((button) => button.addEventListener('click', () => {
    active = button.dataset.thread;
    root.querySelectorAll('[data-thread]').forEach((item) => item.classList.toggle('active', item === button));
    render();
  }));
  root.querySelector('[data-write]').addEventListener('click', () => {
    const key = threadKey(active);
    const name = active === 'thread-a' ? 'Bob' : 'Alice';
    const history = [
      { role: 'user', content: `你好，我是 ${name}` },
      { role: 'assistant', content: `记住了，你是 ${name}` },
      { role: 'user', content: '请继续查询退款进度' },
    ];
    const policy = root.querySelector('[data-policy]').value;
    const messages = policy === 'summarize'
      ? [{ role: 'system', content: `摘要：用户姓名 ${name}，正在查询退款。` }, history.at(-1)]
      : policy === 'trim'
        ? history.slice(-2)
        : [...history, ...history, ...history];
    runtimeState[key] = { messages, owner: name };
    if (root.querySelector('[data-checkpointer]').checked) persisted[key] = structuredClone(runtimeState[key]);
    render();
    setResult(result, 'warn', `已写入 ${active}。请切换线程并写入另一位用户。`);
  });
  root.querySelector('[data-read]').addEventListener('click', () => {
    render();
    const key = threadKey(active);
    setResult(result, runtimeState[key] ? 'good' : 'warn', runtimeState[key] ? `读取到 ${runtimeState[key].owner} 的线程状态。` : '当前运行时没有该线程状态。');
  });
  root.querySelector('[data-restart]').addEventListener('click', () => {
    runtimeState = {};
    render();
    setResult(result, 'warn', '运行时内存已清空。现在从 Checkpointer 恢复。');
  });
  root.querySelector('[data-verify]').addEventListener('click', () => {
    const checkpointer = root.querySelector('[data-checkpointer]').checked;
    const isolate = root.querySelector('[data-isolate]').checked;
    const policy = root.querySelector('[data-policy]').value;
    if (!checkpointer) {
      setResult(result, 'warn', '未启用 Checkpointer，服务重启后无法恢复 State。');
      return;
    }
    if (!isolate) {
      setResult(result, 'warn', '两个用户正在共享同一个 thread_id，状态会串线。');
      return;
    }
    if (policy === 'none') {
      setResult(result, 'warn', '上下文无限追加会持续增长。请选择 trim 或 summarization。');
      return;
    }
    if (!persisted['thread-a'] || !persisted['thread-b']) {
      setResult(result, 'warn', '请先分别写入线程 A 和线程 B，再模拟恢复。');
      return;
    }
    runtimeState = structuredClone(persisted);
    const isolated = runtimeState['thread-a'].owner === 'Bob' && runtimeState['thread-b'].owner === 'Alice';
    if (!isolated) {
      setResult(result, 'bad', '恢复后线程身份不正确。');
      return;
    }
    render();
    const artifact = {
      checkpointer: 'database-backed-in-production',
      threadIdIsolation: true,
      contextPolicy: policy,
      recoveredThreads: ['thread-a', 'thread-b'],
    };
    artifacts.set('memoryPolicy', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ 两个线程在模拟重启后独立恢复，并配置了上下文压缩策略。');
    complete(artifact);
  });
  render();
}

export function mountReliabilityChaosLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { name: '模型 API 返回 429', answer: 'model-retry', reason: '使用 Model Retry，限制次数并指数退避。' },
    { name: '主模型持续返回 503', answer: 'fallback', reason: '有限重试后切换备用模型。' },
    { name: '外部工具偶发 TimeoutError', answer: 'tool-retry', reason: '对可恢复工具异常使用 Tool Retry。' },
    { name: 'Zod Schema 参数确定性错误', answer: 'fix', reason: '修复输入或 Schema，不盲目重试。' },
    { name: 'Agent 连续调用工具超过预算', answer: 'limit', reason: '使用 Tool/Model Call Limit 终止失控执行。' },
  ];
  const policies = [
    ['model-retry', 'Model Retry'], ['tool-retry', 'Tool Retry'], ['fallback', 'Model Fallback'],
    ['fix', '直接修复输入/策略'], ['limit', 'Call Limit'], ['forever', '无限重试'],
  ];

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>可靠性故障注入台</b><small>错误分类决定 retry、fallback、修复还是终止</small></div><button class="v1-primary" data-check type="button">运行故障演练</button></div>
      <div class="v1-grid"><section>
        <div class="v1-table-wrap"><table class="v1-table"><thead><tr><th>故障</th><th>恢复策略</th><th>解释</th></tr></thead><tbody>${scenarios.map((scenario, index) => `<tr data-row="${index}"><td><b>${scenario.name}</b></td><td><select class="v1-select" data-policy="${index}"><option value="">请选择</option>${policies.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-reason="${index}">等待</td></tr>`).join('')}</tbody></table></div>
      </section><aside>
        <span class="v1-label">Retry 参数</span>
        <div class="v1-checklist"><label><input type="checkbox" data-backoff> 指数退避</label><label><input type="checkbox" data-jitter> jitter 防止惊群</label><label><input type="checkbox" data-observe> 记录重试、fallback 与最终失败</label></div>
        <label class="v1-label">最大重试 <b data-retries-label>2</b></label><input type="range" min="0" max="6" value="2" data-retries>
        <div class="v1-result" data-result>请为五类故障选择不同的恢复动作。</div>
      </aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  root.querySelector('[data-retries]').addEventListener('input', (event) => {
    root.querySelector('[data-retries-label]').textContent = event.target.value;
  });
  root.querySelector('[data-check]').addEventListener('click', () => {
    let correct = 0;
    scenarios.forEach((scenario, index) => {
      const selected = root.querySelector(`[data-policy="${index}"]`).value;
      const ok = selected === scenario.answer;
      root.querySelector(`[data-row="${index}"]`).className = ok ? 'pass' : 'fail';
      root.querySelector(`[data-reason="${index}"]`).textContent = ok ? scenario.reason : '策略不匹配';
      if (ok) correct += 1;
    });
    const parameters = ['backoff', 'jitter', 'observe'].every((name) => root.querySelector(`[data-${name}]`).checked);
    const retries = Number(root.querySelector('[data-retries]').value);
    if (correct !== scenarios.length || !parameters || retries < 1 || retries > 4) {
      setResult(result, 'warn', `故障分类 ${correct}/${scenarios.length}。可靠 Retry 还需要有限次数、指数退避、jitter 和可观察记录。`);
      return;
    }
    const artifact = {
      modelRetry: { maxRetries: retries, backoffFactor: 2, jitter: true, retryOn: ['429', 'transient-network'] },
      toolRetry: { maxRetries: retries, retryOn: ['TimeoutError'], onFailure: 'continue-as-ToolMessage' },
      fallback: ['primary-model', 'backup-model'],
      callLimits: true,
      deterministicErrorsRetried: false,
    };
    artifacts.set('reliabilityPolicy', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ 瞬时错误、供应商故障、确定性错误和失控调用已经使用不同恢复策略。');
    complete(artifact);
  });
}

export function mountGuardrailHitlLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const cases = [
    { title: '输入中包含客户邮箱 bob@example.com', kind: 'pii', answer: 'redact', prompt: '选择 PII 处理策略' },
    { title: '模型请求 delete_records({ before: "2025-01-01" })', kind: 'delete', answer: 'reject', prompt: '选择人工决策' },
    { title: '模型请求 create_refund({ amount: 1000 })，审批人只同意 100', kind: 'refund', answer: 'edit', prompt: '选择人工决策' },
    { title: '模型请求 send_email，内容已审核且收件人正确', kind: 'email', answer: 'approve', prompt: '选择人工决策' },
  ];
  const options = {
    pii: [['none', '不处理'], ['redact', 'redact'], ['log', '原文写入日志']],
    delete: [['approve', 'approve'], ['reject', 'reject'], ['respond', 'respond']],
    refund: [['approve', 'approve 原参数'], ['edit', 'edit 参数后继续'], ['reject', 'reject']],
    email: [['approve', 'approve'], ['edit', 'edit'], ['reject', 'reject']],
  };
  let index = 0;
  const decisions = [];

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>Guardrails 与 Human-in-the-loop 审批台</b><small>内容检查和动作审批解决不同风险</small></div><button class="v1-primary" data-apply type="button">应用当前决策</button></div>
      <div class="v1-grid"><section>
        <span class="v1-label">案例 <b data-index>1</b>/4</span><div class="v1-card"><b data-case></b><small data-prompt></small></div>
        <div class="v1-card-list" data-options></div>
      </section><aside>
        <div class="v1-pipeline"><span>model</span><i>→</i><span>after_model policy</span><i>→</i><span>interrupt</span><i>→</i><span>human decision</span><i>→</i><span>resume</span></div>
        <div class="v1-trace" data-trace></div>
        <div class="v1-result" data-result>按顺序处理 PII、删除、退款编辑和邮件批准。</div>
      </aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  function render() {
    const current = cases[index];
    root.querySelector('[data-index]').textContent = index + 1;
    root.querySelector('[data-case]').textContent = current.title;
    root.querySelector('[data-prompt]').textContent = current.prompt;
    root.querySelector('[data-options]').innerHTML = options[current.kind].map(([value, label]) => `<label class="v1-card"><input type="radio" name="decision" value="${value}"> <b>${label}</b></label>`).join('');
  }
  root.querySelector('[data-apply]').addEventListener('click', () => {
    const selected = root.querySelector('input[name="decision"]:checked')?.value;
    const current = cases[index];
    if (!selected) {
      setResult(result, 'warn', '先选择一个处理策略。');
      return;
    }
    if (selected !== current.answer) {
      const hints = {
        pii: '客户邮箱不应原样进入模型或日志，本场景使用 redact。',
        delete: '删除历史记录属于高风险操作，本场景应 reject。',
        refund: '审批人修改了金额，应使用 edit，而不是 approve 原参数。',
        email: '内容和收件人已审核，可 approve。',
      };
      setResult(result, 'warn', hints[current.kind]);
      return;
    }
    decisions.push({ kind: current.kind, decision: selected });
    root.querySelector('[data-trace]').insertAdjacentHTML('beforeend', `<article class="good"><span>${String(index + 1).padStart(2, '0')}</span><b>${current.kind}</b><p>${selected}</p></article>`);
    if (index < cases.length - 1) {
      index += 1;
      render();
      setResult(result, 'good', '✓ 当前风险已处理。继续下一项。');
      return;
    }
    const artifact = {
      pii: { email: 'redact', appliesToInput: true },
      promptInjectionGuard: true,
      hitl: {
        protectedTools: ['delete_records', 'create_refund', 'send_email'],
        decisions: ['approve', 'edit', 'reject', 'respond'],
        persistenceRequired: true,
      },
      decisions,
    };
    artifacts.set('safetyAndApprovalPolicy', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ Guardrails 已处理敏感内容，HITL 已在工具执行前完成暂停、决策和恢复。');
    complete(artifact);
  });
  render();
}

export function mountTraceReleaseLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const runs = [
    { id: 'run-agent', type: 'agent', name: 'customer-service-agent', status: 'error', latency: 2410, detail: '最终回答：未找到订单' },
    { id: 'run-model-1', type: 'model', name: 'model / decision', status: 'ok', latency: 810, detail: '正确选择 lookup_refund' },
    { id: 'run-mw', type: 'middleware', name: 'beforeModel / tenant context', status: 'error', latency: 3, detail: 'tenant_id 缺失' },
    { id: 'run-tool', type: 'tool', name: 'lookup_refund', status: 'error', latency: 1190, detail: '查询使用默认租户，订单不存在' },
    { id: 'run-model-2', type: 'model', name: 'model / final answer', status: 'ok', latency: 402, detail: '根据 ToolMessage 生成错误结论' },
  ];
  let selectedRun = null;

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>LangSmith Trace 调试器与发布清单</b><small>从最终错误深入到具体 Run、版本与上下文</small></div><button class="v1-primary" data-release type="button">完成发布审查</button></div>
      <div class="v1-grid"><section>
        <span class="v1-label">失败 Trace</span><div class="v1-trace">${runs.map((run, index) => `<article class="${run.status === 'error' ? 'error' : ''}" data-run="${run.id}"><span>${String(index + 1).padStart(2, '0')}</span><b>${run.name}</b><p>${run.type} · ${run.latency}ms · ${run.detail}</p></article>`).join('')}</div>
        <span class="v1-label">选择根因</span><select class="v1-select" data-cause><option value="">请选择</option><option value="model">模型选择错工具</option><option value="tool-context">Middleware 未注入 tenant_id，导致工具查错租户</option><option value="prompt">System Prompt 太短</option><option value="ui">前端渲染错误</option></select>
      </section><aside>
        <span class="v1-label">生产发布清单</span><div class="v1-checklist">
          <label><input type="checkbox" data-item="trace"> 启用 LANGSMITH_TRACING 并隔离项目</label>
          <label><input type="checkbox" data-item="metadata"> Trace 写入 prompt/model/app version metadata</label>
          <label><input type="checkbox" data-item="dataset"> 保留回归 Dataset 与离线评估</label>
          <label><input type="checkbox" data-item="reliability"> Retry、fallback、call limit 已配置</label>
          <label><input type="checkbox" data-item="safety"> Guardrails 与 HITL 已覆盖高风险工具</label>
          <label><input type="checkbox" data-item="rollback"> 保留可回退版本和告警</label>
        </div>
        <div class="v1-result" data-result>点击错误 Run，选择根因，再完成发布清单。</div>
      </aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  root.querySelectorAll('[data-run]').forEach((element) => element.addEventListener('click', () => {
    selectedRun = element.dataset.run;
    root.querySelectorAll('[data-run]').forEach((item) => item.classList.toggle('good', item === element));
    const run = runs.find((item) => item.id === selectedRun);
    setResult(result, run.status === 'error' ? 'warn' : '', `已选择 ${run.name}：${run.detail}`);
  }));
  root.querySelector('[data-release]').addEventListener('click', () => {
    const cause = root.querySelector('[data-cause]').value;
    const checklist = [...root.querySelectorAll('[data-item]')];
    const completed = checklist.every((item) => item.checked);
    if (!['run-mw', 'run-tool'].includes(selectedRun)) {
      setResult(result, 'warn', '请进入真正的失败 Run，而不是只选择根 Trace 或成功的模型 Run。');
      return;
    }
    if (cause !== 'tool-context') {
      setResult(result, 'warn', '模型正确选择了查询工具；根因是 tenant context 未注入，工具查询了错误租户。');
      return;
    }
    if (!completed) {
      setResult(result, 'warn', '根因已定位，但生产发布清单还没有完成。');
      return;
    }
    const artifact = {
      tracing: { enabled: true, projectIsolation: true, metadata: ['prompt_version', 'model_version', 'app_version', 'tenant'] },
      rootCause: { run: selectedRun, category: 'missing-runtime-context' },
      evaluation: { dataset: true, regression: true },
      reliability: true,
      guardrailsAndHitl: true,
      rollback: true,
      officialVersion: 'langchain@1.5.3',
    };
    artifacts.set('langchainProductionBlueprint', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ 已从 Trace 定位到具体 Middleware/Tool Run，并完成版本、评估、可靠性、安全与回退审查。');
    complete(artifact);
  });
}

export const langChainV1ProductionSimulators = {
  'thread-memory-lab': mountThreadMemoryLab,
  'reliability-chaos-lab': mountReliabilityChaosLab,
  'guardrail-hitl-lab': mountGuardrailHitlLab,
  'trace-release-lab': mountTraceReleaseLab,
};
