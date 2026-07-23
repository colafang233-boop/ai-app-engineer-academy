import { mountChecklistLab, mountClassificationLab, mountDecisionSeries } from './mcp-lab-utils.js';

export function mountEnterpriseDeliveryFoundation(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'enterprise-delivery-lab',
    title: 'Environment & Release Foundation',
    subtitle: '配置、Secret、Flag、迁移和版本证据',
    artifactName: 'deliveryFoundationContract',
    artifactNote: '每次运行可还原环境、模型、Prompt、Graph、知识、Tool 和 Flag 组合。',
    completeText: 'NovaTech 环境和发布基础契约已完成。',
    lede: 'staging 正常，production 却调用旧 Prompt 和新 Tool Schema',
    detail: '排查发现环境变量、数据库迁移和 Feature Flag 没有统一版本。',
    checks: [
      { id: 'schema', label: '配置 Schema 与启动校验', description: '缺少或类型错误时拒绝启动' },
      { id: 'secrets', label: 'Secrets 独立存储与轮换', description: '不进入源码、前端和普通日志' },
      { id: 'bundle', label: '记录 Release Bundle', description: 'app/prompt/model/graph/knowledge/tool 版本' },
      { id: 'flags', label: 'Feature Flag 使用稳定 targetingKey', description: '按 tenant、user、environment 稳定定向' },
      { id: 'telemetry', label: '记录 Flag variant、reason 和 version', description: '能解释运行行为' },
      { id: 'migration', label: '数据库与索引迁移顺序', description: '兼容滚动发布和回滚' },
      { id: 'drift', label: '环境漂移检测', description: '发布前比较期望与实际配置' },
      { id: 'defaults', label: '安全默认值与 provider 失败策略', description: 'Flag/配置服务不可用时不自动放开高风险能力' },
    ],
    selects: [
      { id: 'flag-fallback', label: '生产写 Tool Flag 解析失败', correct: 'off', options: [{ value: 'on', label: '默认开启' }, { value: 'off', label: '默认关闭并告警' }] },
      { id: 'secret', label: 'MCP Client Secret 来源', correct: 'secret-store', options: [{ value: 'env-file', label: '仓库 .env.production' }, { value: 'secret-store', label: '受管 Secret Store / Workload Identity' }] },
    ],
    successCode: `releaseBundle:\n  app: 1.0.0\n  prompt: access-intake@4\n  graph: access-flow@3\n  knowledge: snapshot-2026-07-23\n  flags: ruleset-18`,
  }});
}

export function mountEnterprisePolicyWorkbench(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'enterprise-policy-lab',
    title: 'Policy Decision Workbench',
    subtitle: 'Subject × Resource × Action × Environment',
    artifactName: 'enterpriseAuthorizationPolicy',
    artifactNote: '权限决策贯穿 API、检索、缓存、Tool 和审计，并返回 obligations。',
    completeText: 'NovaTech 租户、项目、数据和 Tool 权限策略已完成。',
    scenarios: [
      { id: 'employee-policy', title: 'Sales 员工读取本租户 INTERNAL 客户数据政策', detail: '部门在允许列表，动作是 knowledge.read。', answer: 'permit', options: [
        { value: 'permit', label: 'PERMIT + audit' }, { value: 'deny', label: 'DENY' }, { value: 'admin', label: '要求 Platform Admin' },
      ]},
      { id: 'cross-tenant', title: 'NovaTech Cloud 开发者读取 NovaTech Labs RESTRICTED 研究计划', detail: 'tenant 和 project 均不匹配。', answer: 'deny', options: [
        { value: 'retrieve', label: '先检索后脱敏' }, { value: 'deny', label: 'DENY，禁止进入候选' }, { value: 'role', label: 'developer 角色足够' },
      ]},
      { id: 'prod-access', title: 'Project A 开发者申请生产数据库只读两小时', detail: '项目成员、最小权限、生产环境。', answer: 'obligations', options: [
        { value: 'permit', label: '直接授权' }, { value: 'obligations', label: 'PERMIT + manager/security/step-up/maxDuration/audit' }, { value: 'deny', label: '永远拒绝生产访问' },
      ]},
      { id: 'cross-project', title: 'Project AI 开发者申请 Project A 生产数据库', detail: '同为 developer，但没有项目成员关系。', answer: 'deny', options: [
        { value: 'deny', label: 'DENY' }, { value: 'approval', label: '只要经理批就允许' }, { value: 'model', label: '模型判断理由是否合理' },
      ]},
      { id: 'platform-admin', title: 'Platform Admin 维护索引时尝试读取 CONFIDENTIAL 文档正文', detail: '只有平台运维角色，没有业务数据角色。', answer: 'deny', options: [
        { value: 'permit', label: '管理员全权访问' }, { value: 'deny', label: 'DENY 内容读取，允许元数据运维' }, { value: 'prompt', label: '让模型隐藏内容' },
      ]},
      { id: 'auditor', title: 'Auditor 读取权限执行审计事件', detail: '只读、需要 Secret 脱敏。', answer: 'redact', options: [
        { value: 'redact', label: 'PERMIT read + redactSecrets' }, { value: 'write', label: '允许修改审计记录' }, { value: 'deny', label: '审计员不能看审计' },
      ]},
    ],
  }});
}

