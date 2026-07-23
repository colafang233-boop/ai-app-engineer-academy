import { official, prediction, reveal, sources, term, transfer } from './column-06-mcp-common.js';

export const mcpLessons66To72 = [
  {
    id: 'lesson-66', number: 66, columnId: 'column-06', shortTitle: "在自己的 Agent 中嵌入 MCP Client",
    title: "我们自己的 AI 应用怎样管理 MCP 连接、工具缓存和失败？",
    titleHtml: "把 MCP Client 放进应用，<span class=\"cr-marker\">而不是把整个 Agent 交给 Server</span>",
    eyebrow: 'EMBEDDED MCP CLIENT · LESSON 66',
    description: "比较 Stdio、Streamable HTTP、Hosted MCP 和自研 Client，处理连接池、缓存、筛选、重连与同名 Tool。",
    prerequisites: ["LangGraph Node", "Agent Tools", "连接生命周期"],
    terms: [term("Local MCP Tool", "应用进程列出并调用的 stdio/HTTP MCP Tool。"), term("Hosted MCP Tool", "由模型平台托管调用的远程 MCP Tool。"), term("Tool Name Collision", "多个 Server 暴露同名 Tool 时发生的选择冲突。")],
    officialReference: official(sources.agentsJs, sources.cloudflareClient, sources.clients),
    stages: [
      prediction("接入 20 个远程 MCP Server 后，每次 Agent Run 都无条件重新 listTools 最好吗？", "比较 Stdio、Streamable HTTP、Hosted MCP 和自研 Client，处理连接池、缓存、筛选、重连与同名 Tool。", "no", [
        { value: "yes", label: "越实时越好" },
        { value: "no", label: "不一定", description: "需要缓存、失效通知和连接失败策略" },
        { value: "model", label: "让模型记住 Tool Schema" }
      ], "✓ 对。工具发现本身有延迟与可用性成本。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-embedded-client", title: "组装一个多 Server Agent Client 层", description: "配置连接、并行初始化、Tool 前缀、静态/动态筛选、缓存失效、重连和失败降级。", config: {} },
      reveal("MCP Client 是应用基础设施的一部分", "它需要像数据库连接和外部 API 一样被治理。", "<p>自己的 Host 要管理 Client 生命周期、连接超时、并行连接、工具缓存、名称冲突、动态 Tool Filter、Trace 和错误呈现。LangGraph 负责路由，MCP Client 负责协议连接。</p>"),
      transfer("两个 Server 都有 search Tool，怎样降低模型选错？", "比较 Stdio、Streamable HTTP、Hosted MCP 和自研 Client，处理连接池、缓存、筛选、重连与同名 Tool。", "prefix", [
        { value: "prefix", label: "为本地 MCP Tool 加 Server 前缀，并做白名单筛选" },
        { value: "random", label: "随机保留一个", feedback: "会导致不可解释行为。" },
        { value: "prompt", label: "只在 Prompt 里提醒", feedback: "名称冲突应在工具层解决。" }
      ], "✓ 对。Tool 命名与筛选是多 Server Host 的基础设计。"),
    ],
  },
  {
    id: 'lesson-67', number: 67, columnId: 'column-06', shortTitle: "App、Plugin 与 Hosted MCP",
    title: "普通 MCP Server、ChatGPT App、Codex Plugin 和 Hosted MCP 有什么差别？",
    titleHtml: "协议服务之外，<span class=\"cr-marker\">还有产品分发与平台治理</span>",
    eyebrow: 'DISTRIBUTION & HOSTED MCP · LESSON 67',
    description: "比较裸 MCP Endpoint、ChatGPT App、Codex Plugin、Hosted MCP Tool 与企业工作空间发布。",
    prerequisites: ["远程 MCP", "产品元数据", "工作空间治理"],
    terms: [term("MCP App", "在远程 MCP 能力之上增加安装、元数据、UI、权限和发布流程的应用。"), term("Plugin", "将 Skill、MCP 与工作流指引一起分发的扩展包。"), term("Hosted Tool Round-trip", "远程 MCP 调用由模型平台完成，不回调应用 Client。")],
    officialReference: official(sources.chatgpt, sources.codex, sources.agentsJs),
    stages: [
      prediction("把 MCP URL 提交为 ChatGPT App 后，是否就与本地 Codex 配置完全相同？", "比较裸 MCP Endpoint、ChatGPT App、Codex Plugin、Hosted MCP Tool 与企业工作空间发布。", "no", [
        { value: "yes", label: "都是 MCP，发布层没有差别" },
        { value: "no", label: "不同", description: "App 还涉及扫描、草稿、审批、RBAC 和发布治理" },
        { value: "stdio", label: "App 会自动转成 stdio" }
      ], "✓ 对。协议兼容只是底层，产品分发还有治理层。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-distribution-modes", title: "为不同受众选择分发方式", description: "在个人开发、团队 Codex、企业 ChatGPT、自研 SaaS 和公共 API 场景间选择配置、Plugin、App 或 Hosted MCP。", config: {} },
      reveal("MCP Endpoint 不等于完整产品", "安装、权限、UI、审核和更新策略属于分发层。", "<p>ChatGPT App 会扫描 Tools 并进入工作空间发布流程；Codex Plugin 可携带 Skill 与 MCP；Hosted MCP 由 Responses API 执行远程调用。课程必须同时教协议和产品化。</p>"),
      transfer("要给公司统一发布“课程审查工作流 + MCP + 使用规范”，更适合什么？", "比较裸 MCP Endpoint、ChatGPT App、Codex Plugin、Hosted MCP Tool 与企业工作空间发布。", "plugin", [
        { value: "plugin", label: "封装为受管 Plugin/App，并配置组织权限" },
        { value: "url", label: "只在群里发一个 URL", feedback: "缺少标准工作流和治理。" },
        { value: "copy", label: "让每个人复制 Server 源码", feedback: "版本和权限会漂移。" }
      ], "✓ 对。分发方式应匹配治理需求。"),
    ],
  },
  {
    id: 'lesson-68', number: 68, columnId: 'column-06', shortTitle: "把自己的 Agent 暴露成 MCP Server",
    title: "什么时候应该让其他 Agent 调我们的 Agent，而不是只暴露底层 API？",
    titleHtml: "MCP 既能接入能力，<span class=\"cr-marker\">也能反向暴露一个受控 Agent</span>",
    eyebrow: 'AGENT AS MCP SERVER · LESSON 68',
    description: "比较 Tool Server、Agent-as-Server、Codex MCP Server、App Server 与 A2A，定义抽象边界。",
    prerequisites: ["Agent 内部编排", "Tool Contract", "长任务与事件流"],
    terms: [term("Agent-as-Server", "把一个已有 Agent 能力包装为 MCP Tool 供其他 Host 调用。"), term("App Server", "暴露更完整 Thread、Turn、事件和审批语义的应用服务。"), term("A2A", "面向 Agent 身份、任务协作和异步状态的 Agent-to-Agent 协议。")],
    officialReference: official(sources.architecture, sources.codex, sources.tasks),
    stages: [
      prediction("一个需要完整 Thread、增量 Diff 和审批事件的编程 Agent，只暴露一个 MCP Tool 一定足够吗？", "比较 Tool Server、Agent-as-Server、Codex MCP Server、App Server 与 A2A，定义抽象边界。", "no", [
        { value: "yes", label: "一个 Tool 能表达所有产品语义" },
        { value: "no", label: "不一定", description: "复杂运行生命周期可能需要 App Server 或 Agent 协议" },
        { value: "resource", label: "改成 Resource 就足够" }
      ], "✓ 对。协议抽象应保留调用方真正需要的运行语义。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-agent-as-server", title: "选择能力暴露边界", description: "为代码修复、课程审查、批处理任务和多 Agent 协作选择函数 Tool、Agent Tool、MCP Task、App Server 或 A2A。", config: {} },
      reveal("不要把整个复杂产品压扁成一个 Tool", "但也不要让调用方知道所有内部节点。", "<p>稳定、目标明确的 Agent 能力可以作为 MCP Tool；需要 Thread、Turn、Diff、持续审批和丰富事件时，应考虑专用 App Server；跨 Agent 任务协作还可能需要 A2A。</p>"),
      transfer("课程审查 Agent 内部有 LangGraph，但调用方只需要“审查一课并返回报告”，怎样暴露？", "比较 Tool Server、Agent-as-Server、Codex MCP Server、App Server 与 A2A，定义抽象边界。", "tool", [
        { value: "tool", label: "暴露高层 review_lesson Tool，隐藏内部 Graph" },
        { value: "nodes", label: "把每个内部 Node 都暴露为 Tool", feedback: "会泄漏实现并增加调用复杂度。" },
        { value: "a2a", label: "任何 Agent 都必须 A2A", feedback: "简单请求—结果能力用 Tool 足够。" }
      ], "✓ 对。对外契约围绕用户目标，而不是内部节点。"),
    ],
  },
  {
    id: 'lesson-69', number: 69, columnId: 'column-06', shortTitle: "开发本地 stdio MCP Server",
    title: "为什么一行 console.log 就可能让本地 MCP 彻底失联？",
    titleHtml: "先理解进程管道，<span class=\"cr-marker\">再写第一个本地 Server</span>",
    eyebrow: 'LOCAL STDIO SERVER · LESSON 69',
    description: "使用 TypeScript SDK v1 开发本地 Academy MCP Server，处理 stdin/stdout、stderr、环境变量和优雅退出。",
    prerequisites: ["Node.js 子进程", "stdin/stdout/stderr", "TypeScript 模块"],
    terms: [term("Stdio Transport", "Client 启动本地进程，通过标准输入输出交换 JSON-RPC。"), term("Protocol Stream", "stdout 上只能出现 MCP 协议消息，普通日志会破坏帧。"), term("Process Lifecycle", "Host 负责启动、监控和关闭本地 Server 进程。")],
    officialReference: official(sources.sdkV1, sources.transports, sources.codex),
    stages: [
      prediction("stdio Server 能否把调试日志直接 console.log 到 stdout？", "使用 TypeScript SDK v1 开发本地 Academy MCP Server，处理 stdin/stdout、stderr、环境变量和优雅退出。", "no", [
        { value: "yes", label: "日志和协议会自动分流" },
        { value: "no", label: "不能", description: "stdout 是协议通道，日志应写 stderr" },
        { value: "http", label: "只有 HTTP Server 才能记录日志" }
      ], "✓ 对。stdout 污染是本地 MCP 最常见的连接失败之一。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-stdio-workbench", title: "修复一个无法连接的 stdio Server", description: "检查 command、args、cwd、环境变量、stdout 日志、异常处理和关闭信号，生成 Codex 本地配置。", config: {} },
      reveal("stdio 是进程级连接，不是网络服务", "它简单、低延迟，但生命周期绑定 Host。", "<p>本地 Host 启动 Server 子进程并通过 stdin/stdout 传输；密钥从环境注入；日志写 stderr；Server 应处理未捕获异常、SIGTERM 和客户端断开。</p>"),
      transfer("本地 Server 需要 GitHub Token，最合理注入方式是什么？", "使用 TypeScript SDK v1 开发本地 Academy MCP Server，处理 stdin/stdout、stderr、环境变量和优雅退出。", "env", [
        { value: "env", label: "由 Host 从环境变量注入，不写入 Tool 参数" },
        { value: "tool", label: "让模型每次填写 Token", feedback: "会泄漏凭证并扩大上下文。" },
        { value: "stdout", label: "Server 启动时打印 Token", feedback: "既泄漏又污染协议流。" }
      ], "✓ 对。stdio 凭证由运行环境管理。"),
    ],
  },
  {
    id: 'lesson-70', number: 70, columnId: 'column-06', shortTitle: "生产级 Tool 设计",
    title: "Tool 能调用成功，为什么仍可能不适合交给 Agent？",
    titleHtml: "Tool 不是 API Endpoint 搬运，<span class=\"cr-marker\">而是面向目标的受控能力</span>",
    eyebrow: 'PRODUCTION TOOL CONTRACT · LESSON 70',
    description: "设计 input/output Schema、结构化结果、错误、annotations、幂等、读写分离与审批提示。",
    prerequisites: ["Zod Schema", "业务幂等性", "Tool Calling"],
    terms: [term("Structured Content", "与 outputSchema 对齐、可被 Host 稳定读取的结果。"), term("Tool Annotation", "描述只读、破坏性、幂等等行为的提示元数据。"), term("Business Failure", "协议成功但业务未完成，应以可解释结果返回。")],
    officialReference: official(sources.tools, sources.servers, sources.security),
    stages: [
      prediction("把 200 个 REST Endpoint 原样暴露为 200 个 Tool，通常是最佳实践吗？", "设计 input/output Schema、结构化结果、错误、annotations、幂等、读写分离与审批提示。", "no", [
        { value: "yes", label: "工具越多模型越强" },
        { value: "no", label: "不是", description: "应围绕稳定用户目标设计少量高质量 Tool" },
        { value: "schema", label: "只要都有 Schema 就行" }
      ], "✓ 对。Tool 数量、描述和重叠会直接影响选择质量与上下文成本。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-tool-contract", title: "设计 Academy MCP 的读写 Tool", description: "为 search_lessons、save_quality_finding 和 trigger_preview_build 配置 Schema、结构化输出、幂等键、错误和审批。", config: {} },
      reveal("Tool Contract 同时服务模型、Host 和审计", "仅“函数能跑”远远不够。", "<p>参数要有约束和描述；输出同时提供人类文本与 structuredContent；写 Tool 要声明风险、要求幂等键并返回审计 ID；业务失败不要伪装为协议异常。</p>"),
      transfer("保存质量问题请求超时，Client 不确定是否写入成功，怎样避免重复记录？", "设计 input/output Schema、结构化结果、错误、annotations、幂等、读写分离与审批提示。", "idempotency", [
        { value: "idempotency", label: "要求 idempotencyKey，并支持按键查询结果" },
        { value: "retry", label: "无条件重试五次", feedback: "可能创建重复记录。" },
        { value: "prompt", label: "让模型不要重复", feedback: "模型无法确认外部写入。" }
      ], "✓ 对。副作用 Tool 必须设计重复调用语义。"),
    ],
  },
  {
    id: 'lesson-71', number: 71, columnId: 'column-06', shortTitle: "Resources、Templates 与订阅",
    title: "课程内容怎样以 URI、类型和版本稳定地提供给多个 Host？",
    titleHtml: "让上下文可寻址、可发现、可更新，<span class=\"cr-marker\">而不是全部塞进 Tool 返回</span>",
    eyebrow: 'RESOURCES & TEMPLATES · LESSON 71',
    description: "设计 Direct Resource、Resource Template、MIME、版本、分页、订阅与 list_changed。",
    prerequisites: ["URI Template", "MIME type", "文档版本"],
    terms: [term("Direct Resource", "拥有固定 URI、可直接列出和读取的资源。"), term("Resource Template", "带参数的 URI 模板，用于动态资源族。"), term("Subscription", "Client 订阅资源变化并接收更新通知。")],
    officialReference: official(sources.resources, sources.servers, sources.architecture),
    stages: [
      prediction("academy://lessons/{lessonId} 属于固定 Resource 还是 Resource Template？", "设计 Direct Resource、Resource Template、MIME、版本、分页、订阅与 list_changed。", "template", [
        { value: "direct", label: "固定 Resource" },
        { value: "template", label: "Resource Template", description: "URI 中包含参数" },
        { value: "tool", label: "只能是 Tool" }
      ], "✓ 对。模板让客户端发现可参数化资源族。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-resource-workbench", title: "构建 Academy Resource 目录", description: "设计课程、专栏、质量标准和项目成果 URI，设置 MIME、版本、模板参数、订阅与缓存策略。", config: {} },
      reveal("Resource 是应用控制的上下文接口", "URI 和元数据让同一内容可被多种 Host 稳定使用。", "<p>固定目录可直接列出；课程详情用 Template；内容声明 MIME 和版本；高频变化资源可支持订阅或 list_changed；权限仍要在 read 前验证。</p>"),
      transfer("课程内容更新后，已缓存 Resource 的 Client 怎样知道？", "设计 Direct Resource、Resource Template、MIME、版本、分页、订阅与 list_changed。", "notify", [
        { value: "notify", label: "支持订阅或 resources/list_changed，并携带版本/ETag" },
        { value: "silent", label: "Client 自己猜更新时间", feedback: "会产生陈旧上下文。" },
        { value: "tool", label: "新增一个 invalidate_all Tool", feedback: "协议已有资源变化机制。" }
      ], "✓ 对。缓存必须配套失效和版本契约。"),
    ],
  },
  {
    id: 'lesson-72', number: 72, columnId: 'column-06', shortTitle: "Prompts、Completion 与通知",
    title: "如何让用户选择标准审查工作流，同时获得参数提示和进度？",
    titleHtml: "把用户工作流做成 Prompt，<span class=\"cr-marker\">把动态状态做成通知</span>",
    eyebrow: 'PROMPTS, COMPLETION & NOTIFICATIONS · LESSON 72',
    description: "开发 Prompt 模板、参数补全、日志、Progress、listChanged 与取消行为。",
    prerequisites: ["Prompt 模板", "异步进度", "客户端通知"],
    terms: [term("Prompt Argument", "用户选择模板后需要填写的结构化参数。"), term("Completion", "Client 请求 Server 为参数提供候选补全。"), term("Progress Token", "把长请求的阶段进度关联到原调用。")],
    officialReference: official(sources.prompts, sources.specification, sources.clients),
    stages: [
      prediction("Prompt 是模型自动挑选的高风险写操作吗？", "开发 Prompt 模板、参数补全、日志、Progress、listChanged 与取消行为。", "no", [
        { value: "yes", label: "Prompt 就是 Tool" },
        { value: "no", label: "不是", description: "Prompt 通常由用户显式选择并生成消息模板" },
        { value: "resource", label: "Prompt 只能返回文件" }
      ], "✓ 对。Prompt 与 Tool 的控制者不同。"),
      { id: 'lab', type: 'simulator', simulator: "mcp-prompt-notification", title: "开发课程质量审查 Prompt 库", description: "配置 review_lesson、compare_lessons、prepare_release 的参数、补全、日志、进度和模板变更通知。", config: {} },
      reveal("Prompts 提供用户可见的复用入口", "Completion 和通知提升可用性，但不改变权限边界。", "<p>Prompt 返回消息列表；Completion 帮助选择 lessonId 或 rubric；Progress 用于长任务；Logging 应避免敏感数据；模板变化可通知 Client 重新发现。</p>"),
      transfer("用户输入 lessonId=les 时，怎样提供 lesson-26 等候选？", "开发 Prompt 模板、参数补全、日志、Progress、listChanged 与取消行为。", "completion", [
        { value: "completion", label: "使用 completion/complete 为 Prompt 参数返回候选" },
        { value: "model", label: "让模型随机补全", feedback: "Server 已掌握真实课程目录。" },
        { value: "tool", label: "先执行写 Tool", feedback: "参数补全不应产生副作用。" }
      ], "✓ 对。Completion 让 Server 提供权威候选。"),
    ],
  }
];
