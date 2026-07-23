import { mountChecklistLab, mountDecisionSeries, once, setResult, teachingNotice } from './mcp-lab-utils.js';

export function mountEnterpriseOfflineEvaluation(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'enterprise-eval-lab',
    title: 'Offline Evaluation Release Gate',
    subtitle: '组件指标、端到端结果和零容忍不变量',
    artifactName: 'offlineEvaluationReleaseGate',
    artifactNote: 'Golden Set 同时覆盖正常、边界、生产失败和对抗样例，并绑定 Release Bundle。',
    completeText: 'NovaTech 离线评估与回归发布门禁已完成。',
    lede: '比较 Release Bundle 1.9 与 2.0',
    detail: '2.0 的回答风格更好，但 Tool 选择和租户隔离必须分别验证。',
    checks: [
      { id: 'versioned', label: '数据集、Evaluator 和基线都版本化', description: '可重复比较历史发布' },
      { id: 'normal', label: '覆盖四类正常业务请求', description: '政策、IT、权限和发布诊断' },
      { id: 'boundary', label: '覆盖边界与信息不足', description: '冲突证据、低置信度、超时和取消' },
      { id: 'security', label: '覆盖租户泄漏、注入和过权 Tool', description: '安全不变量单独计分' },
      { id: 'components', label: '组件级 Evaluators', description: '路由、检索、ACL、政策、Tool 参数和引用' },
      { id: 'trajectory', label: 'Agent 轨迹与停止条件', description: '检查无效循环、错误子流程和预算' },
      { id: 'business', label: '端到端任务完成指标', description: '不是只评最终文案' },
      { id: 'performance', label: '延迟、可靠性和成本门禁', description: '按流程和风险分层' },
      { id: 'zero', label: '零容忍不变量独立阻断', description: '不参与平均分抵消' },
      { id: 'evidence', label: '保存失败样例和 Release 对比证据', description: '支持复现与审查' },
    ],
    selects: [
      { id: 'leak', label: '出现 1 个跨租户泄漏', correct: 'block', options: [{ value: 'average', label: '看总体平均分' }, { value: 'block', label: '立即阻止发布' }] },
      { id: 'tool', label: 'Tool 选择从 98% 降至 91%', correct: 'investigate', options: [{ value: 'ship', label: '语言质量更好，继续发布' }, { value: 'investigate', label: '阻止高风险流程发布并分析失败分布' }] },
    ],
    successCode: `releaseGate:\n  security_invariants: PASS\n  policy_accuracy: 99%\n  tool_selection: 98%\n  grounded_citation: 96%\n  trajectory_success: 94%\n  p95_and_cost: PASS`,
  }});
}

export function mountEnterpriseContinuousEvaluation(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'enterprise-online-eval-lab',
    title: 'Production Failure Data Flywheel',
    subtitle: '线上发现 → 确认失败 → 回归案例 → 修复发布',
    artifactName: 'continuousEvaluationLoop',
    artifactNote: '生产弱信号需要组合确认，脱敏后进入版本化回归集。',
    completeText: '线上评估、人工复核和失败数据回流闭环已完成。',
    scenarios: [
      { id: 'guardrail', title: '生产权限写 Tool 的确定性护栏', detail: '安全关键且可规则验证。', answer: 'all', options: [
        { value: 'all', label: '100% 实时验证' }, { value: 'sample', label: '只抽样 1%' }, { value: 'none', label: '只依赖离线测试' },
      ]},
      { id: 'quality', title: '普通制度回答的语义质量评估', detail: '成本较高且没有即时参考答案。', answer: 'risk-sample', options: [
        { value: 'all', label: '每条都运行全部 LLM Judge' }, { value: 'risk-sample', label: '按风险、异常和稳定随机样本分层抽样' }, { value: 'none', label: '完全不评估' },
      ]},
      { id: 'feedback', title: '用户点击“没帮助”', detail: '可能是回答错，也可能是业务没有解决。', answer: 'combine', options: [
        { value: 'failure', label: '直接认定模型答案错误' }, { value: 'combine', label: '结合任务状态、Trace、证据和人工复核' }, { value: 'ignore', label: '忽略主观反馈' },
      ]},
      { id: 'handoff', title: '同类请求频繁转人工', detail: '没有明确错误标签，但业务闭环失败。', answer: 'cluster', options: [
        { value: 'cluster', label: '聚类请求并进入人工分析/知识缺口队列' }, { value: 'success', label: '转人工说明系统成功' }, { value: 'model', label: '只升级模型' },
      ]},
      { id: 'confirm', title: '人工确认新型 Prompt Injection', detail: '含敏感工单文本和用户信息。', answer: 'sanitize', options: [
        { value: 'raw', label: '完整复制到公开数据集' }, { value: 'sanitize', label: '脱敏、最小化、保留攻击结构和来源元数据' }, { value: 'delete', label: '不保留任何案例' },
      ]},
      { id: 'regression', title: '安全修复完成', detail: '需要防止未来 Prompt/模型升级复发。', answer: 'gate', options: [
        { value: 'gate', label: '加入安全回归集并绑定发布门禁' }, { value: 'note', label: '写进聊天记录' }, { value: 'trust', label: '相信修复永久有效' },
      ]},
    ],
  }});
}

