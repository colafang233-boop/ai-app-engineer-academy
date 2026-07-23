function getCompletedLessonCount(app) { return app.course.lessons.filter((lesson) => app.progress.isLessonComplete(lesson.id)).length; }
function getUnlockedLessonCount(app) { return app.course.lessons.filter((lesson) => app.isLessonUnlocked(lesson)).length; }
function getNextLesson(app) {
  return app.course.lessons.find((lesson) => app.isLessonUnlocked(lesson) && !app.progress.isLessonComplete(lesson.id))
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

function renderPathCard(column, index, currentColumn, stateLabel, reviewMode) {
  const active = !reviewMode && index + 1 === currentColumn;
  const locked = !reviewMode && index + 1 > currentColumn;
  return `<article class="formal-column-card ${active ? 'active' : ''} ${locked ? 'locked' : ''} ${reviewMode ? 'review-open' : ''} developed"><span class="formal-column-index">COLUMN ${String(index + 1).padStart(2, '0')}</span><h3>${column.title}</h3><p>${column.description}</p><span class="formal-column-state">${stateLabel}</span></article>`;
}

function columnPathData(app) {
  return app.course.columns.map((column) => ({
    id: column.id,
    title: column.title.replace(/^专栏[一二三四五六七] · /, ''),
    description: column.description,
    lessonCount: column.lessonIds.length,
    examId: column.examId,
  }));
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
function renderEnterpriseBanner(course) {
  const baseline = course.enterpriseResearchBaseline;
  if (!baseline) return '';
  return `<div class="enterprise-baseline-banner"><div><b>NovaTech Enterprise AI Service Desk</b><span>${baseline.asOf}</span></div><p>25 个连续产品增量 · 4 条真实业务闭环 · 16 类生产故障 · 25 项企业工程成果</p><small>最终专栏不再增加新框架，而是验证产品、领域、权限、事务、AI 质量、可靠性、安全、发布和事故责任能否共同成立。</small></div>`;
}
function renderColumnBanner(course, number) {
  if (number === 3) return renderLangChainVersionBanner(course);
  if (number === 4) return renderRagResearchBanner(course);
  if (number === 5) return renderLangGraphVersionBanner(course);
  if (number === 6) return renderMcpVersionBanner(course);
  if (number === 7) return renderEnterpriseBanner(course);
  return '';
}

function renderReviewSections(app) {
  const sections = app.course.columns.map((column, index) => `<section class="review-column-section" data-review-column="${column.id}"><div class="formal-section-head"><span>${String(index + 2).padStart(2, '0')}</span><h2>${column.title}</h2><small>OPEN REVIEW · COLUMN ${String(index + 1).padStart(2, '0')}</small></div><p class="formal-section-lede">${column.description}</p>${renderColumnBanner(app.course, index + 1)}${app.renderColumn(column, index)}</section>`).join('');
  return `<div class="quality-review-banner"><div><span>QUALITY REVIEW MODE</span><h2>全部 108 节课程与 7 场考试已开放</h2></div><p>当前暂时关闭顺序解锁，只用于逐课检查内容、术语、颗粒度、交互和最终企业项目质量。访问 <code>?review=0</code> 可恢复正式学习路径。</p></div><div class="review-column-stack">${sections}</div><section class="review-graduation"><div class="formal-section-head"><span>09</span><h2>完整学习路径已经开发完成</h2><small>108 LESSONS · 7 COLUMNS</small></div><p>从 TypeScript、Prompt 和 LangChain，到框架中立 RAG、LangGraph、MCP，再到 NovaTech 企业级生产交付。课程不存在未开发占位专栏。</p></section>`;
}

export function installFormalDashboard(app) {
  app.renderDashboard = function renderFormalDashboard() {
    const completed = getCompletedLessonCount(this);
    const unlocked = getUnlockedLessonCount(this);
    const currentColumn = getCurrentColumnNumber(this);
    const nextLesson = getNextLesson(this);
    const columns = columnPathData(this);
    const totalLessons = this.course.lessons.length;
    const overall = Math.round(completed / totalLessons * 100);
    const graduated = this.progress.isExamPassed('exam-column-07-enterprise');

    const pathCards = columns.map((column, index) => {
      const number = index + 1;
      const passed = this.progress.isExamPassed(column.examId);
      const label = this.reviewMode
        ? `${passed ? '已通过' : '开放审阅'} · ${column.lessonCount} 节`
        : passed ? `已完成 · ${column.lessonCount} 节` : number === currentColumn ? `进行中 · ${column.lessonCount} 节` : number < currentColumn ? `已开放 · ${column.lessonCount} 节` : `未解锁 · ${column.lessonCount} 节`;
      return renderPathCard(column, index, currentColumn, label, this.reviewMode);
    }).join('');

    const currentColumnConfig = this.course.columns.find((column) => column.id === `column-0${currentColumn}`) ?? this.course.columns.at(-1);
    const currentSection = this.reviewMode ? renderReviewSections(this)
      : `<div class="formal-section-head"><span>02</span><h2>${graduated ? '毕业项目已经通过' : `当前专栏：${currentColumnConfig.title}`}</h2><small>COLUMN ${String(currentColumn).padStart(2, '0')}</small></div><p class="formal-section-lede">${graduated ? '你已经完成从 AI 应用基础到企业生产事故演练的完整路径。所有工程成果仍可在项目成果抽屉中复查。' : currentColumnConfig.description}</p>${renderColumnBanner(this.course, currentColumn)}${this.renderColumn(currentColumnConfig, currentColumn - 1)}`;

    this.content.innerHTML = `<main class="formal-dashboard ${this.reviewMode ? 'review-mode' : ''}" id="dashboardTop"><section class="formal-hero"><div class="formal-hero-grid"><div><div class="formal-eyebrow">JAVA → TYPESCRIPT → AI APPLICATION ENGINEERING → PRODUCTION</div><h1>从会写 Java CRUD，<br>到能独立交付<span>企业 AI 系统</span></h1><p class="formal-lead">${this.reviewMode ? '当前处于课程质量审阅模式。108 节课程和 7 场考试全部可以直接进入，便于检查最终内容质量。' : '这套课程从模型调用、Prompt 和结构化输出开始，逐步进入 LangChain、框架中立 RAG、LangGraph、MCP，最后完成一个可评估、可审计、可恢复、可回滚的企业 AI Service Desk。'}</p><div class="formal-stats"><article><span>完整专栏</span><b>7</b><small>全部开发完成</small></article><article><span>互动课程</span><b>${totalLessons}</b><small>每课一个实验和成果</small></article><article><span>${this.reviewMode ? '开放审阅' : '当前解锁'}</span><b>${unlocked}</b><small>${this.reviewMode ? '全部课程' : '按考试结果推进'}</small></article><article><span>已完成</span><b>${completed}</b><small>${graduated ? '毕业答辩已通过' : '完成实验与迁移才计入'}</small></article></div></div><aside class="formal-continue-sheet"><div class="formal-sheet-label">${graduated ? '毕业成果' : this.reviewMode ? '审阅入口' : '下一步'} · 第 ${nextLesson.number} 课</div><h2>${nextLesson.title}</h2><p>${nextLesson.description}</p><div class="formal-continue-meta"><span>官方依据</span><span>互动实验</span><span>工程成果</span></div><div class="formal-progress"><i><em style="width:${overall}%"></em></i><span>${overall}%</span></div><button class="formal-primary" data-next-lesson="${nextLesson.id}">${graduated ? '复查最终毕业项目' : this.reviewMode ? '进入课程审阅' : completed ? '继续学习' : '开始第 1 课'}</button></aside></div></section><section class="formal-section" id="columns"><div class="formal-section-head"><span>01</span><h2>七个专栏，一条完整学习路径</h2><small>LEARNING PATH</small></div><p class="formal-section-lede">从认知、模型与工程基础，逐层进入检索、编排、协议集成和企业生产责任；全部课程已经开发完成。</p><div class="formal-column-path">${pathCards}</div></section><section class="formal-section" id="currentColumn">${currentSection}</section></main>`;
    this.content.querySelector('[data-next-lesson]')?.addEventListener('click', (event) => { this.go(`lesson/${event.currentTarget.dataset.nextLesson}`); });
    this.bindDashboardActions();
  };
}
