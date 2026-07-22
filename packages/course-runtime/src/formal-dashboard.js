const futureColumns = [
  {
    id: 'column-05',
    title: 'LangGraph 与 Agentic RAG',
    description: 'State、路由、记忆、Checkpoint、自纠错检索与人工介入。',
    lessonCount: 8,
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
    description: '把 RAG、LangGraph、MCP、评估与部署全部接起来。',
    lessonCount: 3,
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
    ?? app.course.lessons.find((lesson) => !app.progress.isLessonComplete(lesson.id))
    ?? app.course.lessons.at(-1);
}

function getCurrentColumnNumber(app) {
  if (app.progress.isExamPassed('exam-column-04-rag')) return 5;
  if (app.progress.isExamPassed('exam-column-03-official')) return 4;
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

function columnPathData(app) {
  const developed = app.course.columns.map((column) => ({
    id: column.id,
    title: column.title.replace(/^专栏[一二三四] · /, ''),
    description: column.description,
    lessonCount: column.lessonIds.length,
    examId: column.examId,
  }));
  return [...developed, ...futureColumns];
}

function renderLangChainVersionBanner(course) {
  const versions = course.officialVersion?.packages;
  if (!versions) return '';
  return `
    <div class="v1-version-banner">
      <b>专栏适用版本</b>：langchain@${versions.langchain} · @langchain/core@${versions['@langchain/core']} · @langchain/langgraph@${versions['@langchain/langgraph']} · zod@${versions.zod} · Node ${versions.node}
      <br><small>版本基线日期：${course.officialVersion.asOf}。每节课页尾提供对应官方文档链接。</small>
    </div>
  `;
}

function renderRagResearchBanner(course) {
  const baseline = course.ragResearchBaseline;
  if (!baseline) return '';
  return `
    <div class="rag-research-banner">
      <div><b>框架中立 RAG 研究基线</b><span>${baseline.asOf}</span></div>
      <p>Problem First · Evaluation First · Scenario Driven。LangChain、LlamaIndex、向量数据库和模型只作为实现候选，不定义课程结论。</p>
      <small>${baseline.note}</small>
    </div>
  `;
}

export function installFormalDashboard(app) {
  app.renderDashboard = function renderFormalDashboard() {
    const completed = getCompletedLessonCount(this);
    const unlocked = getUnlockedLessonCount(this);
    const currentColumn = getCurrentColumnNumber(this);
    const nextLesson = getNextLesson(this);
    const columns = columnPathData(this);
    const totalLessons = columns.reduce((sum, column) => sum + column.lessonCount, 0);
    const overall = Math.round(completed / totalLessons * 100);

    const pathCards = columns.map((column, index) => {
      const number = index + 1;
      const passed = column.examId ? this.progress.isExamPassed(column.examId) : false;
      const label = passed
        ? `已完成 · ${column.lessonCount} 节`
        : number === currentColumn
          ? `进行中 · ${column.lessonCount} 节`
          : number < currentColumn
            ? `已开放 · ${column.lessonCount} 节`
            : `未解锁 · ${column.lessonCount} 节`;
      return renderPathCard(column, index, currentColumn, label);
    }).join('');

    const currentColumnConfig = this.course.columns.find((column) => column.id === `column-0${currentColumn}`);
    const futureColumn = columns[currentColumn - 1];
    const currentSection = currentColumnConfig
      ? `
          <div class="formal-section-head"><span>02</span><h2>当前专栏：${currentColumnConfig.title}</h2><small>COLUMN ${String(currentColumn).padStart(2, '0')}</small></div>
          <p class="formal-section-lede">${currentColumnConfig.description}</p>
          ${currentColumn === 3 ? renderLangChainVersionBanner(this.course) : ''}
          ${currentColumn === 4 ? renderRagResearchBanner(this.course) : ''}
          ${this.renderColumn(currentColumnConfig)}
        `
      : `
          <div class="formal-section-head"><span>02</span><h2>下一专栏：${futureColumn.title}</h2><small>COLUMN ${String(currentColumn).padStart(2, '0')}</small></div>
          <p class="formal-section-lede">${futureColumn.description}</p>
          <div class="future-column-preview"><b>即将开发</b><p>前一专栏考试已经通过。后续课程会继续采用完整调研、互动实验、项目成果和生产门禁，不用占位课冒充完成内容。</p></div>
        `;

    this.content.innerHTML = `
      <main class="formal-dashboard" id="dashboardTop">
        <section class="formal-hero">
          <div class="formal-hero-grid">
            <div>
              <div class="formal-eyebrow">JAVA → TYPESCRIPT → AI APPLICATION ENGINEERING</div>
              <h1>从会写 Java CRUD，<br>到能独立做出<span>企业 AI 应用</span></h1>
              <p class="formal-lead">
                这不是一套“照着敲 API”的教程。你会先弄懂模型、Prompt 和结构化输出，
                再系统学习 LangChain、框架中立 RAG、LangGraph 和 MCP。每节课必须完成实验并通过考试，下一课才会解锁。
              </p>
              <div class="formal-stats">
                <article><span>课程专栏</span><b>7</b><small>从认知到综合项目</small></article>
                <article><span>互动课程</span><b>${totalLessons}</b><small>不为固定数字压缩知识</small></article>
                <article><span>当前解锁</span><b>${unlocked}</b><small>按考试结果推进</small></article>
                <article><span>已完成</span><b>${completed}</b><small>完成实验与迁移才计入</small></article>
              </div>
            </div>
            <aside class="formal-continue-sheet">
              <div class="formal-sheet-label">下一步 · 第 ${nextLesson.number} 课</div>
              <h2>${nextLesson.title}</h2>
              <p>${nextLesson.description}</p>
              <div class="formal-continue-meta"><span>已解锁</span><span>研究依据</span><span>互动实验</span></div>
              <div class="formal-progress"><i><em style="width:${overall}%"></em></i><span>${overall}%</span></div>
              <button class="formal-primary" data-next-lesson="${nextLesson.id}">${completed ? '继续学习' : '开始第 1 课'}</button>
            </aside>
          </div>
        </section>

        <section class="formal-section" id="columns">
          <div class="formal-section-head"><span>01</span><h2>七个专栏，一条完整学习路径</h2><small>LEARNING PATH</small></div>
          <p class="formal-section-lede">先补齐 AI 应用最容易缺失的认知，再逐层增加能力；课程数量随真实能力边界调整，不为好看的数字强行压缩。</p>
          <div class="formal-column-path">${pathCards}</div>
        </section>

        <section class="formal-section" id="currentColumn">${currentSection}</section>
      </main>
    `;

    this.content.querySelector('[data-next-lesson]')?.addEventListener('click', (event) => {
      this.go(`lesson/${event.currentTarget.dataset.nextLesson}`);
    });
    this.bindDashboardActions();
  };
}
