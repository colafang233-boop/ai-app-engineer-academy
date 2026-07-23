export function once(callback) {
  let done = false;
  return (detail) => {
    if (done) return;
    done = true;
    callback?.(detail);
  };
}

export function setResult(element, state, text) {
  element.className = `mcp-result ${state ?? ''}`.trim();
  element.textContent = text;
}

export function teachingNotice() {
  return '<div class="mcp-teaching-note"><b>教学模拟数据</b><span>本实验用于解释协议与工程决策，不冒充真实 Host、OAuth Provider 或生产压测结果。</span></div>';
}

export function artifactChips(artifacts, names = []) {
  if (!names.length) return '';
  return `<div class="mcp-artifact-chips"><b>读取前置成果</b>${names.map((name) => `<span class="${artifacts.has(name) ? 'ready' : 'missing'}">${name} · ${artifacts.has(name) ? '已读取' : '暂无'}</span>`).join('')}</div>`;
}

export function mountDecisionSeries({ root, config, artifacts, onComplete, definition }) {
  const complete = once(onComplete);
  let index = 0;
  const decisions = {};
  root.innerHTML = `
    <div class="mcp-panel ${definition.className ?? ''}">
      <div class="mcp-toolbar"><div><b>${definition.title}</b><small>${definition.subtitle}</small></div><span data-progress>1 / ${definition.scenarios.length}</span></div>
      <div class="mcp-grid"><section>
        <span class="mcp-label">当前场景</span>
        <article class="mcp-scenario-card"><b data-title></b><p data-detail></p></article>
        <span class="mcp-label">你的决策</span>
        <div class="mcp-choice-grid" data-choices></div>
      </section><aside>
        ${definition.asideHtml ?? '<div class="mcp-mini-pipeline"><span>识别主体</span><i>→</i><span>选择契约</span><i>→</i><span>验证边界</span></div>'}
        <div class="mcp-result" data-result>完成所有场景。</div>
        ${artifactChips(artifacts, definition.inputs)}
        ${teachingNotice()}
      </aside></div>
    </div>`;
  const q = (selector) => root.querySelector(selector);
  function render() {
    const scenario = definition.scenarios[index];
    q('[data-progress]').textContent = `${index + 1} / ${definition.scenarios.length}`;
    q('[data-title]').textContent = scenario.title;
    q('[data-detail]').textContent = scenario.detail;
    q('[data-choices]').innerHTML = scenario.options.map((option) => `<button type="button" data-choice="${option.value}"><b>${option.label}</b><small>${option.description ?? ''}</small></button>`).join('');
    root.querySelectorAll('[data-choice]').forEach((button) => button.addEventListener('click', () => {
      const value = button.dataset.choice;
      if (value !== scenario.answer) {
        root.querySelectorAll('[data-choice]').forEach((item) => item.classList.toggle('selected', item === button));
        setResult(q('[data-result]'), 'warn', scenario.hint ?? '这个选择没有满足当前场景的关键约束。');
        return;
      }
      decisions[scenario.id] = value;
      button.classList.add('correct');
      if (index < definition.scenarios.length - 1) {
        index += 1;
        setResult(q('[data-result]'), 'good', `✓ ${scenario.success ?? '当前场景正确'}，继续下一项。`);
        window.setTimeout(render, 80);
        return;
      }
      const artifact = {
        asOf: '2026-07-23',
        decisions,
        note: definition.artifactNote,
      };
      artifacts.set(definition.artifactName, artifact, { lessonId: config.lessonId });
      setResult(q('[data-result]'), 'good', `✓ ${definition.completeText}`);
      complete(artifact);
    }));
  }
  render();
}

