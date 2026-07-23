import { mountChecklistLab, mountClassificationLab, mountDecisionSeries } from './mcp-lab-utils.js';

export function mountEnterpriseReadinessMatrix(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'enterprise-readiness-lab',
    title: 'Enterprise Readiness Matrix',
    subtitle: '功能不是企业成熟度的替代指标',
    artifactName: 'enterpriseReadinessModel',
    artifactNote: '企业级由业务闭环、权限、质量证据、恢复、安全治理和持续改进共同成立。',
    completeText: '六个企业成熟度维度已经形成判断标准。',
    scenarios: [
      {
        id: 'business-loop',
        title: '聊天机器人能回答，但无法创建工单或确认问题是否解决',
        detail: '功能看起来完整，业务状态没有闭环。',
        answer: 'not-ready',
        options: [
          { value: 'ready', label: '企业级', description: '回答质量足够即可' },
          { value: 'not-ready', label: '未达到企业级', description: '缺少可验证业务闭环' },
          { value: 'scale', label: '只需要增加并发' },
        ],
      },
      {
        id: 'identity',
        title: '知识问答准确率很高，但所有员工共享同一个检索权限',
        detail: '私有文档可能进入无权用户上下文。',
        answer: 'blocked',
        options: [
          { value: 'blocked', label: '阻止上线', description: '权限泄漏属于硬性失败' },
          { value: 'warn', label: '上线后观察' },
          { value: 'prompt', label: '在 Prompt 中提醒保密' },
        ],
      },
      {
        id: 'quality',
        title: '团队展示了十个成功案例，但没有固定评估集',
        detail: '模型、Prompt 或知识更新后无法证明没有退化。',
        answer: 'evidence',
        options: [
          { value: 'evidence', label: '需要版本化评估证据' },
          { value: 'demo', label: 'Demo 已经足够' },
          { value: 'manual', label: '每次凭感觉看两题' },
        ],
      },
      {
        id: 'recovery',
        title: 'IAM 已经授权，但网络超时，系统准备再次执行同一写 Tool',
        detail: '外部状态未知且可能重复副作用。',
        answer: 'recover',
        options: [
          { value: 'recover', label: '查询状态并使用幂等恢复' },
          { value: 'retry', label: '无条件重试' },
          { value: 'success', label: '直接标记成功' },
        ],
      },
      {
        id: 'governance',
        title: 'Agent 可以触发生产部署，但没有审批、审计和回滚',
        detail: '自动化能力越强，错误影响越大。',
        answer: 'unsafe',
        options: [
          { value: 'unsafe', label: '高风险且不可接受' },
          { value: 'advanced', label: '自主性高，属于先进架构' },
          { value: 'log', label: '补 console.log 即可' },
        ],
      },
      {
        id: 'improvement',
        title: '生产失败只被客服手工处理，从不进入评估数据集',
        detail: '同类问题会在未来版本继续出现。',
        answer: 'loop',
        options: [
          { value: 'loop', label: '建立生产失败到回归集的闭环' },
          { value: 'ignore', label: '生产问题无法测试' },
          { value: 'model', label: '只升级更大模型' },
        ],
      },
    ],
  }});
}

export function mountEnterpriseProductCharter(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'enterprise-charter-lab',
    title: 'NovaTech Product Charter Builder',
    subtitle: '价值、护栏、责任人与非目标必须同时存在',
    artifactName: 'serviceDeskProductCharter',
    artifactNote: '产品章程同时约束业务收益、不可接受结果、责任人和发布边界。',
    completeText: 'NovaTech Enterprise AI Service Desk 产品章程已完成。',
    lede: '目标：减少重复咨询，但不能以错误回答、越权或阻止建单换取自助率。',
    detail: '产品服务制度咨询、IT 故障、权限申请和研发发布故障四条闭环。',
    checks: [
      { id: 'users', label: '明确用户与责任角色', description: '员工、开发者、支持、经理、安全、审计和平台运维' },
      { id: 'loops', label: '限定四条业务闭环', description: '拒绝“万能企业助手”范围膨胀' },
      { id: 'business', label: '定义业务结果指标', description: '解决率、处理时间、知识缺口和成本' },
      { id: 'guardrails', label: '定义安全与质量护栏', description: '泄漏、越权、无引用高风险回答必须为零' },
      { id: 'owners', label: '指定产品、业务、数据和系统所有者', description: '每类风险有明确责任人' },
      { id: 'non-goals', label: '写出明确非目标', description: '不替代最终审批、不自动授予无限权限、不回答无证据高风险问题' },
      { id: 'stop', label: '设置停止上线条件', description: '关键安全或质量门禁失败时必须阻止发布' },
    ],
    selects: [
      {
        id: 'north-star',
        label: '北极星指标',
        correct: 'resolved',
        options: [
          { value: 'messages', label: '聊天消息数量' },
          { value: 'resolved', label: '经验证的安全解决请求数量' },
          { value: 'tokens', label: 'Token 使用量' },
        ],
      },
      {
        id: 'risk-appetite',
        label: '跨租户数据泄漏风险偏好',
        correct: 'zero',
        options: [
          { value: 'small', label: '低于 1% 可接受' },
          { value: 'zero', label: '零容忍，任何案例阻止发布' },
        ],
      },
    ],
    successCode: `product: NovaTech Enterprise AI Service Desk\nloops: policy / IT / access / deployment\nnorthStar: verified_safe_resolution\nzeroTolerance: tenant_leakage, unauthorized_tool_execution`,
  }});
}

