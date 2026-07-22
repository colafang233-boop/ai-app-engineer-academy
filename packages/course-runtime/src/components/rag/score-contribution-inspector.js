import { escapeHtml } from '../simulator-kit.js';

export function mountScoreContributionInspector({ root, modes, active = modes[0]?.id }) {
  let activeId = active;

  function render() {
    const mode = modes.find((item) => item.id === activeId) ?? modes[0];
    root.innerHTML = `
      <div class="rag-score-inspector">
        <div class="rag-scenario-tabs">${modes.map((item) => `<button type="button" class="v1-secondary ${item.id === activeId ? 'active' : ''}" data-mode="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`).join('')}</div>
        <div class="rag-score-summary"><b>${escapeHtml(mode.title)}</b><p>${escapeHtml(mode.explanation)}</p></div>
        <div class="rag-contribution-list">${mode.contributions.map((item) => `
          <article>
            <div><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.note ?? '')}</small></div>
            <i><em style="width:${Math.max(0, Math.min(100, item.value * 100))}%"></em></i>
            <span>${Number(item.value).toFixed(2)}</span>
          </article>`).join('')}</div>
      </div>`;
    root.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
      activeId = button.dataset.mode;
      render();
    }));
  }

  render();
  return { get activeId() { return activeId; } };
}