export function mountEnterpriseObservabilityControlRoom({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const spans = [
    { id: 'http', name: 'HTTP /support/requests', duration: 6240, status: 'ok', cost: 0 },
    { id: 'identity', name: 'identity.resolve', duration: 42, status: 'ok', cost: 0 },
    { id: 'policy', name: 'policy.evaluate', duration: 61, status: 'ok', cost: 0 },
    { id: 'retrieval', name: 'rag.retrieve', duration: 880, status: 'ok', cost: 0.002 },
    { id: 'rerank', name: 'rag.rerank', duration: 730, status: 'ok', cost: 0.008 },
    { id: 'model', name: 'model.generate', duration: 3210, status: 'ok', cost: 0.048 },
    { id: 'graph', name: 'langgraph.evidence_gate', duration: 183, status: 'ok', cost: 0 },
    { id: 'mcp', name: 'mcp.ci.get_failed_jobs', duration: 1120, status: 'degraded', cost: 0.001 },
  ];
  const selected = new Set();
  root.innerHTML = `
    <div class="enterprise-control-room">
      <div class="enterprise-control-head"><div><span>ENTERPRISE CONTROL ROOM</span><h3>Trace · SLO · Cost · Release Bundle</h3></div><button type="button" data-save>保存观测契约</button></div>
      <div class="enterprise-control-grid">
        <section>
          <div class="enterprise-context-strip">
            <span>tenant: novatech-cloud</span><span>request: req-deploy-1</span><span>release: 2.0-canary</span><span>flag: model-v2/B</span>
          </div>
          <div class="enterprise-trace-list">${spans.map((span) => `<button type="button" data-span="${span.id}" class="${span.status}"><b>${span.name}</b><i style="width:${Math.max(8, span.duration / 65)}%"></i><small>${span.duration} ms · $${span.cost.toFixed(3)}</small></button>`).join('')}</div>
        </section>
        <aside>
          <div class="enterprise-metric-grid"><article><span>P95 latency</span><b>6.8s</b><small>target ≤ 8s</small></article><article><span>Task success</span><b>91%</b><small>target ≥ 94%</small></article><article><span>Cost/request</span><b>$0.059</b><small>+34% vs control</small></article><article><span>Error budget</span><b>42%</b><small>window remaining</small></article></div>
          <div class="enterprise-insight" data-insight>选择至少四个关键 Span，并判断当前版本为什么不应仅凭延迟发布。</div>
          <label><input type="checkbox" data-check="quality"> 任务完成率进入 SLO/发布判断</label>
          <label><input type="checkbox" data-check="cost"> 成本按 tenant/request/release 归因</label>
          <label><input type="checkbox" data-check="redact"> Prompt、Token、Secret 和敏感证据默认脱敏</label>
          <div class="mcp-result" data-result>还原一次请求的真实执行路径。</div>${teachingNotice()}
        </aside>
      </div>
    </div>`;
  const result = root.querySelector('[data-result]');
  root.querySelectorAll('[data-span]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.span;
    selected.has(id) ? selected.delete(id) : selected.add(id);
    button.classList.toggle('selected', selected.has(id));
    const chosen = spans.filter((span) => selected.has(span.id));
    root.querySelector('[data-insight]').textContent = chosen.length
      ? `已选择 ${chosen.length} 个阶段；模型与 MCP 占主要延迟，但任务成功率和成本已经偏离发布目标。`
      : '选择至少四个关键 Span，并判断当前版本为什么不应仅凭延迟发布。';
  }));
  root.querySelector('[data-save]').addEventListener('click', () => {
    const checks = ['quality', 'cost', 'redact'].every((id) => root.querySelector(`[data-check="${id}"]`).checked);
    if (selected.size < 4 || !checks) {
      setResult(result, 'warn', '至少选择四个关键 Span，并启用质量、成本和隐私观测。');
      return;
    }
    const artifact = { traceSpans: [...selected], slis: ['latency', 'task_success', 'cost', 'availability'], releaseBundle: true, sensitiveContentDefault: 'redacted' };
    artifacts.set('observabilitySloContract', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ 端到端 Trace、业务 SLI、成本归因和隐私边界已完成。');
    complete(artifact);
  });
}

