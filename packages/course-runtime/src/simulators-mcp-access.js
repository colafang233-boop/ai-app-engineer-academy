import { mountChecklistLab, mountDecisionSeries, once, setResult, teachingNotice } from './mcp-lab-utils.js';

export function mountMcpIntegrationModes(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'mcp-integration-lab',
    title: 'MCP 接入模式选择器',
    subtitle: '接入责任与 Transport 分开判断',
    artifactName: 'mcpIntegrationModeDecision',
    artifactNote: '先决定谁管理 Client 与调用，再决定 stdio/HTTP 和身份。',
    completeText: '六种接入模式已进入正确场景。',
    scenarios: [
      { id: 'codex', title: '开发者在 Codex CLI 使用本地文件工具', detail: 'Host 已原生支持 MCP 配置。', answer: 'native', options: [
        { value: 'native', label: '原生 Host 配置' }, { value: 'hosted', label: 'Hosted MCP' }, { value: 'a2a', label: 'A2A' },
      ]},
      { id: 'own-agent', title: '自己的 LangGraph Agent 连接私网课程服务', detail: '需要自定义连接、重试和 Trace。', answer: 'embedded', options: [
        { value: 'embedded', label: '应用内嵌 MCP Client' }, { value: 'plugin', label: 'Codex Plugin' }, { value: 'resource', label: '只放 Resource' },
      ]},
      { id: 'responses', title: '公开 MCP 由 Responses API 代模型调用', detail: '应用不想维护本地 Client。', answer: 'hosted', options: [
        { value: 'hosted', label: 'Hosted MCP' }, { value: 'stdio', label: '浏览器 stdio' }, { value: 'a2a', label: 'A2A' },
      ]},
      { id: 'workspace', title: '企业 ChatGPT 工作空间发布课程审查应用', detail: '需要扫描、RBAC 和动作治理。', answer: 'app', options: [
        { value: 'app', label: 'MCP App' }, { value: 'url', label: '群里发 URL' }, { value: 'function', label: '复制函数' },
      ]},
      { id: 'private', title: 'ChatGPT 访问 On-Prem MCP', detail: '不能直接暴露公网。', answer: 'tunnel', options: [
        { value: 'tunnel', label: 'Gateway / Secure Tunnel' }, { value: 'stdio', label: 'ChatGPT 启动本机进程' }, { value: 'public', label: '关闭认证公开' },
      ]},
      { id: 'reverse', title: '其他 Agent 调用课程审查 Agent', detail: '对外只需要稳定审查结果。', answer: 'server', options: [
        { value: 'server', label: 'Agent-as-MCP-Server' }, { value: 'copy', label: '复制内部 Graph' }, { value: 'root', label: 'Roots' },
      ]},
    ],
  }});
}

