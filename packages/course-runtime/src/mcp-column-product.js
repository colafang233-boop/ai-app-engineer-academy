const artifactMeta = {
  mcpFitDecision: { label: "MCP 适用性决策", description: "函数、API、MCP、App Server 与 A2A 的使用边界" },
  mcpTrustBoundaryMap: { label: "MCP 信任边界拓扑", description: "Host、Client、Server、授权服务器、下游凭证与审批" },
  mcpLifecycleContract: { label: "MCP 生命周期契约", description: "initialize、能力协商、发现、调用与变更通知" },
  mcpPrimitiveCatalog: { label: "Tools / Resources / Prompts 目录", description: "Academy MCP Server 原语与控制关系" },
  mcpClientCapabilityPolicy: { label: "Client Capability Policy", description: "Roots、Sampling、Elicitation、Progress 与 Tasks 的支持边界" },
  mcpIntegrationModeDecision: { label: "MCP 接入模式决策", description: "原生 Host、嵌入 Client、Hosted MCP、App、Tunnel 与反向 Server" },
  mcpHostCompatibilityMatrix: { label: "MCP Host 兼容矩阵", description: "Codex、ChatGPT、Claude Code、VS Code 与 CI 接入方式" },
  embeddedMcpClientArchitecture: { label: "自研 Agent MCP Client 架构", description: "连接、缓存、筛选、重连、Trace 与降级" },
  mcpDistributionPolicy: { label: "MCP 分发与治理策略", description: "Endpoint、Plugin、App、Hosted MCP 与 Tunnel" },
  agentAsMcpBoundary: { label: "Agent-as-MCP 边界", description: "MCP Tool、Task、App Server 与 A2A 的选择" },
  localStdioServerContract: { label: "本地 stdio Server 契约", description: "进程启动、协议流、环境变量、日志与关闭" },
  mcpToolRegistry: { label: "MCP Tool Registry", description: "Schema、结构化输出、错误、幂等、审批与审计" },
  mcpResourceContract: { label: "MCP Resource Contract", description: "URI、Template、MIME、版本、订阅与缓存" },
  mcpPromptNotificationContract: { label: "Prompt 与通知契约", description: "Prompt、Completion、Logging、Progress 与变更通知" },
  mcpClientAdapter: { label: "TypeScript MCP Client Adapter", description: "发现、Server 请求、缓存、取消、重连与错误" },
  mcpTransportDecision: { label: "MCP Transport 决策", description: "stdio、Streamable HTTP、内部 RPC 与旧 SSE" },
  streamableHttpSessionContract: { label: "Streamable HTTP Session 契约", description: "Session、Progress、Tasks、断线恢复与幂等" },
  identityAuthorizationApprovalPolicy: { label: "身份、授权与审批策略", description: "Authentication、Scope、ACL、Approval 与业务门禁" },
  oauthDelegationPolicy: { label: "OAuth 用户委托策略", description: "发现、PKCE、resource、Scope、Audience 与刷新" },
  nonInteractiveAuthGatewayPolicy: { label: "机器身份与 Gateway 策略", description: "API Key、Bearer、Client Credentials、SSO 与 Tunnel" },
  statelessRemoteDeployment: { label: "Cloudflare 无状态 MCP 部署", description: "Streamable HTTP Worker、限流、缓存与回滚" },
  statefulRemoteDeployment: { label: "Cloudflare 有状态 MCP 部署", description: "McpAgent、Durable Objects、Elicitation 与迁移" },
  mcpSecurityThreatModel: { label: "MCP 安全威胁模型", description: "Injection、SSRF、DNS Rebinding、Token 与越权" },
  mcpCompatibilityMigrationReport: { label: "MCP 兼容与迁移报告", description: "Inspector、协议测试、Evals、Host 矩阵与 v1→v2" },
  academyMcpProductionBlueprint: { label: "Academy MCP 生产交付蓝图", description: "跨 Codex、ChatGPT、自研 Agent、CI 的完整交付" },
};

