function once(callback) {
  let done = false;
  return (detail) => {
    if (done) return;
    done = true;
    callback?.(detail);
  };
}

function artifactChips(artifacts, names = []) {
  if (!names.length) return '';
  return `<div class="sim-artifacts"><b>前置产物</b>${names.map((name) => `
    <span class="sim-chip ${artifacts.has(name) ? 'ready' : 'missing'}">${name} · ${artifacts.has(name) ? '已读取' : '暂无'}</span>`).join('')}</div>`;
}

function mountDistributionLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  root.innerHTML = `
    <div class="sim-panel distribution-lab">
      <div class="sim-toolbar"><div><b>20 次重复运行</b><small>同一封邮件，不同 Harness 条件</small></div><button class="sim-primary" data-run>运行 20 次</button></div>
      <div class="sim-toggle-row">
        <label><input type="checkbox" data-rules> 业务规则</label>
        <label><input type="checkbox" data-schema> 结构化输出</label>
        <label><input type="checkbox" data-fallback> 低置信度兜底</label>
      </div>
      <div class="dist-bars">
        <div><span>退款进度查询</span><i><em data-bar="query"></em></i><b data-value="query">0%</b></div>
        <div><span>投诉</span><i><em data-bar="complaint"></em></i><b data-value="complaint">0%</b></div>
        <div><span>退款申请</span><i><em data-bar="refund"></em></i><b data-value="refund">0%</b></div>
      </div>
      <div class="sim-metrics"><span>格式通过率 <b data-format>—</b></span><span>自动流转 <b data-auto>—</b></span><span>人工审核 <b data-human>—</b></span></div>
      <div class="sim-result" data-result>打开或关闭不同能力，再运行。</div>
    </div>`;
  const q = (s) => root.querySelector(s);
  q('[data-run]').onclick = () => {
    const rules = q('[data-rules]').checked;
    const schema = q('[data-schema]').checked;
    const fallback = q('[data-fallback]').checked;
    const values = rules ? [85, 10, 5] : [48, 32, 20];
    ['query', 'complaint', 'refund'].forEach((name, i) => {
      q(`[data-bar="${name}"]`).style.width = `${values[i]}%`;
      q(`[data-value="${name}"]`).textContent = `${values[i]}%`;
    });
    q('[data-format]').textContent = schema ? '100%' : '55%';
    q('[data-auto]').textContent = fallback ? '16/20' : '20/20';
    q('[data-human]').textContent = fallback ? '4/20' : '0/20';
    q('[data-result]').className = `sim-result ${rules && schema && fallback ? 'good' : 'warn'}`;
    q('[data-result]').textContent = rules && schema && fallback
      ? '✓ 规则让判断收敛，Schema 固定格式，兜底阻止低置信度结果直接进入业务。'
      : '你只解决了部分问题：准确性、格式稳定和失败处理是三条不同的轴。';
    artifacts.set('businessRisk', {
      task: 'email intent classification',
      distribution: values,
      enabled: { rules, schema, fallback },
      needs: ['rules', 'schema', 'fallback'],
    }, { lessonId: config.lessonId });
    if (rules && schema && fallback) complete({ values });
  };
}

function mountConstraintMixerLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const conditions = config.conditions;
  root.innerHTML = `
    <div class="sim-panel mixer-lab">
      <div class="sim-toolbar"><div><b>项目条件混合器</b><small>不是语言排行榜，而是约束匹配</small></div><button class="sim-primary" data-save>保存技术决策</button></div>
      <div class="condition-grid">${conditions.map((c) => `<label><span>${c.label}</span><input type="checkbox" data-condition="${c.id}"></label>`).join('')}</div>
      <div class="score-board">
        ${['java', 'python', 'ts'].map((lang) => `<div><span>${lang === 'ts' ? 'TypeScript' : lang[0].toUpperCase() + lang.slice(1)}</span><i><em data-score-bar="${lang}"></em></i><b data-score="${lang}">50</b></div>`).join('')}
      </div>
      <div class="sim-result" data-result>先组合项目条件。</div>
    </div>`;
  const q = (s) => root.querySelector(s);
  function calculate() {
    const score = { java: 50, python: 50, ts: 50 };
    const selected = [...root.querySelectorAll('[data-condition]:checked')].map((el) => el.dataset.condition);
    selected.forEach((id) => {
      const condition = conditions.find((item) => item.id === id);
      Object.keys(score).forEach((lang) => { score[lang] += condition.weights[lang]; });
    });
    Object.keys(score).forEach((lang) => { score[lang] = Math.max(5, Math.min(100, score[lang])); });
    const winner = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
    Object.entries(score).forEach(([lang, value]) => {
      q(`[data-score-bar="${lang}"]`).style.width = `${value}%`;
      q(`[data-score="${lang}"]`).textContent = value;
    });
    q('[data-result]').textContent = `当前更匹配：${{ java: 'Java', python: 'Python', ts: 'TypeScript' }[winner]}。改变约束，结论也会改变。`;
    return { score, winner, selected };
  }
  root.onchange = calculate;
  calculate();
  q('[data-save]').onclick = () => {
    const decision = calculate();
    artifacts.set('languageDecision', decision, { lessonId: config.lessonId });
    q('[data-result]').className = 'sim-result good';
    q('[data-result]').textContent += ' ✓ 已写入课程产物账本。';
    complete(decision);
  };
}

function mountCodeRepairLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  let source = config.initialSource;
  root.innerHTML = `
    <div class="sim-panel code-lab">
      <div class="sim-toolbar"><div><b>TypeScript AI 调用修理厂</b><small>逐层修复异步、运行时和返回契约</small></div><div><button class="sim-secondary" data-reset>重置</button><button class="sim-secondary" data-fix>应用当前修复</button><button class="sim-primary" data-run>运行诊断</button></div></div>
      <div class="code-grid"><textarea spellcheck="false" data-editor></textarea><aside><div class="issue-list" data-issues></div><pre data-terminal>点击“运行诊断”。</pre></aside></div>
      ${artifactChips(artifacts, config.artifactInputs)}
    </div>`;
  const q = (s) => root.querySelector(s);
  const editor = q('[data-editor]');
  const getIssues = () => config.issues.filter((issue) => !issue.test(source));
  function render() {
    const issues = getIssues();
    q('[data-issues]').innerHTML = issues.length
      ? issues.map((issue, i) => `<article class="issue ${i === 0 ? 'active' : ''}"><span>${issue.code}</span><div><b>${issue.title}</b><p>${issue.explanation}</p></div></article>`).join('')
      : '<div class="all-pass">✓ 所有诊断通过</div>';
    return issues;
  }
  q('[data-run]').onclick = () => {
    source = editor.value;
    const issues = render();
    if (issues.length) {
      q('[data-terminal]').className = 'bad';
      q('[data-terminal]').textContent = `诊断失败：${issues[0].code} · ${issues[0].title}`;
      return;
    }
    q('[data-terminal]').className = 'good';
    q('[data-terminal]').textContent = config.successOutput;
    artifacts.set('tsSource', source, { lessonId: config.lessonId });
    complete({ source });
  };
  q('[data-fix]').onclick = () => {
    source = editor.value;
    const issue = getIssues()[0];
    if (!issue) return q('[data-run]').click();
    source = issue.fix(source);
    editor.value = source;
    render();
    q('[data-terminal]').className = '';
    q('[data-terminal]').textContent = `已应用 ${issue.code} 修复。继续运行诊断。`;
  };
  q('[data-reset]').onclick = () => {
    source = config.initialSource;
    editor.value = source;
    render();
    q('[data-terminal]').className = '';
    q('[data-terminal]').textContent = '已重置。';
  };
  editor.value = source;
  render();
}

function mountContextWindowLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const state = { selected: new Set(['system', 'user']), budget: 180 };
  root.innerHTML = `
    <div class="sim-panel window-lab">
      <div class="sim-toolbar"><div><b>Messages 行李箱</b><small>拖入信息，观察 Token 占用和挤出</small></div><button class="sim-primary" data-run>发送请求</button></div>
      <div class="window-controls"><label>窗口预算 <b data-budget-label>180</b> tokens <input type="range" min="100" max="360" step="20" value="180" data-budget></label></div>
      <div class="message-pool">${config.messages.map((m) => `<button data-message="${m.id}" class="message-card ${state.selected.has(m.id) ? 'selected' : ''}"><span>${m.role}</span><b>${m.label}</b><small>${m.tokens} tokens</small></button>`).join('')}</div>
      <div class="context-window"><div class="window-head"><b>最终请求窗口</b><span data-usage>0 / 180</span></div><div data-window></div></div>
      <div class="sim-result" data-result>System 和当前 User 已默认进入窗口。</div>
      ${artifactChips(artifacts, ['tsSource'])}
    </div>`;
  const q = (s) => root.querySelector(s);
  function compute() {
    const picked = config.messages.filter((m) => state.selected.has(m.id));
    let used = 0;
    const visible = [];
    const evicted = [];
    for (let i = picked.length - 1; i >= 0; i -= 1) {
      const item = picked[i];
      if (used + item.tokens <= state.budget) {
        visible.unshift(item);
        used += item.tokens;
      } else {
        evicted.unshift(item);
      }
    }
    q('[data-usage]').textContent = `${used} / ${state.budget}`;
    q('[data-window]').innerHTML = [...evicted.map((m) => `<article class="window-item evicted"><span>${m.role}</span><b>${m.label}</b><small>被挤出</small></article>`), ...visible.map((m) => `<article class="window-item"><span>${m.role}</span><b>${m.label}</b><small>${m.tokens} tokens</small></article>`)].join('');
    const systemVisible = visible.some((m) => m.id === 'system');
    const referentVisible = visible.some((m) => m.id === 'history');
    q('[data-result]').className = `sim-result ${systemVisible && referentVisible ? 'good' : 'warn'}`;
    q('[data-result]').textContent = !systemVisible
      ? '危险：System 规则已经被挤出，模型可能忘记业务边界。'
      : !referentVisible
        ? '“那个方案”缺少历史指代，模型无法知道用户在说什么。'
        : '窗口里同时保留了规则、必要历史和当前问题。可以发送。';
    return { picked, visible, evicted, used };
  }
  root.querySelectorAll('[data-message]').forEach((button) => {
    button.onclick = () => {
      const id = button.dataset.message;
      state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
      button.classList.toggle('selected', state.selected.has(id));
      compute();
    };
  });
  q('[data-budget]').oninput = (event) => {
    state.budget = Number(event.target.value);
    q('[data-budget-label]').textContent = state.budget;
    compute();
  };
  q('[data-run]').onclick = () => {
    const result = compute();
    const ids = result.visible.map((m) => m.id);
    if (!ids.includes('system') || !ids.includes('history') || !ids.includes('user')) {
      q('[data-result]').className = 'sim-result bad';
      q('[data-result]').textContent = '还不能发送：必须保留 System、必要历史和当前 User。';
      return;
    }
    artifacts.set('messages', result.visible.map(({ role, content, tokens }) => ({ role, content, tokens })), { lessonId: config.lessonId });
    q('[data-result]').className = 'sim-result good';
    q('[data-result]').textContent = '✓ Messages 已保存。下一课会在这个请求包之上构造 Prompt。';
    complete(result);
  };
  compute();
}

function mountPromptAnatomyLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const enabled = new Set(config.blocks.map((b) => b.id));
  root.innerHTML = `
    <div class="sim-panel prompt-lab">
      <div class="sim-toolbar"><div><b>Prompt 反事实实验</b><small>先完整，再删掉一块观察失败</small></div><button class="sim-primary" data-save>保存 Prompt v1</button></div>
      <div class="prompt-blocks">${config.blocks.map((b) => `<button class="prompt-block selected" data-block="${b.id}"><span>${b.name}</span><small>${b.summary}</small></button>`).join('')}</div>
      <div class="prompt-preview" data-preview></div>
      <div class="failure-grid" data-failures></div>
      <div class="sim-result" data-result>五块都在，点击任意块做删除实验。</div>
      ${artifactChips(artifacts, ['messages'])}
    </div>`;
  const q = (s) => root.querySelector(s);
  function render() {
    q('[data-preview]').innerHTML = config.blocks.filter((b) => enabled.has(b.id)).map((b) => `<section><b>${b.name}</b><p>${b.content}</p></section>`).join('');
    const missing = config.blocks.filter((b) => !enabled.has(b.id));
    q('[data-failures]').innerHTML = missing.length ? missing.map((b) => `<article><b>删除 ${b.name}</b><p>${b.failure}</p></article>`).join('') : '<article class="success-card"><b>完整 Prompt</b><p>任务、上下文、规则、输出和失败出口都明确。</p></article>';
    q('[data-result]').className = `sim-result ${missing.length ? 'warn' : 'good'}`;
    q('[data-result]').textContent = missing.length ? `当前缺少 ${missing.map((b) => b.name).join('、')}。` : '五块都在，可以形成 Prompt v1。';
  }
  root.querySelectorAll('[data-block]').forEach((button) => {
    button.onclick = () => {
      const id = button.dataset.block;
      enabled.has(id) ? enabled.delete(id) : enabled.add(id);
      button.classList.toggle('selected', enabled.has(id));
      render();
    };
  });
  q('[data-save]').onclick = () => {
    if (enabled.size !== config.blocks.length) {
      q('[data-result]').className = 'sim-result bad';
      q('[data-result]').textContent = '请恢复五个组成部分，再保存 Prompt v1。';
      return;
    }
    const prompt = config.blocks.map((b) => `## ${b.name}\n${b.content}`).join('\n\n');
    artifacts.set('promptV1', { version: 'v1', text: prompt, blocks: [...enabled] }, { lessonId: config.lessonId });
    q('[data-result]').textContent = '✓ Prompt v1 已保存。下一课会把规则部分变成可执行决策表。';
    complete({ prompt });
  };
  render();
}

function mountRuleRoutingLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  let rules = config.rules.map((r) => ({ ...r }));
  root.innerHTML = `
    <div class="sim-panel routing-lab">
      <div class="sim-toolbar"><div><b>邮件规则路由台</b><small>调整优先级，批量重跑所有邮件</small></div><button class="sim-primary" data-run>重新路由</button></div>
      <div class="routing-grid"><div class="rule-stack" data-rules></div><div class="route-table-wrap"><table><thead><tr><th>邮件</th><th>期望</th><th>实际</th><th>状态</th></tr></thead><tbody data-rows></tbody></table></div></div>
      <div class="sim-result" data-result>当前规则顺序故意有问题。</div>
      ${artifactChips(artifacts, ['promptV1'])}
    </div>`;
  const q = (s) => root.querySelector(s);
  function renderRules() {
    q('[data-rules]').innerHTML = rules.map((rule, index) => `<article class="rule-card"><span>${index + 1}</span><div><b>${rule.label}</b><small>${rule.description}</small></div><div><button data-up="${rule.id}" ${index === 0 ? 'disabled' : ''}>↑</button><button data-down="${rule.id}" ${index === rules.length - 1 ? 'disabled' : ''}>↓</button></div></article>`).join('');
    root.querySelectorAll('[data-up]').forEach((button) => button.onclick = () => move(button.dataset.up, -1));
    root.querySelectorAll('[data-down]').forEach((button) => button.onclick = () => move(button.dataset.down, 1));
  }
  function move(id, delta) {
    const index = rules.findIndex((r) => r.id === id);
    const target = index + delta;
    [rules[index], rules[target]] = [rules[target], rules[index]];
    renderRules();
    run(false);
  }
  function classify(text) {
    for (const rule of rules) if (rule.match(text)) return rule.output;
    return 'unknown';
  }
  function run(finalize = true) {
    const rows = config.emails.map((email) => ({ ...email, actual: classify(email.text) }));
    const passed = rows.filter((r) => r.actual === r.expected).length;
    q('[data-rows]').innerHTML = rows.map((row) => `<tr class="${row.actual === row.expected ? 'pass' : 'fail'}"><td><b>${row.name}</b><small>${row.text}</small></td><td>${row.expected}</td><td>${row.actual}</td><td>${row.actual === row.expected ? '✓' : '✗'}</td></tr>`).join('');
    q('[data-result]').className = `sim-result ${passed === rows.length ? 'good' : 'warn'}`;
    q('[data-result]').textContent = `${passed}/${rows.length} 路由正确。${passed === rows.length ? '规则顺序已经表达业务优先级。' : '观察失败邮件，再调整规则顺序。'}`;
    if (finalize && passed === rows.length) {
      artifacts.set('classificationRules', rules.map(({ id, label, output }) => ({ id, label, output })), { lessonId: config.lessonId });
      complete({ rules, rows });
    }
  }
  q('[data-run]').onclick = () => run(true);
  renderRules();
  run(false);
}

function mountStructuredOutputLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  root.innerHTML = `
    <div class="sim-panel validation-lab">
      <div class="sim-toolbar"><div><b>JSON → Schema → 业务规则</b><small>三道检查门各自负责不同失败</small></div><div>${config.presets.map((p, i) => `<button class="sim-secondary" data-preset="${i}">${p.label}</button>`).join('')}<button class="sim-primary" data-run>验证</button></div></div>
      <div class="validation-grid"><textarea data-json spellcheck="false"></textarea><div class="gate-stack"><article data-gate="json"><span>01</span><b>JSON 语法</b><small>尚未运行</small></article><article data-gate="schema"><span>02</span><b>Zod Schema</b><small>尚未运行</small></article><article data-gate="business"><span>03</span><b>业务规则</b><small>尚未运行</small></article></div></div>
      <div class="sim-result" data-result>选择坏样例或直接编辑 JSON。</div>
      ${artifactChips(artifacts, ['classificationRules'])}
    </div>`;
  const q = (s) => root.querySelector(s);
  const editor = q('[data-json]');
  function setGate(name, state, text) {
    const gate = q(`[data-gate="${name}"]`);
    gate.className = state;
    gate.querySelector('small').textContent = text;
  }
  root.querySelectorAll('[data-preset]').forEach((button) => button.onclick = () => { editor.value = config.presets[Number(button.dataset.preset)].json; });
  q('[data-run]').onclick = () => {
    ['json', 'schema', 'business'].forEach((name) => setGate(name, '', '等待检查'));
    let value;
    try {
      value = JSON.parse(editor.value);
      setGate('json', 'pass', '可解析');
    } catch (error) {
      setGate('json', 'fail', error.message);
      q('[data-result]').className = 'sim-result bad';
      q('[data-result]').textContent = '第一道门失败：JSON 本身无法解析。';
      return;
    }
    const schemaOk = config.schema(value);
    if (!schemaOk.ok) {
      setGate('schema', 'fail', schemaOk.reason);
      q('[data-result]').className = 'sim-result bad';
      q('[data-result]').textContent = '第二道门失败：字段或类型不符合契约。';
      return;
    }
    setGate('schema', 'pass', '字段和类型正确');
    const businessOk = config.business(value);
    if (!businessOk.ok) {
      setGate('business', 'fail', businessOk.reason);
      q('[data-result]').className = 'sim-result bad';
      q('[data-result]').textContent = '第三道门失败：数据合法，但业务组合不允许。';
      return;
    }
    setGate('business', 'pass', '业务组合可接受');
    q('[data-result]').className = 'sim-result good';
    q('[data-result]').textContent = '✓ 三道门全部通过。Schema 已保存为下一课的输出契约。';
    artifacts.set('outputSchema', config.schemaSource, { lessonId: config.lessonId });
    complete({ value });
  };
  editor.value = config.presets[0].json;
}

function mountFewShotMapLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const selected = new Set();
  root.innerHTML = `
    <div class="sim-panel fewshot-lab">
      <div class="sim-toolbar"><div><b>Few-shot 语义地图</b><small>预算 300 tokens，兼顾相关性、边界和多样性</small></div><div><span class="budget" data-budget>0 / 300</span><button class="sim-secondary" data-reset>重置</button><button class="sim-primary" data-run>使用所选示例</button></div></div>
      <div class="semantic-map" data-map><div class="query-point">当前输入<br><small>退款怎么还没到账</small></div></div>
      <div class="metric-row"><span data-rel>相关性 —</span><span data-div>多样性 —</span><span data-boundary>边界例 未覆盖</span><span data-failure>失败出口 未覆盖</span></div>
      <div class="sim-result" data-result>圆形是普通例，虚线是边界例，方形是失败例。</div>
      ${artifactChips(artifacts, ['outputSchema'])}
    </div>`;
  const q = (s) => root.querySelector(s);
  function metrics() {
    const items = config.examples.filter((e) => selected.has(e.id));
    const used = items.reduce((s, e) => s + e.tokens, 0);
    const rel = items.length ? Math.round(items.reduce((s, e) => s + Math.max(0, 100 - Math.hypot(e.x - 50, e.y - 50) * 3), 0) / items.length) : 0;
    let min = 100;
    if (items.length > 1) for (let i = 0; i < items.length; i += 1) for (let j = i + 1; j < items.length; j += 1) min = Math.min(min, Math.hypot(items[i].x - items[j].x, items[i].y - items[j].y));
    const diversity = items.length < 2 ? 0 : Math.min(100, Math.round(min * 5));
    const boundary = items.some((e) => e.kind === 'boundary');
    const failure = items.some((e) => e.kind === 'failure');
    const contrast = items.some((e) => e.kind === 'contrast');
    q('[data-budget]').textContent = `${used} / 300`;
    q('[data-rel]').textContent = `相关性 ${rel || '—'}${rel ? '%' : ''}`;
    q('[data-div]').textContent = `多样性 ${diversity || '—'}${diversity ? '%' : ''}`;
    q('[data-boundary]').textContent = `边界例 ${boundary ? '已覆盖' : '未覆盖'}`;
    q('[data-failure]').textContent = `失败出口 ${failure ? '已覆盖' : '未覆盖'}`;
    return { items, used, rel, diversity, boundary, failure, contrast };
  }
  function render() {
    q('[data-map]').querySelectorAll('[data-example]').forEach((node) => node.remove());
    config.examples.forEach((e) => {
      const button = document.createElement('button');
      button.dataset.example = e.id;
      button.className = `example-point ${e.kind} ${selected.has(e.id) ? 'selected' : ''}`;
      button.style.left = `${e.x}%`;
      button.style.top = `${e.y}%`;
      button.innerHTML = `${e.label}<small>${e.tokens}</small>`;
      button.onclick = () => {
        if (selected.has(e.id)) selected.delete(e.id);
        else {
          const used = metrics().used;
          if (selected.size >= 3 || used + e.tokens > 300) return;
          selected.add(e.id);
        }
        render();
      };
      q('[data-map]').appendChild(button);
    });
    metrics();
  }
  q('[data-reset]').onclick = () => { selected.clear(); render(); };
  q('[data-run]').onclick = () => {
    const m = metrics();
    if (m.items.length !== 3 || !m.boundary || !m.failure || !m.contrast) {
      q('[data-result]').className = 'sim-result bad';
      q('[data-result]').textContent = '需要同时选择：到账边界例、纯投诉对比例、信息不足失败例。';
      return;
    }
    artifacts.set('fewShotExamples', m.items.map(({ id, label, kind, tokens }) => ({ id, label, kind, tokens })), { lessonId: config.lessonId });
    q('[data-result]').className = 'sim-result good';
    q('[data-result]').textContent = '✓ 示例集兼顾相关性、边界和失败出口。';
    complete(m);
  };
  render();
}

