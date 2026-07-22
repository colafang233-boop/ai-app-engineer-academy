import { CourseRuntime } from './course-runtime.js';

const PREVIEW_KEY = 'ai-academy-preview-mode-v4';

export class AcademyRuntimeApp {
  constructor({ root, course, artifacts, progress, eventBus, simulators }) {
    this.root = root;
    this.course = course;
    this.artifacts = artifacts;
    this.progress = progress;
    this.eventBus = eventBus;
    this.simulators = simulators;

    const params = new URLSearchParams(window.location.search);
    this.debugMode = params.get('debug') === '1';
    this.previewMode = params.get('preview') === '1'
      || (this.debugMode && localStorage.getItem(PREVIEW_KEY) === 'true');
  }

  mount() {
    this.root.innerHTML = `
      <header class="academy-nav">
        <button class="academy-brand" data-route="dashboard" type="button">
          <span>AI</span>
          <div><b>${this.course.title}</b><small>互动式 AI 工程课程</small></div>
        </button>

        <div class="academy-progress" aria-label="课程总进度">
          <div><span>学习进度</span><b data-progress-text>0%</b></div>
          <i><em data-progress-bar></em></i>
        </div>

        <div class="academy-nav-actions">
          ${this.previewMode ? '<span class="preview-badge">课程导览</span>' : ''}
          <button data-route="dashboard" type="button">学习路径</button>
          <button data-action="artifacts" type="button">我的项目成果</button>
          ${this.debugMode ? '<button data-action="debug" type="button">开发者工具</button>' : ''}
        </div>
      </header>

      <div class="academy-content" data-content></div>

      <aside class="artifact-drawer" data-drawer hidden>
        <div class="drawer-head">
          <div><span>PROJECT PORTFOLIO</span><b>我的项目成果</b><small>每完成一项实验，你的 AI 邮件分类项目都会向前一步。</small></div>
          <button data-close type="button" aria-label="关闭">×</button>
        </div>
        <div class="artifact-progress" data-artifact-progress></div>
        <div data-artifacts></div>
      </aside>
      <div class="drawer-mask" data-mask hidden></div>

      ${this.debugMode ? `
        <aside class="debug-drawer" data-debug-drawer hidden>
          <div class="drawer-head"><div><b>开发者工具</b><small>仅在 ?debug=1 下显示</small></div><button data-debug-close type="button">×</button></div>
          <label class="debug-toggle"><input type="checkbox" data-action="preview" ${this.previewMode ? 'checked' : ''}> 开放全部课程与考试</label>
          <button class="danger-button" data-action="reset" type="button">重置全部学习数据</button>
          <pre data-debug-state></pre>
        </aside>
      ` : ''}
    `;

    this.content = this.root.querySelector('[data-content]');
    this.drawer = this.root.querySelector('[data-drawer]');
    this.mask = this.root.querySelector('[data-mask]');

    this.root.querySelectorAll('[data-route="dashboard"]').forEach((button) => {
      button.addEventListener('click', () => this.go('dashboard'));
    });
    this.root.querySelector('[data-action="artifacts"]').addEventListener('click', () => this.openArtifacts());
    this.root.querySelector('[data-close]').addEventListener('click', () => this.closeArtifacts());
    this.mask.addEventListener('click', () => this.closeArtifacts());

    if (this.debugMode) this.mountDebugTools();

    window.addEventListener('hashchange', () => this.route());
    this.eventBus.on('progress:change', () => {
      this.updateProgress();
      this.renderDebugState();
    });
    this.eventBus.on('progress:reset', () => {
      this.updateProgress();
      this.renderDebugState();
    });
    this.eventBus.on('artifact:change', () => {
      this.renderArtifacts();
      this.renderDebugState();
    });
    this.eventBus.on('artifact:reset', () => {
      this.renderArtifacts();
      this.renderDebugState();
    });
    this.eventBus.on('lesson:complete', ({ lessonId }) => this.showLessonComplete(lessonId));

    this.renderArtifacts();
    this.updateProgress();
    this.route();
  }

