import { artifactChips, bindRange, metricGrid, once, q, saveArtifact, setResult, teachingNotice } from './shared.js';

export function mountSubgraphPersistence({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const cases = [
    { id: 'worker', label: '一次研究任务的并行 Worker', answer: 'invocation', note: '每次调用独立，不应跨请求积累内部状态。' },
    { id: 'support', label: '同一客户线程中的退款子流程', answer: 'thread', note: '需要在该 thread 内连续恢复。' },
    { id: 'validator', label: '纯 Schema/规则验证子图', answer: 'stateless', note: '确定性纯函数不需要持久化内部 State。' },
    { id: 'accounting', label: '独立账务域 Agent，读取共享 user context', answer: 'invocation', note: '子 Agent 单次执行，长期偏好由 Store 提供。' },
  ];
  const modes = [['invocation', 'per-invocation'], ['thread', 'per-thread'], ['stateless', 'stateless']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Subgraph Persistence 设计台</b><small>子图复用不等于所有调用共享同一份内部 State</small></div><button class="lg-primary" data-save>保存子图策略</button></div><div class="lg-grid"><section><table class="lg-table"><thead><tr><th>子图场景</th><th>Persistence mode</th><th>解释</th></tr></thead><tbody>${cases.map((item) => `<tr data-row="${item.id}"><td><b>${item.label}</b></td><td><select data-choice="${item.id}"><option value="">选择...</option>${modes.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-note="${item.id}">等待判断</td></tr>`).join('')}</tbody></table></section><aside><label class="lg-check"><input type="checkbox" data-map> 父图与子图使用显式 State mapping</label><label class="lg-check"><input type="checkbox" data-namespace> Store 使用 tenant/user namespace</label><label class="lg-check"><input type="checkbox" data-errors> 子图错误映射为父图可处理状态</label>${metricGrid([{ label: '一次性 Worker', value: 'per-invocation' }, { label: '连续子流程', value: 'per-thread' }, { label: '纯验证器', value: 'stateless' }])}<div class="lg-result" data-result>为四种子图选择生命周期。</div></aside></div>${artifactChips(artifacts, ['memoryScopePolicy'])}${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-save]').onclick = () => {
    let correct = 0;
    const decisions = {};
    cases.forEach((item) => {
      const value = q(root, `[data-choice="${item.id}"]`).value;
      const ok = value === item.answer;
      decisions[item.id] = value;
      root.querySelector(`[data-row="${item.id}"]`).className = ok ? 'pass' : 'fail';
      q(root, `[data-note="${item.id}"]`).textContent = ok ? item.note : '生命周期与隔离要求不匹配';
      if (ok) correct += 1;
    });
    const controls = ['map', 'namespace', 'errors'].every((id) => q(root, `[data-${id}]`).checked);
    if (correct !== cases.length || !controls) return setResult(result, 'warn', `模式 ${correct}/${cases.length} 正确。还要显式映射 State、namespace 和错误边界。`);
    const artifact = saveArtifact(artifacts, 'subgraphCompositionPolicy', { decisions, stateMapping: true, namespaceIsolation: true, errorBoundary: true }, config);
    setResult(result, 'good', '✓ 子图生命周期、State mapping、Store namespace 与错误边界已明确。');
    complete(artifact);
  };
}

export function mountMultiAgentArchitecture({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const cases = [
    { id: 'single', label: '一个客服域、6 个低风险工具', answer: 'single', note: '一个 Agent + 动态工具筛选更简单。' },
    { id: 'parallel', label: '制度、账务、技术三个域可能同时相关', answer: 'router', note: 'Router + Send 可并行调用多个专家并汇合。' },
    { id: 'context', label: '主 Agent 需要隔离深度研究上下文', answer: 'subagents', note: 'Subagents 可保持主上下文干净。' },
    { id: 'conversation', label: '销售与法务轮流直接和用户对话', answer: 'handoff', note: 'Handoff 适合显式控制当前对话 Agent。' },
    { id: 'workflow', label: '固定审批步骤，无模型自由交接', answer: 'workflow', note: '确定性 Workflow 更可审计。' },
  ];
  const choices = [['single', 'Single Agent'], ['router', 'Router + Send'], ['subagents', 'Subagents'], ['handoff', 'Handoffs'], ['workflow', 'Deterministic Workflow']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Multi-agent Architecture 选择器</b><small>Agent 数量不是目标，职责、上下文与控制流才是</small></div><button class="lg-primary" data-save>保存架构决策</button></div><div class="lg-grid"><section><table class="lg-table"><thead><tr><th>场景</th><th>架构</th><th>理由</th></tr></thead><tbody>${cases.map((item) => `<tr data-row="${item.id}"><td><b>${item.label}</b></td><td><select data-choice="${item.id}"><option value="">选择...</option>${choices.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-note="${item.id}">等待</td></tr>`).join('')}</tbody></table></section><aside><label class="lg-check"><input type="checkbox" data-contract> 每个 Agent 定义输入、输出和工具边界</label><label class="lg-check"><input type="checkbox" data-context> 限制跨 Agent 传递的上下文</label><label class="lg-check"><input type="checkbox" data-budget> 配置并发、调用次数和总成本预算</label><label class="lg-check"><input type="checkbox" data-trace> Trace 记录 router、agent、tool 与汇合节点</label><div class="lg-result" data-result>为五类任务选择最小可控架构。</div></aside></div>${artifactChips(artifacts, ['subgraphCompositionPolicy'])}${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-save]').onclick = () => {
    let correct = 0;
    const decisions = {};
    cases.forEach((item) => {
      const value = q(root, `[data-choice="${item.id}"]`).value;
      const ok = value === item.answer;
      decisions[item.id] = value;
      root.querySelector(`[data-row="${item.id}"]`).className = ok ? 'pass' : 'fail';
      q(root, `[data-note="${item.id}"]`).textContent = ok ? item.note : '架构与协作方式不匹配';
      if (ok) correct += 1;
    });
    const controls = ['contract', 'context', 'budget', 'trace'].every((id) => q(root, `[data-${id}]`).checked);
    if (correct !== cases.length || !controls) return setResult(result, 'warn', `架构 ${correct}/${cases.length} 正确。还需补齐职责契约、上下文、预算和 Trace。`);
    const artifact = saveArtifact(artifacts, 'multiAgentArchitectureDecision', { decisions, contracts: true, contextIsolation: true, budgets: true, tracing: true }, config);
    setResult(result, 'good', '✓ Single Agent、Router、Subagent、Handoff 与 Workflow 已按真实约束区分。');
    complete(artifact);
  };
}

export function mountAgenticRagRouter({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const cases = [
    { id: 'smalltalk', label: '“你好，今天怎么样？”', answer: 'none', note: '无需访问外部知识。' },
    { id: 'balance', label: '“ORD-881 当前应付余额？”', answer: 'api', note: '实时结构化事实来自业务 API。' },
    { id: 'policy', label: '“海外差旅报销上限是多少？”', answer: 'vector', note: '制度文档需要检索和引用。' },
    { id: 'error', label: '“ERR-NVML-57 为什么出现？”', answer: 'hybrid', note: '错误码精确词 + 语义说明适合 Hybrid。' },
    { id: 'mixed', label: '“当前余额是否符合差旅制度？”', answer: 'parallel', note: 'API 与文档检索应并行后综合。' },
    { id: 'forbidden', label: '“读取其他租户的合同”', answer: 'deny', note: '权限拒绝，不进入检索循环。' },
  ];
  const choices = [['none', 'No retrieval'], ['api', 'SQL/API'], ['vector', 'Document retrieval'], ['hybrid', 'Lexical + Dense'], ['parallel', 'API + Retrieval in parallel'], ['deny', 'Permission denied']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Agentic RAG Knowledge Router</b><small>模型可以路由，但数据源权威性与安全边界由应用定义</small></div><button class="lg-primary" data-save>保存知识路由</button></div><div class="lg-grid"><section><table class="lg-table"><thead><tr><th>Query</th><th>访问路径</th><th>状态</th></tr></thead><tbody>${cases.map((item) => `<tr data-row="${item.id}"><td><b>${item.label}</b></td><td><select data-choice="${item.id}"><option value="">选择...</option>${choices.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-note="${item.id}">等待</td></tr>`).join('')}</tbody></table></section><aside><label class="lg-check"><input type="checkbox" data-typed> Router 输出使用结构化 Schema</label><label class="lg-check"><input type="checkbox" data-acl> ACL 在工具/检索执行前检查</label><label class="lg-check"><input type="checkbox" data-source> 每个路径记录 authority/source</label><label class="lg-check"><input type="checkbox" data-budget> 限制最多 2 个并行知识源</label>${metricGrid([{ label: '实时事实', value: 'API' }, { label: '文档证据', value: 'Retriever' }, { label: '越权请求', value: 'Deny' }])}<div class="lg-result" data-result>完成六种 Query 的知识路由。</div></aside></div>${artifactChips(artifacts, ['multiAgentArchitectureDecision', 'firstStageRetrievalRouter'])}${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-save]').onclick = () => {
    let correct = 0;
    const routes = {};
    cases.forEach((item) => {
      const value = q(root, `[data-choice="${item.id}"]`).value;
      const ok = value === item.answer;
      routes[item.id] = value;
      root.querySelector(`[data-row="${item.id}"]`).className = ok ? 'pass' : 'fail';
      q(root, `[data-note="${item.id}"]`).textContent = ok ? item.note : '数据源与 Query 约束不匹配';
      if (ok) correct += 1;
    });
    const controls = ['typed', 'acl', 'source', 'budget'].every((id) => q(root, `[data-${id}]`).checked);
    if (correct !== cases.length || !controls) return setResult(result, 'warn', `路由 ${correct}/${cases.length} 正确。还需结构化输出、ACL、来源与并行预算。`);
    const artifact = saveArtifact(artifacts, 'agenticRetrievalRouter', { routes, typed: true, aclBeforeAccess: true, authorityTracking: true, maxParallelSources: 2 }, config);
    setResult(result, 'good', '✓ Agentic RAG 已按 Query 类型、权威数据源和 ACL 进行可控路由。');
    complete(artifact);
  };
}

export function mountRetrievalCorrection({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const cases = [
    { id: 'wording', label: '同义表达导致候选无关', answer: 'rewrite', note: '保持意图的 Query rewrite。' },
    { id: 'multihop', label: '问题同时包含两个独立事实', answer: 'decompose', note: '拆解为子问题并合并 Evidence。' },
    { id: 'cross', label: '中文 Query、英文文档召回失败', answer: 'translate', note: '跨语言检索或翻译路径。' },
    { id: 'permission', label: 'ACL 拒绝全部候选', answer: 'stop', note: '返回无权限，不能通过改写绕过。' },
    { id: 'missing', label: 'Golden corpus 中确认无答案', answer: 'abstain', note: '明确拒答并记录知识缺口。' },
  ];
  const actions = [['rewrite', 'Rewrite'], ['decompose', 'Decompose'], ['translate', 'Translate / multilingual'], ['stop', 'Stop: permission'], ['abstain', 'Abstain: no answer']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Retrieve → Grade → Correct Loop</b><small>先分类失败，再决定是否继续循环</small></div><button class="lg-primary" data-save>运行自纠错计划</button></div><div class="lg-grid"><section><table class="lg-table"><thead><tr><th>失败</th><th>动作</th><th>解释</th></tr></thead><tbody>${cases.map((item) => `<tr data-row="${item.id}"><td><b>${item.label}</b></td><td><select data-choice="${item.id}"><option value="">选择...</option>${actions.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-note="${item.id}">等待</td></tr>`).join('')}</tbody></table><label class="lg-label">max attempts <b data-attempts-label>2</b></label><input type="range" min="1" max="6" value="2" data-attempts></section><aside><label class="lg-check"><input type="checkbox" data-original> 保留 original query</label><label class="lg-check"><input type="checkbox" data-diff> 记录每轮 transformation diff</label><label class="lg-check"><input type="checkbox" data-candidates> 记录 candidates 与 grade</label><label class="lg-check"><input type="checkbox" data-cost> 记录轮次 latency/cost</label><div class="lg-loop-diagram"><span>Retrieve</span><i>→</i><span>Grade</span><i>→</i><span>Correct / Exit</span></div><div class="lg-result" data-result>配置有限、自解释的修正循环。</div></aside></div>${artifactChips(artifacts, ['agenticRetrievalRouter', 'queryTransformationPolicy'])}${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  bindRange(root, '[data-attempts]', '[data-attempts-label]');
  q(root, '[data-save]').onclick = () => {
    let correct = 0;
    const policies = {};
    cases.forEach((item) => {
      const value = q(root, `[data-choice="${item.id}"]`).value;
      const ok = value === item.answer;
      policies[item.id] = value;
      root.querySelector(`[data-row="${item.id}"]`).className = ok ? 'pass' : 'fail';
      q(root, `[data-note="${item.id}"]`).textContent = ok ? item.note : '动作与失败类型不匹配';
      if (ok) correct += 1;
    });
    const attempts = Number(q(root, '[data-attempts]').value);
    const observability = ['original', 'diff', 'candidates', 'cost'].every((id) => q(root, `[data-${id}]`).checked);
    if (correct !== cases.length || attempts < 1 || attempts > 3 || !observability) return setResult(result, 'warn', `策略 ${correct}/${cases.length} 正确。max attempts 建议 1–3，并记录 Query、候选、grade 和成本。`);
    const artifact = saveArtifact(artifacts, 'retrievalCorrectionLoop', { policies, maxAttempts: attempts, audit: ['originalQuery', 'transformDiff', 'candidates', 'grade', 'latency', 'cost'] }, config);
    setResult(result, 'good', '✓ 修正循环只处理可修复失败，并为权限与无答案提供强制出口。');
    complete(artifact);
  };
}

export function mountEvidenceGate({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const cases = [
    { id: 'insufficient', label: '证据只覆盖问题的一半', answer: 'retrieve', note: '补检索或分解剩余问题。' },
    { id: 'citation', label: '答案正确但引用段落不支持金额', answer: 'revise', note: '修订引用或删除无依据陈述。' },
    { id: 'irrelevant', label: '证据充分但回答偏离问题', answer: 'regenerate', note: '基于同一 Evidence 重新生成。' },
    { id: 'conflict', label: '两个权威来源给出冲突规则', answer: 'human', note: '升级人工复核并展示冲突。' },
    { id: 'none', label: '预算耗尽仍无充分证据', answer: 'abstain', note: '拒答并记录知识缺口。' },
  ];
  const actions = [['retrieve', 'Supplement retrieval'], ['revise', 'Revise citation/claim'], ['regenerate', 'Regenerate answer'], ['human', 'Human review'], ['abstain', 'Abstain']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>Evidence & Grounding Gate</b><small>相关候选不等于答案中的每个事实都有依据</small></div><button class="lg-primary" data-save>执行门禁</button></div><div class="lg-grid"><section><table class="lg-table"><thead><tr><th>失败状态</th><th>下一步</th><th>解释</th></tr></thead><tbody>${cases.map((item) => `<tr data-row="${item.id}"><td><b>${item.label}</b></td><td><select data-choice="${item.id}"><option value="">选择...</option>${actions.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td><td data-note="${item.id}">等待</td></tr>`).join('')}</tbody></table><label class="lg-label">总模型/检索调用预算 <b data-budget-label>6</b></label><input type="range" min="2" max="12" value="6" data-budget></section><aside><label class="lg-check"><input type="checkbox" data-sufficiency> 生成前检查 evidence sufficiency</label><label class="lg-check"><input type="checkbox" data-grounded> 生成后检查 groundedness</label><label class="lg-check"><input type="checkbox" data-citation> 检查 citation span</label><label class="lg-check"><input type="checkbox" data-relevance> 检查 answer relevance</label><label class="lg-check"><input type="checkbox" data-stop> 每条循环路径有 stop/abstain</label>${metricGrid([{ label: '缺证据', value: 'Retrieve' }, { label: '引用错', value: 'Revise' }, { label: '无证据', value: 'Abstain' }])}<div class="lg-result" data-result>为五种质量失败配置独立路径。</div></aside></div>${artifactChips(artifacts, ['retrievalCorrectionLoop', 'evidenceAndCitationContract'])}${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  bindRange(root, '[data-budget]', '[data-budget-label]');
  q(root, '[data-save]').onclick = () => {
    let correct = 0;
    const gates = {};
    cases.forEach((item) => {
      const value = q(root, `[data-choice="${item.id}"]`).value;
      const ok = value === item.answer;
      gates[item.id] = value;
      root.querySelector(`[data-row="${item.id}"]`).className = ok ? 'pass' : 'fail';
      q(root, `[data-note="${item.id}"]`).textContent = ok ? item.note : '下一步与质量失败不匹配';
      if (ok) correct += 1;
    });
    const budget = Number(q(root, '[data-budget]').value);
    const controls = ['sufficiency', 'grounded', 'citation', 'relevance', 'stop'].every((id) => q(root, `[data-${id}]`).checked);
    if (correct !== cases.length || budget < 4 || budget > 8 || !controls) return setResult(result, 'warn', `门禁 ${correct}/${cases.length} 正确。调用预算建议 4–8，并补齐 sufficiency、groundedness、citation、relevance 和 stop。`);
    const artifact = saveArtifact(artifacts, 'evidenceGroundingLoop', { gates, totalCallBudget: budget, checks: ['sufficiency', 'groundedness', 'citation', 'answerRelevance'], abstention: true }, config);
    setResult(result, 'good', '✓ 检索、生成、修订、人工复核和拒答已经形成有限质量闭环。');
    complete(artifact);
  };
}

export function mountProductionRelease({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const checks = [
    ['node-tests', 'Node 单元测试'], ['route-tests', 'Conditional route 测试'], ['partial', 'Partial execution / historical State 测试'],
    ['checkpoint', '数据库 Checkpointer 与线程恢复'], ['interrupt', 'Interrupt/resume 故障恢复'], ['migration', 'State/checkpoint 迁移'],
    ['trace', 'Node/route/tool Trace 与 metadata'], ['stream', '节点级 streaming UI'], ['budget', '循环、并发和成本预算'],
    ['security', 'ACL、Store namespace 与工具权限'], ['deploy', 'langgraph.json / graph entry / env'], ['rollback', '版本回滚与旧线程兼容'],
  ];
  const faults = [
    { id: 'crash', label: '生成节点后进程崩溃', answer: 'resume' },
    { id: 'schema', label: '新版本删除旧 State 字段', answer: 'migrate' },
    { id: 'loop', label: 'grader 连续返回 retry', answer: 'budget' },
    { id: 'acl', label: '子 Agent 读取错误租户 namespace', answer: 'block' },
  ];
  const actions = [['resume', 'Resume from checkpoint'], ['migrate', 'State migration'], ['budget', 'Stop by budget'], ['block', 'Block and audit']];
  root.innerHTML = `<div class="lg-panel"><div class="lg-toolbar"><div><b>LangGraph Production Release Gate</b><small>图能跑通不等于长时、可恢复系统已经可发布</small></div><button class="lg-primary" data-release>执行发布审查</button></div><div class="lg-grid"><section><div class="lg-release-checks">${checks.map(([id, label]) => `<label class="lg-check"><input type="checkbox" data-item="${id}"> ${label}</label>`).join('')}</div><span class="lg-label">故障演练</span><table class="lg-table"><tbody>${faults.map((item) => `<tr data-row="${item.id}"><td><b>${item.label}</b></td><td><select data-fault="${item.id}"><option value="">选择恢复...</option>${actions.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></section><aside>${metricGrid([{ label: '课程成果', value: '20' }, { label: '核心边界', value: 'State' }, { label: '发布策略', value: 'Canary' }])}<label class="lg-label">发布决策</label><select data-decision><option value="">选择...</option><option value="release">全量发布</option><option value="canary">灰度发布</option><option value="hold">继续实验</option><option value="rollback">回滚</option></select><div class="lg-result" data-result>补齐发布清单并处理四类故障。</div></aside></div>${artifactChips(artifacts, ['orchestrationDecision', 'durableExecutionPolicy', 'interruptResumeContract', 'agenticRetrievalRouter', 'evidenceGroundingLoop'])}${teachingNotice()}</div>`;
  const result = q(root, '[data-result]');
  q(root, '[data-release]').onclick = () => {
    const completed = checks.every(([id]) => q(root, `[data-item="${id}"]`).checked);
    let correct = 0;
    const faultPlan = {};
    faults.forEach((item) => {
      const value = q(root, `[data-fault="${item.id}"]`).value;
      const ok = value === item.answer;
      faultPlan[item.id] = value;
      root.querySelector(`[data-row="${item.id}"]`).className = ok ? 'pass' : 'fail';
      if (ok) correct += 1;
    });
    const decision = q(root, '[data-decision]').value;
    if (!completed || correct !== faults.length || decision !== 'canary') return setResult(result, 'warn', `清单 ${checks.filter(([id]) => q(root, `[data-item="${id}"]`).checked).length}/${checks.length}；故障 ${correct}/${faults.length}。新图与旧 checkpoint 并存时先灰度发布。`);
    const artifact = saveArtifact(artifacts, 'langGraphProductionBlueprint', {
      version: '@langchain/langgraph@1.4.8',
      tests: ['nodes', 'routes', 'partialExecution', 'recovery'],
      persistence: 'database-checkpointer-and-store',
      migration: true,
      observability: ['trace', 'node', 'route', 'latency', 'cost', 'errors'],
      deployment: ['langgraph.json', 'graphFactory', 'environment'],
      faultPlan,
      decision: 'canary',
      rollback: true,
    }, config);
    setResult(result, 'good', '✓ 第五专栏生产蓝图完成：先灰度、可恢复、可迁移、可审计、可回滚。');
    complete(artifact);
  };
}

export const langGraphAdvancedSimulators = {
  'lg-subgraph-persistence': mountSubgraphPersistence,
  'lg-multi-agent-architecture': mountMultiAgentArchitecture,
  'lg-agentic-rag-router': mountAgenticRagRouter,
  'lg-retrieval-correction': mountRetrievalCorrection,
  'lg-evidence-gate': mountEvidenceGate,
  'lg-production-release': mountProductionRelease,
};
