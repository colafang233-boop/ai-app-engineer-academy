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

export function mountV1PackageMap({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const packages = [
    ['langchain', 'langchain'],
    ['core', '@langchain/core'],
    ['integration', '模型集成包'],
    ['langgraph', '@langchain/langgraph'],
    ['classic', '@langchain/classic'],
    ['langsmith', 'LangSmith'],
  ];
  const items = [
    { api: 'createAgent / Middleware / tool()', answer: 'langchain', why: 'LangChain v1 Agent 主线 API' },
    { api: 'AIMessage / RunnableConfig', answer: 'core', why: '跨包共享的基础抽象与消息类型' },
    { api: 'ChatOpenAI / ChatAnthropic', answer: 'integration', why: '供应商模型集成由独立包提供' },
    { api: 'StateGraph / Checkpointer', answer: 'langgraph', why: '底层状态图与持久化运行时' },
    { api: 'ConversationChain / legacy retrievers', answer: 'classic', why: 'v1 精简后迁移到兼容包' },
    { api: 'Trace / Run / Evaluation', answer: 'langsmith', why: '可观测、评估与监控平台' },
  ];

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>LangChain v1 包归属分拣台</b><small>不要把 v0.x import 路径直接带进 v1 项目</small></div><button class="v1-primary" data-check type="button">检查包边界</button></div>
      <div class="v1-version-banner">本实验适用于 <b>langchain@1.5.3</b>。旧式 Chains、Retrievers 和 Indexing API 不属于 v1 主包主线。</div>
      <div class="v1-table-wrap"><table class="v1-table"><thead><tr><th>API / 能力</th><th>选择归属</th><th>说明</th></tr></thead><tbody>
        ${items.map((item, index) => `<tr data-row="${index}"><td><b>${item.api}</b></td><td><select class="v1-select" data-select="${index}"><option value="">请选择</option>${packages.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-why="${index}">等待判断</td></tr>`).join('')}
      </tbody></table></div>
      <div class="v1-result" data-result>先完成所有归属，再检查。</div>
    </div>`;

  const result = root.querySelector('[data-result]');
  root.querySelector('[data-check]').addEventListener('click', () => {
    let correct = 0;
    items.forEach((item, index) => {
      const value = root.querySelector(`[data-select="${index}"]`).value;
      const row = root.querySelector(`[data-row="${index}"]`);
      const ok = value === item.answer;
      row.className = ok ? 'pass' : 'fail';
      root.querySelector(`[data-why="${index}"]`).textContent = ok ? item.why : '归属不正确，请对照 v1 包边界重新选择。';
      if (ok) correct += 1;
    });
    if (correct !== items.length) {
      setResult(result, 'warn', `当前正确 ${correct}/${items.length}。重点检查 langchain 主包与 @langchain/classic 的边界。`);
      return;
    }
    const artifact = {
      version: 'langchain@1.5.3',
      packageMap: Object.fromEntries(items.map((item) => [item.api, item.answer])),
      migrationRule: 'identify-v0-api-before-copying',
    };
    artifacts.set('langchainArchitectureDecision', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ 包边界正确。你现在可以区分 v1 Agent 主线、底层 Core/Graph、兼容包与 LangSmith。');
    complete(artifact);
  });
}

export function mountContentBlockInspector({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const providers = {
    openai: [
      { raw: '{ type: "reasoning", summary: [...] }', answer: 'reasoning', label: '推理摘要' },
      { raw: '{ type: "text", text: "退款处理中" }', answer: 'text', label: '文本回答' },
      { raw: 'tool_calls: [{ name: "lookup_refund" }]', answer: 'tool', label: '工具调用' },
      { raw: 'usage_metadata: { input_tokens: 120 }', answer: 'metadata', label: '用量元数据' },
    ],
    anthropic: [
      { raw: '{ type: "thinking", thinking: "..." }', answer: 'reasoning', label: '推理内容' },
      { raw: '{ type: "text", text: "预计三天到账" }', answer: 'text', label: '文本回答' },
      { raw: '{ type: "citation", source: ... }', answer: 'citation', label: '引用块' },
      { raw: 'response_metadata: { stop_reason: "end_turn" }', answer: 'metadata', label: '响应元数据' },
    ],
  };
  const types = [
    ['text', 'Text ContentBlock'], ['reasoning', 'Reasoning ContentBlock'], ['citation', 'Citation ContentBlock'],
    ['tool', 'AIMessage.tool_calls'], ['metadata', 'Message metadata'],
  ];
  let provider = 'openai';
  const passed = new Set();

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>跨供应商 Message 归一化实验</b><small>contentBlocks 不替代 content，而是提供标准、类型化访问</small></div><div><button class="v1-secondary active" data-provider="openai" type="button">OpenAI</button><button class="v1-secondary" data-provider="anthropic" type="button">Anthropic</button><button class="v1-primary" data-check type="button">检查映射</button></div></div>
      <div class="v1-grid"><section><div class="v1-card-list" data-blocks></div></section><aside>
        <span class="v1-label">应用最终读取</span>
        <div class="v1-card"><b>AIMessage</b><small>text · content · contentBlocks · tool_calls · usage_metadata · response_metadata</small></div>
        <div class="v1-result" data-result>先完成 OpenAI 与 Anthropic 两组映射。</div>
      </aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  function render() {
    root.querySelector('[data-blocks]').innerHTML = providers[provider].map((block, index) => `
      <article class="v1-card" data-row="${index}"><b>${block.raw}</b><small>${block.label}</small><select class="v1-select" data-map="${index}"><option value="">映射到...</option>${types.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></article>
    `).join('');
  }
  root.querySelectorAll('[data-provider]').forEach((button) => button.addEventListener('click', () => {
    provider = button.dataset.provider;
    root.querySelectorAll('[data-provider]').forEach((item) => item.classList.toggle('active', item === button));
    render();
  }));
  root.querySelector('[data-check]').addEventListener('click', () => {
    let correct = 0;
    providers[provider].forEach((block, index) => {
      const value = root.querySelector(`[data-map="${index}"]`).value;
      const row = root.querySelector(`[data-row="${index}"]`);
      const ok = value === block.answer;
      row.classList.toggle('selected', ok);
      if (ok) correct += 1;
    });
    if (correct !== providers[provider].length) {
      setResult(result, 'warn', `${provider} 映射正确 ${correct}/${providers[provider].length}。不要把 metadata 或 tool_calls 当普通文本块。`);
      return;
    }
    passed.add(provider);
    if (passed.size < 2) {
      setResult(result, 'good', `✓ ${provider} 已归一化。请切换另一家供应商继续。`);
      return;
    }
    const artifact = {
      outputVersion: 'v1',
      normalizedProviders: [...passed],
      reads: ['text', 'contentBlocks', 'tool_calls', 'usage_metadata', 'response_metadata'],
    };
    artifacts.set('messageContractV1', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ 两家供应商内容已映射到同一份 Message 契约。');
    complete(artifact);
  });
  render();
}

export function mountModelProfileScheduler({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const models = {
    fast: { label: 'Fast Text', structured: false, tools: false, multimodal: false, reasoning: false },
    structured: { label: 'Structured Mini', structured: true, tools: true, multimodal: false, reasoning: false },
    vision: { label: 'Vision Reasoner', structured: true, tools: true, multimodal: true, reasoning: true },
  };
  const scenarios = [
    { title: '批量分类 50 封邮件', needs: ['structured'], model: 'structured', method: 'batch', concurrency: [2, 10] },
    { title: '理解发票图片并抽取字段', needs: ['structured', 'multimodal'], model: 'vision', method: 'invoke', concurrency: [1, 3] },
    { title: '查询退款状态的工具 Agent', needs: ['tools'], model: 'structured', method: 'invoke', concurrency: [1, 5] },
  ];
  let scenarioIndex = 0;
  const passed = new Set();

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>模型能力与批处理调度台</b><small>Profile 参与策略选择，batch 处理独立输入</small></div><button class="v1-primary" data-check type="button">运行当前方案</button></div>
      <div class="v1-grid"><section>
        <span class="v1-label">当前任务</span><div class="v1-card"><b data-scenario></b><div data-needs></div></div>
        <span class="v1-label">选择模型</span><div class="v1-card-list" data-models></div>
        <span class="v1-label">调用方式</span><div class="v1-row"><label><input type="radio" name="method" value="invoke" checked> invoke</label><label><input type="radio" name="method" value="batch"> batch</label></div>
        <label class="v1-label">maxConcurrency <b data-concurrency-label>4</b></label><input type="range" min="1" max="16" value="4" data-concurrency>
      </section><aside>
        <div class="v1-metric-grid">${Object.entries(models).map(([id, model]) => `<article class="v1-metric"><span>${model.label}</span><b>${Object.entries(model).filter(([, value]) => value === true).length}</b><small>项能力</small></article>`).join('')}</div>
        <div class="v1-result" data-result>完成三个任务的能力匹配。</div>
      </aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  let selectedModel = 'fast';
  function renderScenario() {
    const scenario = scenarios[scenarioIndex];
    root.querySelector('[data-scenario]').textContent = scenario.title;
    root.querySelector('[data-needs]').innerHTML = scenario.needs.map((need) => `<span class="v1-chip good">${need}</span>`).join('');
    root.querySelector('[data-models]').innerHTML = Object.entries(models).map(([id, model]) => `<button class="v1-card ${selectedModel === id ? 'selected' : ''}" data-model="${id}" type="button"><b>${model.label}</b><small>structured:${model.structured} · tools:${model.tools} · multimodal:${model.multimodal} · reasoning:${model.reasoning}</small></button>`).join('');
    root.querySelectorAll('[data-model]').forEach((button) => button.addEventListener('click', () => {
      selectedModel = button.dataset.model;
      renderScenario();
    }));
  }
  root.querySelector('[data-concurrency]').addEventListener('input', (event) => {
    root.querySelector('[data-concurrency-label]').textContent = event.target.value;
  });
  root.querySelector('[data-check]').addEventListener('click', () => {
    const scenario = scenarios[scenarioIndex];
    const method = root.querySelector('input[name="method"]:checked').value;
    const concurrency = Number(root.querySelector('[data-concurrency]').value);
    const ok = selectedModel === scenario.model && method === scenario.method && concurrency >= scenario.concurrency[0] && concurrency <= scenario.concurrency[1];
    if (!ok) {
      const hint = scenario.method === 'batch'
        ? '独立批量任务应使用 batch，并限制 maxConcurrency。'
        : '先满足任务需要的 Model Profile，再选择 invoke。';
      setResult(result, 'warn', `当前方案不匹配：${hint}`);
      return;
    }
    passed.add(scenarioIndex);
    if (scenarioIndex < scenarios.length - 1) {
      scenarioIndex += 1;
      selectedModel = 'fast';
      root.querySelector('input[value="invoke"]').checked = true;
      root.querySelector('[data-concurrency]').value = 4;
      root.querySelector('[data-concurrency-label]').textContent = '4';
      renderScenario();
      setResult(result, 'good', `✓ 已完成 ${passed.size}/${scenarios.length}。继续下一个任务。`);
      return;
    }
    const artifact = {
      init: 'initChatModel',
      supportedMethods: ['invoke', 'stream', 'batch'],
      profileAware: true,
      batch: { maxConcurrency: 4 },
      scenariosCompleted: passed.size + 1,
    };
    artifacts.set('modelRuntimeConfig', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ 三类任务均已按 Profile、调用方式和并发限制完成调度。');
    complete(artifact);
  });
  renderScenario();
}

export function mountStructuredStrategyLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const scenarios = [
    { title: 'Agent 不使用工具，模型 Profile 支持原生结构化输出', answer: 'provider', reason: '可使用 Provider Strategy。' },
    { title: 'Agent 使用工具，模型不支持原生结构化输出', answer: 'tool', reason: '使用 Tool Strategy 生成结构化响应。' },
    { title: '模型支持原生输出，但不支持工具与结构化输出同时使用', answer: 'split', reason: '拆分步骤或更换能力组合。' },
    { title: '非 Agent 的单次抽取任务', answer: 'model', reason: '模型直接使用 withStructuredOutput。' },
  ];
  const choices = [
    ['provider', 'Provider Strategy'], ['tool', 'Tool Strategy'], ['split', '拆分步骤/更换模型'], ['model', 'model.withStructuredOutput'],
  ];
  let index = 0;
  const results = [];

  root.innerHTML = `
    <div class="v1-panel">
      <div class="v1-toolbar"><div><b>结构化输出策略选择器</b><small>能力、工具并用和执行层级共同决定策略</small></div><button class="v1-primary" data-check type="button">验证策略</button></div>
      <div class="v1-grid"><section>
        <span class="v1-label">场景 <b data-index>1</b>/4</span><div class="v1-card"><b data-scenario></b></div>
        <span class="v1-label">选择策略</span><div class="v1-card-list">${choices.map(([value, label]) => `<label class="v1-card"><input type="radio" name="strategy" value="${value}"> <b>${label}</b></label>`).join('')}</div>
      </section><aside><pre class="v1-code">const agent = createAgent({
  model,
  tools,
  responseFormat: /* strategy */
});

const result = await agent.invoke(...);
console.log(result.structuredResponse);</pre><div class="v1-result" data-result>完成四种官方策略场景。</div></aside></div>
    </div>`;

  const result = root.querySelector('[data-result]');
  function render() {
    root.querySelector('[data-index]').textContent = index + 1;
    root.querySelector('[data-scenario]').textContent = scenarios[index].title;
    root.querySelectorAll('input[name="strategy"]').forEach((input) => { input.checked = false; });
  }
  root.querySelector('[data-check]').addEventListener('click', () => {
    const selected = root.querySelector('input[name="strategy"]:checked')?.value;
    if (!selected) {
      setResult(result, 'warn', '先选择一个策略。');
      return;
    }
    const scenario = scenarios[index];
    if (selected !== scenario.answer) {
      setResult(result, 'warn', `策略不匹配。提示：${scenario.reason}`);
      return;
    }
    results.push({ scenario: scenario.title, strategy: selected });
    if (index < scenarios.length - 1) {
      index += 1;
      render();
      setResult(result, 'good', `✓ ${scenario.reason} 继续下一种场景。`);
      return;
    }
    const artifact = {
      agentField: 'structuredResponse',
      policies: results,
      errorsHandled: ['schema_validation', 'multiple_structured_outputs'],
    };
    artifacts.set('structuredOutputPolicy', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ 已区分模型直接结构化输出、Provider Strategy、Tool Strategy 和拆分执行。');
    complete(artifact);
  });
  render();
}

export const langChainV1FoundationSimulators = {
  'v1-package-map': mountV1PackageMap,
  'content-block-inspector': mountContentBlockInspector,
  'model-profile-scheduler': mountModelProfileScheduler,
  'structured-strategy-lab': mountStructuredStrategyLab,
};
