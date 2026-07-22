function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function mountCodeRepairLab({ root, config, artifacts, onComplete }) {
  let source = config.initialSource;
  let completed = false;

  root.innerHTML = `
    <div class="cr-code-lab">
      <div class="cr-code-toolbar">
        <div>
          <strong>${config.title}</strong>
          <small>${config.description}</small>
        </div>
        <div class="cr-code-actions">
          <button class="cr-button secondary" type="button" data-action="reset">重置</button>
          <button class="cr-button secondary" type="button" data-action="fix">应用当前修复</button>
          <button class="cr-button primary" type="button" data-action="run">运行诊断</button>
        </div>
      </div>
      <div class="cr-code-grid">
        <label class="cr-editor-label">
          <span>TypeScript 源码</span>
          <textarea class="cr-editor" spellcheck="false"></textarea>
        </label>
        <aside class="cr-diagnostics">
          <div class="cr-diagnostics-head"><b>诊断</b><span data-role="count">—</span></div>
          <div data-role="issues"></div>
          <div class="cr-terminal" data-role="terminal">点击“运行诊断”。</div>
        </aside>
      </div>
      <div class="cr-artifact-input" data-role="inputs"></div>
    </div>
  `;

  const editor = root.querySelector('.cr-editor');
  const issueRoot = root.querySelector('[data-role="issues"]');
  const count = root.querySelector('[data-role="count"]');
  const terminal = root.querySelector('[data-role="terminal"]');
  const inputRoot = root.querySelector('[data-role="inputs"]');

  const renderInputs = () => {
    const inputs = config.artifactInputs ?? [];
    if (inputs.length === 0) {
      inputRoot.hidden = true;
      return;
    }
    inputRoot.innerHTML = `<b>来自前置课程：</b>${inputs.map((name) => {
      const exists = artifacts.has(name);
      return `<span class="cr-artifact-chip ${exists ? 'ready' : 'missing'}">${name} · ${exists ? '已读取' : '暂无'}</span>`;
    }).join('')}`;
  };

  const getIssues = () => config.issues.filter((issue) => !issue.test(source));

  const renderIssues = (issues) => {
    count.textContent = `${issues.length} 个问题`;
    issueRoot.innerHTML = issues.length
      ? issues.map((issue, index) => `
          <article class="cr-issue ${index === 0 ? 'active' : ''}">
            <span>${issue.code}</span>
            <div><b>${issue.title}</b><p>${issue.explanation}</p></div>
          </article>
        `).join('')
      : '<div class="cr-all-pass">✓ 所有诊断通过</div>';
  };

  const run = () => {
    source = editor.value;
    const issues = getIssues();
    renderIssues(issues);

    if (issues.length > 0) {
      terminal.className = 'cr-terminal bad';
      terminal.textContent = `诊断失败：先处理 ${issues[0].code} · ${issues[0].title}`;
      return;
    }

    terminal.className = 'cr-terminal good';
    terminal.textContent = config.successOutput;
    if (!completed) {
      completed = true;
      artifacts.set(config.artifactOutput, source, {
        lessonId: config.lessonId,
        simulator: 'code-repair-lab',
      });
      onComplete?.({ source });
    }
  };

  const applyFix = () => {
    source = editor.value;
    const issue = getIssues()[0];
    if (!issue) {
      run();
      return;
    }
    source = issue.fix(source);
    editor.value = source;
    const remaining = getIssues();
    renderIssues(remaining);
    terminal.className = 'cr-terminal';
    terminal.textContent = `已应用 ${issue.code} 修复。继续运行诊断。`;
  };

  root.querySelector('[data-action="run"]').addEventListener('click', run);
  root.querySelector('[data-action="fix"]').addEventListener('click', applyFix);
  root.querySelector('[data-action="reset"]').addEventListener('click', () => {
    completed = false;
    source = config.initialSource;
    editor.value = source;
    renderIssues(getIssues());
    terminal.className = 'cr-terminal';
    terminal.textContent = '已重置。点击“运行诊断”。';
  });

  editor.value = source;
  renderInputs();
  renderIssues(getIssues());
}