export function mountEnterpriseSecurityRedTeam(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'enterprise-security-lab',
    title: 'Enterprise Agentic Red Team',
    subtitle: '目标、身份、数据、Memory、Tools 与级联影响',
    artifactName: 'enterpriseAiThreatModel',
    artifactNote: '攻击链跨越用户输入、持久数据、检索、Memory、Tool、身份和外部系统。',
    completeText: 'NovaTech Agentic 威胁模型和安全发布门禁已完成。',
    scenarios: [
      { id: 'tenant', title: '跨租户检索泄漏', detail: 'Cloud 用户查询 Labs 研究计划。', answer: 'pre-filter', options: [
        { value: 'post-mask', label: '生成后脱敏' }, { value: 'pre-filter', label: '检索前 tenant/ACL 策略过滤' }, { value: 'prompt', label: 'Prompt 提醒模型' },
      ]},
      { id: 'document', title: '恶意知识文档要求调用 grant_access', detail: '内容进入 RAG。', answer: 'untrusted', options: [
        { value: 'follow', label: '文档属于知识库，遵从' }, { value: 'untrusted', label: '数据与指令分离，禁止改变 Tool 授权' }, { value: 'delete-all', label: '关闭全部 RAG' },
      ]},
      { id: 'memory', title: '工单中的恶意内容准备写入长期 Memory', detail: '未来请求可能继续受到影响。', answer: 'validate', options: [
        { value: 'write', label: '所有历史自动记忆' }, { value: 'validate', label: '来源、类型、租户和用途验证后最小写入' }, { value: 'shared', label: '写入全局 Memory' },
      ]},
      { id: 'tool', title: '只读问答 Agent 看见 production.deploy', detail: '当前用户没有发布目标。', answer: 'filter', options: [
        { value: 'describe', label: '描述中写“不要用”' }, { value: 'filter', label: 'Host/Server 双层 Tool Filter' }, { value: 'approve-after', label: '执行后再审批' },
      ]},
      { id: 'identity', title: 'Agent 代表用户调用 IAM', detail: 'MCP Gateway 同时拥有机器权限。', answer: 'delegation', options: [
        { value: 'machine', label: '只记录机器身份' }, { value: 'delegation', label: '记录用户 subject、delegation、机器身份、Scope 和 policy' }, { value: 'passthrough', label: '用户 Token 原样传给 IAM' },
      ]},
      { id: 'ssrf', title: 'Tool 参数包含云元数据地址', detail: 'Agent 被诱导访问私网。', answer: 'network', options: [
        { value: 'fetch', label: '先请求再看结果' }, { value: 'network', label: 'URL allowlist、解析后 IP 校验和网络隔离' }, { value: 'model', label: '让模型判断 URL 是否安全' },
      ]},
      { id: 'cascade', title: '一个子 Agent 持续失败并创建大量重试任务', detail: '队列和模型成本快速放大。', answer: 'contain', options: [
        { value: 'retry', label: '保持自主重试' }, { value: 'contain', label: '预算、熔断、隔离和人工升级' }, { value: 'scale', label: '无限扩容队列' },
      ]},
      { id: 'audit', title: 'Trace 中记录完整 OAuth Token 和受限政策正文', detail: '遥测成为新的泄漏面。', answer: 'redact', options: [
        { value: 'keep', label: '排障需要完整数据' }, { value: 'redact', label: '默认最小化、脱敏和分权访问' }, { value: 'public', label: '方便团队共享' },
      ]},
    ],
  }});
}