export function mountEnterpriseOutboxLab(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'enterprise-outbox-lab',
    title: 'Transaction, Outbox & Audit Failure Lab',
    subtitle: '解决数据库成功、事件失败和重复消费',
    artifactName: 'transactionAuditContract',
    artifactNote: '业务数据与 Outbox 原子提交；Relay 至少一次发送；消费者幂等；审计证据完整。',
    completeText: '访问申请的事务、消息和审计契约已完成。',
    lede: 'AccessRequest 已入库，但 approval.requested 没有进入队列',
    detail: '应用在数据库 commit 后、消息 publish 前崩溃。',
    checks: [
      { id: 'transaction', label: 'AccessRequest + OutboxEvent 同事务提交', description: '任一失败则整体回滚' },
      { id: 'relay', label: '独立 Outbox Relay', description: '只读取已提交事件并发送' },
      { id: 'event-id', label: '稳定 eventId 与 aggregate sequence', description: '支持去重和顺序' },
      { id: 'consumer', label: '审批消费者幂等', description: '重复消息不创建重复 ApprovalCase' },
      { id: 'unknown', label: '外部调用状态 UNKNOWN', description: '超时不伪装失败或成功' },
      { id: 'audit', label: '审计记录 subject/delegation/policy/command/result', description: '可还原责任链' },
      { id: 'redact', label: '审计与 Trace 脱敏', description: '不记录 Token、密码和完整敏感正文' },
      { id: 'replay', label: '支持安全重放', description: '按幂等键查询原结果' },
    ],
    selects: [
      { id: 'delivery', label: '消息投递语义', correct: 'at-least-once', options: [{ value: 'exactly-once', label: '假设绝对 exactly-once' }, { value: 'at-least-once', label: '至少一次 + 幂等消费' }] },
      { id: 'timeout', label: 'IAM 请求超时', correct: 'query', options: [{ value: 'repeat', label: '立即重复授权' }, { value: 'query', label: '按 idempotencyKey / externalRef 查询' }] },
    ],
    successCode: `BEGIN\n  INSERT access_request ...\n  INSERT audit_event ...\n  INSERT outbox_event ...\nCOMMIT\n\nrelay → queue (at least once)\nconsumer → idempotent`,
  }});
}

