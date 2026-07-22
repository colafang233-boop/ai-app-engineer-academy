function once(callback) {
  let done = false;
  return (detail) => {
    if (done) return;
    done = true;
    callback?.(detail);
  };
}

function resultClass(element, state) {
  element.className = `lc-result ${state}`;
}

function mountModelInvocationLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const state = {
    provider: 'openai',
    inputMode: 'text',
    includeSystem: false,
    temperature: 0.2,
  };

  root.innerHTML = `
    <div class="lc-panel lc-model-lab">
      <div class="lc-toolbar">
        <div><b>模型调用适配台</b><small>同一份业务上下文，比较不同调用方式返回了什么</small></div>
        <button class="lc-primary" data-run type="button">发送给模型</button>
      </div>
      <div class="lc-model-grid">
        <section>
          <span class="lc-label">选择模型服务</span>
          <div class="lc-segmented">
            <button class="active" data-provider="openai" type="button">OpenAI</button>
            <button data-provider="anthropic" type="button">Anthropic</button>
          </div>
          <span class="lc-label">选择输入方式</span>
          <div class="lc-segmented">
            <button class="active" data-mode="text" type="button">直接传字符串</button>
            <button data-mode="messages" type="button">传入 Messages</button>
          </div>
          <label class="lc-check"><input type="checkbox" data-system> 带上已经验证过的系统规则</label>
          <label class="lc-range">Temperature <b data-temp-label>0.2</b><input type="range" min="0" max="1" step="0.1" value="0.2" data-temp></label>
          <div class="lc-request" data-request></div>
        </section>
        <aside>
          <div class="lc-response-head"><span>统一返回对象</span><b>AIMessage</b></div>
          <div class="lc-message-card" data-response>
            <span>等待调用</span>
            <p>运行后查看 text、usage metadata 和 response metadata。</p>
          </div>
          <div class="lc-result" data-result>先比较字符串输入和 Messages 输入。</div>
        </aside>
      </div>
    </div>`;

  const q = (selector) => root.querySelector(selector);

  function renderRequest() {
    const prompt = artifacts.get('promptV2')?.text ?? '判断邮件意图，并返回结构化结果。';
    const request = state.inputMode === 'messages'
      ? [
          ...(state.includeSystem ? [{ role: 'system', content: prompt }] : []),
          { role: 'user', content: '问了三次，退款为什么还没到账？' },
        ]
      : '问了三次，退款为什么还没到账？';

    q('[data-request]').innerHTML = state.inputMode === 'messages'
      ? `<b>messages</b><pre>${JSON.stringify(request, null, 2)}</pre>`
      : `<b>input</b><pre>${request}</pre>`;
    return request;
  }

  root.querySelectorAll('[data-provider]').forEach((button) => {
    button.addEventListener('click', () => {
      state.provider = button.dataset.provider;
      root.querySelectorAll('[data-provider]').forEach((item) => item.classList.toggle('active', item === button));
      renderRequest();
    });
  });

  root.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.inputMode = button.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach((item) => item.classList.toggle('active', item === button));
      renderRequest();
    });
  });

  q('[data-system]').addEventListener('change', (event) => {
    state.includeSystem = event.target.checked;
    renderRequest();
  });

  q('[data-temp]').addEventListener('input', (event) => {
    state.temperature = Number(event.target.value);
    q('[data-temp-label]').textContent = state.temperature.toFixed(1);
  });

  q('[data-run]').addEventListener('click', () => {
    const request = renderRequest();
    const valid = state.inputMode === 'messages' && state.includeSystem;
    q('[data-response]').innerHTML = `
      <span>${state.provider === 'openai' ? 'OpenAI' : 'Anthropic'} → LangChain 标准消息</span>
      <h4>${valid ? 'refund_query' : 'complaint'}</h4>
      <p>${valid ? '用户虽然表达不满，但核心任务是在查询退款到账进度。' : '缺少系统规则时，模型更容易被不满语气带偏。'}</p>
      <dl>
        <div><dt>text</dt><dd>${valid ? 'refund_query' : 'complaint'}</dd></div>
        <div><dt>input tokens</dt><dd>${state.inputMode === 'messages' ? 146 : 31}</dd></div>
        <div><dt>output tokens</dt><dd>42</dd></div>
        <div><dt>finish reason</dt><dd>stop</dd></div>
      </dl>`;

    if (!valid) {
      resultClass(q('[data-result]'), 'warn');
      q('[data-result]').textContent = '模型能回答，但缺少已经验证过的系统规则。切换到 Messages，并带上系统规则。';
      return;
    }

    const artifact = {
      provider: state.provider,
      model: state.provider === 'openai' ? 'openai:chat-model' : 'anthropic:chat-model',
      method: 'invoke',
      temperature: state.temperature,
      input: request,
      outputType: 'AIMessage',
      fieldsRead: ['text', 'usage_metadata', 'response_metadata'],
    };
    artifacts.set('modelInvocation', artifact, { lessonId: config.lessonId });
    resultClass(q('[data-result]'), 'good');
    q('[data-result]').textContent = '✓ 已完成一次标准模型调用。无论底层供应商是谁，应用都从 AIMessage 读取结果与元数据。';
    complete(artifact);
  });

  renderRequest();
}

function mountStreamingLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const chunks = ['退款', '正在处理中', '，预计', ' 3 个工作日', '内到账。'];
  let timer = null;
  let index = 0;
  let accumulated = '';
  let cancelledOnce = false;

  root.innerHTML = `
    <div class="lc-panel lc-stream-lab">
      <div class="lc-toolbar">
        <div><b>流式响应控制台</b><small>不要等完整答案返回后，才第一次让用户看到变化</small></div>
        <div><button class="lc-secondary" data-reset type="button">重新开始</button><button class="lc-secondary" data-cancel type="button">取消</button><button class="lc-primary" data-start type="button">开始接收</button></div>
      </div>
      <div class="lc-stream-grid">
        <section>
          <div class="lc-segmented">
            <button class="active" data-stream-mode="invoke" type="button">invoke()</button>
            <button data-stream-mode="stream" type="button">stream()</button>
          </div>
          <label class="lc-check"><input type="checkbox" data-merge> 将 AIMessageChunk 持续合并</label>
          <div class="lc-timeline" data-timeline></div>
        </section>
        <aside>
          <div class="lc-live-answer"><span data-state>尚未开始</span><p data-answer>完整答案会显示在这里。</p><i><em data-progress></em></i></div>
          <div class="lc-result" data-result>先比较 invoke 和 stream 的用户体验。</div>
        </aside>
      </div>
    </div>`;

  const q = (selector) => root.querySelector(selector);
  let mode = 'invoke';

  function clearTimer() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function reset() {
    clearTimer();
    index = 0;
    accumulated = '';
    q('[data-state]').textContent = '尚未开始';
    q('[data-answer]').textContent = '完整答案会显示在这里。';
    q('[data-progress]').style.width = '0%';
    q('[data-timeline]').innerHTML = '';
    resultClass(q('[data-result]'), '');
    q('[data-result]').textContent = '先比较 invoke 和 stream 的用户体验。';
  }

  root.querySelectorAll('[data-stream-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      mode = button.dataset.streamMode;
      root.querySelectorAll('[data-stream-mode]').forEach((item) => item.classList.toggle('active', item === button));
      reset();
    });
  });

  q('[data-start]').addEventListener('click', () => {
    reset();
    const merge = q('[data-merge]').checked;
    q('[data-state]').textContent = mode === 'stream' ? '正在接收 AIMessageChunk' : '等待完整 AIMessage';

    if (mode === 'invoke') {
      q('[data-progress]').style.width = '15%';
      timer = window.setTimeout(() => {
        q('[data-progress]').style.width = '100%';
        q('[data-answer]').textContent = chunks.join('');
        q('[data-state]').textContent = '完整响应已返回';
        resultClass(q('[data-result]'), 'warn');
        q('[data-result]').textContent = 'invoke() 没有错，但用户在完整答案返回前看不到任何内容。切换到 stream() 继续。';
      }, 900);
      return;
    }

    timer = window.setInterval(() => {
      const chunk = chunks[index];
      accumulated = merge ? accumulated + chunk : chunk;
      q('[data-answer]').textContent = accumulated;
      q('[data-timeline]').insertAdjacentHTML('beforeend', `<span><b>chunk ${index + 1}</b>${chunk}</span>`);
      index += 1;
      q('[data-progress]').style.width = `${Math.round(index / chunks.length * 100)}%`;

      if (index < chunks.length) return;
      clearTimer();
      q('[data-state]').textContent = '流式响应完成';
      if (!merge) {
        resultClass(q('[data-result]'), 'warn');
        q('[data-result]').textContent = '你接收到了每个 chunk，但界面只保留了最后一块。打开“持续合并”后重试。';
        return;
      }

      const artifact = {
        method: 'stream',
        chunkType: 'AIMessageChunk',
        aggregation: 'concat',
        cancellationHandled: cancelledOnce,
        finalText: accumulated,
        uiStates: ['waiting', 'streaming', 'cancelled', 'completed', 'error'],
      };
      artifacts.set('streamingContract', artifact, { lessonId: config.lessonId });
      resultClass(q('[data-result]'), 'good');
      q('[data-result]').textContent = `✓ ${chunks.length} 个 chunk 已合并为完整消息。界面同时保留了等待、取消和完成状态。`;
      complete(artifact);
    }, 360);
  });

  q('[data-cancel]').addEventListener('click', () => {
    if (!timer) return;
    clearTimer();
    cancelledOnce = true;
    q('[data-state]').textContent = '已取消';
    resultClass(q('[data-result]'), 'warn');
    q('[data-result]').textContent = '请求已取消，已经收到的内容仍然保留。现在可以重新开始。';
  });

  q('[data-reset]').addEventListener('click', reset);
  reset();
}

function mountToolCallingLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const tools = [
    { id: 'lookup_refund', label: '查询退款进度', risk: 'read', description: '根据 order_id 查询退款状态', enabled: true },
    { id: 'create_refund', label: '创建退款', risk: 'write', description: '直接为订单创建退款', enabled: true },
    { id: 'send_coupon', label: '发送优惠券', risk: 'write', description: '向用户发放补偿优惠券', enabled: false },
  ];
  let schemaField = 'orderId';

  root.innerHTML = `
    <div class="lc-panel lc-tool-lab">
      <div class="lc-toolbar">
        <div><b>工具调用工作台</b><small>模型只负责提出调用，应用负责校验、执行并把结果送回</small></div>
        <button class="lc-primary" data-run type="button">运行一次工具调用</button>
      </div>
      <div class="lc-tool-grid">
        <section>
          <span class="lc-label">本次向模型开放哪些工具</span>
          <div class="lc-tool-list">${tools.map((tool) => `<label class="lc-tool-card ${tool.enabled ? 'selected' : ''}" data-tool-card="${tool.id}"><input type="checkbox" data-tool="${tool.id}" ${tool.enabled ? 'checked' : ''}><span>${tool.risk === 'read' ? '只读' : '写操作'}</span><b>${tool.label}</b><small>${tool.description}</small></label>`).join('')}</div>
          <span class="lc-label">参数 Schema</span>
          <div class="lc-schema-choice">
            <button class="active" data-schema="orderId" type="button">orderId: string</button>
            <button data-schema="order_id" type="button">order_id: string</button>
            <button data-schema="query" type="button">query: string</button>
          </div>
        </section>
        <aside>
          <div class="lc-conversation" data-trace></div>
          <div class="lc-result" data-result>目标：只查询订单 SO-1024 的退款进度，不执行任何写操作。</div>
        </aside>
      </div>
    </div>`;

  const q = (selector) => root.querySelector(selector);

  root.querySelectorAll('[data-tool]').forEach((input) => {
    input.addEventListener('change', () => {
      const card = root.querySelector(`[data-tool-card="${input.dataset.tool}"]`);
      card.classList.toggle('selected', input.checked);
    });
  });

  root.querySelectorAll('[data-schema]').forEach((button) => {
    button.addEventListener('click', () => {
      schemaField = button.dataset.schema;
      root.querySelectorAll('[data-schema]').forEach((item) => item.classList.toggle('active', item === button));
    });
  });

  q('[data-run]').addEventListener('click', () => {
    const enabled = [...root.querySelectorAll('[data-tool]:checked')].map((input) => input.dataset.tool);
    const safe = enabled.length === 1 && enabled[0] === 'lookup_refund';
    const validSchema = schemaField === 'order_id';

    q('[data-trace]').innerHTML = `
      <article><span>HumanMessage</span><p>查询订单 SO-1024 的退款进度。</p></article>
      <article><span>AIMessage · tool_calls</span><p>${safe ? 'lookup_refund' : enabled.join(', ') || '没有可用工具'}(${JSON.stringify({ [schemaField]: 'SO-1024' })})</p></article>
      <article class="${validSchema ? '' : 'error'}"><span>Zod 参数校验</span><p>${validSchema ? '通过' : '失败：工具要求字段 order_id'}</p></article>
      <article><span>ToolMessage</span><p>${safe && validSchema ? 'processing · 预计 3 个工作日到账' : '工具没有执行'}</p></article>
      <article><span>AIMessage · final</span><p>${safe && validSchema ? '退款正在处理中，预计 3 个工作日内到账。' : '无法生成可信的最终回答。'}</p></article>`;

    if (!safe) {
      resultClass(q('[data-result]'), 'warn');
      q('[data-result]').textContent = '当前任务只需要查询。请遵循最小权限，只向模型开放 lookup_refund。';
      return;
    }
    if (!validSchema) {
      resultClass(q('[data-result]'), 'warn');
      q('[data-result]').textContent = '模型生成了参数，但字段名没有通过工具的 Zod Schema。请选择 order_id。';
      return;
    }

    const artifact = {
      tools: [{ name: 'lookup_refund', description: '根据订单号查询退款状态', schema: { order_id: 'string' }, permission: 'read' }],
      messageFlow: ['HumanMessage', 'AIMessage.tool_calls', 'ToolMessage', 'AIMessage'],
      toolChoice: 'model',
      leastPrivilege: true,
    };
    artifacts.set('toolRegistry', artifact, { lessonId: config.lessonId });
    resultClass(q('[data-result]'), 'good');
    q('[data-result]').textContent = '✓ 工具调用闭环完成：模型提出调用，Schema 校验参数，应用执行工具，再用 ToolMessage 把结果送回模型。';
    complete(artifact);
  });
}

function mountAgentLoopLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const steps = [
    { kind: 'model', title: '模型判断', detail: '当前问题需要实时退款状态，决定调用 lookup_refund。' },
    { kind: 'tool', title: '执行工具', detail: 'lookup_refund({ order_id: "SO-1024" })' },
    { kind: 'observation', title: '读取结果', detail: 'processing · 已等待 2 天 · SLA 3 天' },
    { kind: 'model', title: '模型再次判断', detail: '已有足够信息，不再调用工具。' },
    { kind: 'final', title: '最终回答', detail: '退款仍在正常处理时限内，预计明天前到账；暂不需要升级。' },
  ];
  let cursor = 0;
  let timer = null;

  root.innerHTML = `
    <div class="lc-panel lc-agent-lab">
      <div class="lc-toolbar">
        <div><b>Agent Loop 单步实验</b><small>模型与工具交替运行，直到满足停止条件</small></div>
        <div><button class="lc-secondary" data-reset type="button">重置</button><button class="lc-secondary" data-step type="button">走一步</button><button class="lc-primary" data-auto type="button">自动运行</button></div>
      </div>
      <div class="lc-agent-grid">
        <section>
          <label class="lc-range">最大迭代次数 <b data-limit-label>3</b><input type="range" min="1" max="6" value="3" data-limit></label>
          <label class="lc-check"><input type="checkbox" data-stop checked> 模型给出最终回答时停止</label>
          <label class="lc-check"><input type="checkbox" data-guard checked> 达到迭代上限时强制停止</label>
          <div class="lc-loop-diagram"><span>Model</span><i>→</i><span>Tools</span><i>→</i><span>Observation</span><i>↺</i></div>
          <div class="lc-result" data-result>先设置停止条件，再单步观察循环。</div>
        </section>
        <aside><div class="lc-agent-trace" data-trace></div></aside>
      </div>
    </div>`;

  const q = (selector) => root.querySelector(selector);

  function clearTimer() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function reset() {
    clearTimer();
    cursor = 0;
    q('[data-trace]').innerHTML = '';
    resultClass(q('[data-result]'), '');
    q('[data-result]').textContent = '先设置停止条件，再单步观察循环。';
  }

  function finishIfReady() {
    const stopOnFinal = q('[data-stop]').checked;
    const guard = q('[data-guard]').checked;
    const limit = Number(q('[data-limit]').value);
    const modelTurns = steps.slice(0, cursor).filter((step) => step.kind === 'model').length;
    const reachedFinal = cursor >= steps.length;

    if (reachedFinal && stopOnFinal && guard && limit >= 2) {
      clearTimer();
      const artifact = {
        runtime: 'createAgent',
        loop: ['model', 'tools', 'model'],
        stopConditions: ['final_output', `iteration_limit:${limit}`],
        trace: steps,
        finalAnswer: steps.at(-1).detail,
      };
      artifacts.set('agentLoopTrace', artifact, { lessonId: config.lessonId });
      resultClass(q('[data-result]'), 'good');
      q('[data-result]').textContent = '✓ Agent 在两次模型判断后停止：一次选择工具，一次基于 ToolMessage 给出最终回答。';
      complete(artifact);
      return true;
    }

    if (modelTurns >= limit && guard) {
      clearTimer();
      resultClass(q('[data-result]'), 'warn');
      q('[data-result]').textContent = '已触发迭代上限。当前限制太小，Agent 还没来得及处理工具结果。';
      return true;
    }

    if (reachedFinal && !stopOnFinal) {
      clearTimer();
      resultClass(q('[data-result]'), 'warn');
      q('[data-result]').textContent = '模型已经给出最终回答，但你关闭了最终输出停止条件，循环仍可能继续。';
      return true;
    }
    return false;
  }

  function step() {
    if (finishIfReady()) return;
    const item = steps[cursor];
    if (!item) return;
    cursor += 1;
    q('[data-trace]').insertAdjacentHTML('beforeend', `<article class="${item.kind}"><span>STEP ${String(cursor).padStart(2, '0')}</span><b>${item.title}</b><p>${item.detail}</p></article>`);
    q('[data-result]').textContent = `${item.title}完成。${cursor < steps.length ? '继续走下一步。' : '检查停止条件。'}`;
    finishIfReady();
  }

  q('[data-limit]').addEventListener('input', (event) => {
    q('[data-limit-label]').textContent = event.target.value;
  });
  q('[data-step]').addEventListener('click', step);
  q('[data-auto]').addEventListener('click', () => {
    clearTimer();
    timer = window.setInterval(step, 520);
  });
  q('[data-reset]').addEventListener('click', reset);
  reset();
}

export const langChainSimulators = {
  'model-invocation': mountModelInvocationLab,
  'streaming-lab': mountStreamingLab,
  'tool-calling-lab': mountToolCallingLab,
  'agent-loop-lab': mountAgentLoopLab,
};
