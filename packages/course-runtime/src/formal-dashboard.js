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

const columnOutcomes = {
  'column-01': '学完后，你能判断一个需求是否真的该用 AI，并独立写出稳定的模型请求骨架。',
  'column-02': '学完后，你能把模糊业务需求拆成 Prompt、结构化输出、Few-shot 与评估闭环。',
  'column-03': '学完后，你能用 LangChain v1 组织 Models、Messages、Tools、Middleware、Memory 与发布能力。',
  'column-04': '学完后，你能按场景设计 RAG：先画像、再评测，再优化检索、证据与生产门禁。',
  'column-05': '学完后，你能用 LangGraph 搭建可恢复的状态流、人工介入流程与可控 Agentic RAG。',
  'column-06': '学完后，你能设计并接入 MCP：理解 Host、Server、授权、部署、安全与跨 Host 集成。',
  'column-07': '学完后，你能把 AI 能力落成企业级产品：从领域、权限、评估到发布、事故与回滚。',
};

function columnOutcome(column) { return columnOutcomes[column.id] ?? column.description; }

function renderPathCard(column, index, currentColumn, selectedColumnId, stateLabel, reviewMode) {
  const active = !reviewMode && index + 1 === currentColumn;
  const locked = !reviewMode && index + 1 > currentColumn;
  const selected = column.id === selectedColumnId;
  return `<button class="formal-column-card ${active ? 'active' : ''} ${selected ? 'selected' : ''} ${locked ? 'locked' : ''} ${reviewMode ? 'review-open' : ''} developed" data-column-select="${column.id}" aria-pressed="${selected}" aria-controls="currentColumn" type="button"><span class="formal-column-topline"><span class="formal-column-index">COLUMN ${String(index + 1).padStart(2, '0')}</span><span class="formal-column-badges"><span class="formal-column-badge">${column.lessonCount} 节课</span><span class="formal-column-badge state">${stateLabel}</span></span></span><h3>${column.title}</h3><p class="formal-column-outcome">${columnOutcome(column)}</p><span class="formal-column-cta">${locked ? '查看课程结构' : '查看课程清单'} <i>→</i></span></button>`;
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

function renderSelectedColumn(app, column, index) {
  const unlocked = app.isColumnUnlocked(column);
  return `<div class="selected-column-panel" data-selected-column="${column.id}" data-review-column="${column.id}"><div class="formal-section-head"><span>02</span><h2 tabindex="-1" data-selected-column-heading>${column.title}</h2><small>COLUMN ${String(index + 1).padStart(2, '0')}</small></div><div class="selected-column-intro"><p>${columnOutcome(column)}</p><div><span>${column.lessonIds.length} 节互动课程</span><span>1 场综合考试</span><span>${unlocked || app.reviewMode ? '可以进入学习' : '课程结构可预览'}</span></div></div>${renderColumnBanner(app.course, index + 1)}${!unlocked && !app.reviewMode ? '<div class="selected-column-lock-note"><b>这个专栏尚未解锁</b><span>你可以先查看课程结构；完成上一专栏考试后，课程入口会自动开放。</span></div>' : ''}${app.renderColumn(column, index)}</div>`;
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
    const fallbackColumn = this.course.columns[currentColumn - 1] ?? this.course.columns.at(-1);
    const selectedColumn = this.course.columns.find((column) => column.id === this.dashboardSelectedColumnId) ?? fallbackColumn;
    const selectedIndex = this.course.columns.indexOf(selectedColumn);
    this.dashboardSelectedColumnId = selectedColumn.id;

    const pathCards = columns.map((column, index) => {
      const number = index + 1;
      const passed = this.progress.isExamPassed(column.examId);
      const label = this.reviewMode
        ? (passed ? '已通过' : '开放审阅')
        : passed ? '已完成' : number === currentColumn ? '进行中' : number < currentColumn ? '已开放' : '未解锁';
      return renderPathCard(column, index, currentColumn, selectedColumn.id, label, this.reviewMode);
    }).join('');

    const selectedSection = `${this.reviewMode ? '<div class="quality-review-banner"><div><span>QUALITY REVIEW MODE</span><h2>108 节课程均可自由选择审阅</h2></div><p>首页一次只展开一个专栏。点击上方专栏卡片切换课程清单；访问 <code>?review=0</code> 恢复正式顺序学习。</p></div>' : ''}${renderSelectedColumn(this, selectedColumn, selectedIndex)}`;

    this.content.innerHTML = `<main class="formal-dashboard ${this.reviewMode ? 'review-mode' : ''}" id="dashboardTop"><section class="formal-hero"><div class="formal-hero-grid"><div><div class="formal-eyebrow">JAVA → TYPESCRIPT → AI APPLICATION ENGINEERING → PRODUCTION</div><h1>从会写 Java CRUD，<br>到能独立交付<span>企业 AI 系统</span></h1><p class="formal-lead">${this.reviewMode ? '当前处于课程质量审阅模式。你可以从七个专栏中自由选择，只展开当前需要检查的课程清单。' : '这套课程从模型调用、Prompt 和结构化输出开始，逐步进入 LangChain、框架中立 RAG、LangGraph、MCP，最后完成一个可评估、可审计、可恢复、可回滚的企业 AI Service Desk。'}</p><div class="formal-stats"><article><span>完整专栏</span><b>7</b><small>全部开发完成</small></article><article><span>互动课程</span><b>${totalLessons}</b><small>每课一个实验和成果</small></article><article><span>${this.reviewMode ? '开放审阅' : '当前解锁'}</span><b>${unlocked}</b><small>${this.reviewMode ? '全部课程' : '按考试结果推进'}</small></article><article><span>已完成</span><b>${completed}</b><small>${graduated ? '毕业答辩已通过' : '完成实验与迁移才计入'}</small></article></div></div><aside class="formal-continue-sheet"><div class="formal-sheet-label">${graduated ? '毕业成果' : this.reviewMode ? '审阅入口' : '下一步'} · 第 ${nextLesson.number} 课</div><h2>${nextLesson.title}</h2><p>${nextLesson.description}</p><div class="formal-continue-meta"><span>官方依据</span><span>互动实验</span><span>工程成果</span></div><div class="formal-progress"><i><em style="width:${overall}%"></em></i><span>${overall}%</span></div><button class="formal-primary" data-next-lesson="${nextLesson.id}">${graduated ? '复查最终毕业项目' : this.reviewMode ? '进入课程审阅' : completed ? '继续学习' : '开始第 1 课'}</button></aside></div></section><section class="formal-section" id="columns"><div class="formal-section-head"><span>01</span><h2>选择一个专栏，查看它的完整课程</h2><small>LEARNING PATH</small></div><p class="formal-section-lede">七张卡片只呈现学习结果和当前状态；点击后，下方仅展示所选专栏的课程清单与考试。</p><div class="formal-column-path">${pathCards}</div></section><section class="formal-section" id="currentColumn">${selectedSection}</section></main>`;
    this.content.querySelector('[data-next-lesson]')?.addEventListener('click', (event) => { this.go(`lesson/${event.currentTarget.dataset.nextLesson}`); });
    this.content.querySelectorAll('[data-column-select]').forEach((button) => {
      button.addEventListener('click', () => {
        this.dashboardSelectedColumnId = button.dataset.columnSelect;
        this.renderDashboard();
        requestAnimationFrame(() => {
          const heading = this.content.querySelector('[data-selected-column-heading]');
          heading?.focus({ preventScroll: true });
          this.content.querySelector('#currentColumn')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    });
    this.bindDashboardActions();
  };
}