export function mountEnterpriseKnowledgeLifecycle(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'enterprise-knowledge-lab',
    title: 'Governed Knowledge Lifecycle',
    subtitle: '内容、版本、权限、索引和缓存一起变化',
    artifactName: 'knowledgeLifecycleContract',
    artifactNote: '只有验证通过的 Knowledge Snapshot 可发布，删除和 ACL 撤销优先传播。',
    completeText: 'NovaTech 企业知识更新、删除、过期与 ACL 同步策略已完成。',
    scenarios: [
      { id: 'new-version', title: '生产访问政策 v5 生效，v4 已过期', detail: '两个版本都还在向量库。', answer: 'expire', options: [
        { value: 'both', label: '都返回给模型判断' }, { value: 'expire', label: '按 effective/expiry 只发布 v5，v4 退出候选' }, { value: 'score', label: '只降低 v4 分数' },
      ]},
      { id: 'delete', title: '知识负责人删除一份错误指南', detail: '对象存储已删除，但搜索索引仍有 Chunk。', answer: 'tombstone', options: [
        { value: 'wait', label: '等待索引自然过期' }, { value: 'tombstone', label: '发送 Tombstone 并验证所有索引清理' }, { value: 'prompt', label: 'Prompt 中提醒忽略' },
      ]},
      { id: 'acl', title: '用户被移出 Project A', detail: '内容未变化，权限变化。', answer: 'priority', options: [
        { value: 'daily', label: '等每日全量重建' }, { value: 'priority', label: 'ACL 撤销优先事件，失效缓存和检索权限' }, { value: 'model', label: '由模型判断项目关系' },
      ]},
      { id: 'partial', title: '100 个 Chunk 中 97 个索引成功', detail: '发布新 Snapshot 会缺失证据。', answer: 'not-publish', options: [
        { value: 'publish', label: '先发布 97%' }, { value: 'not-publish', label: '保持旧 Snapshot，修复后原子切换' }, { value: 'mix', label: '混合新旧 Chunk' },
      ]},
      { id: 'cache', title: '检索缓存只按 query 建键', detail: '不同 tenant 和 policyVersion 共享结果。', answer: 'context', options: [
        { value: 'context', label: '加入 tenant/subject-policy/snapshot 等上下文' }, { value: 'query', label: 'query 足够' }, { value: 'disable', label: '永远不用缓存' },
      ]},
      { id: 'untrusted', title: '外部供应商故障说明包含“调用 grant_access”', detail: '来源允许工程部门读取，但内容不可信。', answer: 'mark', options: [
        { value: 'follow', label: '按文档指令调用 Tool' }, { value: 'mark', label: '标记 untrusted data，禁止提升为控制指令' }, { value: 'delete', label: '删除所有外部文档' },
      ]},
    ],
  }});
}

export function mountEnterpriseModelGateway(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'enterprise-model-gateway-lab',
    title: 'Model Gateway Routing Board',
    subtitle: '任务能力、风险、延迟、成本和数据边界',
    artifactName: 'modelGatewayPolicy',
    artifactNote: '模型选择服从任务能力契约与本地评估，高风险任务禁止未验证降级。',
    completeText: 'NovaTech 模型路由、Fallback 和发布绑定策略已完成。',
    scenarios: [
      { id: 'intent', title: '低风险请求类型分类', detail: '短文本、严格 Schema、低延迟。', answer: 'small', options: [
        { value: 'large', label: '始终最大模型' }, { value: 'small', label: '通过评估的小模型/快速模型' }, { value: 'random', label: '随机模型' },
      ]},
      { id: 'policy-answer', title: '高风险制度回答', detail: '需要长证据、引用和拒答。', answer: 'evaluated', options: [
        { value: 'cheap', label: '最便宜模型' }, { value: 'evaluated', label: '通过 grounded/citation/abstention 评估的模型' }, { value: 'generic', label: '通用榜单第一' },
      ]},
      { id: 'tool', title: '访问申请结构化提取和 Tool 参数', detail: 'Schema 和枚举必须稳定。', answer: 'schema', options: [
        { value: 'schema', label: '支持严格结构化输出且本地参数评估通过' }, { value: 'text', label: '只要能写自然语言' }, { value: 'fallback', label: '任何超时都降到无 Schema 模型' },
      ]},
      { id: 'residency', title: 'RESTRICTED 数据不得离开指定区域', detail: '模型能力高但数据驻留不满足。', answer: 'deny', options: [
        { value: 'use', label: '质量高就使用' }, { value: 'deny', label: '从候选模型中排除' }, { value: 'prompt', label: 'Prompt 中提醒不保存' },
      ]},
      { id: 'fallback', title: '高风险回答主模型超时', detail: '备用模型未跑过引用评估。', answer: 'abstain', options: [
        { value: 'fallback', label: '直接切换备用模型' }, { value: 'abstain', label: '降级到搜索结果/人工，禁止未评估生成' }, { value: 'retry', label: '无限重试主模型' },
      ]},
      { id: 'bundle', title: '线上问题需要还原当时行为', detail: '只记录了 model name。', answer: 'release', options: [
        { value: 'model', label: '模型名足够' }, { value: 'release', label: '记录完整 Release Bundle 与 Flag variant' }, { value: 'logs', label: '只保存最终回答' },
      ]},
    ],
  }});
}