  mountDebugTools() {
    const drawer = this.root.querySelector('[data-debug-drawer]');
    this.root.querySelector('[data-action="debug"]').addEventListener('click', () => { drawer.hidden = false; });
    this.root.querySelector('[data-debug-close]').addEventListener('click', () => { drawer.hidden = true; });
    this.root.querySelector('[data-action="preview"]').addEventListener('change', (event) => {
      this.previewMode = event.target.checked;
      localStorage.setItem(PREVIEW_KEY, String(this.previewMode));
      this.route();
    });
    this.root.querySelector('[data-action="reset"]').addEventListener('click', () => {
      if (!window.confirm('确认清空全部课程进度和项目成果吗？')) return;
      this.progress.resetAll();
      this.artifacts.reset();
      this.go('dashboard');
      drawer.hidden = true;
    });
    this.renderDebugState();
  }

  renderDebugState() {
    if (!this.debugMode) return;
    const target = this.root.querySelector('[data-debug-state]');
    if (!target) return;
    target.textContent = JSON.stringify({
      previewMode: this.previewMode,
      progress: this.progress.getAll?.() ?? {},
      artifacts: this.artifacts.get(),
    }, null, 2);
  }

  go(route) {
    window.location.hash = route === 'dashboard' ? '#dashboard' : `#${route}`;
  }