export function mountChecklistLab({ root, config, artifacts, onComplete, definition }) {
  const complete = once(onComplete);
  root.innerHTML = `
    <div class="mcp-panel ${definition.className ?? ''}">
      <div class="mcp-toolbar"><div><b>${definition.title}</b><small>${definition.subtitle}</small></div><button class="mcp-primary" type="button" data-run>${definition.actionLabel ?? '验证配置'}</button></div>
      <div class="mcp-grid"><section>
        ${definition.lede ? `<div class="mcp-scenario-card"><b>${definition.lede}</b><p>${definition.detail ?? ''}</p></div>` : ''}
        <div class="mcp-checklist">${definition.checks.map((item) => `<label><input type="checkbox" data-check="${item.id}"> <span><b>${item.label}</b><small>${item.description}</small></span></label>`).join('')}</div>
        ${(definition.selects ?? []).map((select) => `<label class="mcp-select-label"><span>${select.label}</span><select data-select="${select.id}">${select.options.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}</select></label>`).join('')}
      </section><aside>
        ${definition.asideHtml ?? '<pre class="mcp-code" data-code>等待验证…</pre>'}
        <div class="mcp-result" data-result>${definition.idleText ?? '完成必要配置后运行。'}</div>
        ${artifactChips(artifacts, definition.inputs)}
        ${teachingNotice()}
      </aside></div>
    </div>`;
  const q = (selector) => root.querySelector(selector);
  q('[data-run]').addEventListener('click', () => {
    const missing = definition.checks.filter((item) => !q(`[data-check="${item.id}"]`).checked);
    const wrong = (definition.selects ?? []).filter((select) => q(`[data-select="${select.id}"]`).value !== select.correct);
    if (missing.length || wrong.length) {
      setResult(q('[data-result]'), 'warn', `仍缺少：${[...missing.map((item) => item.label), ...wrong.map((item) => item.label)].join('、')}。`);
      return;
    }
    const artifact = {
      asOf: '2026-07-23',
      checks: Object.fromEntries(definition.checks.map((item) => [item.id, true])),
      selections: Object.fromEntries((definition.selects ?? []).map((select) => [select.id, q(`[data-select="${select.id}"]`).value])),
      note: definition.artifactNote,
    };
    artifacts.set(definition.artifactName, artifact, { lessonId: config.lessonId });
    q('[data-code]') && (q('[data-code]').textContent = definition.successCode ?? JSON.stringify(artifact, null, 2));
    setResult(q('[data-result]'), 'good', `✓ ${definition.completeText}`);
    complete(artifact);
  });
}

export function mountClassificationLab({ root, config, artifacts, onComplete, definition }) {
  const complete = once(onComplete);
  root.innerHTML = `
    <div class="mcp-panel ${definition.className ?? ''}">
      <div class="mcp-toolbar"><div><b>${definition.title}</b><small>${definition.subtitle}</small></div><button class="mcp-primary" type="button" data-run>检查分类</button></div>
      <div class="mcp-table-wrap"><table class="mcp-table"><thead><tr><th>能力</th><th>分类</th><th>说明</th></tr></thead><tbody>
        ${definition.items.map((item, index) => `<tr data-row="${index}"><td><b>${item.label}</b><small>${item.description}</small></td><td><select data-item="${index}"><option value="">请选择</option>${definition.categories.map((category) => `<option value="${category.value}">${category.label}</option>`).join('')}</select></td><td data-why="${index}">等待判断</td></tr>`).join('')}
      </tbody></table></div>
      <div class="mcp-panel-footer"><div class="mcp-result" data-result>完成全部分类。</div>${teachingNotice()}</div>
    </div>`;
  const q = (selector) => root.querySelector(selector);
  q('[data-run]').addEventListener('click', () => {
    let correct = 0;
    definition.items.forEach((item, index) => {
      const value = q(`[data-item="${index}"]`).value;
      const ok = value === item.answer;
      q(`[data-row="${index}"]`).className = ok ? 'pass' : 'fail';
      q(`[data-why="${index}"]`).textContent = ok ? item.why : '控制关系或语义不匹配';
      if (ok) correct += 1;
    });
    if (correct !== definition.items.length) {
      setResult(q('[data-result]'), 'warn', `当前正确 ${correct}/${definition.items.length}。`);
      return;
    }
    const artifact = {
      asOf: '2026-07-23',
      catalog: Object.fromEntries(definition.items.map((item) => [item.id, item.answer])),
      note: definition.artifactNote,
    };
    artifacts.set(definition.artifactName, artifact, { lessonId: config.lessonId });
    setResult(q('[data-result]'), 'good', `✓ ${definition.completeText}`);
    complete(artifact);
  });
}
