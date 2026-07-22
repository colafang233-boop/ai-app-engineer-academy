const VERSION = 'langchain@1.5.3 · @langchain/core@1.2.3 · @langchain/langgraph@1.4.8';

const docs = {
  v1: { label: 'LangChain v1 更新说明', url: 'https://docs.langchain.com/oss/javascript/releases/langchain-v1' },
  migrate: { label: 'LangChain v1 迁移指南', url: 'https://docs.langchain.com/oss/javascript/migrate/langchain-v1' },
  changelog: { label: 'LangChain v1 Changelog', url: 'https://docs.langchain.com/oss/javascript/releases/changelog' },
  messages: { label: 'Messages 与 Content Blocks', url: 'https://docs.langchain.com/oss/javascript/langchain/messages' },
  models: { label: 'Models', url: 'https://docs.langchain.com/oss/javascript/langchain/models' },
  structured: { label: 'Structured Output', url: 'https://docs.langchain.com/oss/javascript/langchain/structured-output' },
  streaming: { label: 'Streaming', url: 'https://docs.langchain.com/oss/javascript/langchain/streaming' },
  events: { label: 'Event Streaming', url: 'https://docs.langchain.com/oss/javascript/langchain/event-streaming' },
  tools: { label: 'Tools', url: 'https://docs.langchain.com/oss/javascript/langchain/tools' },
  agents: { label: 'Agents 与 createAgent', url: 'https://docs.langchain.com/oss/javascript/langchain/agents' },
  middleware: { label: 'Middleware Overview', url: 'https://docs.langchain.com/oss/javascript/langchain/middleware/overview' },
  builtIn: { label: 'Prebuilt Middleware', url: 'https://docs.langchain.com/oss/javascript/langchain/middleware/built-in' },
  memory: { label: 'Short-term Memory', url: 'https://docs.langchain.com/oss/javascript/langchain/short-term-memory' },
  memoryConcept: { label: 'Memory Concepts', url: 'https://docs.langchain.com/oss/javascript/concepts/memory' },
  guardrails: { label: 'Guardrails', url: 'https://docs.langchain.com/oss/javascript/langchain/guardrails' },
  hitl: { label: 'Human-in-the-loop', url: 'https://docs.langchain.com/oss/javascript/langchain/human-in-the-loop' },
  observability: { label: 'LangChain Observability', url: 'https://docs.langchain.com/oss/javascript/langchain/observability' },
  langsmith: { label: 'LangSmith Tracing Quickstart', url: 'https://docs.langchain.com/langsmith/observability-quickstart' },
};

const prediction = (title, description, correctValue, options, correctText, incorrectText = '答案已记录。下面用实验验证。') => ({
  id: 'prediction', type: 'prediction', title, description, correctValue, options, correctText, incorrectText,
});
const reveal = (title, description, html) => ({ id: 'reveal', type: 'content', title, description, html });
const transfer = (title, description, correctValue, options, correctText) => ({ id: 'transfer', type: 'quiz', title, description, correctValue, options, correctText });
const official = (...links) => ({ appliesTo: VERSION, links, note: '本课按 LangChain JavaScript v1 当前稳定文档设计；升级依赖前请重新核对 Changelog 与 Migration Guide。' });