export function mountAiDeterministicBoundary(args) {
  return mountClassificationLab({ ...args, definition: {
    className: 'enterprise-boundary-lab',
    title: 'AI / Code / Human Responsibility Map',
    subtitle: '把不确定性包在可验证的确定性外壳中',
    artifactName: 'aiDeterministicBoundaryMap',
    artifactNote: '模型负责理解与建议，代码负责硬约束，人员负责组织授权；高风险步骤采用组合边界。',
    completeText: '四条业务流程的责任边界已经建立。',
    categories: [
      { value: 'ai', label: 'AI' },
      { value: 'deterministic', label: '确定性代码/策略' },
      { value: 'human', label: '人工授权' },
      { value: 'hybrid', label: '组合步骤' },
    ],
    items: [
      { id: 'intent', label: '理解用户模糊请求', description: '识别问题类型和上下文', answer: 'ai', why: '非结构化语义理解' },
      { id: 'tenant', label: '解析 tenantId 与用户身份', description: '来自已验证身份令牌', answer: 'deterministic', why: '身份不能由模型猜测' },
      { id: 'retrieval-query', label: '改写检索查询', description: '处理同义表达和中英混输', answer: 'ai', why: '语义转换适合模型' },
      { id: 'acl', label: '知识 ACL 过滤', description: '决定哪些文档可进入检索', answer: 'deterministic', why: '硬性授权边界' },
      { id: 'citation', label: '生成引用解释', description: '根据已经验证的证据组织回答', answer: 'hybrid', why: '代码限制证据，模型生成解释' },
      { id: 'policy', label: '访问策略最终裁决', description: 'subject/resource/action/environment', answer: 'deterministic', why: '策略结果必须可重复验证' },
      { id: 'justification', label: '提取访问申请理由', description: '从自然语言生成结构化字段', answer: 'ai', why: '结构化提取' },
      { id: 'manager-approval', label: '批准业务必要性', description: '承担部门责任', answer: 'human', why: '组织授权' },
      { id: 'security-approval', label: '批准生产高权限访问', description: '承担安全责任', answer: 'human', why: '高风险职责分离' },
      { id: 'expiry', label: '计算授权到期时间', description: '依据政策最大时长', answer: 'deterministic', why: '时间与策略约束' },
      { id: 'diagnostic-step', label: '选择 VPN 下一排查步骤', description: '结合用户环境和故障树', answer: 'hybrid', why: '模型理解上下文，代码限制合法步骤' },
      { id: 'ticket-summary', label: '生成支持工单摘要', description: '汇总证据与尝试步骤', answer: 'ai', why: '非结构化总结' },
      { id: 'state-transition', label: '把工单从 OPEN 改为 RESOLVED', description: '必须满足解决证据', answer: 'deterministic', why: '领域状态机' },
      { id: 'deploy-diagnosis', label: '综合日志与发布规范生成诊断', description: '多个证据源', answer: 'hybrid', why: '代码约束数据和工具，模型综合证据' },
      { id: 'rerun-approval', label: '批准重新触发生产部署', description: '真实外部副作用', answer: 'human', why: '需要责任主体确认' },
      { id: 'idempotency', label: '外部写操作去重', description: '网络超时后安全恢复', answer: 'deterministic', why: '业务幂等契约' },
    ],
  }});
}

