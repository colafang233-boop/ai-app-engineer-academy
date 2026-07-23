import { official, prediction, reveal, sources, term, transfer } from './column-06-mcp-common.js';

export const mcpLessons73To78 = [
  {
    id: 'lesson-73', number: 73, columnId: 'column-06', shortTitle: "开发完整 TypeScript MCP Client",
    title: "一个可靠 MCP Client 除了 callTool，还要管理什么？",
    titleHtml: "连接只是开始，<span class=\"cr-marker\">发现、缓存、通知和失败都要有策略</span>",
    eyebrow: 'TYPESCRIPT MCP CLIENT · LESSON 73',
    description: "实现连接、initialize、list/get/read/call、Server-initiated 请求、缓存、通知、取消、重连与错误分层。",
    prerequisites: ["MCP 生命周期", "AbortController", "缓存失效"],
    terms: [term("Server-initiated Request", "Server 向 Client 发起 Sampling、Elicitation 等需要响应的请求。"), term("Tool Cache", "缓存发现结果，并在变更通知或版本变化时失效。"), term("Cancellation", "调用方终止长请求并让资源及时释放。")],
    officialReference: official(sources.clients, sources.sdkV1, sources.lifecycle),
    stages: [
      prediction("MCP Client 只实现 tools/list 与 tools/call，就能兼容所有 Server 功能吗？", "实现连接、initialize、list/get/read/call、Server-initiated 请求、缓存、通知、取消、重连与错误分层。", "no", [
        { value: "yes", label: "MCP 只有 Tool" },
        { value: "no", label: "不能", description: "还可能有 Resources、Prompts、通知和 Client features" },
        { value: "http", label: "HTTP 会自动补齐所有能力" }
      ], "✓ 对。客户端完整性取决于声明并实现的能力。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-client-workbench", title: "组装 Academy TypeScript Client", description: "配置 Transport、能力、处理器、缓存、超时、取消、重连、错误和多 Server 管理。", config: {} },
      reveal("Client 是协议适配层，也是可靠性边界", "不要让业务 Node 直接拼 JSON-RPC。", "<p>高层 Client 负责初始化、发现、调用、Server 请求处理、通知、超时、取消和重连。业务 Agent 只消费经过筛选的能力与结构化结果。</p>"),
      transfer("远程 Server tools/list 延迟高但 Schema 很少变化，怎样优化？", "实现连接、initialize、list/get/read/call、Server-initiated 请求、缓存、通知、取消、重连与错误分层。", "cache", [
        { value: "cache", label: "缓存工具列表，并在 list_changed 或版本变化时失效" },
        { value: "never", label: "每个 Token 都重新 list", feedback: "会放大延迟。" },
        { value: "forever", label: "永久缓存且忽略通知", feedback: "会使用陈旧 Schema。" }
      ], "✓ 对。缓存必须有明确失效条件。"),
    ],
  },
  {
    id: 'lesson-74', number: 74, columnId: 'column-06', shortTitle: "stdio、Streamable HTTP 与旧 SSE",
    title: "本地子进程和远程服务，为什么不能只换一个 URL 就算完成迁移？",
    titleHtml: "Transport 改变生命周期、并发和安全，<span class=\"cr-marker\">不只是地址变化</span>",
    eyebrow: 'TRANSPORT DECISION · LESSON 74',
    description: "比较 stdio、Streamable HTTP、Cloudflare 内部 RPC 与旧 SSE，理解连接、身份、流式和部署边界。",
    prerequisites: ["HTTP POST/SSE", "子进程通信", "OAuth Resource Server"],
    terms: [term("Streamable HTTP", "远程标准 Transport，使用单一 MCP Endpoint 和 HTTP 消息。"), term("Legacy SSE", "旧远程 Transport，新项目不应作为默认方案。"), term("Internal RPC", "同一云平台内部直接调用的非标准部署优化。")],
    officialReference: official(sources.transports, sources.cloudflareRemote, sources.cloudflareClient),
    stages: [
      prediction("新远程 MCP Server 应继续把旧 SSE 作为唯一默认 Transport 吗？", "比较 stdio、Streamable HTTP、Cloudflare 内部 RPC 与旧 SSE，理解连接、身份、流式和部署边界。", "no", [
        { value: "yes", label: "SSE 是最新标准" },
        { value: "no", label: "不应", description: "新项目优先 Streamable HTTP" },
        { value: "stdio", label: "远程只能 stdio" }
      ], "✓ 对。旧 SSE 只用于兼容遗留 Client。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-transport-lab", title: "为不同部署选择 Transport", description: "比较本地 IDE、公共 SaaS、Cloudflare 内部 Agent、遗留 Client 和高并发远程 Server。", config: {} },
      reveal("Transport 决定连接与授权模型", "本地与远程是不同运行问题。", "<p>stdio 绑定本地进程；Streamable HTTP 面向多远程 Client 并可配 OAuth；SSE 是兼容旧方案；Cloudflare RPC 只适合内部绑定，不是通用 MCP 客户端入口。</p>"),
      transfer("Academy MCP 要供 Codex、ChatGPT 和自研 SaaS 共同访问，应提供什么？", "比较 stdio、Streamable HTTP、Cloudflare 内部 RPC 与旧 SSE，理解连接、身份、流式和部署边界。", "http", [
        { value: "http", label: "标准 Streamable HTTP /mcp 端点" },
        { value: "rpc", label: "只提供 Cloudflare RPC", feedback: "外部 Host 无法使用内部绑定。" },
        { value: "sse", label: "只提供旧 /sse", feedback: "新集成不应锁定弃用 Transport。" }
      ], "✓ 对。跨产品远程复用需要标准 HTTP Transport。"),
    ],
  },
  {
    id: 'lesson-75', number: 75, columnId: 'column-06', shortTitle: "Session、恢复、Progress 与 Tasks",
    title: "远程连接断开后，怎样判断要重连、恢复还是重新执行？",
    titleHtml: "长任务必须有身份、状态与幂等语义，<span class=\"cr-marker\">不能只靠浏览器一直在线</span>",
    eyebrow: 'REMOTE SESSION & TASKS · LESSON 75',
    description: "操作 MCP-Session-Id、协议版本 Header、断线恢复、Progress、取消、幂等和实验性 Tasks。",
    prerequisites: ["HTTP Session", "幂等请求", "长任务状态机"],
    terms: [term("MCP Session ID", "Server 为有状态 Streamable HTTP 会话分配的标识。"), term("Resumability", "断线后继续接收事件或查询状态，而不是盲目重跑。"), term("Deferred Result", "长任务先返回任务标识，之后查询状态和结果。")],
    officialReference: official(sources.transports, sources.tasks, sources.cloudflareRemote),
    stages: [
      prediction("远程调用断线后，无条件重发写 Tool 是安全恢复方式吗？", "操作 MCP-Session-Id、协议版本 Header、断线恢复、Progress、取消、幂等和实验性 Tasks。", "no", [
        { value: "yes", label: "网络错误一定没执行" },
        { value: "no", label: "不是", description: "需要幂等键、任务状态或 Server 恢复语义" },
        { value: "oauth", label: "OAuth 会自动回滚业务" }
      ], "✓ 对。Transport 重试不能替代业务幂等。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-session-resume", title: "演练远程会话与长任务恢复", description: "配置 Session ID、Last-Event-ID、Progress Token、取消、Task 查询和幂等写入，注入三次断线。", config: {} },
      reveal("连接状态和业务状态必须分开", "HTTP 重连成功不代表业务动作可以重复。", "<p>有状态 Server 可使用 Session ID；长请求使用 Progress；实验性 Tasks 支持延迟结果。任何写操作仍需幂等键和审计状态，Client 要区分连接失败、协议失败与业务未知状态。</p>"),
      transfer("触发预览构建后连接断开，Client 首先应该怎么做？", "操作 MCP-Session-Id、协议版本 Header、断线恢复、Progress、取消、幂等和实验性 Tasks。", "status", [
        { value: "status", label: "使用幂等键或 Task ID 查询现有状态" },
        { value: "retry", label: "立即创建第二个构建", feedback: "可能重复消耗和发布。" },
        { value: "guess", label: "假设失败并返回错误", feedback: "实际构建可能仍在进行。" }
      ], "✓ 对。恢复先确认事实，再决定重试。"),
    ],
  },
  {
    id: 'lesson-76', number: 76, columnId: 'column-06', shortTitle: "Authentication、Authorization 与 Approval",
    title: "已经登录并拥有 Scope，为什么 Tool 仍可能要求这一次确认？",
    titleHtml: "身份、权限与单次同意，<span class=\"cr-marker\">是三道不同的门</span>",
    eyebrow: 'IDENTITY, AUTHORIZATION & APPROVAL · LESSON 76',
    description: "建立 Authentication → Scope/ACL → Tool Allow List → Approval → Business Rule → Audit 的完整权限链。",
    prerequisites: ["身份认证", "RBAC/Scope", "Human-in-the-loop"],
    terms: [term("Authentication", "确认调用主体是谁。"), term("Authorization", "判断主体是否有权访问资源或动作。"), term("Approval", "针对当前具体动作，在执行前获得用户或策略同意。")],
    officialReference: official(sources.authorization, sources.security, sources.codex, sources.chatgpt),
    stages: [
      prediction("用户拥有 findings.write Scope，模型就能静默删除整个专栏吗？", "建立 Authentication → Scope/ACL → Tool Allow List → Approval → Business Rule → Audit 的完整权限链。", "no", [
        { value: "yes", label: "Scope 已覆盖所有写操作" },
        { value: "no", label: "不能", description: "还需要 Tool 级权限、审批和业务约束" },
        { value: "schema", label: "只要参数通过 Schema" }
      ], "✓ 对。授权范围不等于当前高风险操作已获批准。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-auth-chain", title: "穿过六层权限门禁", description: "为匿名读取、保存问题、创建 GitHub Issue 和生产部署配置身份、Scope、ACL、Tool 可见性、审批与审计。", config: {} },
      reveal("权限控制是多层交集", "任何一层都不能由 Prompt 代替。", "<p>身份决定主体；Scope/RBAC 决定可做范围；数据 ACL 决定可见记录；Host 决定 Tool 是否暴露与是否审批；业务规则验证动作；审计记录最终证据。</p>"),
      transfer("CI 机器身份有 deploy.trigger Scope，但部署目标是生产环境，合理策略是什么？", "建立 Authentication → Scope/ACL → Tool Allow List → Approval → Business Rule → Audit 的完整权限链。", "stepup", [
        { value: "stepup", label: "仍要求环境策略、变更门禁或人工审批" },
        { value: "auto", label: "机器 Token 存在就全自动", feedback: "生产风险需要独立门禁。" },
        { value: "prompt", label: "让模型自行评估", feedback: "模型不是授权主体。" }
      ], "✓ 对。高风险动作可以在授权之上增加 Step-up。"),
    ],
  },
  {
    id: 'lesson-77', number: 77, columnId: 'column-06', shortTitle: "OAuth 2.1 用户委托授权",
    title: "MCP Client 怎样让用户只授权“读课程”，而不是交出全部账号权限？",
    titleHtml: "使用标准发现、PKCE、Scope 和 Audience，<span class=\"cr-marker\">完成最小委托</span>",
    eyebrow: 'OAUTH DELEGATED AUTHORIZATION · LESSON 77',
    description: "完成 Protected Resource Metadata、Authorization Server 发现、PKCE、resource、Scope、Token、刷新与撤销。",
    prerequisites: ["OAuth Authorization Code", "PKCE", "JWT Audience"],
    terms: [term("Protected Resource Metadata", "MCP Server 发布其授权服务器和资源信息的发现文档。"), term("PKCE", "公开客户端用代码挑战防止授权码被截获。"), term("Audience", "Token 明确授权给哪个 Resource Server 使用。")],
    officialReference: official(sources.authorization, sources.cloudflareAuth, sources.chatgpt),
    stages: [
      prediction("MCP Access Token 可以放在 URL 查询参数中方便调试吗？", "完成 Protected Resource Metadata、Authorization Server 发现、PKCE、resource、Scope、Token、刷新与撤销。", "no", [
        { value: "yes", label: "HTTPS 下完全安全" },
        { value: "no", label: "不应", description: "应使用 Authorization: Bearer，并避免 URL 泄漏" },
        { value: "cookie", label: "规范要求只能 Cookie" }
      ], "✓ 对。URL 会进入日志、历史和代理链。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-oauth-delegation", title: "完成 Academy MCP OAuth 授权流", description: "选择发现端点、PKCE、resource、read/write Scope、offline_access、Audience 验证和 Token 撤销。", config: {} },
      reveal("MCP Server 是 OAuth Resource Server", "用户委托的是有限访问，不是共享下游密码。", "<p>Client 发现授权服务器，使用 Authorization Code + PKCE，声明 resource 与 scopes，Server 验证签名、过期、issuer、audience 和权限。需要长期连接时还要正确处理 refresh token。</p>"),
      transfer("Token 的 aud 是另一个 API，但 Scope 名看起来匹配，MCP Server 能接受吗？", "完成 Protected Resource Metadata、Authorization Server 发现、PKCE、resource、Scope、Token、刷新与撤销。", "reject", [
        { value: "reject", label: "拒绝，Audience 不匹配" },
        { value: "accept", label: "Scope 相同即可", feedback: "会造成 Token Confusion。" },
        { value: "forward", label: "转发给下游试试", feedback: "属于危险 Token Passthrough。" }
      ], "✓ 对。Audience 验证是 Resource Server 的核心责任。"),
    ],
  },
  {
    id: 'lesson-78', number: 78, columnId: 'column-06', shortTitle: "API Key、Bearer、Client Credentials、SSO 与 Tunnel",
    title: "用户登录、机器调用和私网接入，为什么不该共用一种认证方案？",
    titleHtml: "先识别主体和网络边界，<span class=\"cr-marker\">再选择认证方式</span>",
    eyebrow: 'NON-INTERACTIVE AUTH & GATEWAYS · LESSON 78',
    description: "比较匿名、API Key、预签发 Bearer、Client Credentials、SSO、Workload Identity、Gateway 与 Secure Tunnel。",
    prerequisites: ["机器身份", "企业 SSO", "私网与零信任"],
    terms: [term("Client Credentials", "机器以自身身份获取 Token，不代表最终用户。"), term("Workload Identity", "云运行时通过联合身份获取短期凭证。"), term("Secure Tunnel", "让远程 Host 访问私网 MCP，而不直接公开服务。")],
    officialReference: official(sources.authorization, sources.chatgpt, sources.cloudflareSecurity, sources.codex),
    stages: [
      prediction("本地 stdio MCP 是否应该启动浏览器走 HTTP OAuth 才能读取环境变量？", "比较匿名、API Key、预签发 Bearer、Client Credentials、SSO、Workload Identity、Gateway 与 Secure Tunnel。", "no", [
        { value: "yes", label: "所有 MCP 都必须 OAuth" },
        { value: "no", label: "不应", description: "stdio 通常从运行环境取得凭证" },
        { value: "anonymous", label: "本地永远匿名" }
      ], "✓ 对。授权规范主要针对 HTTP Transport。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-auth-gateway", title: "为七类主体选择认证与网络入口", description: "配置个人 Codex、ChatGPT 用户、CI、Cloudflare Worker、内网员工、公共只读客户端和第三方 SaaS。", config: {} },
      reveal("认证方式由主体和部署边界决定", "没有一种方案适合所有 Client。", "<p>API Key 适合简单固定集成；Bearer 适合预签发短期 Token；用户委托用 OAuth；后台服务可用 Client Credentials 或 Workload Identity；企业私网通过 Gateway/Tunnel 统一审计和策略。</p>"),
      transfer("GitHub Actions 每晚运行课程评测，没有交互用户，优先哪种身份？", "比较匿名、API Key、预签发 Bearer、Client Credentials、SSO、Workload Identity、Gateway 与 Secure Tunnel。", "machine", [
        { value: "machine", label: "Client Credentials 或 Workload Identity 获取短期 Token" },
        { value: "user", label: "保存员工个人 refresh token", feedback: "机器任务不应依赖个人身份。" },
        { value: "public", label: "开放匿名写 Tool", feedback: "会失去访问控制。" }
      ], "✓ 对。后台自动化使用可审计机器身份。"),
    ],
  }
];
