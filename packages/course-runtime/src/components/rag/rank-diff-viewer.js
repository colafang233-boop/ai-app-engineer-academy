import { escapeHtml } from '../simulator-kit.js';

export function mountRankDiffViewer({ root, columns }) {
  const allIds = new Set(columns.flatMap((column) => column.items.map((item) => item.id)));
  root.innerHTML = `
    <div class="rag-rank-diff" style="--rank-columns:${columns.length}">
      ${columns.map((column) => `
        <section class="rag-rank-column" data-rank-column="${escapeHtml(column.id)}">
          <header><b>${escapeHtml(column.label)}</b><small>${escapeHtml(column.note ?? '')}</small></header>
          ${column.items.map((item, index) => `
            <article class="rag-rank-item ${item.relevant ? 'relevant' : ''}" data-rank-id="${escapeHtml(item.id)}">
              <span>${index + 1}</span><div><b>${escapeHtml(item.title)}</b><small>${Number(item.score ?? 0).toFixed(3)}</small></div>
            </article>`).join('')}
        </section>`).join('')}
    </div>
    <div class="rag-rank-legend"><span>共 ${allIds.size} 个候选</span><span>绿色标记为相关文档</span></div>`;
}
