import { CourseRuntime } from './course-runtime.js';

const EXPERIENCE_KEY = 'ai-academy-experience-mode-v4';

export class AcademyRuntimeApp {
  constructor({ root, course, artifacts, progress, eventBus, simulators }) {
    this.root = root;
    this.course = course;
    this.artifacts = artifacts;
    this.progress = progress;
    this.eventBus = eventBus;
    this.simulators = simulators;
    this.experienceMode = localStorage.getItem(EXPERIENCE_KEY) === 'true';
  }

  mount() {
    this.root.innerHTML = `
      <header class="academy-nav">
        <button class="academy-brand" data-route="dashboard"><span>AI</span><b>${this.course.title}</b></button>
        <div class="academy-nav-actions">
          <button data-action="artifacts">产物账本</button>
          <label class="experience-toggle"><input type="checkbox" data-action="experience" ${this.experienceMode ? 'checked' : ''}><span>体验模式</span></label>
          <button data-action="reset">重置进度</button>
        </div>
        <div class="academy-progress"><i><em data-progress-bar></em></i><span data-progress-text>0%</span></div>
      </header>
      <div class="academy-content" data-content></div>
      <aside class="artifact-drawer" data-drawer hidden>
        <div class="drawer-head"><div><b>课程产物账本</b><small>上一课的真实输出会流入下一课</small></div><button data-close>×</button></div>
        <div data-artifacts></div>
      </aside>
      <div class="drawer-mask" data-mask hidden></div>`;

    this.content = this.root.querySelector('[data-content]');
    this.drawer = this.root.querySelector('[data-drawer]');
    this.mask = this.root.querySelector('[data-mask]');
    this.root.querySelector('[data-route="dashboard"]').onclick = () => this.go('dashboard');
    this.root.querySelector('[data-action="artifacts"]').onclick = () => this.openArtifacts();
    this.root.querySelector('[data-close]').onclick = () => this.closeArtifacts();
    this.mask.onclick = () => this.closeArtifacts();
    this.root.querySelector('[data-action="experience"]').onchange = (event) => {
      this.experienceMode = event.target.checked;
      localStorage.setItem(EXPERIENCE_KEY, String(this.experienceMode));
      this.route();
    };
    this.root.querySelector('[data-action="reset"]').onclick = () => {
      if (!window.confirm('重置所有 Runtime 学习进度和课程产物？')) return;
      this.progress.resetAll();
      this.artifacts.reset();
      this.go('dashboard');
    };

    window.addEventListener('hashchange', () => this.route());
    this.eventBus.on('progress:change', () => this.updateProgress());
    this.eventBus.on('progress:reset', () => this.updateProgress());
    this.eventBus.on('artifact:change', () => this.renderArtifacts());
    this.eventBus.on('artifact:reset', () => this.renderArtifacts());
    this.eventBus.on('lesson:complete', ({ lessonId }) => {
      this.updateProgress();
      const banner = document.createElement('div');
      banner.className = 'lesson-finish-banner';
      banner.innerHTML = `<b>✓ 第 ${this.lessonById(lessonId).number} 课完成</b><button>返回总控台</button>`;
      banner.querySelector('button').onclick = () => this.go('dashboard');
      this.content.prepend(banner);
    });

    this.renderArtifacts();
    this.updateProgress();
    this.route();
  }

  go(route) {
    location.hash = route === 'dashboard' ? '#dashboard' : `#${route}`;
  }

