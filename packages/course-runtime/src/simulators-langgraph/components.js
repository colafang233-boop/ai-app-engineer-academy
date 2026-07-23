import { q } from './shared.js';

export function mountGraphExecutionCanvas(root, { nodes, steps, initialState }) {
  root.innerHTML = `
    <div class="lg-graph-canvas">
      <div class="lg-graph-map" data-map>
        ${nodes.map((node) => `<article class="lg-node" data-node="${node.id}"><span>${node.kind ?? 'NODE'}</span><b>${node.label}</b><small>${node.note ?? ''}</small></article>`).join('')}
      </div>
      <aside class="lg-state-inspector">
        <div><span>SUPERSTEP</span><b data-step>0</b></div>
        <pre data-state>${JSON.stringify(initialState, null, 2)}</pre>
        <div class="lg-trace" data-trace></div>
      </aside>
    </div>`;

  let index = 0;
  let state = structuredClone(initialState);
  function render() {
    root.querySelectorAll('[data-node]').forEach((node) => node.classList.remove('active', 'done'));
    steps.slice(0, index).forEach((step) => step.nodes.forEach((id) => root.querySelector(`[data-node="${id}"]`)?.classList.add('done')));
    steps[index]?.nodes.forEach((id) => root.querySelector(`[data-node="${id}"]`)?.classList.add('active'));
    q(root, '[data-step]').textContent = String(index);
    q(root, '[data-state]').textContent = JSON.stringify(state, null, 2);
    q(root, '[data-trace]').innerHTML = steps.slice(0, index).map((step, i) => `<article><span>${String(i + 1).padStart(2, '0')}</span><b>${step.label}</b><small>${step.detail}</small></article>`).join('');
  }
  function step() {
    if (index >= steps.length) return { done: true, state };
    const current = steps[index];
    state = current.apply ? current.apply(structuredClone(state)) : { ...state, ...(current.update ?? {}) };
    index += 1;
    render();
    return { done: index >= steps.length, state, current };
  }
  function reset() {
    index = 0;
    state = structuredClone(initialState);
    render();
  }
  render();
  return { step, reset, getState: () => structuredClone(state), getIndex: () => index };
}

export function mountStateChannelBoard(root, channels) {
  root.innerHTML = `<div class="lg-channel-board">${channels.map((channel) => `
    <article data-channel="${channel.id}">
      <div><span>${channel.type}</span><b>${channel.label}</b><small>${channel.note}</small></div>
      <select data-reducer="${channel.id}">
        <option value="overwrite">overwrite</option>
        <option value="append">append</option>
        <option value="sum">sum</option>
        <option value="union">set union</option>
        <option value="messages">MessagesValue</option>
      </select>
      <pre data-preview="${channel.id}">等待并行更新</pre>
    </article>`).join('')}</div>`;

  function run(updates) {
    const results = {};
    channels.forEach((channel) => {
      const reducer = q(root, `[data-reducer="${channel.id}"]`).value;
      const values = updates[channel.id] ?? [];
      let value = channel.initial;
      if (reducer === 'overwrite') value = values.at(-1);
      if (reducer === 'append' || reducer === 'messages') value = [...(Array.isArray(value) ? value : []), ...values.flatMap((item) => Array.isArray(item) ? item : [item])];
      if (reducer === 'sum') value = Number(value ?? 0) + values.reduce((sum, item) => sum + Number(item), 0);
      if (reducer === 'union') value = [...new Set([...(Array.isArray(value) ? value : []), ...values.flatMap((item) => Array.isArray(item) ? item : [item])])];
      results[channel.id] = { reducer, value };
      q(root, `[data-preview="${channel.id}"]`).textContent = JSON.stringify(value, null, 2);
      root.querySelector(`[data-channel="${channel.id}"]`).classList.toggle('good', reducer === channel.correct);
    });
    return results;
  }
  return { run };
}

export function mountCheckpointForkTree(root, checkpoints) {
  root.innerHTML = `
    <div class="lg-checkpoint-tree">
      ${checkpoints.map((item) => `<button type="button" data-checkpoint="${item.id}" class="${item.parent ? 'branch' : 'root'}"><span>${item.id}</span><b>${item.label}</b><small>${item.state}</small></button>`).join('')}
    </div>
    <div class="lg-fork-panel">
      <div><span>SELECTED CHECKPOINT</span><b data-selected>—</b></div>
      <pre data-checkpoint-state>{}</pre>
    </div>`;
  let selected = null;
  root.querySelectorAll('[data-checkpoint]').forEach((button) => button.addEventListener('click', () => {
    selected = checkpoints.find((item) => item.id === button.dataset.checkpoint);
    root.querySelectorAll('[data-checkpoint]').forEach((item) => item.classList.toggle('active', item === button));
    q(root, '[data-selected]').textContent = `${selected.id} · ${selected.label}`;
    q(root, '[data-checkpoint-state]').textContent = JSON.stringify(selected.snapshot, null, 2);
  }));
  return { getSelected: () => selected };
}
