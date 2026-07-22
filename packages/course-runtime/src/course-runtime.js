import { mountPredictionGate } from './primitives/prediction-gate.js';
import { mountRetryableQuiz } from './primitives/retryable-quiz.js';

const RUNTIME_STYLE_ID = 'course-runtime-styles';
const stageLabels = {
  prediction: '先判断',
  simulator: '动手实验',
  content: '原理揭示',
  quiz: '迁移应用',
};

function ensureStyles() {
  if (document.getElementById(RUNTIME_STYLE_ID)) return;
  if (document.querySelector('link[href$="styles.css"]')) return;

  const style = document.createElement('style');
  style.id = RUNTIME_STYLE_ID;
  style.textContent = `
    :root{--cr-paper:#f4f5f0;--cr-card:#fff;--cr-ink:#15202b;--cr-muted:#6b7782;--cr-line:#d8dedf;--cr-teal:#0b7a75;--cr-teal-soft:#e1f0ed;--cr-marker:#f5dd60;--cr-red:#cc4053;--cr-red-soft:#fae6ea;--cr-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--cr-serif:"Songti SC","STSong",Georgia,serif;--cr-sans:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}
    *{box-sizing:border-box}.cr-course{max-width:1100px;margin:auto;padding:0 22px 90px;color:var(--cr-ink);font-family:var(--cr-sans);line-height:1.7}.cr-hero{padding:70px 0 28px}.cr-eyebrow{font:700 12px var(--cr-mono);letter-spacing:.16em;color:var(--cr-teal)}.cr-hero h1{max-width:900px;margin:12px 0;font:900 clamp(2.1rem,5vw,4rem)/1.18 var(--cr-serif)}.cr-hero p{max-width:760px;color:var(--cr-muted)}.cr-marker{background:linear-gradient(transparent 58%,var(--cr-marker) 58%)}
    .cr-stage{padding:58px 0;border-top:1px solid var(--cr-line)}.cr-stage-head{display:flex;gap:14px;align-items:baseline}.cr-stage-no{font:900 15px var(--cr-serif);color:var(--cr-teal)}.cr-stage h2{margin:0;font:900 clamp(1.5rem,3vw,2.25rem)/1.25 var(--cr-serif)}.cr-stage-lede{max-width:760px;color:var(--cr-muted)}.cr-stage-body{margin-top:22px}.cr-locked{position:relative;opacity:.45;pointer-events:none}.cr-locked::after{content:'完成前一部分后继续';position:absolute;inset:0;display:grid;place-items:center;background:rgba(244,245,240,.74);font-weight:800}
    .cr-options,.cr-quiz-options{display:grid;gap:10px}.cr-option,.cr-quiz-option{display:flex;gap:12px;text-align:left;padding:14px;border:1px solid var(--cr-line);border-radius:10px;background:var(--cr-card);cursor:pointer}.cr-option:hover,.cr-quiz-option:hover{border-color:var(--cr-teal)}.cr-option.selected{border-color:var(--cr-teal);box-shadow:0 0 0 2px var(--cr-teal-soft)}.cr-option-key{display:grid;place-items:center;width:28px;height:28px;flex:0 0 auto;border:1px solid var(--cr-ink);border-radius:7px;font:700 12px var(--cr-mono)}.cr-option small{display:block;color:var(--cr-muted)}.cr-feedback{margin-top:12px;padding:11px 13px;border-radius:9px;background:#eef1f1;color:var(--cr-muted)}.cr-feedback.good{background:var(--cr-teal-soft);color:#075b58}.cr-feedback.bad,.cr-feedback.miss{background:var(--cr-red-soft);color:#8f2635}.cr-quiz-option.correct{border-color:var(--cr-teal);background:var(--cr-teal-soft)}.cr-quiz-option.wrong{border-color:var(--cr-red);background:var(--cr-red-soft)}
    .cr-reveal{padding:18px;border-left:5px solid var(--cr-marker);background:#fffdf2}.cr-complete{margin-top:22px;padding:15px;border:1px solid var(--cr-teal);border-radius:10px;background:var(--cr-teal-soft);font-weight:800;color:#075b58}
  `;
  document.head.appendChild(style);
}

