export function mountRetryableQuiz({ root, config, onComplete }) {
  root.innerHTML = `
    <div class="cr-quiz-options">
      ${config.options.map((option, index) => `
        <button class="cr-quiz-option" type="button" data-index="${index}">${option.label}</button>
      `).join('')}
    </div>
    <div class="cr-feedback" aria-live="polite">${config.idleText ?? '选择一个答案。答错可以继续尝试。'}</div>
  `;

  const feedback = root.querySelector('.cr-feedback');
  root.querySelectorAll('.cr-quiz-option').forEach((button) => {
    button.addEventListener('click', () => {
      if (root.dataset.completed === 'true') return;
      const option = config.options[Number(button.dataset.index)];
      const correct = option.value === config.correctValue;

      if (!correct) {
        button.classList.add('wrong');
        feedback.className = 'cr-feedback bad';
        feedback.textContent = option.feedback ?? config.incorrectText ?? '还不对，可以继续选择。';
        window.setTimeout(() => button.classList.remove('wrong'), 500);
        return;
      }

      root.dataset.completed = 'true';
      button.classList.add('correct');
      root.querySelectorAll('.cr-quiz-option').forEach((item) => { item.disabled = true; });
      feedback.className = 'cr-feedback good';
      feedback.textContent = config.correctText;
      onComplete?.({ value: option.value });
    });
  });
}
