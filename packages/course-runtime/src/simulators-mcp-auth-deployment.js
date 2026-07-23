import { mountChecklistLab, mountDecisionSeries, once, setResult, teachingNotice } from './mcp-lab-utils.js';

export function mountMcpTransportLab(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'mcp-transport-lab',
    title: 'MCP Transport 决策台',
    subtitle: '本地、远程、内部绑定与遗留兼容',
    artifactName: 'mcpTransportDecision',
    artifactNote: '新远程 Server 以 Streamable HTTP 为主，stdio 用于本地，SSE 仅兼容。',
    completeText: '五类部署的 Transport 已正确选择。',
    scenarios: [
      { id: 'local', title: 'Codex 启动本地文件 Server', detail: '同机子进程、低延迟。', answer: 'stdio', options: [
        { value: 'stdio', label: 'stdio' }, { value: 'http', label: '公开 HTTP' }, { value: 'sse', label: 'Legacy SSE' },
      ]},
      { id: 'remote', title: '公共 Academy SaaS', detail: '多个远程 Host 与 OAuth。', answer: 'http', options: [
        { value: 'http', label: 'Streamable HTTP' }, { value: 'stdio', label: 'stdio' }, { value: 'rpc', label: '内部 RPC only' },
      ]},
      { id: 'cloudflare', title: '同一个 Cloudflare Worker 内部 Agent 调 McpAgent', detail: '无需公网和 OAuth。', answer: 'rpc', options: [
        { value: 'rpc', label: 'Cloudflare RPC binding' }, { value: 'sse', label: 'Legacy SSE' }, { value: 'stdio', label: 'stdio' },
      ]},
      { id: 'legacy', title: '旧 Client 只支持 /sse', detail: '过渡期兼容。', answer: 'legacy', options: [
        { value: 'legacy', label: '临时提供 SSE 兼容并计划迁移' }, { value: 'default', label: '把 SSE 写成新标准' }, { value: 'none', label: '静默失败' },
      ]},
      { id: 'chatgpt', title: 'ChatGPT 远程 App', detail: '产品运行在远程基础设施。', answer: 'http', options: [
        { value: 'stdio', label: '启动用户本机进程' }, { value: 'http', label: 'Streamable HTTP /mcp' }, { value: 'file', label: '读取配置文件' },
      ]},
    ],
  }});
}

export function mountMcpSessionResume(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'mcp-session-lab',
    title: 'Remote Session 与 Task 恢复演练',
    subtitle: '连接状态、任务状态和业务幂等分层',
    artifactName: 'streamableHttpSessionContract',
    artifactNote: '断线恢复先查询现有状态，不盲目重复副作用。',
    completeText: 'Session、Progress、Tasks、取消与幂等恢复契约已完成。',
    lede: 'trigger_preview_build 在 60% 时网络中断',
    detail: 'Client 不知道构建是否仍在运行。',
    checks: [
      { id: 'session', label: '保存 MCP-Session-Id', description: '有状态 Server 路由回原 Session' },
      { id: 'version', label: '发送 MCP-Protocol-Version', description: '明确协议版本' },
      { id: 'progress', label: '使用 Progress Token', description: '报告阶段与百分比' },
      { id: 'task', label: '长任务返回 Task ID', description: '允许稍后查询结果' },
      { id: 'idempotency', label: '写操作带 idempotencyKey', description: '重复请求返回原状态' },
      { id: 'resume', label: '重连后查询 Task/幂等状态', description: '确认事实再继续' },
      { id: 'cancel', label: '支持取消与资源清理', description: '取消不伪装成功' },
    ],
    selects: [
      { id: 'retry', label: '断线后的第一动作', correct: 'query', options: [{ value: 'repeat', label: '重新创建构建' }, { value: 'query', label: '查询现有 Task/幂等状态' }] },
      { id: 'unknown', label: '业务状态未知', correct: 'pending', options: [{ value: 'success', label: '标记成功' }, { value: 'pending', label: '标记 pending/unknown 并继续确认' }] },
    ],
    successCode: `POST /mcp\nMCP-Session-Id: session_123\nidempotencyKey: preview_2026_07_23\n→ tasks/get(build_42)`,
  }});
}