const lessonResults = Object.fromEntries([
  ["lesson-59", "MCP 适用性决策"],
  ["lesson-60", "MCP 信任边界拓扑"],
  ["lesson-61", "MCP 生命周期契约"],
  ["lesson-62", "Tools / Resources / Prompts 目录"],
  ["lesson-63", "Client Capability Policy"],
  ["lesson-64", "MCP 接入模式决策"],
  ["lesson-65", "MCP Host 兼容矩阵"],
  ["lesson-66", "自研 Agent MCP Client 架构"],
  ["lesson-67", "MCP 分发与治理策略"],
  ["lesson-68", "Agent-as-MCP 边界"],
  ["lesson-69", "本地 stdio Server 契约"],
  ["lesson-70", "MCP Tool Registry"],
  ["lesson-71", "MCP Resource Contract"],
  ["lesson-72", "Prompt 与通知契约"],
  ["lesson-73", "TypeScript MCP Client Adapter"],
  ["lesson-74", "MCP Transport 决策"],
  ["lesson-75", "Streamable HTTP Session 契约"],
  ["lesson-76", "身份、授权与审批策略"],
  ["lesson-77", "OAuth 用户委托策略"],
  ["lesson-78", "机器身份与 Gateway 策略"],
  ["lesson-79", "Cloudflare 无状态 MCP 部署"],
  ["lesson-80", "Cloudflare 有状态 MCP 部署"],
  ["lesson-81", "MCP 安全威胁模型"],
  ["lesson-82", "MCP 兼容与迁移报告"],
  ["lesson-83", "Academy MCP 生产交付蓝图"],
]);

function preview(name, value) {
  if (name === 'mcpFitDecision') return `<p>已为 <b>${Object.keys(value?.decisions ?? {}).length}</b> 类能力选择最小可靠连接方式。</p>`;
  if (name === 'mcpTrustBoundaryMap') return '<p>Host、Client、Server、OAuth 与下游凭证已经分离。</p>';
  if (name === 'mcpLifecycleContract') return `<p>协议版本 <b>${value?.protocolVersion ?? '2025-11-25'}</b>；初始化、发现与通知完整。</p>`;
  if (name === 'mcpPrimitiveCatalog') return `<p>已分类 <b>${Object.keys(value?.catalog ?? {}).length}</b> 项 Tool、Resource、Template 与 Prompt。</p>`;
  if (name === 'mcpClientCapabilityPolicy') return '<p>Roots、Sampling、Elicitation、Progress 和 Tasks 均按 capability 使用。</p>';
  if (name === 'mcpIntegrationModeDecision') return '<p>原生 Host、嵌入 Client、Hosted MCP、App、Tunnel 与反向 Server 已分工。</p>';
  if (name === 'mcpHostCompatibilityMatrix') return `<p>兼容矩阵包含 <b>${value?.hosts?.length ?? 0}</b> 类真实 Host，基线日期 2026-07-23。</p>`;
  if (name === 'embeddedMcpClientArchitecture') return '<p>多 Server Client 已配置并行连接、前缀、筛选、缓存、降级和 Trace。</p>';
  if (name === 'mcpDistributionPolicy') return '<p>个人、团队、工作空间和平台托管使用不同分发方式。</p>';
  if (name === 'agentAsMcpBoundary') return '<p>Agent 能力按 Tool、Task、App Server 与 A2A 选择对外边界。</p>';
  if (name === 'localStdioServerContract') return '<p>stdout 保持纯协议流；日志、凭证和退出行为已规范。</p>';
  if (name === 'mcpToolRegistry') return '<p>读写 Tool 已包含 Schema、结构化输出、幂等、审批和审计。</p>';
  if (name === 'mcpResourceContract') return `<p>Resource 目录包含 <b>${Object.keys(value?.catalog ?? {}).length}</b> 项 URI、Template、订阅与动态查询。</p>`;
  if (name === 'mcpPromptNotificationContract') return '<p>Prompt、Completion、Progress、Logging 和列表变更已形成契约。</p>';
  if (name === 'mcpClientAdapter') return '<p>完整 Client Adapter 管理发现、缓存、Server 请求、取消、重连与错误。</p>';
  if (name === 'mcpTransportDecision') return '<p>本地 stdio、远程 Streamable HTTP、内部 RPC 与遗留 SSE 已分场景。</p>';
  if (name === 'streamableHttpSessionContract') return '<p>Session、Task、Progress、断线恢复和幂等已分层。</p>';
  if (name === 'identityAuthorizationApprovalPolicy') return `<p>已配置 <b>${value?.gates?.length ?? 7}</b> 层身份、权限、审批与审计门禁。</p>`;
  if (name === 'oauthDelegationPolicy') return '<p>OAuth 使用 PKCE、resource、最小 Scope 和 Audience 验证。</p>';
  if (name === 'nonInteractiveAuthGatewayPolicy') return `<p>已覆盖 <b>${Object.keys(value?.decisions ?? {}).length}</b> 类用户、机器与私网身份场景。</p>`;
  if (name === 'statelessRemoteDeployment') return '<p>公开只读 Academy MCP 使用无状态 Worker 与标准 /mcp 端点。</p>';
  if (name === 'statefulRemoteDeployment') return '<p>多轮审查 Session 使用 McpAgent + Durable Objects，业务记录写正式数据库。</p>';
  if (name === 'mcpSecurityThreatModel') return `<p>已阻断 <b>${Object.keys(value?.decisions ?? {}).length}</b> 条 Injection、SSRF、Token 和越权攻击链。</p>`;
  if (name === 'mcpCompatibilityMigrationReport') return '<p>Inspector、协议测试、Evals、Host 矩阵、安全和 v1→v2 迁移均纳入门禁。</p>';
  if (name === 'academyMcpProductionBlueprint') return '<p>Academy MCP 已完成 Codex、ChatGPT、自研 Agent、CI、OAuth、Cloudflare 和回滚验收。</p>';
  return null;
}