const lessons = [
  {
    id: 'lesson-10', number: 10, columnId: 'column-03', shortTitle: '看懂 LangChain v1 的边界',
    title: 'LangChain v1 到底保留了什么，又把什么移走了？',
    titleHtml: '先分清包边界，<span class="cr-marker">再开始写 LangChain v1</span>',
    eyebrow: 'LANGCHAIN V1 ARCHITECTURE · LESSON 10',
    description: '把 createAgent、Messages、模型集成、LangGraph、旧式 Chains 和 LangSmith 放进正确位置，避免把 v0.x 教程混入 v1 项目。',
    officialReference: official(docs.v1, docs.migrate, docs.changelog),
    stages: [
      prediction('LangChain v1 仍然把所有旧式 Chain 和 Retriever 放在 langchain 主包里吗？', 'v1 精简了主包，旧式能力有明确迁移边界。', 'no', [
        { value: 'yes', label: '仍然全部保留', description: '旧教程中的 import 路径可以原样使用' },
        { value: 'no', label: '不是', description: 'Agent 主线留在 langchain，旧式能力迁到 @langchain/classic' },
        { value: 'graph', label: '所有功能都迁到 LangGraph', description: 'LangChain 只剩一个别名' },
      ], '✓ 对。v1 主包聚焦 Agent 构件，旧式 Chains、Retrievers 与 Indexing API 迁到 @langchain/classic。'),
      { id: 'lab', type: 'simulator', simulator: 'v1-package-map', title: '把 API 放回正确的包和层级', description: '完成包归属、迁移判断和高层/低层运行时边界分拣。', config: {} },
      reveal('LangChain v1 是 Agent 高层入口，不是所有历史 API 的合集', '包边界直接决定你是否在学习当前主线。', '<p><b>langchain</b> 提供 createAgent、Middleware、Tools 等 Agent 主线；<b>@langchain/core</b> 提供 Messages、Runnables 等基础抽象；<b>模型集成包</b> 对接供应商；<b>@langchain/langgraph</b> 提供底层状态图运行时；<b>@langchain/classic</b> 承接旧式 Chains 和相关兼容能力；<b>LangSmith</b> 负责 tracing、evaluation 与 monitoring。</p>'),
      transfer('一个旧教程从 langchain/chains 导入 ConversationChain，v1 项目应该怎么处理？', '先判断它是不是当前 Agent 主线。', 'classic', [
        { value: 'classic', label: '确认需求后迁到 @langchain/classic，或改写为当前 Agent/Graph 方案' },
        { value: 'same', label: '继续照抄旧 import，v1 会自动兼容', feedback: 'v1 已明确精简包边界，旧 import 不能假设继续存在。' },
        { value: 'delete', label: '所有 Chain 都必须删除', feedback: '兼容能力仍可通过 @langchain/classic 使用，但应明确其定位。' },
      ], '✓ 对。先识别旧 API，再决定兼容迁移还是按 v1 主线重构。'),
    ],
  },
  {
    id: 'lesson-11', number: 11, columnId: 'column-03', shortTitle: 'Messages 与 Content Blocks',
    title: '模型返回的不只是一段字符串，应用到底应该读取什么？',
    titleHtml: '从 content 字符串，走向<span class="cr-marker">标准 Message 与 Content Blocks</span>',
    eyebrow: 'MESSAGES & CONTENT BLOCKS · LESSON 11',
    description: '识别 System、Human、AI、Tool Message，并把不同供应商的文本、推理、图片、引用和工具调用归一为标准内容块。',
    officialReference: official(docs.messages, docs.v1),
    stages: [
      prediction('跨模型供应商时，只读取 message.content 字符串就足够了吗？', '现代模型可能返回推理、引用、图片和工具调用等结构化内容。', 'blocks', [
        { value: 'yes', label: '足够', description: '所有返回最终都会变成字符串' },
        { value: 'blocks', label: '不够', description: '应理解 text、content、contentBlocks、tool_calls 和 metadata' },
        { value: 'json', label: '只读取 provider 原生 JSON', description: '应用应该绑定某一家供应商格式' },
      ], '✓ 对。LangChain v1 使用标准 Message 与 contentBlocks 降低供应商差异。'),
      { id: 'lab', type: 'simulator', simulator: 'content-block-inspector', title: '把两家供应商的返回归一成同一份消息契约', description: '选择 provider-native 内容，识别 text、reasoning、image、citation 与 tool block，并检查 metadata。', config: {} },
      reveal('Message 是上下文和状态的基本单位', '角色、内容块和元数据都可能参与下一步执行。', '<p>Message 不只是 role + string。AIMessage 还可能包含 <b>tool_calls</b>、<b>usage_metadata</b>、<b>response_metadata</b> 和标准 <b>contentBlocks</b>。contentBlocks 在 v1 中提供跨供应商的类型化表示，同时保留 content 兼容性。</p>'),
      transfer('前端需要同时显示文本、引用和工具调用状态，应该优先基于什么渲染？', '不要用字符串正则猜结构。', 'typed', [
        { value: 'typed', label: '基于标准 contentBlocks 和 tool_calls 分类型渲染' },
        { value: 'regex', label: '从 text 中用正则提取引用和工具名', feedback: '结构已经存在，不应该退化为字符串解析。' },
        { value: 'provider', label: '直接绑定 OpenAI 原生字段', feedback: '这样会丢失 LangChain 的跨供应商标准化价值。' },
      ], '✓ 对。UI 应读取类型化内容块，而不是猜测一段字符串。'),
    ],
  },
  {
    id: 'lesson-12', number: 12, columnId: 'column-03', shortTitle: '标准模型接口与 Profiles',
    title: 'invoke、batch、stream 和模型能力，应该怎么组合？',
    titleHtml: '模型不是一个按钮，<span class="cr-marker">而是一组标准运行能力</span>',
    eyebrow: 'MODEL INTERFACE & PROFILES · LESSON 12',
    description: '使用统一模型接口完成单次调用、批处理、并发限制和能力匹配，并理解 Model Profile 对结构化输出等策略选择的影响。',
    officialReference: official(docs.models, docs.changelog),
    stages: [
      prediction('20 个互不依赖的分类请求，最合理的默认方式是什么？', '独立请求可以批量并行，但仍需要并发与失败控制。', 'batch', [
        { value: 'serial', label: '逐个 await invoke', description: '始终串行最安全' },
        { value: 'batch', label: '使用 batch 并设置 maxConcurrency', description: '并行处理独立请求并限制压力' },
        { value: 'agent', label: '必须创建 Agent', description: '批处理只能在 Agent 中使用' },
      ], '✓ 对。独立输入适合 batch，并通过 RunnableConfig 控制并发。'),
      { id: 'lab', type: 'simulator', simulator: 'model-profile-scheduler', title: '为任务匹配模型能力并安排批处理', description: '根据 tool calling、structured output、多模态和 reasoning 需求选择模型，再控制 batch 并发、超时与重试入口。', config: {} },
      reveal('统一接口不等于所有模型能力相同', '先读取能力，再决定调用策略。', '<p><b>invoke</b> 返回完整 AIMessage；<b>stream</b> 返回 AIMessageChunk；<b>batch</b> 处理独立输入并可设置 maxConcurrency。Model Profile 描述模型是否支持结构化输出等能力，应用不应仅凭模型名字猜测。</p>'),
      transfer('模型 Profile 明确 structuredOutput=false，但任务要求强类型结果，应该怎么做？', '能力约束必须进入策略决策。', 'tool', [
        { value: 'tool', label: '使用可支持的 Tool Strategy 或选择具备原生能力的模型' },
        { value: 'force', label: '继续强制 Provider Strategy', feedback: 'Profile 已说明不支持原生结构化输出。' },
        { value: 'parse', label: '让前端从自然语言里猜 JSON', feedback: '这会绕过结构化输出的验证价值。' },
      ], '✓ 对。Profile 是策略输入，不是展示信息。'),
    ],
  },
  {
    id: 'lesson-13', number: 13, columnId: 'column-03', shortTitle: '结构化输出策略',
    title: '模型结构化输出和 Agent responseFormat 有什么区别？',
    titleHtml: '不是“让模型吐 JSON”，而是<span class="cr-marker">选择并验证输出策略</span>',
    eyebrow: 'STRUCTURED OUTPUT STRATEGIES · LESSON 13',
    description: '区分模型 withStructuredOutput 与 Agent responseFormat，并根据 Profile、工具并用要求和错误类型选择 Provider 或 Tool Strategy。',
    officialReference: official(docs.structured, docs.models),
    stages: [
      prediction('createAgent 配置 responseFormat 后，结构化结果从哪里读取？', 'Agent 会把验证后的数据放进状态中的专用字段。', 'state', [
        { value: 'content', label: '只能从最后一条消息 content 解析', description: '仍然自己 JSON.parse' },
        { value: 'state', label: '从 structuredResponse 读取', description: 'Agent 返回经过策略和 Schema 验证的结构化结果' },
        { value: 'tool', label: '一定从 ToolMessage 读取', description: '所有结构化结果都是业务工具结果' },
      ], '✓ 对。Agent 的结构化结果保存在 structuredResponse。'),
      { id: 'lab', type: 'simulator', simulator: 'structured-strategy-lab', title: '根据能力和错误选择正确策略', description: '切换 Provider Strategy、Tool Strategy、工具并用和 Schema 错误，观察结构化响应能否成立。', config: {} },
      reveal('结构化输出是一条带能力判断和错误处理的执行路径', 'Schema 只是起点，不是全部。', '<p>模型可使用 <b>withStructuredOutput</b>；Agent 使用 <b>responseFormat</b>，并返回 <b>structuredResponse</b>。支持原生能力时可使用 Provider Strategy，否则可使用 Tool Strategy；还要处理 Schema validation 和 multiple structured outputs 等错误。</p>'),
      transfer('模型支持原生结构化输出，但同时绑定的工具不支持与结构化输出并用，应该怎么处理？', '供应商能力组合也需要验证。', 'change', [
        { value: 'change', label: '调整模型/策略或拆分步骤，不能假设两个能力可同时使用' },
        { value: 'ignore', label: '忽略限制，Provider Strategy 总会成功', feedback: '官方文档明确要求模型支持工具与结构化输出同时使用。' },
        { value: 'regex', label: '把结构化输出改成文本正则', feedback: '应先调整执行架构，而不是放弃验证。' },
      ], '✓ 对。结构化输出策略必须服从模型的实际能力组合。'),
    ],
  },
  {
    id: 'lesson-14', number: 14, columnId: 'column-03', shortTitle: 'Streaming 与事件流',
    title: '只流 Token，为什么仍然看不懂 Agent 在做什么？',
    titleHtml: '从打字机效果，升级为<span class="cr-marker">可观察的多通道事件流</span>',
    eyebrow: 'STREAMING & EVENT STREAMING · LESSON 14',
    description: '同时处理 messages、updates、custom 与 Event Streaming v3，把模型 token、Agent 步骤、工具生命周期和业务进度投影到不同 UI。',
    officialReference: official(docs.streaming, docs.events, docs.models),
    stages: [
      prediction('Agent 使用工具时，只监听模型 token 能完整解释执行过程吗？', '工具开始、结束和状态更新不一定出现在文本 token 中。', 'multi', [
        { value: 'yes', label: '可以', description: 'token 包含所有节点状态' },
        { value: 'multi', label: '不可以', description: '还需要 updates、custom 或 typed event projections' },
        { value: 'poll', label: '只能轮询数据库', description: 'LangChain 没有 Agent 事件流' },
      ], '✓ 对。Agent 流式体验需要多种事件，不只是文本 token。'),
      { id: 'lab', type: 'simulator', simulator: 'event-stream-router', title: '把四类事件送到正确的界面区域', description: '组合 messages、updates、custom 与 event v3，处理取消、重复事件、工具进度和最终完成。', config: {} },
      reveal('Streaming 是应用状态协议，不是动画效果', '不同模式回答不同问题。', '<p><b>messages</b> 提供模型 token 与 metadata；<b>updates</b> 提供 Agent step 后的状态变化；<b>custom</b> 承载业务自定义进度。应用与前端场景可使用 <b>streamEvents v3</b> 的类型化投影，避免手工解析混杂事件。</p>'),
      transfer('前端需要同时显示回答文字、当前 Agent 节点和“已查询 10/100 条”进度，应该怎么配置？', '为不同 UI 状态选择不同事件来源。', 'modes', [
        { value: 'modes', label: '组合 messages、updates、custom，或使用 Event Streaming v3 投影' },
        { value: 'text', label: '只从 text 中解析全部状态', feedback: '业务进度与节点状态不应伪装成文本。' },
        { value: 'final', label: '等最终回答后一次性展示', feedback: '这样失去了 Agent streaming 的核心价值。' },
      ], '✓ 对。事件类型应该直接映射到 UI 状态。'),
    ],
  },
  {
    id: 'lesson-15', number: 15, columnId: 'column-03', shortTitle: 'Tools 与 Runtime Context',
    title: '工具参数正确，为什么仍然可能越权或串租户？',
    titleHtml: 'Tool Schema 之外，<span class="cr-marker">还需要运行时上下文和最小权限</span>',
    eyebrow: 'TOOLS & RUNTIME CONTEXT · LESSON 15',
    description: '定义 Zod 参数、选择最小工具集、读取用户与租户上下文，并把 ToolMessage 错误安全地送回 Agent。',
    officialReference: official(docs.tools),
    stages: [
      prediction('工具参数里包含 tenant_id，就能保证模型不会跨租户访问吗？', '可信上下文不应该由模型自由生成。', 'runtime', [
        { value: 'yes', label: '可以', description: '只要 Schema 有 tenant_id 就安全' },
        { value: 'runtime', label: '不可以', description: '租户和用户身份应来自 Runtime Context，由应用注入' },
        { value: 'prompt', label: '写进 Prompt 就够了', description: '模型会自觉遵守租户边界' },
      ], '✓ 对。可信身份来自应用运行时，不应交给模型构造。'),
      { id: 'lab', type: 'simulator', simulator: 'runtime-tool-lab', title: '修复参数、权限和运行时上下文', description: '只开放必要工具，修正 Zod Schema，把 user/tenant context 注入执行，并处理 ToolMessage 错误。', config: {} },
      reveal('Tool 是受控函数，不是模型获得系统权限', '模型提出调用，应用负责边界。', '<p>tool() 定义名称、描述、Zod 输入和执行函数。模型生成 tool call，应用校验参数并执行。身份、租户、数据库连接等可信信息应从 Runtime Context 注入；高风险工具应遵循最小权限，并通过 ToolMessage 返回结果或可恢复错误。</p>'),
      transfer('一个“查询退款状态”任务，应该向模型开放哪些工具？', '工具数量和权限都会影响可靠性。', 'least', [
        { value: 'least', label: '只开放只读查询工具，身份和租户由 Runtime Context 注入' },
        { value: 'all', label: '同时开放退款、删单、发券等所有工具', feedback: '无关写工具会扩大误调用与越权风险。' },
        { value: 'tenant', label: '让模型自己填写 tenant_id', feedback: '可信身份不应来自模型参数。' },
      ], '✓ 对。最小工具集与可信上下文必须同时存在。'),
    ],
  },
  {
    id: 'lesson-16', number: 16, columnId: 'column-03', shortTitle: 'createAgent 与 State',
    title: 'createAgent 帮你做了什么，又没有替你决定什么？',
    titleHtml: '高层 Agent API 背后，仍然是<span class="cr-marker">状态、节点与停止条件</span>',
    eyebrow: 'CREATEAGENT & STATE · LESSON 16',
    description: '单步观察 model node、tools node、Messages State、自定义 State/Context、structuredResponse 和 iteration limit。',
    officialReference: official(docs.agents, docs.v1),
    stages: [
      prediction('createAgent 会一直循环，直到工具列表为空吗？', 'Agent 的停止条件来自模型最终输出或运行限制。', 'stop', [
        { value: 'empty', label: '工具列表为空才停止', description: '有工具就永不结束' },
        { value: 'stop', label: '模型给出最终输出或触发迭代上限等条件', description: '循环必须有明确停止路径' },
        { value: 'manual', label: '只能人工停止', description: 'createAgent 没有终止逻辑' },
      ], '✓ 对。最终输出和运行限制共同构成停止条件。'),
      { id: 'lab', type: 'simulator', simulator: 'agent-state-lab', title: '单步运行 Agent 并观察 State 如何变化', description: '查看 messages、custom state、runtime context、tool calls 和 structuredResponse 在每一步的变化。', config: {} },
      reveal('createAgent 是 LangGraph 上的生产级高层 Agent', '高层 API 简化编排，但不会替你定义业务边界。', '<p>createAgent 构建基于 LangGraph 的 model/tools 循环，并管理 Messages State。你仍需定义工具、systemPrompt、responseFormat、custom state/context、middleware 和停止保护。需要自定义拓扑时，再下沉到 LangGraph。</p>'),
      transfer('任务需要先经过确定性分类，再分流到两个不同 Agent，应该怎么做？', '标准循环与自定义拓扑要分层。', 'graph', [
        { value: 'graph', label: '把 createAgent 作为节点/子图，外围使用 LangGraph 自定义路由' },
        { value: 'prompt', label: '把所有拓扑逻辑写进 Prompt', feedback: '确定性分流不应完全交给模型文本决策。' },
        { value: 'middleware', label: 'Middleware 可以替代任何图结构', feedback: 'Middleware 控制标准循环，但复杂拓扑应使用 LangGraph。' },
      ], '✓ 对。LangChain 高层 Agent 与 LangGraph 自定义编排是分层关系。'),
    ],
  },
  {
    id: 'lesson-17', number: 17, columnId: 'column-03', shortTitle: 'Middleware 与上下文工程',
    title: '为什么生产 Agent 的关键逻辑不应该全塞进一个 Prompt？',
    titleHtml: '把动态控制放进<span class="cr-marker">Middleware Hooks</span>',
    eyebrow: 'MIDDLEWARE & CONTEXT ENGINEERING · LESSON 17',
    description: '使用 before/after/wrap hooks 动态修改 Prompt、选择模型、过滤工具、拦截调用和提前终止。',
    officialReference: official(docs.middleware, docs.builtIn, docs.migrate),
    stages: [
      prediction('不同用户等级选择不同模型，最合适的 v1 扩展点是什么？', '动态模型选择已经进入 Middleware 主线。', 'middleware', [
        { value: 'if', label: '在业务代码各处写 if/else', description: '每个调用点重复路由逻辑' },
        { value: 'middleware', label: '使用 Middleware 动态选择模型', description: '在 Agent 调用链中集中控制' },
        { value: 'prompt', label: '让 Prompt 决定调用哪家 API', description: '模型直接切换 SDK 实例' },
      ], '✓ 对。动态模型、Prompt、工具和调用包装是 Middleware 的核心职责。'),
      { id: 'lab', type: 'simulator', simulator: 'middleware-hook-lab', title: '组装一条可解释的 Middleware 流水线', description: '安排 beforeAgent、beforeModel、wrapModelCall、wrapToolCall、afterModel 和 afterAgent，并观察顺序冲突。', config: {} },
      reveal('Middleware 是 Agent 内部的上下文工程层', '它控制每一次模型和工具调用前后发生什么。', '<p>Middleware 可追踪行为、转换 Prompt、动态筛选工具、选择模型、增加 retries/fallback、执行 guardrails 和 early termination。v1 将旧 pre/post model hooks 迁移为统一 Middleware 机制。</p>'),
      transfer('需要在工具执行前统一检查租户额度，并把异常转换成可恢复 ToolMessage，应该用什么？', '这是工具调用边界控制。', 'wrap', [
        { value: 'wrap', label: '使用 wrapToolCall Middleware 包装工具调用' },
        { value: 'system', label: '只在 System Prompt 提醒模型节省额度', feedback: '额度校验必须由应用执行。' },
        { value: 'after', label: '只在最终回答后检查', feedback: '高风险工具已执行后再检查太晚。' },
      ], '✓ 对。调用边界逻辑应放在对应的 wrap hook。'),
    ],
  },
  {
    id: 'lesson-18', number: 18, columnId: 'column-03', shortTitle: '短期记忆与 Checkpointer',
    title: '保存了聊天数组，为什么仍然不能可靠恢复 Agent？',
    titleHtml: '真正的短期记忆是<span class="cr-marker">线程级 State 持久化</span>',
    eyebrow: 'SHORT-TERM MEMORY · LESSON 18',
    description: '配置 Checkpointer 与 thread_id，验证线程隔离、跨请求恢复，并处理上下文过长时的裁剪与摘要。',
    officialReference: official(docs.memory, docs.memoryConcept),
    stages: [
      prediction('两个用户使用同一个 thread_id，会发生什么？', 'thread_id 是短期记忆隔离边界。', 'mix', [
        { value: 'safe', label: '完全安全', description: 'Agent 会自动识别用户' },
        { value: 'mix', label: '状态可能串线', description: '同一线程会读取同一份持久化 State' },
        { value: 'reset', label: '每次调用自动清空', description: 'thread_id 只用于日志' },
      ], '✓ 对。thread_id 必须与会话隔离策略一致。'),
      { id: 'lab', type: 'simulator', simulator: 'thread-memory-lab', title: '在多个线程中保存、恢复并压缩记忆', description: '切换 thread_id，验证状态隔离，模拟重启恢复，并选择 trim 或 summarization 策略。', config: {} },
      reveal('Short-term Memory 是 Agent State 的持久化', '它在每一步读写，而不仅是请求结束时保存文本。', '<p>为 createAgent 配置 Checkpointer 后，State 会按 thread_id 持久化。生产环境应使用数据库支持的 saver。上下文过长时，需要裁剪、删除或摘要旧消息，而不是无限追加。</p>'),
      transfer('服务重启后仍要恢复对话，应该依赖什么？', '内存数组无法跨进程可靠恢复。', 'db', [
        { value: 'db', label: '使用数据库支持的 Checkpointer，并保持正确 thread_id' },
        { value: 'memory', label: '只用进程内数组', feedback: '进程重启后数据会丢失。' },
        { value: 'prompt', label: '让模型自己回忆过去对话', feedback: '模型没有未传入的会话记忆。' },
      ], '✓ 对。可靠恢复依赖持久化 Checkpointer 和线程标识。'),
    ],
  },
  {
    id: 'lesson-19', number: 19, columnId: 'column-03', shortTitle: 'Retry、Fallback 与限额',
    title: '失败时一直重试，为什么反而可能拖垮系统？',
    titleHtml: '可靠性不是“再试一次”，而是<span class="cr-marker">分类、退避、降级和限额</span>',
    eyebrow: 'RELIABILITY MIDDLEWARE · LESSON 19',
    description: '注入 429、503、工具超时和主模型故障，配置 model/tool retry、指数退避、jitter、fallback 与调用次数限制。',
    officialReference: official(docs.builtIn, docs.changelog),
    stages: [
      prediction('工具返回参数校验错误，应该像网络超时一样自动重试三次吗？', '只有可恢复的瞬时错误适合重试。', 'classify', [
        { value: 'yes', label: '所有错误都重试', description: '重试总能提高成功率' },
        { value: 'classify', label: '不应该', description: '先区分瞬时错误与确定性错误' },
        { value: 'fallback', label: '所有错误都切模型', description: '模型 fallback 可以修复工具参数' },
      ], '✓ 对。重试策略必须筛选错误类型。'),
      { id: 'lab', type: 'simulator', simulator: 'reliability-chaos-lab', title: '给 Agent 注入故障并配置恢复策略', description: '为模型和工具分别设置 retryOn、backoff、jitter、onFailure、fallback 和 call limit。', config: {} },
      reveal('可靠性 Middleware 应把故障类型和恢复动作对应起来', '不是所有失败都值得再次消耗资源。', '<p>Model/Tool Retry 支持最大重试、指数退避、jitter 和失败处理；Model Fallback 提供供应商或模型降级；Model/Tool Call Limit 防止成本和死循环失控。确定性 Schema 错误应直接修复输入，不应盲目重试。</p>'),
      transfer('主模型 503，备用模型可满足任务，合理策略是什么？', '这是供应商级可恢复故障。', 'retry-fallback', [
        { value: 'retry-fallback', label: '有限重试后切换备用模型，并记录降级状态' },
        { value: 'forever', label: '无限重试主模型', feedback: '会放大延迟和故障压力。' },
        { value: 'ignore', label: '返回空字符串并标记成功', feedback: '不能把失败伪装成成功。' },
      ], '✓ 对。有限重试、明确 fallback 和可观察降级共同构成可靠性。'),
    ],
  },
  {
    id: 'lesson-20', number: 20, columnId: 'column-03', shortTitle: 'Guardrails 与人工审批',
    title: '模型提出删除或退款操作时，谁拥有最后决定权？',
    titleHtml: '高风险工具必须经过<span class="cr-marker">Guardrails 与 Human-in-the-loop</span>',
    eyebrow: 'GUARDRAILS & HITL · LESSON 20',
    description: '检测 PII 与 Prompt Injection，对敏感工具发出 interrupt，并处理 approve、edit、reject 与 respond 后恢复执行。',
    officialReference: official(docs.guardrails, docs.hitl, docs.builtIn),
    stages: [
      prediction('模型生成了合法的 delete_records 工具参数，就应该立即执行吗？', '参数合法不代表操作已获授权。', 'review', [
        { value: 'yes', label: '立即执行', description: 'Schema 通过就说明安全' },
        { value: 'review', label: '不一定', description: '高风险操作应按策略暂停并等待人工决策' },
        { value: 'prompt', label: '只要 Prompt 里写“谨慎”即可', description: '模型会自动承担审批责任' },
      ], '✓ 对。敏感操作需要独立审批策略。'),
      { id: 'lab', type: 'simulator', simulator: 'guardrail-hitl-lab', title: '处理一次敏感工具调用的完整审批生命周期', description: '检测 PII、识别高风险工具、触发 interrupt，并分别尝试 approve、edit、reject 与 respond。', config: {} },
      reveal('Guardrail 检查内容，HITL 控制动作', '两者解决不同风险。', '<p>Guardrails 可在 Agent 前后检查 PII、Prompt Injection、内容和业务规则。HITL Middleware 在模型生成工具调用后、真正执行前暂停，保存 Graph State，并根据 approve/edit/reject/respond 决策恢复执行。</p>'),
      transfer('审批人把退款金额从 1000 改为 100，应该使用哪类决策？', '不是只有通过和拒绝。', 'edit', [
        { value: 'edit', label: 'edit：修改参数后继续执行' },
        { value: 'approve', label: 'approve：按原参数执行', feedback: '这不会应用审批人的金额修改。' },
        { value: 'respond', label: 'respond：直接给工具结果', feedback: 'respond 用于人工直接提供结果，不等同于修改调用参数。' },
      ], '✓ 对。edit 允许在恢复执行前修改敏感工具参数。'),
    ],
  },
  {
    id: 'lesson-21', number: 21, columnId: 'column-03', shortTitle: 'LangSmith 与生产综合项目',
    title: 'Agent 最终答错了，怎样定位到底是哪一步出问题？',
    titleHtml: '从最终答案，深入到<span class="cr-marker">Trace、Run 与决策节点</span>',
    eyebrow: 'LANGSMITH OBSERVABILITY · LESSON 21',
    description: '检查模型调用、工具调用、Middleware、状态和错误 Run，添加 metadata/tags，并完成一份可发布的 LangChain Agent 生产蓝图。',
    officialReference: official(docs.observability, docs.langsmith),
    stages: [
      prediction('只记录最终输入和输出，足够调试一个多工具 Agent 吗？', '最终错误可能来自模型、工具、Middleware 或状态。', 'trace', [
        { value: 'yes', label: '足够', description: '最终答案能解释全部过程' },
        { value: 'trace', label: '不够', description: '需要完整 Trace 和每个 Run 的输入、输出、错误与耗时' },
        { value: 'console', label: '只看浏览器 console', description: 'LangSmith 不需要 tracing' },
      ], '✓ 对。Agent 调试必须进入执行轨迹。'),
      { id: 'lab', type: 'simulator', simulator: 'trace-release-lab', title: '从失败 Trace 中定位根因，并完成发布检查', description: '筛选 model/tool/middleware Run，定位错误节点，补齐 metadata、可靠性、安全和回退清单。', config: {} },
      reveal('Trace 是一次请求从输入到输出的完整执行记录', '每个步骤都是可检查的 Run。', '<p>LangChain createAgent 可通过环境变量启用 LangSmith tracing。Trace 包含模型调用、工具调用和 Agent 决策点；metadata 与 tags 用于区分版本、租户和实验。生产发布还需要评估集、监控、反馈、成本和安全策略。</p>'),
      transfer('线上只有某个 Prompt 版本失败率升高，最有效的第一步是什么？', '先用 metadata 缩小范围。', 'filter', [
        { value: 'filter', label: '按项目、版本 metadata 和错误 Run 过滤 Trace，再定位共同失败节点' },
        { value: 'restart', label: '先重启全部服务', feedback: '重启不会解释版本相关失败。' },
        { value: 'guess', label: '直接猜是模型变差', feedback: '需要用 Trace 证据定位具体节点。' },
      ], '✓ 对。先用 Trace 和 metadata 建立证据，再决定修复位置。'),
    ],
  },
];

