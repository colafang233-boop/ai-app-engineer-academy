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

function installPassedExamMessage(app, exam, result) {
  const submit = app.content.querySelector('[data-submit]');
  if (!submit || !result) return;

  submit.addEventListener('click', () => {
    queueMicrotask(() => {
      if (!result.classList.contains('good')) return;
      const state = app.progress.getExam(exam.id);
      const columnIndex = app.course.columns.findIndex((column) => column.id === exam.columnId);
      const hasNextColumn = columnIndex >= 0 && columnIndex < app.course.columns.length - 1;
      const nextStep = hasNextColumn
        ? '下一专栏已经加入你的学习路径。'
        : '全部课程与最终毕业答辩已经完成。';
      result.innerHTML = `✓ ${state.score} 分，通过。${nextStep} <button data-dashboard type="button">返回学习路径</button>`;
      result.querySelector('[data-dashboard]')?.addEventListener('click', () => app.go('dashboard'));
    });
  });
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
    installPassedExamMessage(this, exam, result);
  };
}
