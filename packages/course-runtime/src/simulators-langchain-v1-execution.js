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

export function mountEventStreamRouter({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const events = [
    { label: 'LLM token: “退款”', answer: 'messages', reason: 'messages 提供 token 与 metadata' },
    { label: 'model node 完成本轮状态更新', answer: 'updates', reason: 'updates 提供 Agent step 后的状态变化' },
    { label: '业务进度：已查询 10/100 条', answer: 'custom', reason: 'custom 承载应用自定义进度' },
    { label: 'tool_call.started', answer: 'events', reason: 'Event Streaming v3 提供类型化工具生命周期投影' },
    { label: 'tool_call.completed', answer: 'events', reason: 'Event Streaming v3 可直接映射工具完成状态' },
    { label: '最终 AIMessage 与 structuredResponse', answer: 'events', reason: '应用层可使用 typed projections 聚合最终状态' },
  ];
  const channels = [
    ['messages', 'messages'], ['updates', 'updates'], ['custom', 'custom'], ['events', 'streamEvents v3'],
  ];

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>多通道事件路由控制台</b><small>Streaming 是 UI 状态协议，不只是逐字输出</small></div><button class="v1-primary" data-check type="button">检查事件路由</button></div>
      <div class="v1-grid"><section>
        <div class="v1-table-wrap"><table class="v1-table"><thead><tr><th>运行事件</th><th>送往通道</th><th>状态</th></tr></thead><tbody>
          ${events.map((event, index) => `<tr data-row="${index}"><td><b>${event.label}</b></td><td><select class="v1-select" data-route="${index}"><option value="">请选择</option>${channels.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-state="${index}">等待</td></tr>`).join('')}
        </tbody></table></div>
      </section><aside>
        <span class="v1-label">前端状态保护</span>
        <div class="v1-checklist">
          <label><input type="checkbox" data-cancel> 支持取消并保留已接收内容</label>
          <label><input type="checkbox" data-dedupe> 根据 run/event 标识避免重复渲染</label>
          <label><input type="checkbox" data-partial> 区分 partial、completed 与 error</label>
        </div>
        <div class="v1-result" data-result>先完成事件路由和三个 UI 状态保护。</div>
      </aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  root.querySelector('[data-check]').addEventListener('click', () => {
    let correct = 0;
    events.forEach((event, index) => {
      const selected = root.querySelector(`[data-route="${index}"]`).value;
      const ok = selected === event.answer;
      const row = root.querySelector(`[data-row="${index}"]`);
      row.className = ok ? 'pass' : 'fail';
      root.querySelector(`[data-state="${index}"]`).textContent = ok ? event.reason : '通道不匹配';
      if (ok) correct += 1;
    });
    const guards = ['cancel', 'dedupe', 'partial'].every((name) => root.querySelector(`[data-${name}]`).checked);
    if (correct !== events.length || !guards) {
      setResult(result, 'warn', `事件路由 ${correct}/${events.length}；UI 状态保护 ${guards ? '已完成' : '未完成'}。token、节点更新和业务进度不要混在同一字符串里。`);
      return;
    }
    const artifact = {
      streamModes: ['messages', 'updates', 'custom'],
      eventStreaming: { version: 'v3', typedProjections: true },
      uiStates: ['partial', 'cancelled', 'completed', 'error'],
      deduplicateByRunId: true,
    };
    artifacts.set('eventStreamingContract', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ token、Agent step、业务进度和工具生命周期已经进入各自的 UI 通道。');
    complete(artifact);
  });
}

export function mountRuntimeToolLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const tools = [
    { id: 'lookup_refund', label: '查询退款状态', risk: '只读', checked: true },
    { id: 'create_refund', label: '创建退款', risk: '写操作', checked: true },
    { id: 'delete_order', label: '删除订单', risk: '高风险', checked: false },
  ];

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>Tool Schema、最小权限与 Runtime Context</b><small>可信身份由应用注入，不允许模型自由生成</small></div><button class="v1-primary" data-run type="button">运行工具调用</button></div>
      <div class="v1-grid"><section>
        <span class="v1-label">本次向模型开放的工具</span>
        <div class="v1-card-list">${tools.map((tool) => `<label class="v1-card"><input type="checkbox" data-tool="${tool.id}" ${tool.checked ? 'checked' : ''}> <b>${tool.label}</b><small>${tool.risk}</small></label>`).join('')}</div>
        <span class="v1-label">Zod 参数字段</span>
        <select class="v1-select" data-schema><option value="orderId">orderId: string</option><option value="order_id">order_id: string</option><option value="tenant">tenant_id: string（让模型填写）</option></select>
        <span class="v1-label">Runtime Context 注入</span>
        <div class="v1-row"><label><input type="checkbox" data-context="user"> user_id</label><label><input type="checkbox" data-context="tenant"> tenant_id</label><label><input type="checkbox" data-context="db"> database client</label></div>
        <span class="v1-label">工具失败如何回传</span>
        <select class="v1-select" data-error><option value="throw">直接丢失上下文并抛异常</option><option value="toolmessage">返回可恢复 ToolMessage</option></select>
      </section><aside>
        <pre class="v1-code" data-code>tool(async ({ order_id }, runtime) =&gt; {
  // runtime.context.tenant_id
  // lookup refund status
}, { schema: z.object({ ... }) })</pre>
        <div class="v1-result" data-result>默认开放了无关写工具，Schema 与可信上下文也未完成。</div>
      </aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  root.querySelector('[data-run]').addEventListener('click', () => {
    const enabled = [...root.querySelectorAll('[data-tool]:checked')].map((item) => item.dataset.tool);
    const schema = root.querySelector('[data-schema]').value;
    const contexts = [...root.querySelectorAll('[data-context]:checked')].map((item) => item.dataset.context);
    const errorMode = root.querySelector('[data-error]').value;
    const leastPrivilege = enabled.length === 1 && enabled[0] === 'lookup_refund';
    const contextReady = ['user', 'tenant', 'db'].every((name) => contexts.includes(name));

    if (!leastPrivilege) {
      setResult(result, 'warn', '查询任务只应开放 lookup_refund。无关写工具会扩大误调用和越权风险。');
      return;
    }
    if (schema !== 'order_id') {
      setResult(result, 'warn', '工具函数要求 order_id。tenant_id 不能作为模型自由填写的参数。');
      return;
    }
    if (!contextReady) {
      setResult(result, 'warn', '请从 Runtime Context 注入 user_id、tenant_id 和 database client。');
      return;
    }
    if (errorMode !== 'toolmessage') {
      setResult(result, 'warn', '可恢复工具失败应以 ToolMessage 进入 Agent 上下文，而不是丢失调用链。');
      return;
    }

    const artifact = {
      tools: [{ name: 'lookup_refund', risk: 'read', schema: { order_id: 'string' } }],
      runtimeContext: ['user_id', 'tenant_id', 'database_client'],
      toolResult: 'ToolMessage',
      leastPrivilege: true,
    };
    artifacts.set('runtimeToolRegistry', artifact, { lessonId: config.lessonId });
    root.querySelector('[data-code]').textContent = `HumanMessage\n→ AIMessage.tool_calls[lookup_refund]\n→ Zod parse({ order_id })\n→ runtime.context.tenant_id\n→ ToolMessage(status)\n→ AIMessage(final)`;
    setResult(result, 'good', '✓ 工具参数、可信上下文、最小权限和错误回传已经形成完整边界。');
    complete(artifact);
  });
}

export function mountAgentStateLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const states = [
    { node: 'input', title: '写入 HumanMessage', detail: 'messages 增加用户问题；caseId 写入 custom state。' },
    { node: 'model', title: 'Model Node 生成 tool call', detail: 'AIMessage.tool_calls 请求 lookup_refund。' },
    { node: 'tools', title: 'Tools Node 执行查询', detail: '读取 Runtime Context 并生成 ToolMessage。' },
    { node: 'model', title: 'Model Node 读取观察结果', detail: 'messages 增加最终 AIMessage；structuredResponse 写入状态。' },
    { node: 'end', title: '满足停止条件', detail: '模型不再请求工具，Agent 返回最终 State。' },
  ];
  let index = 0;
  let trace = [];

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>createAgent State 单步执行器</b><small>观察 model node、tools node 和 State 更新</small></div><div><button class="v1-secondary" data-reset type="button">重置</button><button class="v1-secondary" data-auto type="button">自动运行</button><button class="v1-primary" data-step type="button">下一步</button></div></div>
      <div class="v1-grid"><section>
        <div class="v1-row"><label>最大迭代 <input type="range" min="1" max="6" value="4" data-limit><b data-limit-label>4</b></label><label><input type="checkbox" data-final checked> 模型最终输出时停止</label><label><input type="checkbox" data-context checked> 注入 Runtime Context</label><label><input type="checkbox" data-custom checked> 保存 custom state.caseId</label></div>
        <div class="v1-trace" data-trace></div>
      </section><aside>
        <span class="v1-label">当前 Agent State</span><pre class="v1-code" data-state>{ messages: [], caseId: null }</pre>
        <div class="v1-result" data-result>先单步观察一次完整 model → tools → model 循环。</div>
      </aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  const traceRoot = root.querySelector('[data-trace]');
  function renderState() {
    const state = {
      messages: trace.map((item) => item.node),
      caseId: root.querySelector('[data-custom]').checked ? 'CASE-2026-071' : null,
      context: root.querySelector('[data-context]').checked ? { tenant_id: 'hotel-001' } : null,
      structuredResponse: index >= 4 ? { intent: 'refund_query', status: 'processing' } : null,
    };
    root.querySelector('[data-state]').textContent = JSON.stringify(state, null, 2);
  }
  function reset() {
    index = 0;
    trace = [];
    traceRoot.innerHTML = '';
    renderState();
    setResult(result, '', '先单步观察一次完整 model → tools → model 循环。');
  }
  function step() {
    const limit = Number(root.querySelector('[data-limit]').value);
    const stopOnFinal = root.querySelector('[data-final]').checked;
    const contextReady = root.querySelector('[data-context]').checked;
    const customReady = root.querySelector('[data-custom]').checked;

    if (!contextReady || !customReady) {
      setResult(result, 'warn', '请同时保留 Runtime Context 与 custom state，观察两者和 Messages State 的差异。');
      return false;
    }
    if (index >= limit) {
      setResult(result, 'warn', '达到最大迭代上限。当前配置不足以完成一次工具循环。');
      return false;
    }
    if (index >= states.length) return false;
    const state = states[index];
    trace.push(state);
    traceRoot.insertAdjacentHTML('beforeend', `<article class="${state.node === 'end' ? 'good' : ''}"><span>${String(index + 1).padStart(2, '0')}</span><b>${state.title}</b><p>${state.detail}</p></article>`);
    index += 1;
    renderState();

    if (state.node === 'end') {
      if (!stopOnFinal) {
        setResult(result, 'warn', '模型已经给出最终输出，但停止条件被关闭，Agent 可能继续无意义循环。');
        return false;
      }
      const artifact = {
        createAgent: true,
        state: ['messages', 'caseId', 'structuredResponse'],
        runtimeContext: ['tenant_id'],
        nodes: ['model', 'tools'],
        stopConditions: ['final_output', 'iteration_limit'],
        trace,
      };
      artifacts.set('agentStateContract', artifact, { lessonId: config.lessonId });
      setResult(result, 'good', '✓ Agent 已在最终输出时停止，并保留 Messages、custom state、context 与 structuredResponse。');
      complete(artifact);
      return false;
    }
    return true;
  }
  root.querySelector('[data-limit]').addEventListener('input', (event) => {
    root.querySelector('[data-limit-label]').textContent = event.target.value;
  });
  root.querySelector('[data-step]').addEventListener('click', step);
  root.querySelector('[data-reset]').addEventListener('click', reset);
  root.querySelector('[data-auto]').addEventListener('click', () => {
    let guard = 0;
    while (step() && guard < 10) guard += 1;
  });
  reset();
}

