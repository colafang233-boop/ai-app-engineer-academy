const artifactMeta = {
  enterpriseReadinessModel: { label: '企业级成熟度模型', description: '业务闭环、权限、质量、恢复、安全和持续改进的共同门禁' },
  serviceDeskProductCharter: { label: 'NovaTech 产品章程', description: '用户、业务闭环、指标、护栏、责任人与非目标' },
  aiDeterministicBoundaryMap: { label: 'AI / 确定性 / 人工责任边界', description: '四条业务流程中每一步的控制主体' },
  enterpriseDomainModel: { label: '企业领域模型与不变量', description: '聚合、命令、事件、状态和外部事实协调' },
  enterpriseArchitectureDecisionPack: { label: '企业架构与 ADR 决策包', description: '模块化单体、Worker、MCP Gateway 与拆分依据' },
  deliveryFoundationContract: { label: '交付基础契约', description: '环境、配置、Secret、Feature Flag、迁移和 Release Bundle' },
  enterpriseAuthorizationPolicy: { label: '企业身份与授权策略', description: 'Tenant、RBAC、ABAC、数据 ACL、Tool 和 obligations' },
  transactionAuditContract: { label: '事务、Outbox 与审计契约', description: '原子业务写入、至少一次消息、幂等消费和责任证据' },
  knowledgeLifecycleContract: { label: '企业知识生命周期契约', description: '版本、生效、权限、索引、缓存、删除和 Snapshot 发布' },
  modelGatewayPolicy: { label: 'Model Gateway 策略', description: '任务能力、风险、路由、Fallback、预算和版本绑定' },
  enterpriseAiUxContract: { label: '企业 AI UX 契约', description: '流式状态、证据、审批、未知状态、取消与人工接管' },
  policyQuestionRelease: { label: '制度问答生产发布', description: '授权后检索、权威版本、证据、引用、冲突与拒答' },
  itTroubleshootingWorkflow: { label: 'IT 故障排查工作流', description: '故障树、观察、Checkpoint、预算和人工升级' },
  supportHandoffContract: { label: '支持工单与 Handoff 契约', description: '用户影响、步骤、观察、证据、Trace、SLA 和责任转移' },
  accessApprovalWorkflow: { label: '权限申请审批工作流', description: 'Policy obligations、职责分离、审批、超时、复核和 Step-up' },
  privilegedAccessExecutionContract: { label: '特权访问执行契约', description: 'MCP 写 Tool、幂等、核验、租约、到期、回收和审计' },
  deploymentDiagnosisWorkflow: { label: '发布故障诊断工作流', description: 'GitHub/CI 多 MCP、日志信任、证据图、写审批和 Task 恢复' },
  boundedAgencyPolicy: { label: '有界自主性策略', description: '路由置信度、风险、Tool Filter、执行预算、停止与升级' },
  offlineEvaluationReleaseGate: { label: '离线评估发布门禁', description: 'Golden Set、组件评估、端到端任务和零容忍不变量' },
  continuousEvaluationLoop: { label: '持续评估数据闭环', description: '线上采样、反馈、人工确认、脱敏和生产失败回归' },
  observabilitySloContract: { label: '可观测性、SLO 与成本契约', description: '端到端 Trace、业务 SLI、Release Bundle、隐私和成本归因' },
  enterpriseAiThreatModel: { label: '企业 Agentic AI 威胁模型', description: '租户、注入、Memory、Tool、身份、SSRF、级联和遥测攻击链' },
  resilienceRecoveryPlan: { label: '可靠性与恢复计划', description: '超时、熔断、隔离、队列、背压、DLQ、降级和状态协调' },
  enterpriseReleaseStrategy: { label: '企业发布与回滚策略', description: '兼容迁移、离线门禁、Canary、SLO、Flag、暂停与回滚' },
  enterpriseServiceDeskProductionBlueprint: { label: 'Enterprise AI Service Desk 生产蓝图', description: '事故止损、恢复、验证、复盘、架构答辩和毕业发布' },
};

