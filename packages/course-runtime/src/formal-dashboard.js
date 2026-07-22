const futureColumns = [
  {
    id: 'column-04',
    title: 'RAG 知识库工程',
    description: '文档、切分、Embedding、检索、引用与验证。',
    lessonCount: 7,
  },
  {
    id: 'column-05',
    title: 'LangGraph 与 Agentic RAG',
    description: 'State、路由、记忆、Checkpoint 与人工介入。',
    lessonCount: 6,
  },
  {
    id: 'column-06',
    title: 'MCP 工具与协议',
    description: 'TS MCP Server、工具发现、调用、认证与安全。',
    lessonCount: 5,
  },
  {
    id: 'column-07',
    title: '企业 AI 应用实战',
    description: '把 RAG、LangGraph、MCP 与验证全部接起来。',
    lessonCount: 2,
  },
];

function getCompletedLessonCount(app) {
  return app.course.lessons.filter((lesson) => app.progress.isLessonComplete(lesson.id)).length;
}

function getUnlockedLessonCount(app) {
  return app.course.lessons.filter((lesson) => app.isLessonUnlocked(lesson)).length;
}

function getNextLesson(app) {
  return app.course.lessons.find((lesson) => app.isLessonUnlocked(lesson) && !app.progress.isLessonComplete(lesson.id))
    ?? app.course.lessons.at(-1);
}

function getCurrentColumnNumber(app) {
  if (app.progress.isExamPassed('exam-column-03')) return 4;
  if (app.progress.isExamPassed('exam-column-02')) return 3;
  if (app.progress.isExamPassed('exam-column-01')) return 2;
  return 1;
}

function renderPathCard(column, index, currentColumn, stateLabel) {
  const active = index + 1 === currentColumn;
  const locked = index + 1 > currentColumn;
  return `
    <article class="formal-column-card ${active ? 'active' : ''} ${locked ? 'locked' : ''}">
      <span class="formal-column-index">COLUMN ${String(index + 1).padStart(2, '0')}</span>
      <h3>${column.title}</h3>
      <p>${column.description}</p>
      <span class="formal-column-state">${stateLabel}</span>
    </article>
  `;
}

function normalizeBuiltColumn(column) {
  return {
    id: column.id,
    title: column.title.replace(/^专栏[一二三] · /, ''),
    description: column.description,
    lessonCount: column.lessonIds.length,
    examId: column.examId,
  };
}

function renderFutureColumnPreview(column) {
  return `
    <div class="future-column-preview">
      <span>下一阶段</span>
      <h3>${column.title}</h3>
      <p>${column.description}</p>
      <div><b>${column.lessonCount} 节互动课程</b><small>课程内容正在按同一套学习标准开发</small></div>
    </div>`;
}

export function installFormalDashboard(app) {
  app.renderDashboard = function renderFormalDashboard() {
    const completed = getCompletedLessonCount(this);
    const unlocked = getUnlockedLessonCount(this);
    const currentColumn = getCurrentColumnNumber(this);
    const nextLesson = getNextLesson(this);
    const totalLessons = 32;
    const overall = Math.round(completed / totalLessons * 100);

    const builtColumns = this.course.columns.map(normalizeBuiltColumn);
    const columns = [...builtColumns, ...futureColumns];
    const passedExamIds = new Set(
      this.course.exams
        .filter((exam) => this.progress.isExamPassed(exam.id))
        .map((exam) => exam.id),
    );

    const pathCards = columns.map((column, index) => {
      const number = index + 1;
      const passed = column.examId ? passedExamIds.has(column.examId) : false;
      const label = passed
        ? `已完成 · ${column.lessonCount} 节`
        : number === currentColumn
          ? `进行中 · ${column.lessonCount} 节`
          : `未解锁 · ${column.lessonCount} 节`;
      return renderPathCard(column, index, currentColumn, label);
    }).join('');

    const currentColumnConfig = this.course.columns[currentColumn - 1] ?? null;
    const futureCurrent = columns[currentColumn - 1];
    const currentTitle = currentColumnConfig?.title ?? futureCurrent.title;
    const currentDescription = currentColumnConfig?.description ?? futureCurrent.description;
    const currentBody = currentColumnConfig
      ? this.renderColumn(currentColumnConfig)
      : renderFutureColumnPreview(futureCurrent);

    const allBuiltLessonsDone = this.course.lessons.every((lesson) => this.progress.isLessonComplete(lesson.id));
    const continueLabel = allBuiltLessonsDone && currentColumn > this.course.columns.length
      ? '回顾已完成课程'
      : completed
        ? '继续学习'
        : '开始第 1 课';

    this.content.innerHTML = `
      <main class="formal-dashboard" id="dashboardTop">
        <section class="formal-hero">
          <div class="formal-hero-grid">
            <div>
              <div class="formal-eyebrow">JAVA → TYPESCRIPT → AI APPLICATION ENGINEERING</div>
              <h1>从会写 Java CRUD，<br>到能独立做出<span>企业 AI 应用</span></h1>
              <p class="formal-lead">
                这不是一套“照着敲 API”的教程。你会先弄懂模型、Prompt 和结构化输出，
                再一步步做到 LangChain、RAG、LangGraph 和 MCP。每节课必须完成实验并通过考试，下一课才会解锁。
              </p>
              <div class="formal-stats">
                <article><span>课程专栏</span><b>7</b><small>从认知到综合项目</small></article>
                <article><span>互动课程</span><b>32</b><small>每课一个核心问题</small></article>
                <article><span>当前解锁</span><b>${unlocked}</b><small>按考试结果推进</small></article>
                <article><span>已完成</span><b>${completed}</b><small>考试通过才算完成</small></article>
              </div>
            </div>
            <aside class="formal-continue-sheet">
              <div class="formal-sheet-label">${allBuiltLessonsDone ? '已完成当前开发课程' : `下一步 · 第 ${nextLesson.number} 课`}</div>
              <h2>${allBuiltLessonsDone ? 'LangChain 核心能力已经打通' : nextLesson.title}</h2>
              <p>${allBuiltLessonsDone ? '你已经完成模型调用、流式响应、工具调用和 Agent Loop。下一专栏将进入 RAG 知识库工程。' : nextLesson.description}</p>
              <div class="formal-continue-meta"><span>${allBuiltLessonsDone ? '可回顾' : '已解锁'}</span><span>约 20 分钟</span><span>互动实验</span></div>
              <div class="formal-progress"><i><em style="width:${overall}%"></em></i><span>${overall}%</span></div>
              <button class="formal-primary" data-next-lesson="${nextLesson.id}">${continueLabel}</button>
            </aside>
          </div>
        </section>

        <section class="formal-section" id="columns">
          <div class="formal-section-head"><span>01</span><h2>七个专栏，一条完整学习路径</h2><small>LEARNING PATH</small></div>
          <p class="formal-section-lede">不会直接把你扔进 LangGraph。先补齐 AI 应用最容易缺失的认知，再逐层增加能力。</p>
          <div class="formal-column-path">${pathCards}</div>
        </section>

        <section class="formal-section" id="currentColumn">
          <div class="formal-section-head"><span>02</span><h2>当前专栏：${currentTitle}</h2><small>COLUMN ${String(currentColumn).padStart(2, '0')}</small></div>
          <p class="formal-section-lede">${currentDescription}</p>
          ${currentBody}
        </section>
      </main>
    `;

    this.content.querySelector('[data-next-lesson]')?.addEventListener('click', (event) => {
      this.go(`lesson/${event.currentTarget.dataset.nextLesson}`);
    });
    this.bindDashboardActions();
  };
}
