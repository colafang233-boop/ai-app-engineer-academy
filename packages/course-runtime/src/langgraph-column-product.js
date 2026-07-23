const artifactMeta = {
  orchestrationDecision: { label: 'LangGraph 编排适用性决策', description: '普通函数、createAgent、Functional API 与 StateGraph 的使用边界' },
  graphExecutionMentalModel: { label: 'Graph 执行模型快照', description: 'State、Node、Edge、Superstep 与状态快照的执行契约' },
  stateReducerContract: { label: 'StateSchema 与 Reducer 契约', description: 'overwrite、append、sum、union 与 MessagesValue 的合并规则' },
  nodeBoundaryPolicy: { label: 'Node 边界与副作用策略', description: 'Checkpoint、重试、幂等和可观察节点颗粒度' },
  routingCommandPolicy: { label: 'Edge、Routing 与 Command 策略', description: '固定边、条件边和状态更新加跳转的选择' },
  parallelSendPolicy: { label: 'Superstep 与 Send 并行策略', description: '静态并行、动态 fan-out、reducer 汇合和并发预算' },
  workflowPatternCatalog: { label: 'LangGraph 工作流模式目录', description: 'Chaining、Parallel、Routing、Orchestrator-worker、Evaluator-optimizer 与 Agent' },
  langGraphApiDecision: { label: 'Graph API / Functional API 决策', description: '新图设计与旧代码渐进增强的 API 使用边界' },
  durableExecutionPolicy: { label: 'Durable Execution 策略', description: 'task、确定性重放、幂等副作用和恢复边界' },
  checkpointThreadContract: { label: 'Checkpoint 与 Thread 契约', description: 'thread_id、checkpoint、StateSnapshot、恢复和隔离' },
  interruptResumeContract: { label: 'Interrupt 与 Resume 契约', description: '中断位置、类型化载荷、approve/edit/reject/respond 与恢复' },
  timeTravelDebugPlan: { label: 'Time Travel 调试方案', description: 'Checkpoint Replay、Fork、State diff 和分支审计' },
  graphStreamingUiContract: { label: 'Graph Streaming UI 契约', description: 'values、updates、messages、custom、debug 与节点状态' },
  memoryScopePolicy: { label: '短期与长期 Memory Scope', description: 'Thread State、Checkpointer、Store namespace、过期和删除' },
  subgraphCompositionPolicy: { label: 'Subgraph 组合与持久化策略', description: 'per-invocation、per-thread、stateless、State mapping 与 namespace' },
  multiAgentArchitectureDecision: { label: 'Multi-agent 架构决策', description: 'Single Agent、Router、Subagents、Handoffs 与确定性 Workflow' },
  agenticRetrievalRouter: { label: 'Agentic RAG 知识路由器', description: 'No retrieval、API、Document、Hybrid、Parallel 与 ACL deny' },
  retrievalCorrectionLoop: { label: '检索自纠错循环', description: 'Grade、Rewrite、Translate、Decompose、Exit 与轮次预算' },
  evidenceGroundingLoop: { label: 'Evidence 与 Grounding 质量闭环', description: 'Sufficiency、Groundedness、Citation、Relevance 与 Abstention' },
  langGraphProductionBlueprint: { label: 'LangGraph 生产交付蓝图', description: '测试、持久化、迁移、Trace、Streaming、部署、灰度和回滚' },
};

const lessonResults = Object.fromEntries([
  ['lesson-39', 'LangGraph 编排适用性决策'], ['lesson-40', 'Graph 执行模型快照'], ['lesson-41', 'StateSchema 与 Reducer 契约'],
  ['lesson-42', 'Node 边界与副作用策略'], ['lesson-43', 'Edge、Routing 与 Command 策略'], ['lesson-44', 'Superstep 与 Send 并行策略'],
  ['lesson-45', 'LangGraph 工作流模式目录'], ['lesson-46', 'Graph API / Functional API 决策'], ['lesson-47', 'Durable Execution 策略'],
  ['lesson-48', 'Checkpoint 与 Thread 契约'], ['lesson-49', 'Interrupt 与 Resume 契约'], ['lesson-50', 'Time Travel 调试方案'],
  ['lesson-51', 'Graph Streaming UI 契约'], ['lesson-52', '短期与长期 Memory Scope'], ['lesson-53', 'Subgraph 组合与持久化策略'],
  ['lesson-54', 'Multi-agent 架构决策'], ['lesson-55', 'Agentic RAG 知识路由器'], ['lesson-56', '检索自纠错循环'],
  ['lesson-57', 'Evidence 与 Grounding 质量闭环'], ['lesson-58', 'LangGraph 生产交付蓝图'],
]);

