const columnSkills = {
  'column-01': [
    '判断需求是否真的适合用 AI',
    '写出可运行的模型调用功能',
    '接住异常和不稳定结果',
  ],
  'column-02': [
    '把模糊需求变成清晰指令',
    '让模型稳定返回结构化结果',
    '用测试集验证 Prompt 效果',
  ],
  'column-03': [
    '快速搭出会调用工具的 AI 助手',
    '让多轮对话记住上下文',
    '给助手加兜底、安全和追踪',
  ],
  'column-04': [
    '让 AI 读懂公司的文档和制度',
    '回答带来源，找不到时不瞎编',
    '知识更新后能及时生效',
  ],
  'column-05': [
    '把复杂任务拆成可执行步骤',
    '中断后继续，关键操作先确认',
    '让多个 AI 分工协作',
  ],
  'column-06': [
    '把代码库、数据库和工单接给 AI',
    '让 AI 安全查资料、办事情',
    '接入审批、权限和企业系统',
  ],
  'column-07': [
    '把 AI 助手做成可上线产品',
    '管住权限、成本和回答质量',
    '出故障时能降级、回滚和恢复',
  ],
};

function skillMarkup(skills) {
  return `<span class="column-skill-label">技能 GET <b>✓</b></span><span class="column-skill-list">${skills.map((skill) => `<span class="column-skill-item"><i>✓</i><span>${skill}</span></span>`).join('')}</span>`;
}

function applySkills(root) {
  root.querySelectorAll('[data-column-select]').forEach((card) => {
    const skills = columnSkills[card.dataset.columnSelect];
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

export { columnSkills };
