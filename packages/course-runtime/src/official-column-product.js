const artifactMeta = {
  langchainArchitectureDecision: { label: 'LangChain v1 架构与迁移决策', description: '主包、Core、模型集成、LangGraph、Classic 与 LangSmith 的边界' },
  messageContractV1: { label: 'Message 与 Content Blocks 契约', description: '跨供应商文本、推理、引用、工具调用和元数据读取方式' },
  modelRuntimeConfig: { label: '模型运行与批处理配置', description: 'Profile、invoke、stream、batch、并发与能力匹配' },
  structuredOutputPolicy: { label: '结构化输出策略', description: '模型与 Agent 的 Provider/Tool Strategy 决策' },
  eventStreamingContract: { label: '多通道事件流协议', description: 'messages、updates、custom 与 Event Streaming v3' },
  runtimeToolRegistry: { label: 'Runtime Tool 注册表', description: 'Zod 参数、最小权限、可信上下文和 ToolMessage 错误' },
  agentStateContract: { label: 'createAgent State 契约', description: 'Messages State、自定义状态、Runtime Context 与停止条件' },
  middlewarePipeline: { label: 'Middleware Hook 流水线', description: '动态 Prompt、模型路由、工具过滤和调用包装' },
  memoryPolicy: { label: '线程级短期记忆策略', description: 'Checkpointer、thread_id、恢复、trim 与 summarization' },
  reliabilityPolicy: { label: 'Agent 可靠性策略', description: 'Model/Tool Retry、Fallback、退避、jitter 与调用限额' },
  safetyAndApprovalPolicy: { label: 'Guardrails 与人工审批策略', description: 'PII、Prompt Injection、approve/edit/reject/respond' },
  langchainProductionBlueprint: { label: 'LangChain v1 生产交付蓝图', description: 'LangSmith Trace、评估、可靠性、安全和回退清单' },
};

const lessonResults = {
  'lesson-10': 'LangChain v1 架构与迁移决策',
  'lesson-11': 'Message 与 Content Blocks 契约',
  'lesson-12': '模型运行与批处理配置',
  'lesson-13': '结构化输出策略',
  'lesson-14': '多通道事件流协议',
  'lesson-15': 'Runtime Tool 注册表',
  'lesson-16': 'createAgent State 契约',
  'lesson-17': 'Middleware Hook 流水线',
  'lesson-18': '线程级短期记忆策略',
  'lesson-19': 'Agent 可靠性策略',
  'lesson-20': 'Guardrails 与人工审批策略',
  'lesson-21': 'LangChain v1 生产交付蓝图',
};

function preview(name, value) {
  if (name === 'langchainArchitectureDecision') return '<p>已明确当前 v1 Agent 主线、兼容包、底层 Graph 和 LangSmith 的职责边界。</p>';
  if (name === 'messageContractV1') return `<p>已统一读取 <b>${value?.normalizedProviders?.length ?? 0}</b> 家供应商的 contentBlocks、tool_calls 与 metadata。</p>`;
  if (name === 'modelRuntimeConfig') return '<p>模型选择开始依据 Profile 与任务能力，并为独立请求配置 batch 并发限制。</p>';
  if (name === 'structuredOutputPolicy') return `<p>已验证 <b>${value?.policies?.length ?? 0}</b> 类结构化输出策略场景。</p>`;
  if (name === 'eventStreamingContract') return '<p>前端已区分 token、Agent step、业务进度、工具生命周期与最终状态。</p>';
  if (name === 'runtimeToolRegistry') return '<p>只开放必要只读工具，并从 Runtime Context 注入用户、租户和数据库连接。</p>';
  if (name === 'agentStateContract') return `<p>Agent State 包含 ${value?.state?.join('、') ?? 'messages'}，并配置最终输出与迭代上限。</p>`;
  if (name === 'middlewarePipeline') return `<p>Middleware 顺序：${value?.order?.join(' → ') ?? '已完成'}。</p>`;
  if (name === 'memoryPolicy') return `<p>已恢复 ${value?.recoveredThreads?.length ?? 0} 个独立线程，策略：<b>${value?.contextPolicy ?? '已配置'}</b>。</p>`;
  if (name === 'reliabilityPolicy') return '<p>已区分瞬时错误、供应商故障、确定性错误和失控调用，并配置对应恢复动作。</p>';
  if (name === 'safetyAndApprovalPolicy') return '<p>高风险工具会在执行前暂停，支持 approve、edit、reject 与 respond。</p>';
  if (name === 'langchainProductionBlueprint') return `<p>当前官方基线：<b>${value?.officialVersion ?? 'langchain v1'}</b>；Trace、评估、可靠性、安全和回退均已纳入发布清单。</p>`;
  return null;
}

export function installOfficialColumnProduct(app) {
  const baseMeta = app.artifactMeta.bind(app);
  const basePreview = app.artifactPreview.bind(app);
  const baseResult = app.resultForLesson.bind(app);

  app.artifactMeta = function officialArtifactMeta(name) {
    return artifactMeta[name] ?? baseMeta(name);
  };

  app.artifactPreview = function officialArtifactPreview(name, value) {
    return preview(name, value) ?? basePreview(name, value);
  };

  app.resultForLesson = function officialResultForLesson(lessonId) {
    return lessonResults[lessonId] ?? baseResult(lessonId);
  };

  app.renderArtifacts = function renderOfficialArtifacts() {
    const target = this.root.querySelector('[data-artifacts]');
    const progressTarget = this.root.querySelector('[data-artifact-progress]');
    if (!target || !progressTarget) return;

    const data = this.artifacts.get();
    const names = this.artifactNames();
    const targetCount = 23;
    progressTarget.innerHTML = `<span>项目完成度</span><i><em style="width:${Math.min(100, Math.round(names.length / targetCount * 100))}%"></em></i><b>${names.length} / ${targetCount}</b>`;

    target.innerHTML = names.length
      ? names.map((name, index) => this.renderArtifactCard(name, data[name], index)).join('')
      : '<div class="empty-artifacts"><span>◇</span><b>你的项目成果会出现在这里</b><p>从第一课开始，每完成一项实验，我们都会替你保存一份可以在后续课程继续使用的成果。</p></div>';
  };
}