function preview(name, value) {
  if (name === 'orchestrationDecision') return `<p>已为 <b>${Object.keys(value?.decisions ?? {}).length}</b> 类任务选择最小可靠编排抽象。</p>`;
  if (name === 'graphExecutionMentalModel') return `<p>已单步执行 <b>${value?.supersteps ?? value?.trace?.length ?? 0}</b> 个 Superstep，并观察 State 合并。</p>`;
  if (name === 'stateReducerContract') return `<p>已为 <b>${Object.keys(value?.channels ?? value?.results ?? {}).length}</b> 个 State channel 定义 reducer。</p>`;
  if (name === 'nodeBoundaryPolicy') return '<p>外部副作用、可重试计算和 Checkpoint 边界已经分离。</p>';
  if (name === 'routingCommandPolicy') return '<p>固定边、条件边和 Command 已按是否同时更新 State 分工。</p>';
  if (name === 'parallelSendPolicy') return `<p>动态 Worker 数：<b>${value?.workers ?? value?.workerCount ?? '已配置'}</b>；并发与 reducer 汇合已设置。</p>`;
  if (name === 'workflowPatternCatalog') return `<p>已覆盖 <b>${Object.keys(value?.patterns ?? value?.decisions ?? {}).length}</b> 类 Workflow/Agent 模式。</p>`;
  if (name === 'langGraphApiDecision') return '<p>Graph API 与 Functional API 已按新建图和渐进改造场景区分。</p>';
  if (name === 'durableExecutionPolicy') return '<p>非确定性调用和副作用已进入 task，并配置幂等与恢复策略。</p>';
  if (name === 'checkpointThreadContract') return `<p>已隔离 <b>${value?.threads?.length ?? 2}</b> 个 thread，并保存 checkpoint 历史。</p>`;
  if (name === 'interruptResumeContract') return `<p>已处理 <b>${value?.decisions?.length ?? 0}</b> 类类型化 resume 决策。</p>`;
  if (name === 'timeTravelDebugPlan') return '<p>已从历史 checkpoint Replay 原分支并 Fork 反事实分支。</p>';
  if (name === 'graphStreamingUiContract') return '<p>Node updates、Token、业务进度、完整 State 和 debug 已路由到不同 UI。</p>';
  if (name === 'memoryScopePolicy') return '<p>Thread State 与跨线程 Store 已按用户、组织和应用 namespace 隔离。</p>';
  if (name === 'subgraphCompositionPolicy') return `<p>已为 <b>${Object.keys(value?.decisions ?? {}).length}</b> 类子图配置 persistence mode。</p>`;
  if (name === 'multiAgentArchitectureDecision') return `<p>已为 <b>${Object.keys(value?.decisions ?? {}).length}</b> 个协作场景选择 Agent 架构。</p>`;
  if (name === 'agenticRetrievalRouter') return `<p>已配置 <b>${Object.keys(value?.routes ?? {}).length}</b> 类 Query 的权威知识访问路径。</p>`;
  if (name === 'retrievalCorrectionLoop') return `<p>最大修正轮次 <b>${value?.maxAttempts ?? '已限制'}</b>，权限与无答案均有强制出口。</p>`;
  if (name === 'evidenceGroundingLoop') return `<p>总调用预算 <b>${value?.totalCallBudget ?? '已配置'}</b>，含 Evidence、Citation 与 Abstention 门禁。</p>`;
  if (name === 'langGraphProductionBlueprint') return `<p>发布决策：<b>${value?.decision ?? '待定'}</b>；测试、迁移、灰度和回滚已纳入门禁。</p>`;
  return null;
}

function renderKnowledgePanel(lesson) {
  const prerequisites = lesson.prerequisites ?? [];
  const terms = lesson.terms ?? [];
  if (!prerequisites.length && !terms.length) return '';
  return `<section class="lg-knowledge-panel" data-langgraph-knowledge><div class="lg-prerequisites"><span>PREREQUISITES</span><h3>开始本课前，你需要知道</h3><div>${prerequisites.map((item) => `<article><i>✓</i><b>${item}</b></article>`).join('')}</div></div><div class="lg-glossary"><span>TERMS IN THIS LESSON</span><h3>本课专业名词</h3><div>${terms.map((item) => `<article><b>${item.name}</b><p>${item.definition}</p></article>`).join('')}</div></div></section>`;
}

export function installLangGraphColumnProduct(app) {
  const baseMeta = app.artifactMeta.bind(app);
  const basePreview = app.artifactPreview.bind(app);
  const baseResult = app.resultForLesson.bind(app);
  const baseRenderLesson = app.renderLesson.bind(app);

  app.artifactMeta = function langGraphArtifactMetadata(name) { return artifactMeta[name] ?? baseMeta(name); };
  app.artifactPreview = function langGraphArtifactPreview(name, value) { return preview(name, value) ?? basePreview(name, value); };
  app.resultForLesson = function langGraphResultForLesson(lessonId) { return lessonResults[lessonId] ?? baseResult(lessonId); };

  app.renderLesson = function renderLangGraphLesson(lessonId) {
    baseRenderLesson(lessonId);
    const lesson = this.lessonById(lessonId);
    if (lesson?.columnId !== 'column-05') return;
    const hero = this.content.querySelector('.cr-hero');
    if (!hero || this.content.querySelector('[data-langgraph-knowledge]')) return;
    hero.insertAdjacentHTML('afterend', renderKnowledgePanel(lesson));
  };

  app.renderArtifacts = function renderCompleteProjectArtifacts() {
    const target = this.root.querySelector('[data-artifacts]');
    const progressTarget = this.root.querySelector('[data-artifact-progress]');
    if (!target || !progressTarget) return;
    const data = this.artifacts.get();
    const names = this.artifactNames();
    const targetCount = 60;
    const percent = Math.min(100, Math.round(names.length / targetCount * 100));
    progressTarget.innerHTML = `<span>项目完成度</span><i><em style="width:${percent}%"></em></i><b>${names.length} / ${targetCount}</b>`;
    target.innerHTML = names.length
      ? names.map((name, index) => this.renderArtifactCard(name, data[name], index)).join('')
      : '<div class="empty-artifacts"><span>◇</span><b>你的项目成果会出现在这里</b><p>每完成一次状态、路由、持久化或 Agentic RAG 实验，都会保存一份可审查的工程契约。</p></div>';
  };
}
