export function once(callback) {
  let done = false;
  return (detail) => {
    if (done) return;
    done = true;
    callback?.(detail);
  };
}

export function q(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

export function setResult(element, state, text) {
  element.className = `lg-result ${state}`.trim();
  element.textContent = text;
}

export function artifactChips(artifacts, names = []) {
  if (!names.length) return '';
  return `<div class="sim-artifacts"><b>前置成果</b>${names.map((name) => `<span class="sim-chip ${artifacts.has(name) ? 'ready' : 'missing'}">${name} · ${artifacts.has(name) ? '已带入' : '尚未完成'}</span>`).join('')}</div>`;
}

export function teachingNotice() {
  return '<div class="lg-teaching-note"><b>教学模拟</b><span>指标和运行数据用于解释机制，不代表任何真实模型或生产 SLA。</span></div>';
}

export function scenarioTabs(items, active) {
  return `<div class="lg-tabs">${items.map((item) => `<button type="button" class="lg-secondary ${item.id === active ? 'active' : ''}" data-scenario="${item.id}">${item.label}</button>`).join('')}</div>`;
}

export function metricGrid(metrics) {
  return `<div class="lg-metrics">${metrics.map((metric) => `<article><span>${metric.label}</span><b>${metric.value}</b><small>${metric.note ?? ''}</small></article>`).join('')}</div>`;
}

export function saveArtifact(artifacts, name, value, config) {
  artifacts.set(name, value, { lessonId: config.lessonId });
  return value;
}

export function bindRange(root, selector, labelSelector, callback) {
  const input = q(root, selector);
  const label = q(root, labelSelector);
  input.addEventListener('input', (event) => {
    label.textContent = event.target.value;
    callback?.(Number(event.target.value));
  });
}

export function renderRows(rows) {
  return rows.map((row) => `<tr class="${row.state ?? ''}"><td><b>${row.title}</b>${row.detail ? `<small>${row.detail}</small>` : ''}</td><td>${row.choice ?? ''}</td><td>${row.status ?? ''}</td></tr>`).join('');
}
