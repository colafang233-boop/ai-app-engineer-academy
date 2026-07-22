const futureColumns = [
  {
    id: 'column-03',
    title: 'LangChain 核心开发',
    description: 'Model、Streaming、Tool Calling 和 Agent Loop。',
    lessonCount: 4,
  },
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

export function installFormalDashboard(app) {
  app.renderDashboard = function renderFormalDashboard() {
    const completed = getCompletedLessonCount(this);
    const unlocked = getUnlockedLessonCount(this);
    const currentColumn = getCurrentColumnNumber(this);
    const nextLesson = getNextLesson(this);
    const totalLessons = 32;
    const overall = Math.round(completed / totalLessons * 100);

    const columns = [
      {
        id: 'column-01',
        title: '从 CRUD 到 AI 应用',
        description: '弄懂模型、消息、Token 和 TypeScript 必需知识。',
        lessonCount: 4,
      },
      {
        id: 'column-02',
        title: 'Prompt 与输出契约',
        description: '业务规则、结构化输出、Zod、Few-shot 和评估。',
        lessonCount: 5,
      },
      ...futureColumns,
    ];

    const pathCards = columns.map((column, index) => {
      const number = index + 1;
      const active = number === currentColumn;
      const passed = number === 1
        ? this.progress.isExamPassed('exam-column-01')
        : number === 2
          ? this.progress.isExamPassed('exam-column-02')
          : false;
      const label = passed
        ? `已完成 · ${column.lessonCount} 节`
        : active
          ? `进行中 · ${column.lessonCount} 节`
          : `未解锁 · ${column.lessonCount} 节`;
      return renderPathCard(column, index, currentColumn, label);
    }).join('');

    const currentColumnConfig = this.course.columns.find((column) => column.id === `column-0${Math.min(currentColumn, 2)}`)
      ?? this.course.columns[0];

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
              <div class="formal-sheet-label">下一步 · 第 ${nextLesson.number} 课</div>
              <h2>${nextLesson.title}</h2>
              <p>${nextLesson.description}</p>
              <div class="formal-continue-meta"><span>已解锁</span><span>约 20 分钟</span><span>互动实验</span></div>
              <div class="formal-progress"><i><em style="width:${overall}%"></em></i><span>${overall}%</span></div>
              <button class="formal-primary" data-next-lesson="${nextLesson.id}">${completed ? '继续学习' : '开始第 1 课'}</button>
            </aside>
          </div>
        </section>

        <section class="formal-section" id="columns">
          <div class="formal-section-head"><span>01</span><h2>七个专栏，一条完整学习路径</h2><small>LEARNING PATH</small></div>
          <p class="formal-section-lede">不会直接把你扔进 LangGraph。先补齐 AI 应用最容易缺失的认知，再逐层增加能力。</p>
          <div class="formal-column-path">${pathCards}</div>
        </section>

        <section class="formal-section" id="currentColumn">
          <div class="formal-section-head"><span>02</span><h2>当前专栏：${currentColumnConfig.title}</h2><small>COLUMN ${String(currentColumn).padStart(2, '0')}</small></div>
          <p class="formal-section-lede">${currentColumnConfig.description}</p>
          ${this.renderColumn(currentColumnConfig)}
        </section>
      </main>
    `;

    this.content.querySelector('[data-next-lesson]')?.addEventListener('click', (event) => {
      this.go(`lesson/${event.currentTarget.dataset.nextLesson}`);
    });
    this.bindDashboardActions();
  };
}
