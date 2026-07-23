import { mountClassificationLab, mountDecisionSeries, once, setResult, teachingNotice } from './mcp-lab-utils.js';

export function mountMcpFitDecision(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'mcp-fit-lab',
    title: 'MCP 适用性分诊台',
    subtitle: '不是所有函数都值得协议化',
    artifactName: 'mcpFitDecision',
    artifactNote: '按跨 Host 复用、能力发现、权限边界和运维成本选择最小抽象。',
    completeText: '六类能力已经进入正确的复用边界。',
    scenarios: [
      { id: 'internal', title: '单体内部格式化函数', detail: '只在一个 Node 内使用，无外部复用。', answer: 'function', options: [
        { value: 'function', label: '普通函数', description: '保持最小边界' }, { value: 'mcp', label: 'MCP Server' }, { value: 'a2a', label: 'A2A' },
      ]},
      { id: 'multi-host', title: '课程搜索供 Codex、ChatGPT、自研 Agent 使用', detail: '同一能力需要被多种 Host 标准发现。', answer: 'mcp', options: [
        { value: 'copy', label: '复制三份 Tool' }, { value: 'mcp', label: '独立 MCP Server', description: '统一工具契约' }, { value: 'prompt', label: '只写 Prompt' },
      ]},
      { id: 'realtime', title: '实时订单余额', detail: '权威数据来自内部账务 API。', answer: 'api', options: [
        { value: 'api', label: '业务 API + Tool' }, { value: 'resource', label: '静态 Resource' }, { value: 'fine-tune', label: '微调模型' },
      ]},
      { id: 'thread', title: '完整编程 Thread、Diff 与审批事件', detail: '调用方需要持续事件和产品级生命周期。', answer: 'app', options: [
        { value: 'tool', label: '单个 Tool 足够' }, { value: 'app', label: 'App Server / 专用 API' }, { value: 'resource', label: 'Resource' },
      ]},
      { id: 'collaboration', title: '两个独立 Agent 交换任务状态', detail: '双方都有身份、任务和异步协作。', answer: 'a2a', options: [
        { value: 'mcp', label: '只暴露底层 Tool' }, { value: 'a2a', label: 'Agent-to-Agent' }, { value: 'function', label: '本地函数' },
      ]},
      { id: 'public-docs', title: '公开协议术语表', detail: '只读、固定、无需用户身份。', answer: 'resource', options: [
        { value: 'resource', label: '公开 Resource' }, { value: 'write', label: '匿名写 Tool' }, { value: 'oauth', label: '强制 OAuth 写权限' },
      ]},
    ],
  }});
}