export function mountMcpHostMatrix({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const hosts = {
    codex: { label: 'Codex CLI / IDE', transport: 'stdio-http', auth: 'oauth-bearer', output: `[mcp_servers.academy]\nurl = "https://academy-mcp.example.com/mcp"\nauth = "oauth"\ndefault_tools_approval_mode = "writes"` },
    chatgpt: { label: 'ChatGPT Web App', transport: 'remote', auth: 'oauth', output: `Endpoint: https://academy-mcp.example.com/mcp\nAuthentication: OAuth\nScan Tools → Test → Publish` },
    claude: { label: 'Claude Code', transport: 'stdio-http', auth: 'oauth-header', output: `claude mcp add --transport http academy https://academy-mcp.example.com/mcp` },
    vscode: { label: 'VS Code', transport: 'stdio-http', auth: 'oauth-header', output: `{"servers":{"academy":{"type":"http","url":"https://academy-mcp.example.com/mcp"}}}` },
    ci: { label: 'GitHub Actions / CI', transport: 'http', auth: 'machine', output: `client_credentials → short-lived Bearer → /mcp` },
  };
  let active = 'codex';
  const completed = new Set();
  root.innerHTML = `
    <div class="mcp-panel mcp-host-matrix-lab">
      <div class="mcp-toolbar"><div><b>MCP Host Compatibility Matrix</b><small>基线日期 2026-07-23</small></div><button class="mcp-primary" data-save type="button">保存兼容矩阵</button></div>
      <div class="mcp-host-tabs">${Object.entries(hosts).map(([id,host]) => `<button class="mcp-secondary ${id === active ? 'active' : ''}" data-host="${id}" type="button">${host.label}</button>`).join('')}</div>
      <div class="mcp-grid"><section>
        <span class="mcp-label">为当前 Host 选择 Transport</span>
        <div class="mcp-choice-row">
          ${[['stdio-http','stdio + HTTP'],['remote','remote HTTP only'],['http','HTTP'],['stdio','stdio only']].map(([v,l]) => `<label><input type="radio" name="host-transport" value="${v}"> ${l}</label>`).join('')}
        </div>
        <span class="mcp-label">选择认证</span>
        <select data-auth><option value="">请选择</option><option value="oauth-bearer">OAuth / Bearer</option><option value="oauth">OAuth</option><option value="oauth-header">OAuth / Header</option><option value="machine">Client Credentials</option><option value="anonymous">Anonymous</option></select>
        <button class="mcp-secondary" data-check type="button">验证当前 Host</button>
      </section><aside>
        <span class="mcp-label">生成配置</span><pre class="mcp-code" data-config>完成当前 Host 配置后生成。</pre>
        <div class="mcp-result" data-result>完成五类 Host。</div>${teachingNotice()}
      </aside></div>
    </div>`;
  const result = root.querySelector('[data-result]');
  function renderHost() {
    root.querySelectorAll('[data-host]').forEach((button) => button.classList.toggle('active', button.dataset.host === active));
    root.querySelectorAll('input[name="host-transport"]').forEach((input) => { input.checked = false; });
    root.querySelector('[data-auth]').value = '';
  }
  root.querySelectorAll('[data-host]').forEach((button) => button.addEventListener('click', () => { active = button.dataset.host; renderHost(); }));
  root.querySelector('[data-check]').addEventListener('click', () => {
    const host = hosts[active];
    const transport = root.querySelector('input[name="host-transport"]:checked')?.value;
    const auth = root.querySelector('[data-auth]').value;
    if (transport !== host.transport || auth !== host.auth) {
      setResult(result, 'warn', `${host.label} 的运行环境或授权方式不匹配。`);
      return;
    }
    completed.add(active);
    root.querySelector('[data-config]').textContent = host.output;
    setResult(result, 'good', `✓ ${host.label} 配置正确。已完成 ${completed.size}/5。`);
  });
  root.querySelector('[data-save]').addEventListener('click', () => {
    if (completed.size !== Object.keys(hosts).length) {
      setResult(result, 'warn', '请先完成全部五类 Host。');
      return;
    }
    const artifact = { asOf: '2026-07-23', hosts: Object.keys(hosts), note: 'Host 支持范围必须按官方文档定期复核。' };
    artifacts.set('mcpHostCompatibilityMatrix', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ Codex、ChatGPT、Claude Code、VS Code 与 CI 接入矩阵已保存。');
    complete(artifact);
  });
  renderHost();
}

export function mountMcpEmbeddedClient(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'mcp-embedded-client-lab',
    title: '多 Server MCP Client 组装台',
    subtitle: '连接生命周期、工具治理和失败降级',
    artifactName: 'embeddedMcpClientArchitecture',
    artifactNote: '自己的 Host 管理连接、筛选、缓存、重连、Trace 与错误。',
    completeText: '可用于 LangGraph Agent 的 MCP Client 层已经完成。',
    lede: '连接 Academy、GitHub 和 Docs 三个 MCP Server',
    detail: '要求一个 Server 失败时其余连接仍可用，并避免同名 Tool 冲突。',
    checks: [
      { id: 'parallel', label: '并行连接并设置超时', description: '降低启动延迟并隔离失败' },
      { id: 'prefix', label: '为 Tool 加 Server 前缀', description: '避免 search 等同名冲突' },
      { id: 'filter', label: '静态 + 动态 Tool Filter', description: '按用户与运行上下文最小暴露' },
      { id: 'cache', label: '缓存 tools/list 并处理 list_changed', description: '减少远程发现延迟' },
      { id: 'reconnect', label: '只重连失败 Server', description: '不重启全部连接' },
      { id: 'trace', label: '记录 discovery/call/error Trace', description: '可定位协议与业务失败' },
    ],
    selects: [
      { id: 'mode', label: '私网连接方式', correct: 'direct', options: [{ value: 'hosted', label: 'Hosted MCP' }, { value: 'direct', label: '应用直连 Streamable HTTP' }] },
      { id: 'failure', label: '部分 Server 失败', correct: 'degraded', options: [{ value: 'crash', label: '全部退出' }, { value: 'degraded', label: '保留成功连接并标记降级' }] },
    ],
    successCode: `const servers = await connectMcpServers({\n  connectInParallel: true,\n  dropFailedServers: true,\n  includeServerInToolNames: true,\n});`,
  }});
}