export class CourseRuntime {
  constructor({ root, lesson, artifacts, progress, eventBus, simulators }) {
    this.root = root;
    this.lesson = lesson;
    this.artifacts = artifacts;
    this.progress = progress;
    this.eventBus = eventBus;
    this.simulators = simulators;
    this.stageElements = new Map();
  }

  mount() {
    ensureStyles();
    this.root.classList.add('cr-course');
    this.root.innerHTML = this.#renderShell();
    this.#mountStages();
    this.#restoreProgress();
  }

  #renderShell() {
    const { lesson } = this;
    return `
      <header class="cr-hero">
        <div class="cr-eyebrow">${lesson.eyebrow}</div>
        <h1>${lesson.titleHtml ?? lesson.title}</h1>
        <p>${lesson.description}</p>
      </header>
      ${lesson.stages.map((stage, index) => `
        <section class="cr-stage ${index > 0 ? 'cr-locked' : ''}" data-stage="${stage.id}">
          <div class="cr-stage-head">
            <span class="cr-stage-no">${String(index + 1).padStart(2, '0')}</span>
            <div class="cr-stage-title-wrap">
              <span class="cr-stage-kicker">${stageLabels[stage.type] ?? '课程内容'}</span>
              <h2>${stage.title}</h2>
            </div>
          </div>
          <p class="cr-stage-lede">${stage.description ?? ''}</p>
          <div class="cr-stage-body"></div>
        </section>
      `).join('')}
      <div class="cr-complete" hidden data-role="lesson-complete">✓ 本课已经完成，你的项目成果已保存。</div>
    `;
  }

  #mountStages() {
    this.lesson.stages.forEach((stage, index) => {
      const stageElement = this.root.querySelector(`[data-stage="${stage.id}"]`);
      this.stageElements.set(stage.id, stageElement);
      const body = stageElement.querySelector('.cr-stage-body');
      const complete = (detail = {}) => this.#completeStage(stage, index, detail);

      if (stage.type === 'prediction') {
        mountPredictionGate({ root: body, config: stage, onComplete: complete });
        return;
      }

      if (stage.type === 'quiz') {
        mountRetryableQuiz({ root: body, config: stage, onComplete: complete });
        return;
      }

      if (stage.type === 'content') {
        body.innerHTML = `<div class="cr-reveal">${stage.html}</div>`;
        return;
      }

      if (stage.type === 'simulator') {
        const simulator = this.simulators[stage.simulator];
        if (!simulator) throw new Error(`Unknown simulator: ${stage.simulator}`);
        simulator({
          root: body,
          config: { ...stage.config, lessonId: this.lesson.id },
          artifacts: this.artifacts,
          eventBus: this.eventBus,
          onComplete: complete,
        });
      }
    });
  }

  #completeStage(stage, index, detail) {
    this.progress.completeStage(this.lesson.id, stage.id);
    this.eventBus.emit('stage:complete', {
      lessonId: this.lesson.id,
      stageId: stage.id,
      detail,
    });

    const next = this.lesson.stages[index + 1];
    if (next) {
      this.#unlock(next.id);
      if (next.type === 'content') {
        this.progress.completeStage(this.lesson.id, next.id);
        const afterContent = this.lesson.stages[index + 2];
        if (afterContent) this.#unlock(afterContent.id);
      }
      return;
    }

    this.progress.completeLesson(this.lesson.id);
    this.root.querySelector('[data-role="lesson-complete"]').hidden = false;
    this.eventBus.emit('lesson:complete', { lessonId: this.lesson.id });
  }

  #unlock(stageId) {
    this.stageElements.get(stageId)?.classList.remove('cr-locked');
  }

  #restoreProgress() {
    const lessonProgress = this.progress.getLesson(this.lesson.id);
    let canUnlockNext = true;
    this.lesson.stages.forEach((stage) => {
      const completed = lessonProgress.completedStages.includes(stage.id);
      if (canUnlockNext) this.#unlock(stage.id);
      if (!completed && stage.type !== 'content') canUnlockNext = false;
    });
    if (lessonProgress.completed) {
      this.root.querySelector('[data-role="lesson-complete"]').hidden = false;
    }
  }
}
