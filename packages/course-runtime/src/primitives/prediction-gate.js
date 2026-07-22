export function mountPredictionGate({ root, config, onComplete }) {
  const options = config.options.map((option, index) => `
    <button class="cr-option" type="button" data-index="${index}">
      <span class="cr-option-key">${String.fromCharCode(65 + index)}</span>
      <span><b>${option.label}</b><small>${option.description ?? ''}</small></span>
    </button>
  `).join('');

  root.innerHTML = `
    <div class="cr-options">${options}</div>
    <div class="cr-feedback" aria-live="polite">${config.idleText ?? '先做出判断，再进入实验。'}</div>
  `;

  const feedback = root.querySelector('.cr-feedback');
  root.querySelectorAll('.cr-option').forEach((button) => {
    button.addEventListener('click', () => {
      if (root.dataset.completed === 'true') return;
      const option = config.options[Number(button.dataset.index)];
      const correct = option.value === config.correctValue;

      root.querySelectorAll('.cr-option').forEach((item) => {
        item.classList.toggle('selected', item === button);
      });

      feedback.className = `cr-feedback ${correct ? 'good' : 'miss'}`;
      feedback.textContent = correct
        ? config.correctText
        : config.incorrectText ?? '答案已记录。预测的作用是暴露直觉，不会阻止你继续实验。';

      root.dataset.completed = 'true';
      root.querySelectorAll('.cr-option').forEach((item) => { item.disabled = true; });
      onComplete?.({ value: option.value, correct });
    });
  });
}
