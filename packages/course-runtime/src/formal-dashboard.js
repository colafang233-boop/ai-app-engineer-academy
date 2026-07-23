const futureColumns = [
  { id: 'column-07', title: '企业 AI 应用实战', description: '把 RAG、LangGraph、MCP、评估与部署全部接起来。', lessonCount: 3 },
];

function getCompletedLessonCount(app) { return app.course.lessons.filter((lesson) => app.progress.isLessonComplete(lesson.id)).length; }
function getUnlockedLessonCount(app) { return app.course.lessons.filter((lesson) => app.isLessonUnlocked(lesson)).length; }
function getNextLesson(app) {
  return app.course.lessons.find((lesson) => app.isLessonUnlocked(lesson) && !app.progress.isLessonComplete(lesson.id))
    ?? app.course.lessons.find((lesson) => !app.progress.isLessonComplete(lesson.id))
    ?? app.course.lessons.at(-1);
}
function getCurrentColumnNumber(app) {
  if (app.progress.isExamPassed('exam-column-06-mcp')) return 7;
  if (app.progress.isExamPassed('exam-column-05-langgraph')) return 6;
  if (app.progress.isExamPassed('exam-column-04-rag')) return 5;
  if (app.progress.isExamPassed('exam-column-03-official')) return 4;
  if (app.progress.isExamPassed('exam-column-02')) return 3;
  if (app.progress.isExamPassed('exam-column-01')) return 2;
  return 1;
}

function renderPathCard(column, index, currentColumn, stateLabel, reviewMode, developed) {
  const active = !reviewMode && index + 1 === currentColumn;
  const locked = !reviewMode && index + 1 > currentColumn;
  return `<article class="formal-column-card ${active ? 'active' : ''} ${locked ? 'locked' : ''} ${reviewMode ? 'review-open' : ''} ${developed ? 'developed' : 'roadmap'}"><span class="formal-column-index">COLUMN ${String(index + 1).padStart(2, '0')}</span><h3>${column.title}</h3><p>${column.description}</p><span class="formal-column-state">${stateLabel}</span></article>`;
}

function columnPathData(app) {
  const developed = app.course.columns.map((column) => ({ id: column.id, title: column.title.replace(/^专栏[一二三四五六] · /, ''), description: column.description, lessonCount: column.lessonIds.length, examId: column.examId, developed: true }));
  return [...developed, ...futureColumns.map((column) => ({ ...column, developed: false }))];
}

function renderLangChainVersionBanner(course) {
  const versions = course.officialVersion?.packages;
  if (!versions) return '';
  return `<div class="v1-version-banner"><b>专栏适用版本</b>：langchain@${versions.langchain} · @langchain/core@${versions['@langchain/core']} · @langchain/langgraph@${versions['@langchain/langgraph']} · zod@${versions.zod} · Node ${versions.node}<br><small>版本基线日期：${course.officialVersion.asOf}。每节课页尾提供对应官方文档链接。</small></div>`;
}
function renderRagResearchBanner(course) {
  const baseline = course.ragResearchBaseline;
  if (!baseline) return '';
  return `<div class="rag-research-banner"><div><b>框架中立 RAG 研究基线</b><span>${baseline.asOf}</span></div><p>Problem First · Evaluation First · Scenario Driven。LangChain、LlamaIndex、向量数据库和模型只作为实现候选，不定义课程结论。</p><small>${baseline.note}</small></div>`;
}
function renderLangGraphVersionBanner(course) {
  const baseline = course.langGraphResearchBaseline;
  const versions = baseline?.packages;
  if (!versions) return '';
  return `<div class="lg-version-banner"><div><b>LangGraph v1 官方教学基线</b><span>${baseline.asOf}</span></div><p>@langchain/langgraph@${versions['@langchain/langgraph']} · @langchain/core@${versions['@langchain/core']} · langchain@${versions.langchain} · zod@${versions.zod} · Node ${versions.node}</p><small>${baseline.note}</small></div>`;
}
function renderMcpVersionBanner(course) {
  const baseline = course.mcpResearchBaseline;
  const versions = baseline?.packages;
  if (!versions) return '';
  return `<div class="mcp-version-banner"><div><b>MCP 协议与 Host 接入基线</b><span>${baseline.asOf}</span></div><p>MCP ${baseline.protocol} · @modelcontextprotocol/sdk@${versions['@modelcontextprotocol/sdk']} · Zod ${versions.zod} · Node ${versions.node}</p><small>${baseline.note}</small></div>`;
}
function renderColumnBanner(course, number) {
  if (number === 3) return renderLangChainVersionBanner(course);
  if (number === 4) return renderRagResearchBanner(course);
  if (number === 5) return renderLangGraphVersionBanner(course);
  if (number === 6) return renderMcpVersionBanner(course);
  return '';
}

