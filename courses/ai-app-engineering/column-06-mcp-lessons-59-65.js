import { official, prediction, reveal, sources, term, transfer } from './column-06-mcp-common.js';

export const mcpLessons59To65 = [
  {
    id: 'lesson-59', number: 59, columnId: 'column-06', shortTitle: "先判断是否需要 MCP",
    title: "已有 REST API 和 Function Calling，为什么还需要 MCP？",
    titleHtml: "先判断复用边界，<span class=\"cr-marker\">再决定是否引入 MCP</span>",
    eyebrow: 'MCP FIT DECISION · LESSON 59',
    description: "比较普通函数、内部 API、MCP 与 Agent-to-Agent，建立“协议复用价值”而不是“所有工具都 MCP 化”的判断。",
    prerequisites: ["Function Calling", "REST/JSON API", "LangGraph Tool Node"],
    terms: [term("MCP Host", "用户直接交互的 AI 应用，负责模型、权限与体验。"), term("MCP Client", "Host 内连接某一个 MCP Server 的协议组件。"), term("MCP Server", "通过标准协议暴露工具、资源与提示词的程序。")],
    officialReference: official(sources.architecture, sources.servers, sources.clients),
    stages: [
      prediction("一个只在单体应用内部调用、永不复用的函数，必须包装成 MCP Tool 吗？", "比较普通函数、内部 API、MCP 与 Agent-to-Agent，建立“协议复用价值”而不是“所有工具都 MCP 化”的判断。", "no", [
        { value: "yes", label: "必须，所有函数都应 MCP 化" },
        { value: "no", label: "不一定", description: "只有跨 Host 复用、标准发现或独立权限边界有价值时才值得" },
        { value: "agent", label: "应该先改成多 Agent" }
      ], "✓ 对。MCP 的价值来自标准化连接与复用，不是给内部函数换名字。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-fit-decision", title: "给六类能力选择最小可靠接入方式", description: "比较本地函数、内部 API、MCP、App Server 与 A2A，观察复用范围、权限和运维成本。", config: {} },
      reveal("MCP 解决“AI 应用怎样标准连接能力”", "它不负责替代业务 API、模型推理或 Agent 编排。", "<p>MCP 标准化 Host 与外部能力之间的发现、调用、上下文和授权。单体内部函数可以继续用 Function Calling；跨 IDE、ChatGPT、自研 Agent 和 CI 复用时，MCP 的协议价值才显现。</p>"),
      transfer("同一个课程搜索能力要同时供 Codex、ChatGPT 和自研 Agent 使用，优先方案是什么？", "比较普通函数、内部 API、MCP 与 Agent-to-Agent，建立“协议复用价值”而不是“所有工具都 MCP 化”的判断。", "mcp", [
        { value: "mcp", label: "独立 MCP Server，底层继续调用现有搜索服务" },
        { value: "copy", label: "在三个 Host 里复制三份工具代码", feedback: "会产生描述、权限和版本漂移。" },
        { value: "prompt", label: "只写一段 Prompt 告诉模型搜索", feedback: "Prompt 不能提供真实外部能力。" }
      ], "✓ 对。MCP 统一连接契约，底层业务服务无需被替换。"),
    ],
  },
  {
    id: 'lesson-60', number: 60, columnId: 'column-06', shortTitle: "Host、Client、Server 与信任边界",
    title: "谁在调用模型，谁在保存凭证，谁真正执行 Tool？",
    titleHtml: "先画清参与者，<span class=\"cr-marker\">再讨论 MCP 安全</span>",
    eyebrow: 'PARTICIPANTS & TRUST BOUNDARIES · LESSON 60',
    description: "用一张可连线拓扑图区分 Host、每 Server 一个 Client、Server、模型、授权服务器与下游 API。",
    prerequisites: ["客户端—服务器架构", "OAuth 基本角色", "最小权限"],
    terms: [term("Dedicated Connection", "一个 MCP Client 通常只维护到一个 Server 的连接。"), term("Trust Boundary", "身份、凭证或执行责任发生变化的边界。"), term("Downstream Credential", "MCP Server 调用 GitHub、数据库等下游时使用的独立凭证。")],
    officialReference: official(sources.architecture, sources.authorization, sources.security),
    stages: [
      prediction("一个 Host 连接三个 MCP Server 时，通常只创建一个共享 MCP Client 吗？", "用一张可连线拓扑图区分 Host、每 Server 一个 Client、Server、模型、授权服务器与下游 API。", "no", [
        { value: "yes", label: "一个 Client 管全部 Server" },
        { value: "no", label: "不是", description: "通常每个 Server 对应一个独立 Client 连接" },
        { value: "server", label: "Server 自己创建 Host" }
      ], "✓ 对。Host 协调多个 Client，每个 Client 连接一个 Server。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-topology-canvas", title: "连接 Academy MCP 的完整拓扑", description: "把 Codex、自研 Agent、MCP Client、Server、OAuth Provider 和 GitHub API 放进正确信任边界。", config: {} },
      reveal("Host 拥有最终控制权", "模型建议调用，不等于 Server 可以任意执行。", "<p>Host 管理模型、用户体验、客户端连接和审批；Client 负责协议；Server 暴露能力并执行受控操作。用户 Token、MCP Token 和下游 API Token 应明确分离。</p>"),
      transfer("MCP Server 收到用户访问令牌后，能否原样转发给 GitHub API？", "用一张可连线拓扑图区分 Host、每 Server 一个 Client、Server、模型、授权服务器与下游 API。", "no", [
        { value: "no", label: "不能，应为下游获取独立且受众正确的凭证" },
        { value: "yes", label: "可以，Bearer 都一样", feedback: "这会形成 Token Passthrough 与 confused deputy 风险。" },
        { value: "prompt", label: "让模型判断是否转发", feedback: "凭证边界不能交给模型猜。" }
      ], "✓ 对。每条信任边界都需要独立受众与权限。"),
    ],
  },
  {
    id: 'lesson-61', number: 61, columnId: 'column-06', shortTitle: "JSON-RPC、生命周期与能力协商",
    title: "为什么不能连上端点就直接 tools/call？",
    titleHtml: "先完成握手，<span class=\"cr-marker\">再使用双方共同支持的能力</span>",
    eyebrow: 'LIFECYCLE & CAPABILITY NEGOTIATION · LESSON 61',
    description: "逐帧查看 initialize、initialized、能力协商、list、call、notification 与错误响应。",
    prerequisites: ["JSON-RPC 2.0", "请求/响应/通知", "协议版本"],
    terms: [term("Initialize", "交换协议版本、实现信息、能力和 Server instructions 的首次请求。"), term("Capability Negotiation", "双方声明支持的功能，后续只使用共同可用能力。"), term("Notification", "不需要响应的 JSON-RPC 消息。")],
    officialReference: official(sources.lifecycle, sources.specification, sources.architecture),
    stages: [
      prediction("客户端没有声明 Sampling，Server 仍可以直接发送 sampling/create 吗？", "逐帧查看 initialize、initialized、能力协商、list、call、notification 与错误响应。", "no", [
        { value: "yes", label: "Server 声明了就可以" },
        { value: "no", label: "不可以", description: "必须先通过初始化确认客户端能力" },
        { value: "tool", label: "改成 tools/call 就等价" }
      ], "✓ 对。能力协商是运行前契约，不是装饰字段。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-protocol-lifecycle", title: "单步执行一次 MCP 会话", description: "按顺序完成 initialize、initialized、tools/list、tools/call 与 list_changed notification，并检查错误码。", config: {} },
      reveal("协议层先建立共同能力集", "SDK 抽象了消息，但工程师仍要理解失败位置。", "<p>MCP 数据层基于 JSON-RPC 2.0。初始化决定协议版本、双方能力和 Server instructions；请求有 id，通知没有 id；调用未知方法、参数错误和业务失败应分层表达。</p>"),
      transfer("Server 新增 Tool 并支持 listChanged，怎样让已连接 Client 更新？", "逐帧查看 initialize、initialized、能力协商、list、call、notification 与错误响应。", "notify", [
        { value: "notify", label: "发送 tools/list_changed notification，Client 重新 list" },
        { value: "restart", label: "只能重启整个 Host", feedback: "协议提供变更通知。" },
        { value: "silent", label: "静默改变 Schema", feedback: "客户端缓存会失效且不可审计。" }
      ], "✓ 对。动态能力变化需要显式通知与重新发现。"),
    ],
  },
  {
    id: 'lesson-62', number: 62, columnId: 'column-06', shortTitle: "Tools、Resources 与 Prompts",
    title: "查询课程、读取课程、运行审查模板，为什么不是同一种原语？",
    titleHtml: "不要把所有能力都塞进 Tool，<span class=\"cr-marker\">先分清控制关系</span>",
    eyebrow: 'SERVER PRIMITIVES · LESSON 62',
    description: "把课程查询、固定内容、模板、写操作和订阅需求分类为 Tools、Resources、Resource Templates 与 Prompts。",
    prerequisites: ["Tool Calling", "URI 与 MIME type", "Prompt 模板"],
    terms: [term("Tool", "可执行动作，通常由模型决定是否调用。"), term("Resource", "由应用读取并决定如何放入上下文的数据。"), term("Prompt", "用户显式选择的可复用交互模板。")],
    officialReference: official(sources.servers, sources.tools, sources.resources, sources.prompts),
    stages: [
      prediction("读取固定的课程 Markdown，是否一定要包装为 Tool？", "把课程查询、固定内容、模板、写操作和订阅需求分类为 Tools、Resources、Resource Templates 与 Prompts。", "no", [
        { value: "yes", label: "模型必须调用 Tool 才能读取" },
        { value: "no", label: "不一定", description: "固定可寻址内容更适合 Resource" },
        { value: "prompt", label: "应该放进 Prompt 参数" }
      ], "✓ 对。Resource 让应用控制上下文读取，不必假装成动作。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-primitive-catalog", title: "为 Academy MCP 建立原语目录", description: "将 18 个能力放入 Tool、Resource、Template 或 Prompt，并检查读写边界与用户控制权。", config: {} },
      reveal("原语选择决定谁拥有控制权", "设计错误会让模型看到过多 Tool 或让应用失去上下文控制。", "<p>Tool 用于动作和动态查询；Resource 用 URI 暴露上下文；Resource Template 支持参数化 URI；Prompt 提供用户可选择的工作流。不要把完整 API 端点逐个变成 Tool。</p>"),
      transfer("“审查第 26 课的颗粒度”是用户主动选择的模板，最适合什么？", "把课程查询、固定内容、模板、写操作和订阅需求分类为 Tools、Resources、Resource Templates 与 Prompts。", "prompt", [
        { value: "prompt", label: "Prompt，参数为 lessonId" },
        { value: "tool", label: "写操作 Tool", feedback: "它是用户选择的交互模板，不是外部副作用。" },
        { value: "resource", label: "固定 Resource", feedback: "模板需要参数与消息结构。" }
      ], "✓ 对。Prompts 表达用户控制的复用工作流。"),
    ],
  },
  {
    id: 'lesson-63', number: 63, columnId: 'column-06', shortTitle: "Roots、Sampling、Elicitation 与 Tasks",
    title: "MCP Server 除了被调用，还能向 Client 请求什么？",
    titleHtml: "Server 也能请求客户端能力，<span class=\"cr-marker\">但必须先协商并获得同意</span>",
    eyebrow: 'CLIENT FEATURES & TASKS · LESSON 63',
    description: "区分 Roots、Sampling、Elicitation、Logging、Progress 与实验性 Tasks，理解客户端支持差异。",
    prerequisites: ["能力协商", "用户确认", "长任务状态"],
    terms: [term("Roots", "客户端向 Server 声明允许访问的文件系统或工作区边界。"), term("Sampling", "Server 请求 Host 使用模型生成内容，但 Host 保留策略控制。"), term("Elicitation", "Server 请求用户补充结构化信息或确认。"), term("Task", "为长请求提供状态与延迟取回的实验性包装。")],
    officialReference: official(sources.clients, sources.roots, sources.sampling, sources.elicitation, sources.tasks),
    stages: [
      prediction("Server 可以假设所有 MCP Host 都支持 Elicitation 吗？", "区分 Roots、Sampling、Elicitation、Logging、Progress 与实验性 Tasks，理解客户端支持差异。", "no", [
        { value: "yes", label: "规范有定义就一定支持" },
        { value: "no", label: "不能", description: "必须检查 capability，Host 支持范围也会变化" },
        { value: "tool", label: "用 Tool annotation 代替" }
      ], "✓ 对。规范能力与具体 Host 实现是两层事实。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-client-capabilities", title: "配置 Client 提供给 Server 的能力", description: "为 IDE、本地 Agent、ChatGPT 和 CI 选择 Roots、Sampling、Elicitation、Progress 与 Tasks，并处理能力缺失。", config: {} },
      reveal("Client feature 不是 Server 的默认权利", "Host 始终保留模型、文件与用户交互的策略控制。", "<p>Roots 限定可见工作区；Sampling 让 Server 借用 Host 模型；Elicitation 收集用户输入；Progress 和 Tasks 处理长任务。使用前必须检查能力，且敏感请求仍需 Host 策略。</p>"),
      transfer("CI Agent 没有交互用户，Server 需要缺失的发布理由时应怎么做？", "区分 Roots、Sampling、Elicitation、Logging、Progress 与实验性 Tasks，理解客户端支持差异。", "fail", [
        { value: "fail", label: "返回需要输入的明确状态，不能假装 Elicitation 可用" },
        { value: "guess", label: "让模型猜一个理由", feedback: "会伪造审计信息。" },
        { value: "root", label: "用 Roots 代替用户输入", feedback: "Roots 只描述可访问边界。" }
      ], "✓ 对。无交互环境必须设计可恢复的缺失输入路径。"),
    ],
  },
  {
    id: 'lesson-64', number: 64, columnId: 'column-06', shortTitle: "接入模式不等于 Transport",
    title: "同一个远程 MCP Server，为什么可以被五种完全不同的方式使用？",
    titleHtml: "先选择接入责任，<span class=\"cr-marker\">再选择 stdio 或 HTTP</span>",
    eyebrow: 'INTEGRATION MODES · LESSON 64',
    description: "区分原生 Host 配置、SDK 嵌入、Hosted MCP、App/Plugin、Gateway/Tunnel 与 Agent-as-Server。",
    prerequisites: ["Host/Client/Server", "stdio 与 HTTP 基础", "Agent Runtime"],
    terms: [term("Native Host Configuration", "通过 Codex、Claude Code、VS Code 等产品配置直接连接。"), term("Embedded Client", "自己的应用进程创建 MCP Client 并管理生命周期。"), term("Hosted MCP", "模型平台在托管基础设施中访问远程 MCP。")],
    officialReference: official(sources.codex, sources.agentsJs, sources.chatgpt, sources.cloudflareClient),
    stages: [
      prediction("Streamable HTTP 是一种“接入模式”还是一种 Transport？", "区分原生 Host 配置、SDK 嵌入、Hosted MCP、App/Plugin、Gateway/Tunnel 与 Agent-as-Server。", "transport", [
        { value: "mode", label: "接入模式" },
        { value: "transport", label: "Transport", description: "它只描述消息怎样传输，不决定谁管理 Client" },
        { value: "auth", label: "授权类型" }
      ], "✓ 对。Transport 与 Host 责任分配是两个正交维度。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-integration-modes", title: "为八种产品场景选择接入模式", description: "比较 Codex 配置、自研 Agent 直连、Responses Hosted MCP、ChatGPT App、Tunnel 和反向 Server。", config: {} },
      reveal("接入模式决定谁维护连接与策略", "Transport 只决定消息如何跨进程或网络流动。", "<p>原生 Host 负责 Client；嵌入模式由你的应用维护 Client；Hosted MCP 把调用交给平台；App/Plugin 增加分发治理；Gateway/Tunnel 解决私网；反向模式把自己的 Agent 暴露给其他 Host。</p>"),
      transfer("自研 LangGraph 服务要连接私网 MCP，并自定义重试和 Trace，优先什么？", "区分原生 Host 配置、SDK 嵌入、Hosted MCP、App/Plugin、Gateway/Tunnel 与 Agent-as-Server。", "embedded", [
        { value: "embedded", label: "在服务内嵌入 Streamable HTTP MCP Client" },
        { value: "hosted", label: "把私网 URL 直接交给 Hosted MCP", feedback: "托管基础设施通常无法直接访问私网。" },
        { value: "stdio", label: "让浏览器启动本地子进程", feedback: "服务端场景与 stdio 生命周期不匹配。" }
      ], "✓ 对。需要基础设施控制时使用应用直连 Client。"),
    ],
  },
  {
    id: 'lesson-65', number: 65, columnId: 'column-06', shortTitle: "Codex、ChatGPT、Claude Code 与 IDE 接入",
    title: "同一个 MCP Server，怎样生成不同 Host 真正可用的配置？",
    titleHtml: "不要只贴一段 JSON，<span class=\"cr-marker\">要理解每个 Host 的连接与授权能力</span>",
    eyebrow: 'HOST COMPATIBILITY MATRIX · LESSON 65',
    description: "建立带日期的 Host 兼容矩阵，并生成 Codex、ChatGPT、Claude Code、VS Code 与 CI 的配置清单。",
    prerequisites: ["MCP 接入模式", "本地/远程 Server", "Bearer 与 OAuth"],
    terms: [term("Host Compatibility Matrix", "记录某个日期下 Host 对 Transport、认证和能力的支持。"), term("Tool Approval Policy", "Host 对某类 Tool 是否自动、提示或禁止调用的策略。"), term("Tool Discovery Cache", "缓存 tools/list 的结果以降低远程延迟。")],
    officialReference: official(sources.codex, sources.chatgpt, sources.claude, sources.vscode),
    stages: [
      prediction("ChatGPT Web 能否像 Codex CLI 一样直接启动本机 stdio Server？", "建立带日期的 Host 兼容矩阵，并生成 Codex、ChatGPT、Claude Code、VS Code 与 CI 的配置清单。", "no", [
        { value: "yes", label: "都支持 MCP，所以完全一样" },
        { value: "no", label: "不能直接如此", description: "ChatGPT Web 连接远程 MCP；私网可用受支持 Tunnel" },
        { value: "oauth", label: "只要 OAuth 就能启动本地进程" }
      ], "✓ 对。协议相同不代表 Host 的运行环境和能力相同。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-host-matrix", title: "生成五种 Host 的接入配置", description: "选择 Transport、认证、Tool Allow List 与审批策略，生成 Codex TOML、Claude 命令、ChatGPT App 清单和 VS Code JSON。", config: {} },
      reveal("兼容矩阵必须标日期", "客户端能力变化快，课程不能把产品现状写成协议定律。", "<p>Codex 本地 Host 支持 stdio、Streamable HTTP、Bearer 与 OAuth；ChatGPT Web 侧重远程 MCP App；其他 IDE/CLI 的 Header、OAuth、Roots 与 Elicitation 支持各异。每次上线前重新验证。</p>"),
      transfer("一个 Tool 可删除课程，Host 已连接成功就能默认自动调用吗？", "建立带日期的 Host 兼容矩阵，并生成 Codex、ChatGPT、Claude Code、VS Code 与 CI 的配置清单。", "approval", [
        { value: "approval", label: "不能，还要配置 Tool 可见性、Scope 与逐次审批" },
        { value: "yes", label: "连接成功即默认授权全部", feedback: "认证不等于每次动作获批。" },
        { value: "schema", label: "Schema 合法就自动执行", feedback: "参数合法不代表用户同意。" }
      ], "✓ 对。Host 兼容性还包括审批和治理能力。"),
    ],
  }
];