const lessonResults = Object.fromEntries([
  ['lesson-84', '企业级成熟度模型'], ['lesson-85', 'NovaTech 产品章程'], ['lesson-86', 'AI / 确定性 / 人工责任边界'],
  ['lesson-87', '企业领域模型与不变量'], ['lesson-88', '企业架构与 ADR 决策包'], ['lesson-89', '交付基础契约'],
  ['lesson-90', '企业身份与授权策略'], ['lesson-91', '事务、Outbox 与审计契约'], ['lesson-92', '企业知识生命周期契约'],
  ['lesson-93', 'Model Gateway 策略'], ['lesson-94', '企业 AI UX 契约'], ['lesson-95', '制度问答生产发布'],
  ['lesson-96', 'IT 故障排查工作流'], ['lesson-97', '支持工单与 Handoff 契约'], ['lesson-98', '权限申请审批工作流'],
  ['lesson-99', '特权访问执行契约'], ['lesson-100', '发布故障诊断工作流'], ['lesson-101', '有界自主性策略'],
  ['lesson-102', '离线评估发布门禁'], ['lesson-103', '持续评估数据闭环'], ['lesson-104', '可观测性、SLO 与成本契约'],
  ['lesson-105', '企业 Agentic AI 威胁模型'], ['lesson-106', '可靠性与恢复计划'], ['lesson-107', '企业发布与回滚策略'],
  ['lesson-108', 'Enterprise AI Service Desk 生产蓝图'],
]);

function preview(name, value) {
  if (name === 'enterpriseReadinessModel') return `<p>已覆盖 <b>${Object.keys(value?.decisions ?? {}).length}</b> 个企业成熟度判断场景。</p>`;
  if (name === 'serviceDeskProductCharter') return '<p>NovaTech 四条业务闭环、价值指标、零容忍护栏和责任人已经明确。</p>';
  if (name === 'aiDeterministicBoundaryMap') return `<p>已为 <b>${Object.keys(value?.catalog ?? {}).length}</b> 个流程步骤分配 AI、确定性代码、人工或组合责任。</p>`;
  if (name === 'enterpriseDomainModel') return '<p>SupportRequest、Ticket、AccessRequest、ApprovalCase、KnowledgeAsset 与 IntegrationExecution 已形成事实边界。</p>';
  if (name === 'enterpriseArchitectureDecisionPack') return '<p>业务核心保持模块化单体；知识、Agent、评估和集成按真实负载与安全边界拆分。</p>';
  if (name === 'deliveryFoundationContract') return '<p>每次运行都能还原配置、Secret、Flag、迁移和完整 Release Bundle。</p>';
  if (name === 'enterpriseAuthorizationPolicy') return `<p>已处理 <b>${Object.keys(value?.decisions ?? {}).length}</b> 个租户、项目、资源和角色策略场景。</p>`;
  if (name === 'transactionAuditContract') return '<p>业务状态、Outbox 和审计原子提交；消费者按事件和业务键幂等。</p>';
  if (name === 'knowledgeLifecycleContract') return `<p>已处理 <b>${Object.keys(value?.decisions ?? {}).length}</b> 个知识更新、删除、ACL、缓存和不可信内容场景。</p>`;
  if (name === 'modelGatewayPolicy') return '<p>模型选择服从任务能力、本地评估、风险、成本和数据驻留契约。</p>';
  if (name === 'enterpriseAiUxContract') return '<p>真实业务状态已映射为 Streaming、Evidence、Approval、Unknown 和 Handoff 交互。</p>';
  if (name === 'policyQuestionRelease') return '<p>制度问答通过权限、权威版本、证据充分性、引用和拒答门禁。</p>';
  if (name === 'itTroubleshootingWorkflow') return '<p>VPN 排障支持安全步骤、观察、Checkpoint、断线恢复、预算和转人工。</p>';
  if (name === 'supportHandoffContract') return '<p>Handoff Package 保留用户影响、步骤、观察、证据、Trace、SLA 和责任转移。</p>';
  if (name === 'accessApprovalWorkflow') return '<p>Project A 生产只读申请已包含 Policy obligations、职责分离、超时和执行前复核。</p>';
  if (name === 'privilegedAccessExecutionContract') return '<p>IAM 授权使用最小机器身份、幂等键、外部核验、有限租约和自动回收。</p>';
  if (name === 'deploymentDiagnosisWorkflow') return '<p>GitHub 与 CI 多 MCP 诊断已区分不可信日志、只读分析、写审批和长任务恢复。</p>';
  if (name === 'boundedAgencyPolicy') return '<p>统一路由具有置信阈值、风险分层、Tool Filter、执行预算和停止条件。</p>';
  if (name === 'offlineEvaluationReleaseGate') return '<p>Golden Set 同时覆盖路由、RAG、政策、Tool、轨迹、安全、性能和业务结果。</p>';
  if (name === 'continuousEvaluationLoop') return '<p>生产弱信号经组合确认和脱敏后进入版本化回归集。</p>';
  if (name === 'observabilitySloContract') return `<p>Trace 覆盖 <b>${value?.traceSpans?.length ?? 0}</b> 个关键阶段，并纳入任务成功、成本和隐私边界。</p>`;
  if (name === 'enterpriseAiThreatModel') return `<p>已阻断 <b>${Object.keys(value?.decisions ?? {}).length}</b> 条跨租户、注入、Memory、Tool、身份和级联攻击链。</p>`;
  if (name === 'resilienceRecoveryPlan') return '<p>模型、检索、MCP、队列和外部写入故障均有受控降级与恢复路径。</p>';
  if (name === 'enterpriseReleaseStrategy') return `<p>Release Bundle ${value?.bundle ?? '2.0'} 具备评估、安全、Canary、SLO 和回滚门禁。</p>`;
  if (name === 'enterpriseServiceDeskProductionBlueprint') return '<p>最终 SEV-1 Game Day 已完成止损、恢复、验证、沟通、复盘和架构答辩。</p>';
  return null;
}