export function mountMiddlewareHookLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const expected = ['beforeAgent', 'beforeModel', 'wrapModelCall', 'afterModel', 'wrapToolCall', 'afterAgent'];
  let hooks = ['wrapToolCall', 'beforeAgent', 'afterAgent', 'beforeModel', 'afterModel', 'wrapModelCall'];

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>Middleware Hook 流水线</b><small>把动态控制放进正确的调用边界</small></div><button class="v1-primary" data-check type="button">运行 Middleware</button></div>
      <div class="v1-grid"><section>
        <span class="v1-label">调整 Hook 顺序</span><div class="v1-card-list" data-hooks></div>
      </section><aside>
        <span class="v1-label">本次需要的上下文工程能力</span>
        <div class="v1-checklist">
          <label><input type="checkbox" data-cap="prompt"> 根据租户动态生成 System Prompt</label>
          <label><input type="checkbox" data-cap="model"> 根据用户等级动态选择模型</label>
          <label><input type="checkbox" data-cap="tools"> 根据权限过滤工具</label>
          <label><input type="checkbox" data-cap="guard"> 在模型和工具结果后执行校验</label>
        </div>
        <div class="v1-result" data-result>当前 Hook 顺序故意打乱。调整后再运行。</div>
      </aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  function render() {
    root.querySelector('[data-hooks]').innerHTML = hooks.map((hook, index) => `
      <article class="v1-card"><b>${String(index + 1).padStart(2, '0')} · ${hook}</b><small>${hookDescription(hook)}</small><div class="v1-row"><button class="v1-secondary" data-up="${index}" type="button">上移</button><button class="v1-secondary" data-down="${index}" type="button">下移</button></div></article>
    `).join('');
    root.querySelectorAll('[data-up]').forEach((button) => button.addEventListener('click', () => move(Number(button.dataset.up), -1)));
    root.querySelectorAll('[data-down]').forEach((button) => button.addEventListener('click', () => move(Number(button.dataset.down), 1)));
  }
  function hookDescription(hook) {
    const map = {
      beforeAgent: '初始化一次 Agent 运行的上下文',
      beforeModel: '在每次模型调用前修改 Prompt/State',
      wrapModelCall: '动态模型、retry、fallback 与调用拦截',
      afterModel: '检查模型结果与 tool calls',
      wrapToolCall: '权限、额度、retry 与 ToolMessage 错误',
      afterAgent: '最终输出、审计与收尾',
    };
    return map[hook];
  }
  function move(index, delta) {
    const next = index + delta;
    if (next < 0 || next >= hooks.length) return;
    [hooks[index], hooks[next]] = [hooks[next], hooks[index]];
    render();
  }
  root.querySelector('[data-check]').addEventListener('click', () => {
    const orderCorrect = hooks.every((hook, index) => hook === expected[index]);
    const capabilities = ['prompt', 'model', 'tools', 'guard'].every((name) => root.querySelector(`[data-cap="${name}"]`).checked);
    if (!orderCorrect) {
      setResult(result, 'warn', 'Hook 顺序仍不合理。模型结果检查应在工具执行前，wrapToolCall 应包住真实工具边界。');
      return;
    }
    if (!capabilities) {
      setResult(result, 'warn', '请把动态 Prompt、模型路由、工具过滤和结果校验都分配给 Middleware。');
      return;
    }
    const artifact = {
      order: hooks,
      capabilities: {
        dynamicPrompt: 'beforeModel',
        dynamicModel: 'wrapModelCall',
        toolFiltering: 'beforeModel',
        toolGuard: 'wrapToolCall',
        outputGuard: 'afterModel',
      },
    };
    artifacts.set('middlewarePipeline', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ Middleware 已覆盖 Agent、模型和工具三个层级，并保持可解释执行顺序。');
    complete(artifact);
  });
  render();
}

export const langChainV1ExecutionSimulators = {
  'event-stream-router': mountEventStreamRouter,
  'runtime-tool-lab': mountRuntimeToolLab,
  'agent-state-lab': mountAgentStateLab,
  'middleware-hook-lab': mountMiddlewareHookLab,
};
