function hashString(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

export function buildExamOptionOrder(examId, questionIndex, optionCount) {
  const order = Array.from({ length: optionCount }, (_, index) => index);
  if (optionCount < 2) return order;

  let state = hashString(`${examId}:${questionIndex}`);
  for (let index = optionCount - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }
  return order;
}

function reorderQuestionOptions(section, examId, questionIndex) {
  const buttons = [...section.querySelectorAll(`[data-question="${questionIndex}"]`)];
  const order = buildExamOptionOrder(examId, questionIndex, buttons.length);
  for (const optionIndex of order) section.append(buttons[optionIndex]);

  for (const button of buttons) {
    button.setAttribute('aria-pressed', button.classList.contains('selected') ? 'true' : 'false');
    button.addEventListener('click', () => {
      for (const sibling of buttons) {
        sibling.setAttribute('aria-pressed', sibling === button ? 'true' : 'false');
      }
    });
  }
}

export function installExamIntegrity(app) {
  const baseRenderExam = app.renderExam.bind(app);

  app.renderExam = function renderExamWithIntegrity(examId) {
    baseRenderExam(examId);
    const exam = this.examById(examId);
    if (!exam) return;

    this.content.querySelectorAll('.exam-questions > section').forEach((section, questionIndex) => {
      reorderQuestionOptions(section, examId, questionIndex);
    });

    const result = this.content.querySelector('[data-result]');
    if (result) {
      result.setAttribute('role', 'status');
      result.setAttribute('aria-live', 'polite');
    }
  };
}
