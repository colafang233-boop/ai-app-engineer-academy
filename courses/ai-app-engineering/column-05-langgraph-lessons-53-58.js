import { official, prediction, reveal, sources, term, transfer } from './column-05-langgraph-common.js';

export const langGraphLessons53To58 = [
  {
    id: 'lesson-53', number: 53, columnId: 'column-05', shortTitle: 'Subgraph 组合与持久化',
    title: '子图应该记住上次调用，还是每次从干净状态开始？',
    titleHtml: 'Subgraph 不是文件拆分，<span class="cr-marker">而是带接口与持久化策略的执行单元</span>',
    eyebrow: 'SUBGRAPHS & PERSISTENCE · LESSON 53',
    description: '比较直接作为节点与在节点内 invoke 两种组合方式，配置 State 映射、共享 channel、per-invocation、per-thread 与 stateless 模式。',
    prerequisites: ['StateSchema', 'Checkpointer', '模块边界'],
    terms: [term('Subgraph', '被父图当作节点或在节点内调用的已编译图。'), term('State Mapping', '父图与子图 State 不同时的输入输出转换。'), term('Per-invocation', '每次调用状态隔离，但继承父 checkpointer 支持 interrupt。'), term('Per-thread', '同一线程跨调用累积子图内部状态。'), term('Stateless', '不使用 checkpoint，无法 interrupt 或 durable resume。')],
    officialReference: official(sources.subgraphs, sources.persistence),
    stages: [
      prediction('一个一次性“合同摘要专家”每次处理独立文档，需要跨调用记住上次合同吗？', '多数工具型子 Agent 应保持调用隔离。', 'no', [
        { value: 'yes', label: '必须永久记住' }, { value: 'no', label: '通常不需要', description: 'per-invocation 更安全' }, { value: 'global', label: '用全局数组共享' },
      ], '✓ 对。Per-invocation 是多数独立子任务的推荐模式。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-subgraph-persistence', title: '为四类子图选择接口和持久化模式', description: '处理共享 State、私有消息历史、重复调用、并行调用和 interrupt，观察 namespace 冲突。', config: {} },
      reveal('子图设计包含接口、状态与生命周期', '不是简单 import 一个函数。', '<p>父子图共享 State key 时可直接把 compiled subgraph 加为节点；Schema 不同时应在父节点中映射输入输出。默认 per-invocation 适合多数独立子任务；只有确需多轮记忆时才用 per-thread；stateless 不支持 interrupt 与 durable execution。</p>'),
      transfer('两个不同专家子图都需要 per-thread 记忆，最重要的额外设计是什么？', '它们不能覆盖同一 checkpoint namespace。', 'namespace', [
        { value: 'namespace', label: '为每个子图提供稳定、独立的节点名/namespace' },
        { value: 'order', label: '只依赖调用顺序', feedback: '调整顺序可能混淆子图 checkpoint。' },
        { value: 'shared', label: '所有子图共享同一内部 State', feedback: '会串联不同专家的记忆。' },
      ], '✓ 对。子图持久化必须有稳定 namespace。'),
    ],
  },
  {
    id: 'lesson-54', number: 54, columnId: 'column-05', shortTitle: 'Multi-agent 架构选择',
    title: '多 Agent 是多个 Prompt，还是一套上下文和控制权分配？',
    titleHtml: '先决定谁路由、谁记忆、谁对用户负责，<span class="cr-marker">再增加 Agent 数量</span>',
    eyebrow: 'MULTI-AGENT ARCHITECTURES · LESSON 54',
    description: '比较 Router、Subagents、Handoffs、Skills 与自定义 Graph，理解上下文隔离、集中控制、并行和用户交互边界。',
    prerequisites: ['createAgent', 'Subgraph', 'Tools 与 Runtime Context'],
    terms: [term('Router', '分类输入并把零个或多个子问题送往专门 Agent。'), term('Subagent', '由主 Agent 作为工具调用、通常不直接与用户对话的专家。'), term('Handoff', '控制权转移给另一个 Agent，后者继续面向用户或流程。'), term('Supervisor', '集中规划、调用专家并综合结果的主 Agent。'), term('Context Isolation', '只向专家提供其任务所需上下文，减少污染与膨胀。')],
    officialReference: official(sources.router, sources.subagents, sources.subgraphs),
    stages: [
      prediction('把同一完整聊天历史复制给所有专家 Agent，一定能提高质量吗？', '上下文膨胀和无关信息会降低专注与安全性。', 'no', [
        { value: 'yes', label: '上下文越多越好' }, { value: 'no', label: '不一定', description: '应按职责隔离上下文' }, { value: 'random', label: '随机分配即可' },
      ], '✓ 对。多 Agent 的价值之一就是上下文隔离。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-multi-agent-architecture', title: '为六类协作任务选择架构', description: '根据领域数量、是否并行、谁维护记忆、是否直接与用户交互、是否需要 handoff 选择模式。', config: {} },
      reveal('多 Agent 是组织设计问题', '更多模型调用不等于更好的系统。', '<p>Router 适合多个明确知识域并可并行查询；Subagents 由主 Agent 集中控制、上下文干净；Handoff 适合把对话责任转交专业 Agent；复杂共享状态与确定性约束可用自定义 LangGraph。必须同时定义预算、权限、记忆和失败回收。</p>'),
      transfer('用户问题可能同时涉及账单和技术故障，需要并行查询后统一回答，适合什么？', '多个垂直域都可能相关。', 'router', [
        { value: 'router', label: 'Router 分解并用 Send 并行调用专家，再综合' },
        { value: 'handoff', label: '只转交给一个随机专家', feedback: '会遗漏另一个相关域。' },
        { value: 'all', label: '所有 Agent 共享全部工具和历史', feedback: '扩大权限和上下文污染。' },
      ], '✓ 对。Router 支持选择多个垂直域并行协作。'),
    ],
  },
  {
    id: 'lesson-55', number: 55, columnId: 'column-05', shortTitle: 'Agentic RAG 检索路由',
    title: 'Agent 应该什么时候检索、检索哪个源，又什么时候直接回答？',
    titleHtml: 'Agentic RAG 的第一步不是循环，<span class="cr-marker">而是知识访问决策</span>',
    eyebrow: 'AGENTIC RETRIEVAL ROUTING · LESSON 55',
    description: '复用第四专栏的检索契约，把 no retrieval、单知识库、多源检索、SQL/API 和人工复核变成显式路由。',
    prerequisites: ['知识访问架构决策', '一阶段召回路由器', 'Conditional Edge/Command'],
    terms: [term('Agentic RAG', '由模型或路由逻辑动态决定是否、何时以及如何检索的 RAG。'), term('Retrieval Tool', '把检索契约封装为模型可调用或图可执行的工具/节点。'), term('Knowledge Router', '根据 Query 类型和权威数据源选择知识访问路径。'), term('2-Step RAG', '每次生成前固定检索一次的可预测架构。')],
    officialReference: official(sources.rag, sources.retrieval, sources.router),
    stages: [
      prediction('用户问“2+2 等于几”，Agentic RAG 是否必须先查询向量库？', '动态检索的价值之一是跳过不需要的检索。', 'no', [
        { value: 'yes', label: '必须检索' }, { value: 'no', label: '不必', description: '可以直接回答' }, { value: 'multi', label: '必须查所有数据源' },
      ], '✓ 对。Agentic RAG 应先判断知识需求，而不是无条件增加检索。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-agentic-rag-router', title: '为八类问题配置知识访问路由', description: '在 direct、vector、hybrid、SQL/API、multi-source、web 和 human review 之间路由，并限制工具权限。', config: {} },
      reveal('Agentic RAG 是动态控制，而不是“向量库 + ReAct”', '需要把检索边界、数据权威性和成本显式化。', '<p>2-Step RAG 延迟可预测；Agentic RAG 灵活但路径和调用次数可变；Hybrid 在动态路由中加入检索验证和答案验证。实时结构化事实应走 SQL/API，普通常识可跳过检索，多域问题可并行路由多个源。</p>'),
      transfer('问题同时需要公司制度和当前账户余额，最合理路径是什么？', '非结构化制度和实时结构化事实来自不同源。', 'multi', [
        { value: 'multi', label: '并行检索制度库 + 调用账户 API，再综合' },
        { value: 'vector', label: '只查向量库', feedback: '账户余额可能陈旧或不存在于文档。' },
        { value: 'model', label: '让模型猜余额', feedback: '模型不是实时权威源。' },
      ], '✓ 对。知识路由必须尊重各数据源的权威性。'),
    ],
  },
  {
    id: 'lesson-56', number: 56, columnId: 'column-05', shortTitle: '检索自纠错循环',
    title: '检索结果不相关时，是扩大 top-k、改写 Query，还是直接退出？',
    titleHtml: '先诊断失败类型，<span class="cr-marker">再进入有限自纠错循环</span>',
    eyebrow: 'RETRIEVAL CORRECTION LOOP · LESSON 56',
    description: '构建 Retrieve→Grade→Rewrite/Decompose→Retrieve 循环，区分无关、覆盖不足、权限拒绝和无答案，并设置预算。',
    prerequisites: ['Golden Set 与 Recall', 'Query Transformation', 'Evaluator-optimizer'],
    terms: [term('Retrieval Grader', '评价候选与 Query 相关性或证据覆盖的步骤。'), term('Query Rewrite', '保持原意的同时改善检索表达。'), term('Decomposition', '把多跳或复合问题拆成可独立检索的子问题。'), term('Correction Budget', '限制改写、检索和评价轮数的成本与时间预算。')],
    officialReference: official(sources.rag, sources.workflows, sources.retrieval),
    stages: [
      prediction('检索失败后无限改写 Query，最终总能找到答案吗？', '无答案、无权限或索引缺失不会因无限循环自动消失。', 'no', [
        { value: 'yes', label: '循环越多越好' }, { value: 'no', label: '不能保证', description: '要分类失败并设置预算' }, { value: 'topk', label: '只把 top-k 调到 1000' },
      ], '✓ 对。自纠错必须有失败分类、预算和退出条件。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-retrieval-correction', title: '配置一次可控的检索自纠错循环', description: '调整 relevance threshold、rewrite、translation、decomposition、max attempts 和 no-answer/permission 出口。', config: {} },
      reveal('Self-correction 的价值来自诊断，不来自多调用', '错误动作会放大延迟和 Query Drift。', '<p>候选无关可改写；复合问题可分解；跨语言失败可翻译或使用多语言检索；权限拒绝不能绕过；语料无答案应退出。每轮需记录原 Query、变换、候选、grade 和成本，并设置 max attempts。</p>'),
      transfer('查询因为 ACL 拒绝没有证据，应该进入 rewrite 循环吗？', '权限失败不是表达问题。', 'stop', [
        { value: 'stop', label: '停止并返回无权限/请求授权' },
        { value: 'rewrite', label: '不断改写直到绕过 ACL', feedback: '这是越权行为。' },
        { value: 'ignore', label: '关闭 metadata filter', feedback: '会造成数据泄漏。' },
      ], '✓ 对。自纠错不能绕过安全边界。'),
    ],
  },
  {
    id: 'lesson-57', number: 57, columnId: 'column-05', shortTitle: 'Evidence、Grounding 与退出',
    title: '检索到相关文档后，为什么 Agent 仍可能循环、幻觉或错误引用？',
    titleHtml: '召回只是开始，<span class="cr-marker">还要验证 Evidence、Grounding 与退出条件</span>',
    eyebrow: 'EVIDENCE GATING · LESSON 57',
    description: '构建 Evidence sufficiency、groundedness、citation 和 answer relevance 门禁，决定生成、补检索、修订或拒答。',
    prerequisites: ['Evidence Assembly', '引用契约', '结构化评价输出'],
    terms: [term('Evidence Sufficiency', '现有证据是否覆盖回答所需事实。'), term('Groundedness', '答案陈述是否能由 Evidence 支撑。'), term('Answer Relevance', '答案是否真正回应用户问题。'), term('Abstention', '证据不足或风险过高时明确拒答。'), term('Loop Budget', '生成—评价—修订允许的最大轮数。')],
    officialReference: official(sources.rag, sources.workflows, sources.retrieval),
    stages: [
      prediction('召回结果语义相关，就可以让模型补齐文档里没有的数字吗？', '相关不等于证据充分。', 'no', [
        { value: 'yes', label: '可以合理推测' }, { value: 'no', label: '不可以', description: '应补检索或拒答' }, { value: 'confidence', label: '只降低置信度即可继续编数字' },
      ], '✓ 对。Evidence 必须覆盖答案中的具体事实。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-evidence-gate', title: '配置生成后的 Evidence 门禁和循环出口', description: '在补检索、修订引用、重新生成、人工复核和 abstain 之间路由，并设置总调用预算。', config: {} },
      reveal('Agentic RAG 质量来自分层门禁', '不是让同一个模型连续自我反思。', '<p>先验证 evidence sufficiency，再生成；生成后检查 groundedness、citation accuracy 和 answer relevance。不同失败进入不同路径：缺证据补检索，引用错修订，内容不相关重写回答，高风险或无证据拒答。所有循环必须有预算与停止条件。</p>'),
      transfer('答案引用了正确文档，但引用段落不支持其中一个金额，属于什么失败？', '文档相关不代表引用精确。', 'citation', [
        { value: 'citation', label: 'Citation/Groundedness failure，需要修订或拒答' },
        { value: 'retrieval', label: '只看 Recall@K 就算通过', feedback: '金额没有被证据支撑。' },
        { value: 'style', label: '只是写作风格问题', feedback: '这是事实依据问题。' },
      ], '✓ 对。最终答案必须逐项可追溯到 Evidence。'),
    ],
  },
  {
    id: 'lesson-58', number: 58, columnId: 'column-05', shortTitle: '测试、观测与生产交付',
    title: '图在 Demo 里跑通了，怎样证明它能恢复、能审计、能安全上线？',
    titleHtml: '最后不是截图，而是<span class="cr-marker">可测试、可观察、可部署的生产蓝图</span>',
    eyebrow: 'PRODUCTION RELEASE GATE · LESSON 58',
    description: '完成节点/路由/部分执行测试、Trace、checkpoint 数据库、应用结构、前端流式、回滚和 Agentic RAG 综合发布门禁。',
    prerequisites: ['全部 LangGraph 课程成果', 'LangSmith Trace', 'Cloud/容器部署基础'],
    terms: [term('Partial Execution Test', '从指定节点或 State 开始测试局部图行为。'), term('Graph Factory', '每个测试创建新图和独立 checkpointer 的构造方式。'), term('langgraph.json', '部署应用时声明依赖、graph 入口和环境的配置文件。'), term('Agent Server', '托管图运行、线程、checkpoint、stream 和 API 的服务层。'), term('Release Gate', '质量、安全、恢复、成本和回滚全部达标后才允许发布。')],
    officialReference: official(sources.test, sources.structure, sources.frontend, sources.thinking),
    stages: [
      prediction('只用一个端到端 happy path 测试，足够验证有循环和 interrupt 的图吗？', '路由、节点、恢复和失败路径需要独立验证。', 'no', [
        { value: 'yes', label: '一个成功案例足够' }, { value: 'no', label: '不够', description: '需要节点、边、部分执行和恢复测试' }, { value: 'prod', label: '直接在线上观察即可' },
      ], '✓ 对。复杂图需要分层测试和可重放失败样例。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-production-release', title: '执行 LangGraph 生产发布门禁', description: '补齐测试、Trace、State metadata、checkpoint 数据库、interrupt 恢复、预算、前端流式、部署结构和回滚。', config: {} },
      reveal('生产 LangGraph 的核心是可恢复控制流', '图结构本身不是交付完成的证据。', '<p>单元测试节点和 routing function；用新 checkpointer 隔离测试；通过 partial execution 覆盖历史 State；Trace 记录 node、route、latency、cost 和 errors；生产使用持久化 checkpointer/store；应用结构声明 graph 入口和环境；部署必须支持回滚和 checkpoint migration。</p>'),
      transfer('升级图结构后旧线程 checkpoint 仍在，发布前最关键的动作是什么？', '持久化 State 与新 Schema 必须兼容。', 'migration', [
        { value: 'migration', label: '验证 State/checkpoint 迁移、旧线程恢复和回滚方案' },
        { value: 'delete', label: '静默删除全部用户线程', feedback: '会造成数据丢失和用户体验中断。' },
        { value: 'ignore', label: '假设新代码一定兼容', feedback: 'State 字段与路由变化可能使恢复失败。' },
      ], '✓ 对。持久化状态让版本迁移成为生产发布的一部分。'),
    ],
  },
];