function mountEvaluationMatrixLab({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  let cases = config.cases.map((c) => ({ ...c }));
  let failuresOnly = false;
  root.innerHTML = `
    <div class="sim-panel eval-lab">
      <div class="sim-toolbar"><div><b>Prompt 评估矩阵</b><small>修改规则，用同一 Golden Dataset 重跑</small></div><div><button class="sim-secondary" data-filter>只看失败</button><button class="sim-primary" data-run>运行评估</button></div></div>
      <div class="eval-grid"><div><textarea data-prompt spellcheck="false"></textarea><div class="add-case"><input data-input placeholder="新增边界输入"><input data-expected placeholder="期望标签"><button class="sim-secondary" data-add>加入 Golden Set</button></div></div><aside><div class="eval-metrics"><span>准确率 <b data-accuracy>—</b></span><span>回归 <b data-regression>—</b></span><span>案例 <b data-total>—</b></span></div><div class="sim-result" data-result>默认 Prompt 故意制造一个回归。</div></aside></div>
      <div class="route-table-wrap"><table><thead><tr><th>案例</th><th>期望</th><th>v1</th><th>当前</th><th>状态</th></tr></thead><tbody data-rows></tbody></table></div>
      ${artifactChips(artifacts, ['fewShotExamples'])}
    </div>`;
  const q = (s) => root.querySelector(s);
  function classify(text, prompt) {
    if (/到账|何时到账/.test(text) && /到账时间优先/.test(prompt)) return 'refund_query';
    if (/客服态度|客服很差/.test(text)) return 'complaint';
    if (/订单状态/.test(text)) return 'query';
    if (/帮我处理/.test(text) && /信息不足返回 unknown/.test(prompt)) return 'unknown';
    if (/我要退款/.test(text)) {
      if (/没找到订单号/.test(text) && /缺订单号时返回 unknown/.test(prompt)) return 'unknown';
      return 'refund';
    }
    return 'unknown';
  }
  function run() {
    const prompt = q('[data-prompt]').value;
    const rows = cases.map((c) => ({ ...c, current: classify(c.text, prompt) }));
    const correct = rows.filter((r) => r.current === r.expected).length;
    const regressions = rows.filter((r) => r.v1 === r.expected && r.current !== r.expected).length;
    q('[data-accuracy]').textContent = `${Math.round(correct / rows.length * 100)}%`;
    q('[data-regression]').textContent = regressions;
    q('[data-total]').textContent = rows.length;
    q('[data-rows]').innerHTML = rows.filter((r) => !failuresOnly || r.current !== r.expected).map((r) => `<tr class="${r.current === r.expected ? 'pass' : 'fail'}"><td><b>${r.name}</b><small>${r.text}</small></td><td>${r.expected}</td><td>${r.v1}</td><td>${r.current}</td><td>${r.current === r.expected ? '✓' : '✗'}</td></tr>`).join('');
    if (correct === rows.length && regressions === 0) {
      q('[data-result]').className = 'sim-result good';
      q('[data-result]').textContent = '✓ 全量通过且无回归。Prompt v2 和评估报告已保存。';
      artifacts.merge({
        promptV2: { version: 'v2', text: prompt },
        evaluationDataset: cases,
        evaluationReport: { total: rows.length, accuracy: 1, regressions: 0, rows },
      }, { lessonId: config.lessonId });
      complete({ rows, prompt });
    } else {
      q('[data-result]').className = 'sim-result warn';
      q('[data-result]').textContent = `${correct}/${rows.length} 通过，${regressions} 个回归。提示：删除“缺订单号时返回 unknown”这一行。`;
    }
  }
  q('[data-run]').onclick = run;
  q('[data-filter]').onclick = () => { failuresOnly = !failuresOnly; q('[data-filter]').classList.toggle('active', failuresOnly); run(); };
  q('[data-add]').onclick = () => {
    const text = q('[data-input]').value.trim();
    const expected = q('[data-expected]').value.trim();
    if (!text || !expected) return;
    cases.push({ name: '新增边界例', text, expected, v1: 'unknown' });
    q('[data-input]').value = '';
    q('[data-expected]').value = '';
    run();
  };
  q('[data-prompt]').value = config.initialPrompt;
  run();
}

export const simulators = {
  'distribution-lab': mountDistributionLab,
  'constraint-mixer': mountConstraintMixerLab,
  'code-repair': mountCodeRepairLab,
  'context-window': mountContextWindowLab,
  'prompt-anatomy': mountPromptAnatomyLab,
  'rule-routing': mountRuleRoutingLab,
  'structured-output': mountStructuredOutputLab,
  'few-shot-map': mountFewShotMapLab,
  'evaluation-matrix': mountEvaluationMatrixLab,
};