export function mountMcpAuthChain({ root, config, artifacts, onComplete }) {
  const complete = once(onComplete);
  const gates = [
    ['identity','Authentication','主体是谁'],
    ['scope','Authorization Scope','被委托哪些能力'],
    ['acl','Tenant / Row ACL','可以访问哪些数据'],
    ['allow','Tool Allow List','Host 是否向模型暴露'],
    ['approval','Current Approval','本次动作是否获批'],
    ['business','Business Rule','金额、环境、状态是否合法'],
    ['audit','Audit','记录谁在何时执行了什么'],
  ];
  root.innerHTML = `
    <div class="mcp-panel mcp-auth-chain-lab">
      <div class="mcp-toolbar"><div><b>身份—权限—审批七道门</b><small>登录不等于本次动作获准</small></div><button class="mcp-primary" data-run type="button">执行发布动作</button></div>
      <div class="mcp-auth-chain">${gates.map(([id,label,desc], index) => `<label data-gate-card="${id}"><span>${String(index + 1).padStart(2,'0')}</span><input type="checkbox" data-gate="${id}"><div><b>${label}</b><small>${desc}</small></div></label>`).join('')}</div>
      <div class="mcp-panel-footer"><div class="mcp-result" data-result>生产部署需要通过全部七层。</div>${teachingNotice()}</div>
    </div>`;
  const result = root.querySelector('[data-result]');
  root.querySelector('[data-run]').addEventListener('click', () => {
    const missing = gates.filter(([id]) => !root.querySelector(`[data-gate="${id}"]`).checked);
    gates.forEach(([id]) => root.querySelector(`[data-gate-card="${id}"]`).classList.toggle('pass', root.querySelector(`[data-gate="${id}"]`).checked));
    if (missing.length) {
      setResult(result, 'warn', `阻止执行：${missing.map(([,label]) => label).join('、')} 未通过。`);
      return;
    }
    const artifact = { gates: gates.map(([id]) => id), authenticationIsNotApproval: true, productionStepUp: true };
    artifacts.set('identityAuthorizationApprovalPolicy', artifact, { lessonId: config.lessonId });
    setResult(result, 'good', '✓ 身份、Scope、ACL、Tool 可见性、审批、业务规则与审计全部通过。');
    complete(artifact);
  });
}

export function mountMcpOAuthDelegation(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'mcp-oauth-lab',
    title: 'OAuth 2.1 用户委托流程',
    subtitle: '发现、PKCE、resource、Scope、Audience 与刷新',
    artifactName: 'oauthDelegationPolicy',
    artifactNote: 'HTTP MCP 作为 Resource Server，验证最小委托和 Token audience。',
    completeText: 'Academy MCP 用户委托 OAuth 契约已经完成。',
    lede: '用户只授权读取课程与保存质量问题',
    detail: '不能获得生产部署权限，也不能把 Token 转发给 GitHub。',
    checks: [
      { id: 'metadata', label: '发布 Protected Resource Metadata', description: 'Client 发现授权服务器' },
      { id: 'pkce', label: 'Authorization Code + PKCE', description: '公开 Client 防止授权码截获' },
      { id: 'resource', label: '授权和 Token 请求携带 resource', description: '绑定 Academy MCP audience' },
      { id: 'scope', label: '最小 Scopes', description: 'lessons.read + findings.write' },
      { id: 'bearer', label: 'Authorization: Bearer Header', description: '不放 URL 查询参数' },
      { id: 'audience', label: '验证 issuer / aud / exp / scope', description: '拒绝其他 API Token' },
      { id: 'refresh', label: '需要长期连接时配置 refresh/offline', description: '可撤销和轮换' },
      { id: 'downstream', label: '下游使用独立 Token', description: '阻止 Token Passthrough' },
    ],
    selects: [
      { id: 'scope-set', label: 'Scope 集', correct: 'minimal', options: [{ value: 'admin', label: 'academy.*' }, { value: 'minimal', label: 'lessons.read findings.write' }] },
      { id: 'aud', label: 'Token audience', correct: 'academy', options: [{ value: 'github', label: 'api.github.com' }, { value: 'academy', label: 'academy-mcp.example.com' }] },
    ],
    successCode: `GET /.well-known/oauth-protected-resource\n→ authorization_code + PKCE\n→ resource=https://academy-mcp.example.com\n→ Bearer token (aud=academy-mcp)`,
  }});
}