export function mountEnterpriseResilienceChaos(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'enterprise-resilience-lab',
    title: 'Resilience & Recovery Chaos Board',
    subtitle: '超时、熔断、队列、背压、降级和补偿',
    artifactName: 'resilienceRecoveryPlan',
    artifactNote: '恢复策略基于业务副作用和不变量，不以无限重试掩盖依赖故障。',
    completeText: 'NovaTech 依赖故障、队列积压和外部部分成功的恢复方案已完成。',
    scenarios: [
      { id: 'model', title: '主模型连续超时', detail: '制度问答需要引用，高风险。', answer: 'evaluated-fallback', options: [
        { value: 'infinite', label: '无限重试主模型' }, { value: 'evaluated-fallback', label: '总预算内使用已评估 Fallback，否则拒答/人工' }, { value: 'guess', label: '无证据回答' },
      ]},
      { id: 'embedding', title: 'Embedding/Vector 服务不可用', detail: '工单和审批数据库仍正常。', answer: 'partial', options: [
        { value: 'all-down', label: '整个服务返回 500' }, { value: 'partial', label: '知识问答安全降级，确定性流程继续' }, { value: 'no-rag', label: '让模型凭常识回答政策' },
      ]},
      { id: 'mcp', title: 'CI MCP 连续失败', detail: '用户只要求诊断。', answer: 'breaker', options: [
        { value: 'retry', label: '每个 Graph Node 继续重试' }, { value: 'breaker', label: '熔断、展示已知信息并转人工/跟进' }, { value: 'success', label: '假设 CI 正常' },
      ]},
      { id: 'queue', title: '知识索引队列积压', detail: '在线 API 正常但知识新鲜度下降。', answer: 'backpressure', options: [
        { value: 'produce', label: '继续无限生产任务' }, { value: 'backpressure', label: '背压、扩容、优先 ACL/删除事件并暴露 freshness' }, { value: 'drop', label: '随机丢消息' },
      ]},
      { id: 'dlq', title: '一个文档解析消息反复失败', detail: '阻塞同一分区后续任务。', answer: 'dlq', options: [
        { value: 'loop', label: '永久重试' }, { value: 'dlq', label: '有限重试后进入 DLQ，记录原因和人工恢复' }, { value: 'ignore', label: '静默丢弃' },
      ]},
      { id: 'write', title: 'IAM 授权成功但本地响应丢失', detail: '外部状态 UNKNOWN。', answer: 'reconcile', options: [
        { value: 'repeat', label: '重复授权' }, { value: 'reconcile', label: '幂等查询、状态协调和必要补偿' }, { value: 'failed', label: '标记失败' },
      ]},
      { id: 'revoke', title: '权限回收队列接近 SLA 窗口', detail: '安全任务与普通通知竞争资源。', answer: 'priority', options: [
        { value: 'fifo', label: '所有消息同优先级' }, { value: 'priority', label: '安全回收优先、扩容并触发事件告警' }, { value: 'drop', label: '丢弃旧任务' },
      ]},
    ],
  }});
}