const exam = {
  id: 'exam-column-03-official',
  columnId: 'column-03',
  title: '专栏三综合考试 · LangChain JavaScript v1',
  description: '通过线 80%。题目覆盖包边界、Messages、Models、Structured Output、Streaming、Tools、Agent、Middleware、Memory、Reliability、Safety 与 Observability。',
  questions: [
    { text: 'v1 中旧式 Chains 和 Retrievers 主要迁往哪里？', options: ['@langchain/classic', '@langchain/langgraph', 'langsmith'], correct: 0 },
    { text: '跨供应商读取推理、引用和工具调用时，应优先使用什么？', options: ['标准 contentBlocks 与 tool_calls', '只解析 text 字符串', '只读取供应商原生 JSON'], correct: 0 },
    { text: '一组互不依赖的模型请求应该如何提高吞吐？', options: ['batch 并设置 maxConcurrency', '创建一个无限循环 Agent', '全部串行 invoke'], correct: 0 },
    { text: 'createAgent 的结构化结果从哪里读取？', options: ['structuredResponse', '最后一个 ToolMessage', '控制台日志'], correct: 0 },
    { text: 'Agent UI 同时需要 token、节点进度和业务进度时应该怎么做？', options: ['组合 messages/updates/custom 或使用 Event Streaming v3', '只监听 text', '只等最终结果'], correct: 0 },
    { text: '租户身份应该从哪里进入工具执行？', options: ['应用注入的 Runtime Context', '模型自由生成的参数', 'System Prompt 文本'], correct: 0 },
    { text: '动态模型路由、工具筛选和调用包装属于什么能力？', options: ['Middleware', 'Zod', 'Retriever'], correct: 0 },
    { text: '短期记忆跨请求恢复的关键是什么？', options: ['Checkpointer 与 thread_id', '浏览器变量', '更长 Prompt'], correct: 0 },
    { text: '确定性 Schema 错误应该如何处理？', options: ['修复输入或策略，不盲目重试', '无限重试', '切换所有模型'], correct: 0 },
    { text: '高风险工具调用在执行前需要什么？', options: ['独立审批策略与可恢复 interrupt', '只检查 JSON', '只记录日志'], correct: 0 },
    { text: '定位 Agent 失败的核心可观测对象是什么？', options: ['Trace 与内部 Runs', '最终输出字符串', '页面截图'], correct: 0 },
    { text: '复杂确定性路由超出标准 Agent Loop 时应该怎么做？', options: ['把 createAgent 作为节点并下沉到 LangGraph', '把所有逻辑塞进 Prompt', '删除工具'], correct: 0 },
  ],
};

export const langChainOfficialVersion = {
  asOf: '2026-07-22',
  packages: {
    langchain: '1.5.3',
    '@langchain/core': '1.2.3',
    '@langchain/langgraph': '1.4.8',
    langsmith: '0.8.3',
    zod: '4.4.3',
    node: '22.x',
  },
};

export function extendWithOfficialColumn03(course) {
  return {
    ...course,
    officialVersion: langChainOfficialVersion,
    columns: [
      ...course.columns,
      {
        id: 'column-03',
        title: '专栏三 · LangChain JavaScript v1',
        description: '严格依据官方 v1 文档，覆盖 Messages、Models、Structured Output、Streaming、Tools、createAgent、Middleware、Memory、Reliability、Safety 与 LangSmith。',
        lessonIds: lessons.map((lesson) => lesson.id),
        examId: exam.id,
        prerequisiteExamId: 'exam-column-02',
      },
    ],
    lessons: [...course.lessons, ...lessons],
    exams: [...course.exams, exam],
  };
}
