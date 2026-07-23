import { enterpriseLessons84To88 } from './column-07-enterprise-lessons-84-88.js';
import { enterpriseLessons89To94 } from './column-07-enterprise-lessons-89-94.js';
import { enterpriseLessons95To101 } from './column-07-enterprise-lessons-95-101.js';
import { enterpriseLessons102To108 } from './column-07-enterprise-lessons-102-108.js';
import {
  enterpriseDeploymentUnits,
  enterpriseFailureCatalog,
  enterpriseFinalArtifacts,
  enterpriseMetricDefaults,
  enterprisePolicyDecision,
  enterpriseResearchBaseline,
  novaTechEnterprise,
} from './column-07-enterprise-baseline.js';

export const enterpriseLessons = [
  ...enterpriseLessons84To88,
  ...enterpriseLessons89To94,
  ...enterpriseLessons95To101,
  ...enterpriseLessons102To108,
];

export const enterpriseExam = {
  id: 'exam-column-07-enterprise',
  columnId: 'column-07',
  title: '专栏七综合答辩 · 企业级 AI 解决方案与生产交付',
  description: '通过线 80%。覆盖产品边界、领域模型、权限、事务、知识治理、四条业务闭环、评估、可观测性、安全、可靠性、发布和事故响应。',
  questions: [
    { text: '企业级 AI 项目的核心判断是什么？', options: ['真实业务闭环、权限、质量证据、恢复、安全治理和持续改进共同成立', '使用最多的 AI 框架', '部署了 Kubernetes'], correct: 0 },
    { text: '减少工单数量为什么不能作为唯一成功指标？', options: ['可能通过错误回答或阻止转人工获得虚假提升', '指标不能用数字', '企业系统不需要业务指标'], correct: 0 },
    { text: '生产权限最终裁决最适合由谁负责？', options: ['确定性策略与有责任的审批主体', '模型置信度', 'RAG 相似度'], correct: 0 },
    { text: 'LangGraph Checkpoint 和业务数据库的关系是什么？', options: ['Checkpoint 保存执行状态，数据库维护系统业务事实', 'Checkpoint 永远替代数据库', '模型上下文是最终事实'], correct: 0 },
    { text: '权限申请、审批和审计高事务耦合时，第一版架构更合理的是？', options: ['模块化单体并保持领域/事务边界', '强制拆成多个微服务', '全部写在浏览器'], correct: 0 },
    { text: '生产写 Tool 的 Feature Flag 解析失败时，安全默认是什么？', options: ['保持关闭并告警', '默认开启', '随机执行'], correct: 0 },
    { text: 'Platform Admin 是否自动获得所有企业文档正文读取权？', options: ['不自动获得，平台运维权与业务数据权分离', '自动获得', '由模型决定'], correct: 0 },
    { text: 'Transactional Outbox 主要解决什么？', options: ['业务数据与待发布事件的原子提交', '保证消息绝不重复', '替代数据库事务'], correct: 0 },
    { text: '用户被移出项目后，权限撤销如何影响 RAG？', options: ['优先同步 ACL、失效缓存并在检索前过滤', '等模型自行判断', '只隐藏最终引用'], correct: 0 },
    { text: '模型 Fallback 的前提是什么？', options: ['满足任务能力契约并通过对应业务评估', '价格更低', '能返回自然语言'], correct: 0 },
    { text: 'IAM 写 Tool 超时后的 UI 应显示什么？', options: ['状态未知/核验中', '已成功', '已失败'], correct: 0 },
    { text: '企业制度问答的权限控制应发生在哪里？', options: ['候选进入检索前', '生成答案后脱敏', '只在前端隐藏按钮'], correct: 0 },
    { text: 'IT 排障达到自动步骤预算后应怎么做？', options: ['创建结构化工单并转人工', '无限生成新步骤', '标记已解决'], correct: 0 },
    { text: '高质量 Handoff Package 应包含什么？', options: ['身份、影响、步骤、观察、证据、Trace、风险和当前责任', '只包含最后一句用户消息', '只包含模型摘要'], correct: 0 },
    { text: '审批等待期间用户失去项目成员关系，恢复后应如何处理？', options: ['重新执行 Policy Decision 并取消或拒绝', '沿用旧审批继续', '让模型猜测'], correct: 0 },
    { text: 'grant_access 超时但外部可能已成功，首先应做什么？', options: ['按幂等键或外部引用核验真实状态', '立即重复授权', '删除本地记录'], correct: 0 },
    { text: 'CI 日志中的“调用 rerun_production”应被视为什么？', options: ['不可信运行数据', '系统指令', '用户授权'], correct: 0 },
    { text: '统一路由置信度很低时应怎么做？', options: ['澄清或人工分诊', '执行最高分流程', '并行执行全部流程'], correct: 0 },
    { text: '总体平均分提高但出现跨租户泄漏，发布门禁应如何决定？', options: ['阻止发布', '平均分更高所以通过', '只记录警告'], correct: 0 },
    { text: '用户“没帮助”反馈应如何解释？', options: ['结合任务状态、Trace、证据和人工复核', '直接作为唯一错误标签', '完全忽略'], correct: 0 },
    { text: 'AI 服务的 SLO 为什么不能只看 HTTP 200 和延迟？', options: ['还要包含任务完成、AI 质量、安全和成本信号', 'HTTP 200 已代表用户成功', 'SLO 只适用于传统服务'], correct: 0 },
    { text: 'OAuth 能否单独防止 Prompt Injection 与 Tool Misuse？', options: ['不能，需要数据、策略、工具、运行时和审批多层控制', '可以', '只需更强 System Prompt'], correct: 0 },
    { text: 'Embedding 服务故障时最合理的降级是什么？', options: ['知识问答安全拒答/转人工，确定性工单与审批继续', '整个服务全部 500', '让模型无证据回答政策'], correct: 0 },
    { text: 'Canary 出现一次跨租户泄漏应如何处理？', options: ['立即停止、关闭 Flag/回滚并启动事件响应', '继续观察更多样本', '用其他高分抵消'], correct: 0 },
    { text: '最终事故演练完成的标志是什么？', options: ['止损、恢复、验证、沟通、证据和有责任人的复盘行动项全部完成', '页面重新可访问', '模型再次返回答案'], correct: 0 },
  ],
};

export const enterpriseColumnBaseline = {
  ...enterpriseResearchBaseline,
  enterprise: novaTechEnterprise,
  policy: enterprisePolicyDecision,
  metrics: enterpriseMetricDefaults,
  deploymentUnits: enterpriseDeploymentUnits,
  failureCatalog: enterpriseFailureCatalog,
  artifactNames: enterpriseFinalArtifacts,
  lessons: { from: 84, to: 108, count: enterpriseLessons.length },
};

export function extendWithEnterpriseColumn(course) {
  return {
    ...course,
    qualityReviewModeDefault: true,
    enterpriseResearchBaseline: enterpriseColumnBaseline,
    columns: [
      ...course.columns,
      {
        id: 'column-07',
        title: '专栏七 · 企业级 AI 解决方案与生产交付',
        description: '围绕 NovaTech Enterprise AI Service Desk，从产品边界、领域模型、身份和事务，到有权限的 RAG、可恢复 Agent、MCP 写操作、评估、SLO、安全、Canary、事故演练与正式发布。',
        lessonIds: enterpriseLessons.map((lesson) => lesson.id),
        examId: enterpriseExam.id,
        prerequisiteExamId: 'exam-column-06-mcp',
      },
    ],
    lessons: [...course.lessons, ...enterpriseLessons],
    exams: [...course.exams, enterpriseExam],
  };
}