  route() {
    const hash = location.hash.replace(/^#/, '') || 'dashboard';
    if (hash === 'dashboard') return this.renderDashboard();
    if (hash.startsWith('lesson/')) return this.renderLesson(hash.split('/')[1]);
    if (hash.startsWith('exam/')) return this.renderExam(hash.split('/')[1]);
    this.renderDashboard();
  }

  lessonById(id) {
    return this.course.lessons.find((lesson) => lesson.id === id);
  }

  examById(id) {
    return this.course.exams.find((exam) => exam.id === id);
  }

  columnById(id) {
    return this.course.columns.find((column) => column.id === id);
  }

  isColumnUnlocked(column) {
    return this.experienceMode || !column.prerequisiteExamId || this.progress.isExamPassed(column.prerequisiteExamId);
  }

  isLessonUnlocked(lesson) {
    if (this.experienceMode) return true;
    const column = this.columnById(lesson.columnId);
    if (!this.isColumnUnlocked(column)) return false;
    const index = column.lessonIds.indexOf(lesson.id);
    if (index === 0) return true;
    return this.progress.isLessonComplete(column.lessonIds[index - 1]);
  }

  isExamUnlocked(exam) {
    if (this.experienceMode) return true;
    const column = this.columnById(exam.columnId);
    return column.lessonIds.every((id) => this.progress.isLessonComplete(id));
  }

  renderDashboard() {
    this.content.innerHTML = `
      <main class="dashboard-shell">
        <section class="dashboard-hero">
          <div class="dashboard-eyebrow">CONFIG-DRIVEN INTERACTIVE COURSE</div>
          <h1>课程共享一套 Runtime，<span>每个知识点拥有自己的实验装置</span></h1>
          <p>${this.course.subtitle}。你可以按顺序学习，也可以打开右上角“体验模式”自由进入任意课程。</p>
          <div class="dashboard-artifact-flow">businessRisk → languageDecision → tsSource → messages → promptV1 → classificationRules → outputSchema → fewShotExamples → evaluationReport</div>
        </section>
        ${this.course.columns.map((column) => this.renderColumn(column)).join('')}
      </main>`;
    this.bindDashboardActions();
  }

  renderColumn(column) {
    const unlocked = this.isColumnUnlocked(column);
    const exam = this.examById(column.examId);
    const examPassed = this.progress.isExamPassed(exam.id);
    return `
      <section class="column-section ${unlocked ? '' : 'locked-column'}">
        <div class="column-head"><div><span>${column.id === 'column-01' ? 'COLUMN 01' : 'COLUMN 02'}</span><h2>${column.title}</h2><p>${column.description}</p></div><div class="column-state">${examPassed ? '专栏已通过 ✓' : unlocked ? '学习中' : '等待前置考试'}</div></div>
        <div class="lesson-grid">${column.lessonIds.map((id) => this.renderLessonCard(this.lessonById(id))).join('')}</div>
        <button class="column-exam ${this.isExamUnlocked(exam) ? '' : 'locked'}" data-exam="${exam.id}" ${this.isExamUnlocked(exam) ? '' : 'disabled'}>
          <span>${examPassed ? '✓' : 'EXAM'}</span><div><b>${exam.title}</b><small>${examPassed ? `最高记录 ${this.progress.getExam(exam.id).score}%` : this.isExamUnlocked(exam) ? '已解锁，80% 通过' : '完成本专栏所有课程后解锁'}</small></div>
        </button>
      </section>`;
  }

  renderLessonCard(lesson) {
    const unlocked = this.isLessonUnlocked(lesson);
    const done = this.progress.isLessonComplete(lesson.id);
    const artifact = this.artifactForLesson(lesson.id);
    return `
      <button class="lesson-card ${done ? 'done' : ''} ${unlocked ? '' : 'locked'}" data-lesson="${lesson.id}" ${unlocked ? '' : 'disabled'}>
        <span class="lesson-number">${String(lesson.number).padStart(2, '0')}</span>
        <div><b>${lesson.shortTitle}</b><p>${lesson.title}</p><small>${done ? '课程完成 ✓' : unlocked ? artifact ? `已存在产物：${artifact}` : '进入互动实验' : '完成上一课后解锁'}</small></div>
      </button>`;
  }

  artifactForLesson(lessonId) {
    const map = {
      'lesson-01': 'businessRisk', 'lesson-02': 'languageDecision', 'lesson-03': 'tsSource', 'lesson-04': 'messages',
      'lesson-05': 'promptV1', 'lesson-06': 'classificationRules', 'lesson-07': 'outputSchema', 'lesson-08': 'fewShotExamples', 'lesson-09': 'evaluationReport',
    };
    return this.artifacts.has(map[lessonId]) ? map[lessonId] : null;
  }

  bindDashboardActions() {
    this.content.querySelectorAll('[data-lesson]').forEach((button) => button.onclick = () => this.go(`lesson/${button.dataset.lesson}`));
    this.content.querySelectorAll('[data-exam]').forEach((button) => button.onclick = () => this.go(`exam/${button.dataset.exam}`));
  }

  renderLesson(lessonId) {
    const lesson = this.lessonById(lessonId);
    if (!lesson) return this.renderDashboard();
    if (!this.isLessonUnlocked(lesson)) return this.renderLocked(`第 ${lesson.number} 课尚未解锁`, '先完成上一课或打开体验模式。');
    this.content.innerHTML = `<div class="lesson-topbar"><button data-back>← 总控台</button><div><span>LESSON ${String(lesson.number).padStart(2, '0')}</span><b>${lesson.shortTitle}</b></div><button data-ledger>查看产物</button></div><div data-lesson-root></div>`;
    this.content.querySelector('[data-back]').onclick = () => this.go('dashboard');
    this.content.querySelector('[data-ledger]').onclick = () => this.openArtifacts();
    const runtime = new CourseRuntime({
      root: this.content.querySelector('[data-lesson-root]'),
      lesson,
      artifacts: this.artifacts,
      progress: this.progress,
      eventBus: this.eventBus,
      simulators: this.simulators,
    });
    runtime.mount();
  }

  renderExam(examId) {
    const exam = this.examById(examId);
    if (!exam) return this.renderDashboard();
    if (!this.isExamUnlocked(exam)) return this.renderLocked('专栏考试尚未解锁', '完成本专栏全部课程后再来。');
    const selected = new Map();
    this.content.innerHTML = `
      <main class="exam-shell">
        <button class="exam-back" data-back>← 返回总控台</button>
        <div class="dashboard-eyebrow">COLUMN EXAM · 80% PASS</div><h1>${exam.title}</h1><p>${exam.description}</p>
        <div class="exam-questions">${exam.questions.map((q, qi) => `<section><h3>${qi + 1}. ${q.text}</h3>${q.options.map((option, oi) => `<button data-question="${qi}" data-option="${oi}">${option}</button>`).join('')}</section>`).join('')}</div>
        <button class="exam-submit" data-submit>提交考试</button><div class="exam-result" data-result>完成所有题目后提交。</div>
      </main>`;
    this.content.querySelector('[data-back]').onclick = () => this.go('dashboard');
    this.content.querySelectorAll('[data-question]').forEach((button) => {
      button.onclick = () => {
        const q = Number(button.dataset.question);
        selected.set(q, Number(button.dataset.option));
        this.content.querySelectorAll(`[data-question="${q}"]`).forEach((item) => item.classList.toggle('selected', item === button));
      };
    });
    this.content.querySelector('[data-submit]').onclick = () => {
      const result = this.content.querySelector('[data-result]');
      if (selected.size !== exam.questions.length) {
        result.className = 'exam-result bad';
        result.textContent = '还有题目未作答。';
        return;
      }
      const correct = exam.questions.filter((q, index) => selected.get(index) === q.correct).length;
      const score = Math.round(correct / exam.questions.length * 100);
      const passed = score >= 80;
      this.progress.recordExam(exam.id, { score, passed });
      result.className = `exam-result ${passed ? 'good' : 'bad'}`;
      result.innerHTML = passed
        ? `✓ ${score} 分，通过。${exam.id === 'exam-column-01' ? '第二专栏已经解锁。' : '前两个专栏全部完成。'} <button data-dashboard>返回总控台</button>`
        : `${score} 分，未达到 80%。可以修改答案后重新提交。`;
      result.querySelector('[data-dashboard]')?.addEventListener('click', () => this.go('dashboard'));
      this.updateProgress();
    };
  }

  renderLocked(title, description) {
    this.content.innerHTML = `<main class="locked-page"><div>⌁</div><h1>${title}</h1><p>${description}</p><button data-back>返回总控台</button></main>`;
    this.content.querySelector('[data-back]').onclick = () => this.go('dashboard');
  }

  openArtifacts() {
    this.renderArtifacts();
    this.drawer.hidden = false;
    this.mask.hidden = false;
  }

  closeArtifacts() {
    this.drawer.hidden = true;
    this.mask.hidden = true;
  }

  renderArtifacts() {
    const target = this.root.querySelector('[data-artifacts]');
    if (!target) return;
    const data = this.artifacts.get();
    const names = Object.keys(data).filter((name) => name !== '__meta');
    target.innerHTML = names.length ? names.map((name) => `
      <details class="artifact-item"><summary><b>${name}</b><span>${this.artifactDescription(name)}</span></summary><pre>${this.escape(JSON.stringify(data[name], null, 2))}</pre></details>`).join('') : '<div class="empty-artifacts">还没有课程产物。进入课程完成实验后，这里会逐步增长。</div>';
  }

  artifactDescription(name) {
    const labels = {
      businessRisk: '概率性与失败要求', languageDecision: '语言选型结果', tsSource: '修复后的 TypeScript 源码', messages: '模型请求消息包',
      promptV1: '第一版 Prompt', classificationRules: '分类规则与优先级', outputSchema: '结构化输出契约', fewShotExamples: '示例集合',
      promptV2: '通过评估的 Prompt', evaluationDataset: 'Golden Dataset', evaluationReport: '回归评估报告',
    };
    return labels[name] ?? '课程产物';
  }

  escape(value) {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  updateProgress() {
    if (!this.root.querySelector('[data-progress-bar]')) return;
    const lessonCount = this.course.lessons.length;
    const examCount = this.course.exams.length;
    const completedLessons = this.course.lessons.filter((lesson) => this.progress.isLessonComplete(lesson.id)).length;
    const completedExams = this.course.exams.filter((exam) => this.progress.isExamPassed(exam.id)).length;
    const percent = Math.round((completedLessons + completedExams) / (lessonCount + examCount) * 100);
    this.root.querySelector('[data-progress-bar]').style.width = `${percent}%`;
    this.root.querySelector('[data-progress-text]').textContent = `${percent}%`;
  }
}