export function mountEnterpriseDomainModel(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'enterprise-domain-lab',
    title: 'Enterprise Domain Model Workbench',
    subtitle: '聚合、命令、事件、状态与不变量',
    artifactName: 'enterpriseDomainModel',
    artifactNote: 'LangGraph 编排命令，领域聚合维护业务事实和不变量。',
    completeText: '核心聚合和状态协调规则已经形成。',
    scenarios: [
      {
        id: 'request-ticket',
        title: 'SupportRequest 与 Ticket 是否必须是同一个聚合？',
        detail: '请求可以在没有人工工单时完成；工单拥有独立 SLA 和分派生命周期。',
        answer: 'separate',
        options: [
          { value: 'same', label: '必须合并' },
          { value: 'separate', label: '独立聚合，通过 ID 和事件关联' },
          { value: 'none', label: '都放进 Graph State' },
        ],
      },
      {
        id: 'access-invariant',
        title: 'AccessRequest 进入 GRANTED 前必须满足什么？',
        detail: '生产环境、敏感资源和有限时长。',
        answer: 'invariant',
        options: [
          { value: 'invariant', label: '策略许可 + 必要审批 + 外部验证 + 到期时间' },
          { value: 'model', label: '模型置信度高' },
          { value: 'manager', label: '只有经理批准' },
        ],
      },
      {
        id: 'approval',
        title: '经理审批与安全审批应怎样建模？',
        detail: '审批顺序、超时、原因和职责分离都需要保留。',
        answer: 'case',
        options: [
          { value: 'boolean', label: '两个布尔字段' },
          { value: 'case', label: 'ApprovalCase 聚合及 ApprovalStep' },
          { value: 'prompt', label: '写进 Prompt 历史' },
        ],
      },
      {
        id: 'external',
        title: 'IAM 调用超时但可能已授权，事实放在哪里？',
        detail: '需要 idempotencyKey、外部引用和状态协调。',
        answer: 'execution',
        options: [
          { value: 'execution', label: 'IntegrationExecution 聚合' },
          { value: 'retry', label: '只记录重试次数' },
          { value: 'message', label: '聊天消息里' },
        ],
      },
      {
        id: 'knowledge',
        title: '文档更新和 ACL 变化后，旧 Chunk 如何处理？',
        detail: '知识版本和权限必须可追踪。',
        answer: 'asset',
        options: [
          { value: 'asset', label: 'KnowledgeAsset 版本 + 索引状态 + 删除/失效事件' },
          { value: 'overwrite', label: '直接覆盖向量，不留版本' },
          { value: 'model', label: '让模型忽略旧内容' },
        ],
      },
      {
        id: 'state',
        title: 'LangGraph Checkpoint 与业务数据库谁是最终事实？',
        detail: '工作流可以恢复，但业务状态必须可独立验证。',
        answer: 'database',
        options: [
          { value: 'checkpoint', label: 'Checkpoint 永远是最终事实' },
          { value: 'database', label: '业务数据库是系统事实，Checkpoint 保存执行状态' },
          { value: 'model', label: '模型上下文是最终事实' },
        ],
      },
    ],
  }});
}

export function mountArchitectureAdrWorkbench(args) {
  return mountClassificationLab({ ...args, definition: {
    className: 'enterprise-architecture-lab',
    title: 'Deployment Boundary & ADR Workbench',
    subtitle: '由事务、负载、安全、团队和发布边界决定拆分',
    artifactName: 'enterpriseArchitectureDecisionPack',
    artifactNote: '业务核心保持模块化单体，独立 Worker 和 MCP Gateway 只在真实边界出现时拆分。',
    completeText: 'NovaTech 第一版部署架构与 ADR 已完成。',
    categories: [
      { value: 'core', label: 'service-desk-api 模块化单体' },
      { value: 'worker', label: '独立异步 Worker' },
      { value: 'gateway', label: '独立 MCP / 安全集成服务' },
      { value: 'web', label: '独立 Web 交付' },
    ],
    items: [
      { id: 'requests', label: '请求、工单、审批与审计事务', description: '高事务耦合和一致性要求', answer: 'core', why: '共享领域和事务边界' },
      { id: 'policy', label: 'Policy Decision 模块', description: '在线请求内同步执行', answer: 'core', why: '业务命令的同步保护' },
      { id: 'web', label: '员工、支持和治理 UI', description: '独立静态交付和前端发布', answer: 'web', why: '独立构建与缓存边界' },
      { id: 'ingestion', label: '文档解析、Embedding 与索引', description: 'CPU 密集、长任务、失败可重试', answer: 'worker', why: '异步负载和故障隔离' },
      { id: 'agent', label: '长时间 LangGraph 工作流', description: '需要队列、Checkpoint 和恢复', answer: 'worker', why: '在线 API 不应承载长任务' },
      { id: 'evaluation', label: '离线实验和在线采样评估', description: '批处理、成本独立', answer: 'worker', why: '独立调度和资源预算' },
      { id: 'github', label: 'GitHub / CI / IAM 外部连接', description: '独立 OAuth、Secrets、Scope 和发布节奏', answer: 'gateway', why: '安全与集成边界' },
      { id: 'notifications', label: '通知与 Outbox 消费', description: '至少一次投递和幂等处理', answer: 'worker', why: '异步事件处理' },
    ],
  }});
}

export const enterpriseFoundationSimulators = {
  'enterprise-readiness-matrix': mountEnterpriseReadinessMatrix,
  'enterprise-product-charter': mountEnterpriseProductCharter,
  'ai-deterministic-boundary': mountAiDeterministicBoundary,
  'enterprise-domain-model': mountEnterpriseDomainModel,
  'architecture-adr-workbench': mountArchitectureAdrWorkbench,
};