function renderKnowledgePanel(lesson) {
  const prerequisites = lesson.prerequisites ?? [];
  const terms = lesson.terms ?? [];
  return `<section class="enterprise-knowledge-panel" data-enterprise-knowledge><div class="enterprise-prerequisites"><span>PREREQUISITES</span><h3>开始本课前，你需要掌握</h3><div>${prerequisites.map((item) => `<article><i>✓</i><b>${item}</b></article>`).join('')}</div></div><div class="enterprise-glossary"><span>ENTERPRISE TERMS</span><h3>本课企业工程名词</h3><div>${terms.map((item) => `<article><b>${item.name}</b><p>${item.definition}</p></article>`).join('')}</div></div></section>`;
}

function renderEnterpriseContext(lesson) {
  return `<div class="enterprise-lesson-context" data-enterprise-context><div><span>NOVATECH CONTROL CONTEXT</span><b>${lesson.number < 95 ? '产品与平台建设' : lesson.number < 102 ? '业务闭环交付' : '生产治理与发布'}</b></div><div><span>tenant</span><b>novatech-cloud</b></div><div><span>environment</span><b>${lesson.number >= 107 ? 'production-canary' : 'staging'}</b></div><div><span>release</span><b>service-desk@2.0</b></div></div>`;
}

export function installEnterpriseColumnProduct(app) {
  const baseMeta = app.artifactMeta.bind(app);
  const basePreview = app.artifactPreview.bind(app);
  const baseResult = app.resultForLesson.bind(app);
  const baseRenderLesson = app.renderLesson.bind(app);

  app.artifactMeta = function enterpriseArtifactMetadata(name) { return artifactMeta[name] ?? baseMeta(name); };
  app.artifactPreview = function enterpriseArtifactPreview(name, value) { return preview(name, value) ?? basePreview(name, value); };
  app.resultForLesson = function enterpriseResultForLesson(lessonId) { return lessonResults[lessonId] ?? baseResult(lessonId); };

  app.renderLesson = function renderEnterpriseLesson(lessonId) {
    baseRenderLesson(lessonId);
    const lesson = this.lessonById(lessonId);
    if (lesson?.columnId !== 'column-07') return;
    const hero = this.content.querySelector('.cr-hero');
    if (!hero || this.content.querySelector('[data-enterprise-knowledge]')) return;
    hero.insertAdjacentHTML('afterend', `${renderEnterpriseContext(lesson)}${renderKnowledgePanel(lesson)}`);
  };

  app.renderArtifacts = function renderAllProjectArtifacts() {
    const target = this.root.querySelector('[data-artifacts]');
    const progressTarget = this.root.querySelector('[data-artifact-progress]');
    if (!target || !progressTarget) return;
    const data = this.artifacts.get();
    const names = this.artifactNames();
    const targetCount = 110;
    const percent = Math.min(100, Math.round(names.length / targetCount * 100));
    progressTarget.innerHTML = `<span>完整工程成果</span><i><em style="width:${percent}%"></em></i><b>${names.length} / ${targetCount}</b>`;
    target.innerHTML = names.length
      ? names.map((name, index) => this.renderArtifactCard(name, data[name], index)).join('')
      : '<div class="empty-artifacts"><span>◇</span><b>你的企业 AI 项目成果会出现在这里</b><p>从技术基础到生产事故演练，每节课都会留下可复用、可审查的工程契约。</p></div>';
  };
}
