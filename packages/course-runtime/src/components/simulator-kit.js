export function once(callback) {
  let done = false;
  return (detail) => {
    if (done) return;
    done = true;
    callback?.(detail);
  };
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function setResult(element, state, text) {
  element.className = `v1-result ${state ?? ''}`.trim();
  element.textContent = text;
}

export function query(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Missing simulator element: ${selector}`);
  return element;
}

export function artifactChips(artifacts, names = []) {
  if (!names.length) return '';
  return `<div class="sim-artifacts"><b>已带入项目成果</b>${names.map((name) => `
    <span class="sim-chip ${artifacts.has(name) ? 'ready' : 'missing'}">${escapeHtml(name)} · ${artifacts.has(name) ? '已读取' : '尚未完成'}</span>`).join('')}</div>`;
}

export function renderMetricCards(metrics) {
  return `<div class="v1-metric-grid rag-metrics">${metrics.map((metric) => `
    <article class="v1-metric ${metric.state ?? ''}" data-metric="${escapeHtml(metric.id)}">
      <span>${escapeHtml(metric.label)}</span>
      <b>${escapeHtml(metric.value)}</b>
      <small>${escapeHtml(metric.note ?? '')}</small>
    </article>`).join('')}</div>`;
}

export function updateMetric(root, id, value, note = '') {
  const card = root.querySelector(`[data-metric="${id}"]`);
  if (!card) return;
  card.querySelector('b').textContent = String(value);
  card.querySelector('small').textContent = note;
}

export function renderScenarioTabs(scenarios, activeId) {
  return `<div class="rag-scenario-tabs">${scenarios.map((scenario) => `
    <button type="button" class="v1-secondary ${scenario.id === activeId ? 'active' : ''}" data-scenario="${escapeHtml(scenario.id)}">
      ${escapeHtml(scenario.label)}
    </button>`).join('')}</div>`;
}

export function bindScenarioTabs(root, scenarios, initialId, onChange) {
  let activeId = initialId ?? scenarios[0]?.id;
  const renderActive = () => {
    root.querySelectorAll('[data-scenario]').forEach((button) => {
      button.classList.toggle('active', button.dataset.scenario === activeId);
    });
  };
  root.querySelectorAll('[data-scenario]').forEach((button) => {
    button.addEventListener('click', () => {
      activeId = button.dataset.scenario;
      renderActive();
      onChange?.(scenarios.find((item) => item.id === activeId), activeId);
    });
  });
  renderActive();
  return {
    get activeId() { return activeId; },
    set(id) {
      if (!scenarios.some((item) => item.id === id)) return;
      activeId = id;
      renderActive();
      onChange?.(scenarios.find((item) => item.id === activeId), activeId);
    },
  };
}

export function bindRange(root, selector, labelSelector, onInput) {
  const input = query(root, selector);
  const label = query(root, labelSelector);
  const update = () => {
    label.textContent = input.value;
    onInput?.(Number(input.value), input);
  };
  input.addEventListener('input', update);
  update();
  return input;
}

export function renderCandidateTable(candidates, { scoreLabel = '得分', statusLabel = '相关性' } = {}) {
  return `<div class="v1-table-wrap"><table class="v1-table rag-candidate-table"><thead><tr>
    <th>排名</th><th>候选</th><th>${escapeHtml(scoreLabel)}</th><th>${escapeHtml(statusLabel)}</th>
  </tr></thead><tbody>${candidates.map((candidate, index) => `
    <tr class="${candidate.relevant ? 'pass' : candidate.hardNegative ? 'fail' : ''}" data-candidate="${escapeHtml(candidate.id)}">
      <td><b>${index + 1}</b></td>
      <td><b>${escapeHtml(candidate.title)}</b><small>${escapeHtml(candidate.snippet ?? '')}</small></td>
      <td>${Number(candidate.score ?? 0).toFixed(3)}</td>
      <td>${candidate.relevant ? '相关' : candidate.hardNegative ? '难负例' : '无关'}</td>
    </tr>`).join('')}</tbody></table></div>`;
}

export function recallAtK(candidates, relevantIds, k) {
  const relevant = new Set(relevantIds);
  const total = relevant.size || 1;
  const found = candidates.slice(0, k).filter((item) => relevant.has(item.id)).length;
  return found / total;
}

export function precisionAtK(candidates, relevantIds, k) {
  const relevant = new Set(relevantIds);
  if (!k) return 0;
  return candidates.slice(0, k).filter((item) => relevant.has(item.id)).length / k;
}

export function reciprocalRank(candidates, relevantIds) {
  const relevant = new Set(relevantIds);
  const index = candidates.findIndex((item) => relevant.has(item.id));
  return index < 0 ? 0 : 1 / (index + 1);
}

export function ndcgAtK(candidates, relevanceById, k) {
  const dcg = candidates.slice(0, k).reduce((sum, item, index) => {
    const relevance = Number(relevanceById[item.id] ?? 0);
    return sum + ((2 ** relevance) - 1) / Math.log2(index + 2);
  }, 0);
  const ideal = Object.values(relevanceById)
    .map(Number)
    .sort((a, b) => b - a)
    .slice(0, k)
    .reduce((sum, relevance, index) => sum + ((2 ** relevance) - 1) / Math.log2(index + 2), 0);
  return ideal ? dcg / ideal : 0;
}

export function percent(value) {
  return `${Math.round(Number(value) * 100)}%`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizedScore(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

export function rankByScore(items, scoreKey = 'score') {
  return [...items].sort((a, b) => Number(b[scoreKey] ?? 0) - Number(a[scoreKey] ?? 0));
}

export function rrfFuse(resultSets, rankConstant = 60) {
  const byId = new Map();
  resultSets.forEach((items, sourceIndex) => {
    items.forEach((item, rank) => {
      const current = byId.get(item.id) ?? { ...item, score: 0, sources: [] };
      current.score += 1 / (rankConstant + rank + 1);
      current.sources.push({ sourceIndex, rank: rank + 1 });
      byId.set(item.id, current);
    });
  });
  return rankByScore([...byId.values()]);
}

export function linearFuse(resultSets, weights) {
  const byId = new Map();
  resultSets.forEach((items, sourceIndex) => {
    const scores = items.map((item) => Number(item.score ?? 0));
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    items.forEach((item) => {
      const current = byId.get(item.id) ?? { ...item, score: 0, sources: [] };
      const score = normalizedScore(Number(item.score ?? 0), min, max);
      current.score += score * Number(weights[sourceIndex] ?? 1);
      current.sources.push({ sourceIndex, rawScore: item.score, normalizedScore: score });
      byId.set(item.id, current);
    });
  });
  return rankByScore([...byId.values()]);
}

export function ensureTeachingDataNotice() {
  return '<div class="rag-teaching-note"><b>教学模拟数据</b><span>指标用于解释参数关系，不代表任何真实模型或数据库的生产基准。</span></div>';
}

export function saveArtifact({ artifacts, key, value, lessonId }) {
  artifacts.set(key, value, { lessonId });
  return value;
}