  route() {
    const hash = window.location.hash.replace(/^#/, '') || 'dashboard';
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (hash === 'dashboard') return this.renderDashboard();
    if (hash.startsWith('lesson/')) return this.renderLesson(hash.split('/')[1]);
    if (hash.startsWith('exam/')) return this.renderExam(hash.split('/')[1]);
    return this.renderDashboard();
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
    return this.previewMode || !column.prerequisiteExamId || this.progress.isExamPassed(column.prerequisiteExamId);
  }

  isLessonUnlocked(lesson) {
    if (this.previewMode) return true;
    const column = this.columnById(lesson.columnId);
    if (!this.isColumnUnlocked(column)) return false;
    const index = column.lessonIds.indexOf(lesson.id);
    return index === 0 || this.progress.isLessonComplete(column.lessonIds[index - 1]);
  }

  isExamUnlocked(exam) {
    if (this.previewMode) return true;
    const column = this.columnById(exam.columnId);
    return column.lessonIds.every((id) => this.progress.isLessonComplete(id));
  }

  nextLesson() {
    return this.course.lessons.find((lesson) => this.isLessonUnlocked(lesson) && !this.progress.isLessonComplete(lesson.id))
      ?? this.course.lessons.find((lesson) => !this.progress.isLessonComplete(lesson.id))
      ?? null;
  }

  nextLessonAfter(lessonId) {
    const index = this.course.lessons.findIndex((lesson) => lesson.id === lessonId);
    return this.course.lessons[index + 1] ?? null;
  }

  renderDashboard() {
    const next = this.nextLesson();
    const completedLessons = this.course.lessons.filter((lesson) => this.progress.isLessonComplete(lesson.id)).length;
    const completedExams = this.course.exams.filter((exam) => this.progress.isExamPassed(exam.id)).length;
    const resultCount = this.artifactNames().length;

    this.content.innerHTML = `
      <main class="dashboard-shell">
        <section class="dashboard-hero">
          <div class="dashboard-eyebrow">AI APPLICATION ENGINEERING</div>
          <h1>从熟悉的 Java 业务系统，<span>走进可验证、可交付的 AI 应用</span></h1>
          <p>${this.course.subtitle}。每节课都从一个真实工程问题出发，通过预测、实验和迁移，逐步完成同一个 AI 邮件分类项目。</p>
          <div class="dashboard-actions">
            ${next ? `<button class="hero-primary" data-continue="${next.id}" type="button"><span>${completedLessons ? '继续学习' : '开始课程'}</span><b>第 ${next.number} 课 · ${next.shortTitle}</b></button>` : '<div class="course-finished">✓ 前两个专栏已经全部完成</div>'}
            <button class="hero-secondary" data-open-results type="button">查看我的项目成果</button>
          </div>
          <div class="dashboard-metrics">
            <article><span>课程进度</span><b>${completedLessons} / ${this.course.lessons.length}</b><small>已完成课程</small></article>
            <article><span>阶段考试</span><b>${completedExams} / ${this.course.exams.length}</b><small>已通过专栏</small></article>
            <article><span>项目成果</span><b>${resultCount}</b><small>已保存成果</small></article>
          </div>
        </section>

        <section class="learning-route-intro">
          <div><span>LEARNING PATH</span><h2>你的学习路径</h2></div>
          <p>先理解模型请求与 TypeScript，再进入 Prompt、结构化输出和评估。后续专栏会沿用你在这里完成的项目成果。</p>
        </section>

        ${this.course.columns.map((column, index) => this.renderColumn(column, index)).join('')}
      </main>
    `;

    this.content.querySelector('[data-continue]')?.addEventListener('click', (event) => this.go(`lesson/${event.currentTarget.dataset.continue}`));
    this.content.querySelector('[data-open-results]')?.addEventListener('click', () => this.openArtifacts());
    this.bindDashboardActions();
  }

  renderColumn(column, index) {
    const unlocked = this.isColumnUnlocked(column);
    const exam = this.examById(column.examId);
    const examPassed = this.progress.isExamPassed(exam.id);
    const completed = column.lessonIds.filter((id) => this.progress.isLessonComplete(id)).length;

    return `
      <section class="column-section ${unlocked ? '' : 'locked-column'}">
        <div class="column-head">
          <div>
            <span>专栏 ${String(index + 1).padStart(2, '0')} · ${completed}/${column.lessonIds.length}</span>
            <h2>${column.title.replace(/^专栏[一二] · /, '')}</h2>
            <p>${column.description}</p>
          </div>
          <div class="column-state ${examPassed ? 'passed' : ''}">${examPassed ? '已完成 ✓' : unlocked ? '学习进行中' : '完成上一专栏后开放'}</div>
        </div>

        <div class="lesson-grid">
          ${column.lessonIds.map((id) => this.renderLessonCard(this.lessonById(id))).join('')}
        </div>

        <button class="column-exam ${this.isExamUnlocked(exam) ? '' : 'locked'}" data-exam="${exam.id}" ${this.isExamUnlocked(exam) ? '' : 'disabled'} type="button">
          <span>${examPassed ? '✓' : '考'}</span>
          <div><b>${exam.title}</b><small>${examPassed ? `已通过 · 最高 ${this.progress.getExam(exam.id).score}%` : this.isExamUnlocked(exam) ? '检验你是否能把本专栏知识迁移到新场景' : '完成本专栏全部课程后开放'}</small></div>
          <em>${examPassed ? '查看' : this.isExamUnlocked(exam) ? '开始考试 →' : '未开放'}</em>
        </button>
      </section>
    `;
  }

  renderLessonCard(lesson) {
    const unlocked = this.isLessonUnlocked(lesson);
    const done = this.progress.isLessonComplete(lesson.id);
    const result = this.resultForLesson(lesson.id);

    return `
      <button class="lesson-card ${done ? 'done' : ''} ${unlocked ? '' : 'locked'}" data-lesson="${lesson.id}" ${unlocked ? '' : 'disabled'} type="button">
        <span class="lesson-number">${String(lesson.number).padStart(2, '0')}</span>
        <div class="lesson-card-copy">
          <span class="lesson-card-state">${done ? '已完成' : unlocked ? '互动课程' : '尚未开放'}</span>
          <b>${lesson.shortTitle}</b>
          <p>${lesson.title}</p>
          <small>${done ? result ? `已产出：${result}` : '本课已完成' : unlocked ? '进入课程，完成预测、实验和迁移' : '完成上一课后开放'}</small>
        </div>
        <i>${done ? '✓' : unlocked ? '→' : '⌁'}</i>
      </button>
    `;
  }

  bindDashboardActions() {
    this.content.querySelectorAll('[data-lesson]').forEach((button) => {
      button.addEventListener('click', () => this.go(`lesson/${button.dataset.lesson}`));
    });
    this.content.querySelectorAll('[data-exam]').forEach((button) => {
      button.addEventListener('click', () => this.go(`exam/${button.dataset.exam}`));
    });
  }

  renderLesson(lessonId) {
    const lesson = this.lessonById(lessonId);
    if (!lesson) return this.renderDashboard();
    if (!this.isLessonUnlocked(lesson)) return this.renderLocked(`第 ${lesson.number} 课还没有开放`, '完成上一课后，这节课会自动加入你的学习路径。');

    const column = this.columnById(lesson.columnId);
    this.content.innerHTML = `
      <div class="lesson-topbar">
        <button data-back type="button">← 学习路径</button>
        <div><span>${column.title} · 第 ${lesson.number} 课</span><b>${lesson.shortTitle}</b></div>
        <button data-results type="button">我的项目成果</button>
      </div>
      <div data-lesson-root></div>
    `;

    this.content.querySelector('[data-back]').addEventListener('click', () => this.go('dashboard'));
    this.content.querySelector('[data-results]').addEventListener('click', () => this.openArtifacts());

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

  showLessonComplete(lessonId) {
    if (!this.content.querySelector('[data-lesson-root]')) return;
    this.content.querySelector('.lesson-finish-banner')?.remove();
    const lesson = this.lessonById(lessonId);
    const next = this.nextLessonAfter(lessonId);
    const nextUnlocked = next && this.isLessonUnlocked(next);
    const banner = document.createElement('div');
    banner.className = 'lesson-finish-banner';
    banner.innerHTML = `
      <div><span>本课完成</span><b>第 ${lesson.number} 课的成果已经保存</b><small>${next ? '下一课会继续使用你刚刚完成的内容。' : '你已经完成当前全部课程。'}</small></div>
      <div>
        <button data-dashboard type="button">返回学习路径</button>
        ${nextUnlocked ? `<button class="primary" data-next type="button">继续第 ${next.number} 课 →</button>` : ''}
      </div>
    `;
    banner.querySelector('[data-dashboard]').addEventListener('click', () => this.go('dashboard'));
    banner.querySelector('[data-next]')?.addEventListener('click', () => this.go(`lesson/${next.id}`));
    this.content.prepend(banner);
  }

  renderExam(examId) {
    const exam = this.examById(examId);
    if (!exam) return this.renderDashboard();
    if (!this.isExamUnlocked(exam)) return this.renderLocked('专栏考试还没有开放', '完成本专栏全部互动课程后，即可参加考试。');

    const selected = new Map();
    this.content.innerHTML = `
      <main class="exam-shell">
        <button class="exam-back" data-back type="button">← 返回学习路径</button>
        <div class="dashboard-eyebrow">COLUMN REVIEW · 80% PASS</div>
        <h1>${exam.title}</h1>
        <p>${exam.description}</p>
        <div class="exam-note"><b>这不是记忆测试。</b><span>题目会把课程内容放进新的工程场景，检验你能否做出正确判断。</span></div>
        <div class="exam-questions">
          ${exam.questions.map((question, questionIndex) => `
            <section>
              <span>QUESTION ${String(questionIndex + 1).padStart(2, '0')}</span>
              <h3>${question.text}</h3>
              ${question.options.map((option, optionIndex) => `<button data-question="${questionIndex}" data-option="${optionIndex}" type="button">${option}</button>`).join('')}
            </section>
          `).join('')}
        </div>
        <div class="exam-actions"><button class="exam-submit" data-submit type="button">提交答案</button><div class="exam-result" data-result>完成所有题目后提交。</div></div>
      </main>
    `;

    this.content.querySelector('[data-back]').addEventListener('click', () => this.go('dashboard'));
    this.content.querySelectorAll('[data-question]').forEach((button) => {
      button.addEventListener('click', () => {
        const question = Number(button.dataset.question);
        selected.set(question, Number(button.dataset.option));
        this.content.querySelectorAll(`[data-question="${question}"]`).forEach((item) => item.classList.toggle('selected', item === button));
      });
    });

    this.content.querySelector('[data-submit]').addEventListener('click', () => {
      const result = this.content.querySelector('[data-result]');
      if (selected.size !== exam.questions.length) {
        result.className = 'exam-result bad';
        result.textContent = '还有题目没有作答。';
        return;
      }
      const correct = exam.questions.filter((question, index) => selected.get(index) === question.correct).length;
      const score = Math.round(correct / exam.questions.length * 100);
      const passed = score >= 80;
      this.progress.recordExam(exam.id, { score, passed });
      result.className = `exam-result ${passed ? 'good' : 'bad'}`;
      result.innerHTML = passed
        ? `✓ ${score} 分，通过。${exam.id === 'exam-column-01' ? '第二专栏已经加入你的学习路径。' : '前两个专栏已经全部完成。'} <button data-dashboard type="button">返回学习路径</button>`
        : `${score} 分，距离通过还差一点。你可以修改答案后再次提交。`;
      result.querySelector('[data-dashboard]')?.addEventListener('click', () => this.go('dashboard'));
      this.updateProgress();
    });
  }

  renderLocked(title, description) {
    this.content.innerHTML = `
      <main class="locked-page">
        <span>⌁</span><h1>${title}</h1><p>${description}</p><button data-back type="button">返回学习路径</button>
      </main>
    `;
    this.content.querySelector('[data-back]').addEventListener('click', () => this.go('dashboard'));
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

  artifactNames() {
    return Object.keys(this.artifacts.get()).filter((name) => name !== '__meta');
  }

  renderArtifacts() {
    const target = this.root.querySelector('[data-artifacts]');
    const progressTarget = this.root.querySelector('[data-artifact-progress]');
    if (!target || !progressTarget) return;

    const data = this.artifacts.get();
    const names = this.artifactNames();
    progressTarget.innerHTML = `<span>项目完成度</span><i><em style="width:${Math.round(names.length / 9 * 100)}%"></em></i><b>${names.length} / 9</b>`;

    target.innerHTML = names.length
      ? names.map((name, index) => this.renderArtifactCard(name, data[name], index)).join('')
      : '<div class="empty-artifacts"><span>◇</span><b>你的项目成果会出现在这里</b><p>从第一课开始，每完成一项实验，我们都会替你保存一份可以在后续课程继续使用的成果。</p></div>';
  }

  renderArtifactCard(name, value, index) {
    const result = this.artifactMeta(name);
    const preview = this.artifactPreview(name, value);
    return `
      <details class="artifact-item">
        <summary>
          <span>${String(index + 1).padStart(2, '0')}</span>
          <div><b>${result.label}</b><small>${result.description}</small></div>
          <i>查看</i>
        </summary>
        <div class="artifact-preview">${preview}</div>
        ${this.debugMode ? `<pre>${this.escape(JSON.stringify(value, null, 2))}</pre><code>${name}</code>` : ''}
      </details>
    `;
  }

  artifactMeta(name) {
    const labels = {
      businessRisk: { label: 'AI 应用风险清单', description: '模型的不确定性需要哪些工程保护' },
      languageDecision: { label: '技术路线选择', description: '为什么本课程项目采用 TypeScript' },
      tsSource: { label: '可运行的 TypeScript 骨架', description: '已经处理异步调用和运行时校验' },
      messages: { label: '模型请求消息包', description: '本次调用真正发送给模型的内容' },
      promptV1: { label: '邮件分类 Prompt v1', description: '任务、上下文、规则、输出和失败策略' },
      classificationRules: { label: '分类规则与优先级', description: '已经通过边界邮件验证' },
      outputSchema: { label: '结构化输出契约', description: 'JSON、字段类型和业务规则' },
      fewShotExamples: { label: 'Few-shot 示例集', description: '兼顾相关性、边界和失败出口' },
      promptV2: { label: '通过评估的 Prompt', description: '修复回归后的可发布版本' },
      evaluationDataset: { label: '回归测试集', description: '用于持续检查旧能力是否退化' },
      evaluationReport: { label: 'Prompt 评估报告', description: '准确率、失败案例和回归结果' },
    };
    return labels[name] ?? { label: '课程项目成果', description: '本课保存的项目内容' };
  }

  artifactPreview(name, value) {
    if (name === 'businessRisk') return '<p>你已经明确区分了：判断稳定性、返回格式和失败处理是三类不同问题。</p>';
    if (name === 'languageDecision') return `<p>当前项目技术路线：<b>${value?.winner === 'ts' ? 'TypeScript' : value?.winner ?? '已确认'}</b>。选择来自项目约束，而不是语言排行榜。</p>`;
    if (name === 'tsSource') return `<pre>${this.escape(String(value).slice(0, 900))}</pre>`;
    if (name === 'messages') return `<p>一次完整请求包含 <b>${Array.isArray(value) ? value.length : 0}</b> 条消息，已经保留系统规则、必要历史和当前问题。</p>`;
    if (name === 'promptV1' || name === 'promptV2') return `<pre>${this.escape(typeof value === 'string' ? value : value?.text ?? JSON.stringify(value, null, 2))}</pre>`;
    if (name === 'classificationRules') return `<p>已保存 <b>${Array.isArray(value) ? value.length : Object.keys(value ?? {}).length}</b> 条分类规则，并明确了冲突时的优先级。</p>`;
    if (name === 'outputSchema') return '<p>模型结果需要依次通过 JSON、字段结构和业务规则检查，才能进入后续流程。</p>';
    if (name === 'fewShotExamples') return `<p>已选择 <b>${Array.isArray(value) ? value.length : 0}</b> 个示例，覆盖典型情况、边界情况和信息不足出口。</p>`;
    if (name === 'evaluationDataset') return `<p>回归测试集包含 <b>${Array.isArray(value) ? value.length : 0}</b> 条固定案例。</p>`;
    if (name === 'evaluationReport') return `<p>当前版本准确率：<b>${Math.round((value?.accuracy ?? 0) * 100)}%</b>；回归数量：<b>${value?.regressions ?? 0}</b>。</p>`;
    return `<p>${this.escape(JSON.stringify(value))}</p>`;
  }

  resultForLesson(lessonId) {
    const map = {
      'lesson-01': 'AI 应用风险清单',
      'lesson-02': '技术路线选择',
      'lesson-03': 'TypeScript 调用骨架',
      'lesson-04': '模型请求消息包',
      'lesson-05': 'Prompt v1',
      'lesson-06': '分类规则与优先级',
      'lesson-07': '结构化输出契约',
      'lesson-08': 'Few-shot 示例集',
      'lesson-09': 'Prompt 评估报告',
    };
    return map[lessonId];
  }

  escape(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  updateProgress() {
    const progressBar = this.root.querySelector('[data-progress-bar]');
    if (!progressBar) return;
    const lessonCount = this.course.lessons.length;
    const examCount = this.course.exams.length;
    const completedLessons = this.course.lessons.filter((lesson) => this.progress.isLessonComplete(lesson.id)).length;
    const completedExams = this.course.exams.filter((exam) => this.progress.isExamPassed(exam.id)).length;
    const percent = Math.round((completedLessons + completedExams) / (lessonCount + examCount) * 100);
    progressBar.style.width = `${percent}%`;
    this.root.querySelector('[data-progress-text]').textContent = `${percent}%`;
  }
}