export function mountMcpAuthGateway(args) {
  return mountDecisionSeries({ ...args, definition: {
    className: 'mcp-auth-gateway-lab',
    title: '主体与网络边界认证选择器',
    subtitle: '用户、机器、工作负载、私网和公共资源',
    artifactName: 'nonInteractiveAuthGatewayPolicy',
    artifactNote: '交互用户、后台机器和私网 Host 使用不同身份入口。',
    completeText: '七类主体的认证与 Gateway 策略已完成。',
    scenarios: [
      { id: 'stdio', title: '个人 Codex 本地 stdio', detail: '同机进程，需要 GitHub Token。', answer: 'env', options: [
        { value: 'env', label: 'Host 环境变量' }, { value: 'oauth', label: '强制浏览器 OAuth' }, { value: 'url', label: 'Token 放 URL' },
      ]},
      { id: 'chatgpt', title: 'ChatGPT 用户访问私有课程', detail: '需要用户委托与长期连接。', answer: 'oauth', options: [
        { value: 'oauth', label: 'OAuth + scopes/refresh' }, { value: 'apikey', label: '所有人共享 API Key' }, { value: 'anonymous', label: '匿名' },
      ]},
      { id: 'ci', title: 'GitHub Actions 每晚评测', detail: '没有交互用户。', answer: 'machine', options: [
        { value: 'machine', label: 'Client Credentials / Workload Identity' }, { value: 'personal', label: '员工 refresh token' }, { value: 'public', label: '匿名写' },
      ]},
      { id: 'worker', title: 'Cloudflare Worker 调内部 MCP', detail: '同一平台服务身份。', answer: 'workload', options: [
        { value: 'workload', label: 'Service/Workload identity 或内部 RPC' }, { value: 'human', label: '人工扫码登录' }, { value: 'cookie', label: '浏览器 Cookie' },
      ]},
      { id: 'onprem', title: 'ChatGPT 访问 On-Prem Server', detail: '禁止直接暴露公网。', answer: 'tunnel', options: [
        { value: 'tunnel', label: 'Secure Tunnel / Gateway + SSO' }, { value: 'open', label: '公开且无认证' }, { value: 'stdio', label: '网页直接启动进程' },
      ]},
      { id: 'public', title: '公开协议术语 Resource', detail: '只读且无用户数据。', answer: 'anonymous', options: [
        { value: 'anonymous', label: '匿名 + 限流' }, { value: 'admin', label: '管理员 Scope' }, { value: 'machine', label: '机器写权限' },
      ]},
      { id: 'vendor', title: '第三方 SaaS 固定集成', detail: '短期无法实现完整用户 OAuth。', answer: 'bearer', options: [
        { value: 'bearer', label: '短期 Bearer/API Key + 轮换/Scope' }, { value: 'query', label: 'URL Token' }, { value: 'none', label: '无审计共享密码' },
      ]},
    ],
  }});
}

