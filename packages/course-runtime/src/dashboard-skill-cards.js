const compactColumnSkills = {
  'column-01': ['判断 AI 场景', '完成模型调用', '处理异常结果'],
  'column-02': ['拆清业务需求', '约束输出格式', '评测 Prompt 效果'],
  'column-03': ['搭建 AI 助手', '接入工具调用', '实现记忆与兜底'],
  'column-04': ['搭建企业知识库', '回答附带来源', '拒答与知识更新'],
  'column-05': ['编排复杂任务', '支持中断恢复', '实现多 AI 协作'],
  'column-06': ['连接内部系统', '安全执行工具', '接入权限与审批'],
  'column-07': ['完成企业级交付', '建立质量门禁', '支持降级与回滚'],
};

const columnSkills = {
  'column-01': [
    '判断一个业务需求是否真的适合使用 AI',
    '独立完成可运行的模型调用功能',
    '处理超时、异常和不稳定结果',
  ],
  'column-02': [
    '把模糊业务需求拆成模型能执行的指令',
    '让模型稳定返回系统可以直接使用的数据',
    '用固定测试集持续验证 Prompt 效果',
  ],
  'column-03': [
    '快速搭建一个能调用工具的 AI 助手',
    '让多轮对话记住必要的上下文',
    '为助手增加兜底、安全控制和运行追踪',
  ],
  'column-04': [
    '让 AI 检索公司的文档、制度和知识库',
    '让回答附带来源，证据不足时主动拒答',
    '让知识更新、权限变化和删除及时生效',
  ],
  'column-05': [
    '把复杂任务拆成可执行、可检查的步骤',
    '让流程中断后继续，关键操作先由人确认',
    '让多个 AI 角色按任务自动分工协作',
  ],
  'column-06': [
    '把代码库、数据库、工单和内部系统接给 AI',
    '让 AI 在安全边界内查询资料和执行操作',
    '为高风险操作接入权限校验和人工审批',
  ],
  'column-07': [
    '把 AI 助手做成可以正式上线的企业产品',
    '建立权限、成本、质量和安全发布门禁',
    '在故障发生时完成降级、回滚和恢复',
  ],
};

function skillMarkup(skills) {
  return `<span class="column-skill-label">技能 GET <b>✓</b></span><span class="column-skill-list">${skills.map((skill) => `<span class="column-skill-item"><i>✓</i><span>${skill}</span></span>`).join('')}</span>`;
}

function applySkills(root) {
  root.querySelectorAll('[data-column-select]').forEach((card) => {
    const skills = compactColumnSkills[card.dataset.columnSelect];
    const outcome = card.querySelector('.formal-column-outcome');
    if (!skills || !outcome) return;
    outcome.className = 'formal-column-outcome column-skill-block compact';
    outcome.innerHTML = skillMarkup(skills);
  });

  const panel = root.querySelector('[data-selected-column]');
  if (!panel) return;
  const skills = columnSkills[panel.dataset.selectedColumn];
  const outcome = panel.querySelector('.selected-column-intro > p');
  if (!skills || !outcome) return;
  outcome.className = 'column-skill-block expanded';
  outcome.innerHTML = skillMarkup(skills);
}

export function installDashboardSkillCards(app) {
  const baseRenderDashboard = app.renderDashboard.bind(app);
  app.renderDashboard = function renderDashboardWithSkillCards() {
    baseRenderDashboard();
    applySkills(this.content);
  };
}

export { columnSkills, compactColumnSkills };