export function mountMcpTopologyCanvas({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const connections = [
    ['host-model', 'Host → Model', 'Host 选择并调用模型'],
    ['host-client', 'Host → MCP Client', 'Host 为每个 Server 创建 Client'],
    ['client-server', 'MCP Client → MCP Server', '协议连接'],
    ['client-auth', 'Client → Authorization Server', '获取 MCP Resource Token'],
    ['server-api', 'MCP Server → Downstream API', '使用独立下游凭证'],
    ['host-user', 'Host → User Approval', '高风险动作由 Host 请求确认'],
  ];
  root.innerHTML = `
    <div class="mcp-panel mcp-topology-lab">
      <div class="mcp-toolbar"><div><b>MCP 参与者与信任边界画布</b><small>选择六条必要连接，拒绝 Token Passthrough</small></div><button class="mcp-primary" data-run type="button">验证拓扑</button></div>
      <div class="mcp-topology-canvas">
        <div class="mcp-topology-map">
          ${['User','MCP Host','LLM','MCP Client','Authorization Server','Academy MCP Server','GitHub / DB API'].map((item, index) => `<article data-node="${index}"><span>${String(index + 1).padStart(2,'0')}</span><b>${item}</b></article>`).join('')}
        </div>
        <aside><span class="mcp-label">建立连接</span>
          <div class="mcp-checklist">${connections.map(([id,label,desc]) => `<label><input type="checkbox" data-link="${id}"><span><b>${label}</b><small>${desc}</small></span></label>`).join('')}</div>
          <label class="mcp-check danger"><input type="checkbox" data-passthrough><span><b>把 MCP Token 原样转发给 GitHub</b><small>故意的危险选项</small></span></label>
          <div class="mcp-result" data-result>完成拓扑和凭证边界。</div>${teachingNotice()}
        </aside>
      </div>
    </div>`;
  const result = root.querySelector('[data-result]');
  root.querySelector('[data-run]').addEventListener('click', () => {
    const ready = connections.every(([id]) => root.querySelector(`[data-link="${id}"]`).checked);
    if (!ready || root.querySelector('[data-passthrough]').checked) {
      setResult(result, 'warn', '每个 Server 需要独立 Client 连接；MCP Token 与下游 Token 必须隔离。');
      return;
    }
    const artifact = { participants: 7, dedicatedClientPerServer: true, tokenPassthrough: false, boundaries: connections.map(([id]) => id) };
    artifacts.set('mcpTrustBoundaryMap', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ Host、Client、Server、授权服务器和下游凭证边界已经分开。');
    complete(artifact);
  });
}

export function mountMcpProtocolLifecycle({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const steps = [
    { id: 'initialize', label: 'initialize', detail: '交换 protocolVersion、capabilities、clientInfo 与 serverInfo' },
    { id: 'initialized', label: 'notifications/initialized', detail: 'Client 确认初始化完成' },
    { id: 'list', label: 'tools/list', detail: '发现经过协商的 Server Tools' },
    { id: 'call', label: 'tools/call', detail: '执行 search_lessons' },
    { id: 'changed', label: 'notifications/tools/list_changed', detail: 'Server 通知 Tool 集变化' },
    { id: 'refresh', label: 'tools/list', detail: 'Client 失效缓存并重新发现' },
  ];
  let index = 0;
  root.innerHTML = `
    <div class="mcp-panel mcp-protocol-lab">
      <div class="mcp-toolbar"><div><b>JSON-RPC 生命周期检查器</b><small>请求、响应和通知逐帧展开</small></div><button class="mcp-primary" type="button" data-next>发送下一帧</button></div>
      <div class="mcp-protocol-inspector"><section><div class="mcp-message-list" data-list></div></section><aside>
        <span class="mcp-label">当前消息</span><pre class="mcp-code" data-json>{}</pre>
        <div class="mcp-result" data-result>从 initialize 开始。</div>${teachingNotice()}
      </aside></div>
    </div>`;
  const list = root.querySelector('[data-list]');
  const json = root.querySelector('[data-json]');
  const result = root.querySelector('[data-result]');
  root.querySelector('[data-next]').addEventListener('click', () => {
    if (index >= steps.length) return;
    const step = steps[index];
    list.insertAdjacentHTML('beforeend', `<article class="${step.id === 'changed' ? 'notification' : ''}"><span>${String(index + 1).padStart(2,'0')}</span><b>${step.label}</b><small>${step.detail}</small></article>`);
    json.textContent = JSON.stringify({
      jsonrpc: '2.0',
      ...(step.id.includes('initialized') || step.id === 'changed' ? {} : { id: index + 1 }),
      method: step.label,
      params: step.id === 'initialize' ? { protocolVersion: '2025-11-25', capabilities: { roots: {}, sampling: {} } } : {},
    }, null, 2);
    index += 1;
    if (index < steps.length) {
      setResult(result, 'good', `✓ ${step.label} 已完成，继续。`);
      return;
    }
    const artifact = { protocolVersion: '2025-11-25', sequence: steps.map((step) => step.label), notificationsHaveNoId: true, refreshedAfterListChanged: true };
    artifacts.set('mcpLifecycleContract', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ 初始化、能力发现、调用与变更通知的完整生命周期已完成。');
    complete(artifact);
  });
}

export function mountMcpPrimitiveCatalog(args) {
  return mountClassificationLab({ ...args, definition: {
    className: 'mcp-primitive-lab',
    title: 'Tools / Resources / Prompts 分类台',
    subtitle: '控制关系比名称更重要',
    artifactName: 'mcpPrimitiveCatalog',
    artifactNote: 'Tool 面向动作，Resource 面向可寻址上下文，Prompt 面向用户选择的模板。',
    completeText: 'Academy MCP 原语目录已经建立。',
    categories: [
      { value: 'tool', label: 'Tool' }, { value: 'resource', label: 'Resource' }, { value: 'template', label: 'Resource Template' }, { value: 'prompt', label: 'Prompt' },
    ],
    items: [
      { id: 'search', label: 'search_lessons(query)', description: '动态搜索', answer: 'tool', why: '执行动态查询' },
      { id: 'lesson', label: 'academy://lessons/lesson-26', description: '固定课程内容', answer: 'resource', why: '固定 URI 上下文' },
      { id: 'lesson-template', label: 'academy://lessons/{lessonId}', description: '课程资源族', answer: 'template', why: '参数化 URI' },
      { id: 'review', label: 'review_lesson_clarity', description: '用户选择的审查模板', answer: 'prompt', why: '用户控制工作流' },
      { id: 'save', label: 'save_quality_finding', description: '写入质量问题', answer: 'tool', why: '有副作用动作' },
      { id: 'rubric', label: 'academy://quality-rubric', description: '固定质量标准', answer: 'resource', why: '应用选择上下文' },
      { id: 'compare', label: 'compare_two_lessons', description: '带两个参数的交互模板', answer: 'prompt', why: '可复用消息模板' },
      { id: 'artifact', label: 'academy://artifacts/{name}', description: '动态项目成果', answer: 'template', why: '参数化资源' },
    ],
  }});
}

export function mountMcpClientCapabilities(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'mcp-capability-lab',
    title: 'Client Capability Consent Board',
    subtitle: '规范能力不等于每个 Host 都支持',
    artifactName: 'mcpClientCapabilityPolicy',
    artifactNote: '使用 Client feature 前先检查 capability，并为缺失能力设计降级。',
    completeText: 'Roots、Sampling、Elicitation、Progress 与 Tasks 已按 Host 能力配置。',
    scenarios: [
      { id: 'ide-root', title: '本地 IDE 只允许访问当前仓库', detail: 'Server 需要知道可访问路径。', answer: 'roots', options: [
        { value: 'roots', label: 'Roots' }, { value: 'sampling', label: 'Sampling' }, { value: 'prompt', label: 'Prompt' },
      ]},
      { id: 'draft', title: 'Server 请求 Host 模型生成审查摘要', detail: 'Host 保留模型和策略控制。', answer: 'sampling', options: [
        { value: 'sampling', label: 'Sampling' }, { value: 'resource', label: 'Resource' }, { value: 'root', label: 'Root' },
      ]},
      { id: 'confirm', title: '缺少发布理由，需要用户补充', detail: '交互式 Host 可请求结构化输入。', answer: 'elicitation', options: [
        { value: 'elicitation', label: 'Elicitation' }, { value: 'logging', label: 'Logging' }, { value: 'tool', label: 'Tool list' },
      ]},
      { id: 'batch', title: '十分钟课程全量检查', detail: '需要状态、进度和稍后取回。', answer: 'task', options: [
        { value: 'task', label: 'Task + Progress' }, { value: 'root', label: 'Roots' }, { value: 'prompt', label: 'Prompt only' },
      ]},
      { id: 'ci', title: 'CI 没有交互用户但 Server 请求确认', detail: '不能假设 Elicitation 存在。', answer: 'fallback', options: [
        { value: 'guess', label: '让模型猜' }, { value: 'fallback', label: '返回 needs_input 状态' }, { value: 'approve', label: '自动批准' },
      ]},
    ],
  }});
}

export const mcpFoundationSimulators = {
  'mcp-fit-decision': mountMcpFitDecision,
  'mcp-topology-canvas': mountMcpTopologyCanvas,
  'mcp-protocol-lifecycle': mountMcpProtocolLifecycle,
  'mcp-primitive-catalog': mountMcpPrimitiveCatalog,
  'mcp-client-capabilities': mountMcpClientCapabilities,
};