export function mountMcpCloudflareStateless(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'mcp-cf-stateless-lab',
    title: 'Cloudflare 无状态 MCP 部署台',
    subtitle: '最简单可靠的远程只读入口',
    artifactName: 'statelessRemoteDeployment',
    artifactNote: '无 Session 需求时使用普通 Worker 与 Streamable HTTP。',
    completeText: 'Academy Public MCP 已形成无状态 Cloudflare 部署方案。',
    lede: '公开 search_lessons、read_course 和协议术语 Resources',
    detail: '只读、幂等，不依赖会话内存。',
    checks: [
      { id: 'handler', label: 'createMcpHandler 或 Raw Web Transport', description: '标准 /mcp Streamable HTTP' },
      { id: 'secrets', label: '密钥存 Wrangler Secrets', description: '不写代码和变量明文' },
      { id: 'origin', label: '验证 Origin / Host', description: '降低 DNS Rebinding 风险' },
      { id: 'limits', label: '限流、大小和超时', description: '防止匿名资源滥用' },
      { id: 'readonly', label: '公开入口只暴露读 Tool', description: '写操作进入授权 Server' },
      { id: 'cache', label: 'Resource 缓存含版本失效', description: '降低读取成本' },
      { id: 'inspector', label: 'Inspector + 真实 Host 验证', description: '本地与远程均测试' },
      { id: 'rollback', label: '保留上一 Worker 版本', description: '故障可回滚' },
    ],
    selects: [
      { id: 'state', label: 'Session State', correct: 'none', options: [{ value: 'global', label: '模块全局变量' }, { value: 'none', label: '不依赖实例内存' }] },
      { id: 'transport', label: '远程 Transport', correct: 'http', options: [{ value: 'sse', label: 'Legacy SSE only' }, { value: 'http', label: 'Streamable HTTP' }] },
    ],
    successCode: `export default {\n  fetch: createMcpHandler(server, { route: "/mcp" })\n};`,
  }});
}

export function mountMcpCloudflareStateful(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'mcp-cf-stateful-lab',
    title: 'Durable Objects 有状态 MCP 设计台',
    subtitle: '每 Session 顺序一致、可恢复、可迁移',
    artifactName: 'statefulRemoteDeployment',
    artifactNote: '仅在持久会话、Elicitation 或长任务需要时引入 McpAgent。',
    completeText: '有状态审查 Session 的 Durable Objects 架构已完成。',
    lede: '多轮质量审查：收集标准 → 运行检查 → 等待人工补充 → 恢复发布',
    detail: '连接可能跨实例，业务记录必须永久保存。',
    checks: [
      { id: 'agent', label: 'McpAgent + Durable Object', description: '每 Session 稳定路由' },
      { id: 'state', label: '会话 State 明确定义', description: '进度、用户输入、Task 与恢复点' },
      { id: 'elicitation', label: '能力协商后使用 Elicitation', description: '无支持时返回 needs_input' },
      { id: 'serial', label: '同 Session 顺序执行', description: '避免并发状态覆盖' },
      { id: 'database', label: '最终业务记录写正式数据库', description: 'DO 不替代业务事实库' },
      { id: 'migration', label: 'State version 与 migration', description: '升级恢复旧 Session' },
      { id: 'ttl', label: 'TTL、删除和隐私清理', description: '会话不过期会积累数据' },
      { id: 'resume', label: '断线重连验证', description: '恢复原 Session 和 Task' },
    ],
    selects: [
      { id: 'need', label: '是否值得有状态', correct: 'yes', options: [{ value: 'no', label: '所有过程均一次请求' }, { value: 'yes', label: '多轮 Elicitation + 长任务恢复' }] },
      { id: 'record', label: '永久质量问题', correct: 'db', options: [{ value: 'memory', label: '对象内存' }, { value: 'db', label: '业务数据库' }] },
    ],
    successCode: `export class AcademyMCP extends McpAgent {\n  initialState = { phase: "collecting", taskId: null };\n}`,
  }});
}

export const mcpAuthDeploymentSimulators = {
  'mcp-transport-lab': mountMcpTransportLab,
  'mcp-session-resume': mountMcpSessionResume,
  'mcp-auth-chain': mountMcpAuthChain,
  'mcp-oauth-delegation': mountMcpOAuthDelegation,
  'mcp-auth-gateway': mountMcpAuthGateway,
  'mcp-cloudflare-stateless': mountMcpCloudflareStateless,
  'mcp-cloudflare-stateful': mountMcpCloudflareStateful,
};
