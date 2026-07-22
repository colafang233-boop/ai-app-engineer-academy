import { escapeHtml } from '../simulator-kit.js';

export function mountChunkBoundaryEditor({ root, blocks, initialBreaks = [], onChange }) {
  const breaks = new Set(initialBreaks);

  function chunks() {
    const result = [];
    let current = [];
    blocks.forEach((block, index) => {
      current.push(block);
      if (breaks.has(index) || index === blocks.length - 1) {
        result.push(current);
        current = [];
      }
    });
    return result;
  }

  function render() {
    root.innerHTML = `
      <div class="rag-boundary-editor" aria-label="Chunk 边界编辑器">
        ${blocks.map((block, index) => `
          <article class="rag-source-block ${block.kind ?? ''}" data-block="${index}">
            <span>${escapeHtml(block.label ?? `段 ${index + 1}`)}</span>
            <p>${escapeHtml(block.text)}</p>
          </article>
          ${index < blocks.length - 1 ? `<button type="button" class="rag-boundary ${breaks.has(index) ? 'active' : ''}" data-boundary="${index}" title="切换 Chunk 边界"><i></i><b>${breaks.has(index) ? 'Chunk 边界' : '连续上下文'}</b></button>` : ''}
        `).join('')}
      </div>`;

    root.querySelectorAll('[data-boundary]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.boundary);
        breaks.has(index) ? breaks.delete(index) : breaks.add(index);
        render();
      });
    });
    onChange?.({ chunks: chunks(), breaks: [...breaks].sort((a, b) => a - b) });
  }

  render();
  return {
    getChunks: chunks,
    setBreaks(next) {
      breaks.clear();
      next.forEach((index) => breaks.add(index));
      render();
    },
  };
}