function renderKnowledgePanel(lesson) {
  const prerequisites = lesson.prerequisites ?? [];
  const terms = lesson.terms ?? [];
  if (!prerequisites.length && !terms.length) return '';
  return `<section class="mcp-knowledge-panel" data-mcp-knowledge><div class="mcp-prerequisites"><span>PREREQUISITES</span><h3>开始本课前，你需要知道</h3><div>${prerequisites.map((item) => `<article><i>✓</i><b>${item}</b></article>`).join('')}</div></div><div class="mcp-glossary"><span>TERMS IN THIS LESSON</span><h3>本课专业名词</h3><div>${terms.map((item) => `<article><b>${item.name}</b><p>${item.definition}</p></article>`).join('')}</div></div></section>`;
}

export function installMcpColumnProduct(app) {
  const baseMeta = app.artifactMeta.bind(app);
  const basePreview = app.artifactPreview.bind(app);
  const baseResult = app.resultForLesson.bind(app);
  const baseRenderLesson = app.renderLesson.bind(app);

  app.artifactMeta = function mcpArtifactMetadata(name) { return artifactMeta[name] ?? baseMeta(name); };
  app.artifactPreview = function mcpArtifactPreview(name, value) { return preview(name, value) ?? basePreview(name, value); };
  app.resultForLesson = function mcpResultForLesson(lessonId) { return lessonResults[lessonId] ?? baseResult(lessonId); };

  app.renderLesson = function renderMcpLesson(lessonId) {
    baseRenderLesson(lessonId);
    const lesson = this.lessonById(lessonId);
    if (lesson?.columnId !== 'column-06') return;
    const hero = this.content.querySelector('.cr-hero');
    if (!hero || this.content.querySelector('[data-mcp-knowledge]')) return;
    hero.insertAdjacentHTML('afterend', renderKnowledgePanel(lesson));
  };

  app.renderArtifacts = function renderCompleteProjectArtifacts() {
    const target = this.root.querySelector('[data-artifacts]');
    const progressTarget = this.root.querySelector('[data-artifact-progress]');
    if (!target || !progressTarget) return;
    const data = this.artifacts.get();
    const names = this.artifactNames();
    const targetCount = 85;
    const percent = Math.min(100, Math.round(names.length / targetCount * 100));
    progressTarget.innerHTML = `<span>项目完成度</span><i><em style="width:${percent}%"></em></i><b>${names.length} / ${targetCount}</b>`;
    target.innerHTML = names.length
      ? names.map((name, index) => this.renderArtifactCard(name, data[name], index)).join('')
      : '<div class="empty-artifacts"><span>◇</span><b>你的项目成果会出现在这里</b><p>每完成一个 MCP 协议、接入、授权、部署或安全实验，都会保存一份可复用的工程契约。</p></div>';
  };
}