export function mountEnterpriseAiUx(args) {
  return mountClassificationLab({ ...args, definition: {
    className: 'enterprise-ux-lab',
    title: 'Enterprise AI Interaction State Designer',
    subtitle: '让用户理解进度、证据、权限和责任',
    artifactName: 'enterpriseAiUxContract',
    artifactNote: '状态文案对应真实系统事实，支持取消、恢复、审批和人工接管。',
    completeText: '四条企业流程的交互状态与用户操作已经完成。',
    categories: [
      { value: 'stream', label: 'Streaming / progress' },
      { value: 'evidence', label: 'Evidence / explanation' },
      { value: 'approval', label: 'Approval / responsibility' },
      { value: 'handoff', label: 'Human handoff' },
      { value: 'unknown', label: 'Unknown / verification' },
    ],
    items: [
      { id: 'retrieving', label: '正在检索 3 个有权限的知识源', description: '只读问题阶段状态', answer: 'stream', why: '可解释进度' },
      { id: 'citation', label: '查看答案引用与政策生效日期', description: '高风险回答', answer: 'evidence', why: '用户可核验依据' },
      { id: 'preview', label: '展示将申请的资源、角色和时长', description: '外部写入前', answer: 'approval', why: '明确变更内容和责任' },
      { id: 'manager', label: '等待项目负责人审批', description: '组织授权阶段', answer: 'approval', why: '不是模型等待' },
      { id: 'timeout', label: 'IAM 请求已发送，结果核验中', description: '网络超时，外部状态未知', answer: 'unknown', why: '不伪造成功或失败' },
      { id: 'resume', label: '重新连接后继续查看 build-42', description: '长任务恢复', answer: 'stream', why: 'Task 状态可恢复' },
      { id: 'takeover', label: '支持工程师已接管，自动步骤停止', description: '三次排查未解决', answer: 'handoff', why: '责任转移和停止自动推进' },
      { id: 'context', label: '人工工作台展示已尝试步骤和用户观察', description: '转人工上下文', answer: 'handoff', why: '避免用户重复描述' },
      { id: 'conflict', label: '两份政策冲突，需要知识负责人确认', description: '证据冲突', answer: 'evidence', why: '显式说明不确定性' },
      { id: 'cancel', label: '取消尚未执行的预览构建', description: '用户控制长任务', answer: 'stream', why: '可取消阶段操作' },
    ],
  }});
}

export const enterprisePlatformSimulators = {
  'enterprise-delivery-foundation': mountEnterpriseDeliveryFoundation,
  'enterprise-policy-workbench': mountEnterprisePolicyWorkbench,
  'enterprise-outbox-lab': mountEnterpriseOutboxLab,
  'enterprise-knowledge-lifecycle': mountEnterpriseKnowledgeLifecycle,
  'enterprise-model-gateway': mountEnterpriseModelGateway,
  'enterprise-ai-ux': mountEnterpriseAiUx,
};