export function mountEnterpriseReleaseGate({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const gates = [
    ['build', '可复现构建', '锁定依赖、镜像和 Release Bundle'],
    ['migration', '兼容迁移', 'Schema expand/contract 与索引 Snapshot'],
    ['offline', '离线评估', 'Golden Set 与零容忍不变量'],
    ['security', '安全红队', '租户、注入、Tool、身份和遥测'],
    ['canary', '5% Canary', '稳定归组和控制组比较'],
    ['slo', '绝对 SLO', '任务成功、延迟、可用性和成本'],
    ['approval', '发布批准', '业务、数据、安全和运维责任人'],
    ['rollback', '回滚/前滚计划', '代码、Flag、数据、知识和外部动作'],
  ];
  root.innerHTML = `
    <div class="enterprise-release-board">
      <div class="enterprise-control-head"><div><span>RELEASE GATE BOARD</span><h3>Service Desk Release Bundle 2.0</h3></div><button type="button" data-release>执行 Canary 决策</button></div>
      <div class="enterprise-release-grid">
        ${gates.map(([id, title, description], index) => `<label data-gate-card="${id}"><span>${String(index + 1).padStart(2, '0')}</span><input type="checkbox" data-gate="${id}"><div><b>${title}</b><small>${description}</small></div></label>`).join('')}
      </div>
      <div class="enterprise-canary-panel">
        <article><span>Control</span><b>task success 94.8%</b><small>P95 6.4s · $0.044/request</small></article>
        <article><span>Canary</span><b>task success 95.1%</b><small>P95 6.7s · $0.051/request</small></article>
        <article class="danger"><span>Security invariant</span><b>tenant leakage 0</b><small>must remain zero</small></article>
      </div>
      <div class="mcp-result" data-result>全部门禁通过后才能扩大 Canary。</div>${teachingNotice()}
    </div>`;
  const result = root.querySelector('[data-result]');
  root.querySelector('[data-release]').addEventListener('click', () => {
    const missing = gates.filter(([id]) => !root.querySelector(`[data-gate="${id}"]`).checked);
    if (missing.length) {
      setResult(result, 'warn', `仍缺少发布证据：${missing.map(([, title]) => title).join('、')}。`);
      return;
    }
    const artifact = { bundle: '2.0', canaryPercent: 5, stableCohort: true, zeroTolerance: ['tenant_leakage', 'unauthorized_tool'], rollbackReady: true };
    artifacts.set('enterpriseReleaseStrategy', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ Release Bundle 2.0 可进入 5% Canary；任何安全不变量失败立即停止并回滚。');
    complete(artifact);
  });
}

export function mountEnterpriseIncidentCommand({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const actions = [
    { id: 'declare', label: '声明 SEV-1 事件', required: true },
    { id: 'roles', label: '分配 IC / Ops / Comms / Scribe', required: true },
    { id: 'flag', label: '关闭高风险写 Tool 与 Canary Flag', required: true },
    { id: 'isolate', label: '隔离受影响租户和检索 Snapshot', required: true },
    { id: 'revoke', label: '优先处理未回收生产权限', required: true },
    { id: 'queue', label: '扩容安全任务消费者并启用背压', required: true },
    { id: 'evidence', label: '保全 Trace、Audit、Release Bundle 和时间线', required: true },
    { id: 'communication', label: '按固定节奏更新内部状态', required: true },
    { id: 'verify', label: '验证租户隔离、权限回收和业务恢复', required: true },
    { id: 'postmortem', label: '创建无责复盘和有负责人行动项', required: true },
  ];
  root.innerHTML = `
    <div class="enterprise-incident-center">
      <div class="enterprise-incident-head"><div><span>INCIDENT COMMAND CENTER · SEV-1</span><h3>跨租户泄漏 + IAM 回收失败 + CI MCP 故障 + 队列积压</h3></div><b data-clock>00:00</b></div>
      <div class="enterprise-incident-layout">
        <section><div class="enterprise-incident-timeline" data-timeline><article><span>T+00</span><b>Canary 用户报告看到其他租户文档标题</b><small>同时发现一个生产权限超过到期时间。</small></article></div></section>
        <aside>
          <div class="mcp-checklist">${actions.map((action) => `<label><input type="checkbox" data-incident="${action.id}"><span><b>${action.label}</b><small>完成后写入 Working Record</small></span></label>`).join('')}</div>
          <button type="button" class="mcp-primary" data-run>执行事件恢复与最终答辩</button>
          <div class="mcp-result" data-result>先止损，再恢复，最后验证和学习。</div>${teachingNotice()}
        </aside>
      </div>
    </div>`;
  let minute = 0;
  root.querySelectorAll('[data-incident]').forEach((input) => input.addEventListener('change', () => {
    if (!input.checked) return;
    minute += 4;
    root.querySelector('[data-clock]').textContent = `T+${String(minute).padStart(2, '0')}`;
    const action = actions.find((item) => item.id === input.dataset.incident);
    root.querySelector('[data-timeline]').insertAdjacentHTML('beforeend', `<article><span>T+${String(minute).padStart(2, '0')}</span><b>${action.label}</b><small>已记录执行者、证据和结果。</small></article>`);
  }));
  const result = root.querySelector('[data-result]');
  root.querySelector('[data-run]').addEventListener('click', () => {
    const missing = actions.filter((action) => !root.querySelector(`[data-incident="${action.id}"]`).checked);
    if (missing.length) {
      setResult(result, 'warn', `事件流程仍缺少：${missing.map((item) => item.label).join('、')}。`);
      return;
    }
    const artifact = {
      incident: 'SEV-1',
      roles: ['incident-commander', 'operations', 'communications', 'scribe'],
      mitigations: ['disable-write-tools', 'disable-canary', 'isolate-tenant', 'prioritize-revocation'],
      verification: ['tenant-isolation', 'access-revoked', 'queues-recovered', 'slo-restored'],
      graduation: true,
    };
    artifacts.set('enterpriseServiceDeskProductionBlueprint', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ Game Day 完成：系统已止损、恢复、验证，并形成可执行复盘与最终生产蓝图。');
    complete(artifact);
  });
}

export const enterpriseGovernanceSimulators = {
  'enterprise-offline-evaluation': mountEnterpriseOfflineEvaluation,
  'enterprise-continuous-evaluation': mountEnterpriseContinuousEvaluation,
  'enterprise-observability-control-room': mountEnterpriseObservabilityControlRoom,
  'enterprise-security-red-team': mountEnterpriseSecurityRedTeam,
  'enterprise-resilience-chaos': mountEnterpriseResilienceChaos,
  'enterprise-release-gate': mountEnterpriseReleaseGate,
  'enterprise-incident-command': mountEnterpriseIncidentCommand,
};