export function mountMcpDistributionModes(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'mcp-distribution-lab',
    title: 'MCP 产品分发决策台',
    subtitle: 'Endpoint、App、Plugin 与 Hosted MCP',
    artifactName: 'mcpDistributionPolicy',
    artifactNote: '分发方式匹配个人、团队、工作空间和平台托管需求。',
    completeText: '五类分发场景已形成治理策略。',
    scenarios: [
      { id: 'personal', title: '个人 Codex 本地工具', detail: '无需组织发布。', answer: 'config', options: [
        { value: 'config', label: 'Host 配置' }, { value: 'app', label: '企业 App' }, { value: 'registry', label: '公开商店' },
      ]},
      { id: 'team', title: '团队统一审查 Skill + MCP', detail: '需要固定流程和版本。', answer: 'plugin', options: [
        { value: 'plugin', label: 'Plugin / 受管扩展' }, { value: 'copy', label: '各自复制代码' }, { value: 'prompt', label: '只发 Prompt' },
      ]},
      { id: 'chatgpt', title: '企业 ChatGPT 工作空间', detail: '需要扫描、RBAC、动作控制和发布。', answer: 'app', options: [
        { value: 'app', label: 'ChatGPT MCP App' }, { value: 'stdio', label: '本地 stdio' }, { value: 'anonymous', label: '匿名 URL' },
      ]},
      { id: 'responses', title: 'Responses API 托管远程调用', detail: 'MCP 往返由平台完成。', answer: 'hosted', options: [
        { value: 'hosted', label: 'Hosted MCP Tool' }, { value: 'plugin', label: 'Codex Plugin' }, { value: 'a2a', label: 'A2A' },
      ]},
      { id: 'private', title: 'On-Prem Server 供远程产品访问', detail: '不能公开公网。', answer: 'tunnel', options: [
        { value: 'tunnel', label: '受管 Gateway / Tunnel' }, { value: 'open', label: '关闭认证公开' }, { value: 'stdio', label: '让网页启动进程' },
      ]},
    ],
  }});
}

export function mountMcpAgentAsServer(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'mcp-agent-server-lab',
    title: 'Agent 能力暴露边界选择器',
    subtitle: 'MCP Tool、Task、App Server 或 A2A',
    artifactName: 'agentAsMcpBoundary',
    artifactNote: '对外暴露用户目标，不泄漏内部 Graph；需要丰富生命周期时升级协议。',
    completeText: 'Agent 对外协议边界已明确。',
    scenarios: [
      { id: 'review', title: '审查单节课程并返回报告', detail: '内部 Graph 对调用方不重要。', answer: 'tool', options: [
        { value: 'tool', label: '高层 MCP Tool' }, { value: 'nodes', label: '每个 Node 一个 Tool' }, { value: 'a2a', label: '强制 A2A' },
      ]},
      { id: 'batch', title: '30 分钟全量课程审计', detail: '需要进度和延迟取回。', answer: 'task', options: [
        { value: 'task', label: 'MCP Tool + Task' }, { value: 'sync', label: '阻塞单请求' }, { value: 'resource', label: '固定 Resource' },
      ]},
      { id: 'coding', title: '需要 Thread、Turn、Diff、审批事件的编程 Agent', detail: '调用方需要完整产品生命周期。', answer: 'appserver', options: [
        { value: 'tool', label: '一个字符串 Tool' }, { value: 'appserver', label: '专用 App Server' }, { value: 'prompt', label: 'Prompt' },
      ]},
      { id: 'collab', title: '两个 Agent 分派任务并异步协作', detail: '双方都有任务身份和状态。', answer: 'a2a', options: [
        { value: 'a2a', label: 'A2A / Agent Protocol' }, { value: 'root', label: 'Roots' }, { value: 'stdio', label: '只靠 stdio' },
      ]},
    ],
  }});
}

export const mcpAccessSimulators = {
  'mcp-integration-modes': mountMcpIntegrationModes,
  'mcp-host-matrix': mountMcpHostMatrix,
  'mcp-embedded-client': mountMcpEmbeddedClient,
  'mcp-distribution-modes': mountMcpDistributionModes,
  'mcp-agent-as-server': mountMcpAgentAsServer,
};