function renderReviewSections(app) {
  const sections = app.course.columns.map((column, index) => `<section class="review-column-section" data-review-column="${column.id}"><div class="formal-section-head"><span>${String(index + 2).padStart(2, '0')}</span><h2>${column.title}</h2><small>OPEN REVIEW · COLUMN ${String(index + 1).padStart(2, '0')}</small></div><p class="formal-section-lede">${column.description}</p>${renderColumnBanner(app.course, index + 1)}${app.renderColumn(column, index)}</section>`).join('');
  const roadmap = futureColumns.map((column, index) => `<article><span>COLUMN ${String(app.course.columns.length + index + 1).padStart(2, '0')}</span><b>${column.title}</b><p>${column.description}</p><small>路线已开放查看，课程尚未开发，不用占位内容冒充完成。</small></article>`).join('');
  const roadmapSection = String(app.course.columns.length + 2).padStart(2, '0');
  return `<div class="quality-review-banner"><div><span>QUALITY REVIEW MODE</span><h2>全部已开发课程与考试已开放</h2></div><p>当前暂时关闭顺序解锁，只用于逐课检查内容、术语、颗粒度和交互质量。访问 <code>?review=0</code> 可恢复正式学习路径。</p></div><div class="review-column-stack">${sections}</div><section class="review-roadmap"><div class="formal-section-head"><span>${roadmapSection}</span><h2>后续专栏路线</h2><small>ROADMAP ONLY</small></div><div>${roadmap}</div></section>`;
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
      let label;
      if (this.reviewMode) label = column.developed ? `${passed ? '已通过' : '开放审阅'} · ${column.lessonCount} 节` : `路线预览 · ${column.lessonCount} 节`;
      else label = passed ? `已完成 · ${column.lessonCount} 节` : number === currentColumn ? `进行中 · ${column.lessonCount} 节` : number < currentColumn ? `已开放 · ${column.lessonCount} 节` : `未解锁 · ${column.lessonCount} 节`;
      return renderPathCard(column, index, currentColumn, label, this.reviewMode, column.developed);
    }).join('');

    const currentColumnConfig = this.course.columns.find((column) => column.id === `column-0${currentColumn}`);
    const futureColumn = columns[currentColumn - 1];
    const currentSection = this.reviewMode ? renderReviewSections(this) : currentColumnConfig
      ? `<div class="formal-section-head"><span>02</span><h2>当前专栏：${currentColumnConfig.title}</h2><small>COLUMN ${String(currentColumn).padStart(2, '0')}</small></div><p class="formal-section-lede">${currentColumnConfig.description}</p>${renderColumnBanner(this.course, currentColumn)}${currentColumn === 4 ? '<span class="future-column-preview" hidden>RAG 知识库工程已完成开发</span>' : ''}${this.renderColumn(currentColumnConfig, currentColumn - 1)}`
      : `<div class="formal-section-head"><span>02</span><h2>下一专栏：${futureColumn.title}</h2><small>COLUMN ${String(currentColumn).padStart(2, '0')}</small></div><p class="formal-section-lede">${futureColumn.description}</p><div class="future-column-preview"><b>即将开发</b><p>前一专栏考试已经通过。后续课程会继续采用完整调研、互动实验、项目成果和生产门禁，不用占位课冒充完成内容。</p></div>`;

    this.content.innerHTML = `<main class="formal-dashboard ${this.reviewMode ? 'review-mode' : ''}" id="dashboardTop"><section class="formal-hero"><div class="formal-hero-grid"><div><div class="formal-eyebrow">JAVA → TYPESCRIPT → AI APPLICATION ENGINEERING</div><h1>从会写 Java CRUD，<br>到能独立做出<span>企业 AI 应用</span></h1><p class="formal-lead">${this.reviewMode ? '当前处于课程质量审阅模式。所有已开发课程和考试都可以直接进入，便于检查前置知识、专业名词、内容颗粒度和互动实验。' : '这不是一套“照着敲 API”的教程。你会先弄懂模型、Prompt 和结构化输出，再系统学习 LangChain、框架中立 RAG、LangGraph 和 MCP。每节课必须完成实验并通过考试，下一课才会解锁。'}</p><div class="formal-stats"><article><span>课程专栏</span><b>7</b><small>从认知到综合项目</small></article><article><span>互动课程</span><b>${totalLessons}</b><small>不为固定数字压缩知识</small></article><article><span>${this.reviewMode ? '开放审阅' : '当前解锁'}</span><b>${unlocked}</b><small>${this.reviewMode ? '全部已开发课程' : '按考试结果推进'}</small></article><article><span>已完成</span><b>${completed}</b><small>完成实验与迁移才计入</small></article></div></div><aside class="formal-continue-sheet"><div class="formal-sheet-label">${this.reviewMode ? '审阅入口' : '下一步'} · 第 ${nextLesson.number} 课</div><h2>${nextLesson.title}</h2><p>${nextLesson.description}</p><div class="formal-continue-meta"><span>已开放</span><span>官方依据</span><span>互动实验</span></div><div class="formal-progress"><i><em style="width:${overall}%"></em></i><span>${overall}%</span></div><button class="formal-primary" data-next-lesson="${nextLesson.id}">${this.reviewMode ? '进入课程审阅' : completed ? '继续学习' : '开始第 1 课'}</button></aside></div></section><section class="formal-section" id="columns"><div class="formal-section-head"><span>01</span><h2>七个专栏，一条完整学习路径</h2><small>LEARNING PATH</small></div><p class="formal-section-lede">先补齐 AI 应用最容易缺失的认知，再逐层增加能力；课程数量随真实能力边界调整，不为好看的数字强行压缩。</p><div class="formal-column-path">${pathCards}</div></section><section class="formal-section" id="currentColumn">${currentSection}</section></main>`;
    this.content.querySelector('[data-next-lesson]')?.addEventListener('click', (event) => { this.go(`lesson/${event.currentTarget.dataset.nextLesson}`); });
    this.bindDashboardActions();
  };
}
