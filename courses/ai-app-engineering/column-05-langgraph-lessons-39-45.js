import { official, prediction, reveal, sources, term, transfer } from './column-05-langgraph-common.js';

export const langGraphLessons39To45 = [
  {
    id: 'lesson-39', number: 39, columnId: 'column-05', shortTitle: '先判断是否需要 LangGraph',
    title: '一个 createAgent 已经能完成的任务，为什么还要手写状态图？',
    titleHtml: '先判断编排复杂度，<span class="cr-marker">再决定是否下沉 LangGraph</span>',
    eyebrow: 'ORCHESTRATION FIT · LESSON 39',
    description: '比较普通函数、确定性工作流、createAgent 与 LangGraph，建立“复杂度适配”而不是“框架崇拜”的架构判断。',
    prerequisites: ['LangChain v1 createAgent', 'Tools 与 Runtime Context', 'RAG 一阶段召回与 Evidence'],
    terms: [term('Workflow', '代码预先规定主要执行路径的流程。'), term('Agent', '模型动态决定动作、工具与停止时机的执行循环。'), term('Orchestration', '把状态、步骤、路由、暂停和恢复组织成可控运行过程。')],
    officialReference: official(sources.overview, sources.v1, sources.workflows),
    stages: [
      prediction('只有两个工具、无暂停、无自定义状态的查询 Agent，应该直接改成 StateGraph 吗？', 'LangGraph 是低层编排运行时，不是所有 Agent 的默认起点。', 'no', [
        { value: 'yes', label: '应该，图越多越专业' },
        { value: 'no', label: '不一定', description: '简单工具循环优先保留 createAgent 或普通代码' },
        { value: 'always', label: '所有 AI 应用都必须使用 LangGraph' },
      ], '✓ 对。只有当控制流、持久化、暂停恢复或状态可观测性值得额外结构时，才下沉 LangGraph。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-orchestration-decision', title: '给六类任务选择最小可靠编排方案', description: '改变路径确定性、循环、暂停、并行、状态和审计要求，比较普通函数、createAgent、Functional API 与 StateGraph。', config: {} },
      reveal('LangGraph 是低层运行时，不是“更高级的 LangChain”', '先用问题复杂度决定抽象层级。', '<p>官方建议：常见模型—工具循环先使用 LangChain <b>createAgent</b>；只有需要自定义状态、明确路由、长时运行、持久化、Human-in-the-loop、复杂并行或可重放执行时，再使用 LangGraph。LangGraph 也可以脱离 LangChain 使用。</p>'),
      transfer('一个审批流程要暂停数小时、恢复原状态并保留审计轨迹，应该优先选择什么？', '关键约束是持久化、暂停与恢复。', 'langgraph', [
        { value: 'langgraph', label: 'LangGraph，并配置持久化和 interrupt' },
        { value: 'prompt', label: '把所有审批规则写进 Prompt', feedback: 'Prompt 无法可靠暂停进程并恢复状态。' },
        { value: 'loop', label: '在内存里写 while(true)', feedback: '进程重启后状态和审计轨迹会丢失。' },
      ], '✓ 对。长时状态与可恢复执行正是 LangGraph 的适用场景。'),
    ],
  },
  {
    id: 'lesson-40', number: 40, columnId: 'column-05', shortTitle: '看懂图的执行模型',
    title: 'State、Node、Edge 和 Superstep 到底怎样一起运行？',
    titleHtml: '不要先背 API，先看见<span class="cr-marker">状态如何穿过整张图</span>',
    eyebrow: 'GRAPH EXECUTION MENTAL MODEL · LESSON 40',
    description: '逐步播放一张包含串行、并行和汇合的图，理解 State、Node、Edge、START、END、Superstep 与状态快照。',
    prerequisites: ['异步函数', '不可变更新的基本观念', '模型调用和工具调用'],
    terms: [term('State', '当前应用快照；节点读取它并返回局部更新。'), term('Node', '执行一项工作并返回 State update 的函数。'), term('Edge', '决定下一步运行哪些节点的连接。'), term('Superstep', '同一轮可并行执行的一组节点及其状态合并阶段。')],
    officialReference: official(sources.quickstart, sources.graphApi, sources.academy),
    stages: [
      prediction('一张图从 A 同时连到 B 和 C，B、C 默认是依次执行吗？', '多个下一节点会进入同一个 superstep 并行执行。', 'parallel', [
        { value: 'serial', label: '先 B 后 C' }, { value: 'parallel', label: '同一 Superstep 并行' }, { value: 'random', label: '完全随机且无法定义' },
      ], '✓ 对。并行节点的更新会在 superstep 边界按 State reducer 合并。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-graph-mental-model', title: '单步播放一张完整工作流', description: '从 START 开始，观察分类、并行检索、汇合、生成和 END；每一步都显示输入 State、节点更新与合并后 State。', config: {} },
      reveal('图不是“节点图片”，而是一个状态驱动执行模型', '节点做事，边决定去向，State 连接所有步骤。', '<p><b>START</b> 与 <b>END</b> 是虚拟边界；节点只返回需要更新的字段；边定义固定、条件或并行流向。多个节点在同一 superstep 完成后，更新会通过 reducer 应用到新的 State snapshot。</p>'),
      transfer('调试时只看最终答案，为什么不足？', '错误可能发生在某个中间状态或路由。', 'state', [
        { value: 'state', label: '需要检查每个节点的输入、更新、下一边和 State snapshot' },
        { value: 'final', label: '最终输出已经包含全部原因', feedback: '最终输出不会自动解释中间路由与状态覆盖。' },
        { value: 'diagram', label: '只看静态图结构', feedback: '静态结构不包含本次运行的真实状态。' },
      ], '✓ 对。LangGraph 的可解释性来自运行中的状态转移。'),
    ],
  },
  {
    id: 'lesson-41', number: 41, columnId: 'column-05', shortTitle: 'StateSchema 与 Reducer',
    title: '两个并行节点同时更新同一个字段，为什么会丢数据或直接报错？',
    titleHtml: 'State 不只是类型，<span class="cr-marker">Reducer 决定更新如何合并</span>',
    eyebrow: 'STATE SCHEMA & REDUCERS · LESSON 41',
    description: '设计输入、输出、内部 State 和 reducer，亲手制造并发覆盖、数组累积、消息追加与计数器冲突。',
    prerequisites: ['Zod v4 Schema', '并发 Promise', '结构化输出'],
    terms: [term('StateSchema', '定义 State 字段、默认值和更新规则的 Schema。'), term('Reducer', '把旧值与节点更新合并成新值的函数。'), term('ReducedValue', '显式声明需要累积或自定义合并的状态字段。'), term('MessagesValue', '为消息列表提供追加与消息语义的内置 reducer。')],
    officialReference: official(sources.quickstart, sources.graphApi, sources.useGraph),
    stages: [
      prediction('两个并行节点分别返回 {sources:[A]} 和 {sources:[B]}，默认一定得到 [A,B] 吗？', '没有 reducer 时，同一字段的并发更新不能假设自动拼接。', 'no', [
        { value: 'yes', label: '一定自动合并' }, { value: 'no', label: '不一定', description: '需要明确 reducer' }, { value: 'llm', label: '由模型决定保留哪个' },
      ], '✓ 对。并发写入同一 channel 必须定义明确合并语义。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-state-reducer', title: '为不同 State channel 选择更新语义', description: '配置 overwrite、append、sum、set-union 和 Messages reducer，再运行并行更新查看最终快照。', config: {} },
      reveal('State Schema 同时定义“有什么”和“怎样更新”', '并行正确性取决于 reducer，而不是字段类型。', '<p>标量通常覆盖；计数器需要求和；结果列表需要 concat 或去重 union；消息应使用 MessagesValue。还应区分 input、output 与 private/internal state，避免把全部内部状态暴露给调用方。</p>'),
      transfer('多个 worker 并行生成章节，completedSections 应怎样定义？', '所有 worker 输出都必须保留。', 'reducer', [
        { value: 'reducer', label: '数组字段使用 concat reducer' },
        { value: 'overwrite', label: '最后一个 worker 覆盖前面结果', feedback: '这会丢失其他 worker 的输出。' },
        { value: 'string', label: '让每个 worker 修改同一个字符串', feedback: '并发更新缺少稳定合并规则。' },
      ], '✓ 对。并行 fan-in 必须先定义可结合的合并语义。'),
    ],
  },
  {
    id: 'lesson-42', number: 42, columnId: 'column-05', shortTitle: '节点颗粒度与副作用',
    title: '一个节点做十件事代码更少，为什么恢复和调试反而更差？',
    titleHtml: '节点边界就是<span class="cr-marker">Checkpoint、重试和可观测边界</span>',
    eyebrow: 'NODE GRANULARITY · LESSON 42',
    description: '拆分读取、分类、检索、生成和写回步骤，比较节点过粗与过细对重复工作、追踪、测试和副作用的影响。',
    prerequisites: ['单一职责', '幂等性', '外部 API 调用'],
    terms: [term('Node Granularity', '一个节点承担多少业务步骤的边界选择。'), term('Side Effect', '写数据库、发邮件、扣款等会改变外部世界的操作。'), term('Idempotency', '同一操作重复执行不会产生额外副作用。'), term('Checkpoint Boundary', '发生恢复时可安全回到的状态边界。')],
    officialReference: official(sources.thinking, sources.persistence),
    stages: [
      prediction('“读取邮件→分类→检索→发回复”全部放一个节点，失败恢复时只会重跑失败的小步骤吗？', '恢复通常从失败节点开头重新执行。', 'no', [
        { value: 'yes', label: '只重跑最后一行' }, { value: 'no', label: '不会', description: '节点内已完成工作可能被重复执行' }, { value: 'never', label: 'LangGraph 不会重试节点' },
      ], '✓ 对。节点越粗，恢复时需要重复的工作和副作用风险越大。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-node-boundary', title: '拖动节点边界并注入一次中途失败', description: '组合或拆分五个步骤，观察 checkpoint 数量、重复耗时、Trace 可读性和副作用风险。', config: {} },
      reveal('最佳节点大小来自恢复与观察需求', '不是“越细越好”，也不是“函数越少越好”。', '<p>小节点提高恢复精度和可观察性，但增加状态字段与图复杂度；大节点代码短，却会放大重放成本。原始业务数据应存进 State，格式化 Prompt 可在节点中临时构造；不可重复副作用应隔离并使用幂等键。</p>'),
      transfer('发送邮件节点在响应前崩溃，重试可能重复发送，应该怎么设计？', '副作用必须可识别重复执行。', 'idempotent', [
        { value: 'idempotent', label: '独立节点 + idempotency key + 发送结果写入 State' },
        { value: 'prompt', label: '提醒模型不要重复发送', feedback: '模型无法保证外部 API 幂等。' },
        { value: 'merge', label: '把发送与十个步骤合并', feedback: '这会扩大重复执行范围。' },
      ], '✓ 对。副作用边界必须显式设计。'),
    ],
  },
  {
    id: 'lesson-43', number: 43, columnId: 'column-05', shortTitle: 'Edges、Routing 与 Command',
    title: '什么时候用 Conditional Edge，什么时候应该由节点返回 Command？',
    titleHtml: '路由不是 Prompt 里的暗示，<span class="cr-marker">而是显式控制流</span>',
    eyebrow: 'ROUTING & COMMAND · LESSON 43',
    description: '比较普通边、条件边、条件入口和 Command，建立“只路由”与“更新状态并路由”的清晰边界。',
    prerequisites: ['结构化输出', '纯函数路由', 'State update'],
    terms: [term('Normal Edge', '无条件进入固定下一节点。'), term('Conditional Edge', '根据 State 计算下一节点或多个节点。'), term('Command', '在同一节点结果中同时返回 State update 与 goto。'), term('Recursion Limit', '限制循环 superstep 数，防止图无限运行。')],
    officialReference: official(sources.graphApi, sources.useGraph),
    stages: [
      prediction('路由函数还需要把 classification 写回 State，最清晰的选择是什么？', '需要同时更新状态和改变去向。', 'command', [
        { value: 'edge', label: '只用普通 Edge' }, { value: 'command', label: '节点返回 Command' }, { value: 'global', label: '修改全局变量' },
      ], '✓ 对。Command 适合把 update 与 goto 放在同一决策结果中。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-routing-command', title: '为六种控制流选择正确机制', description: '处理固定顺序、条件分支、多目标并行、状态更新+跳转、父图跳转和循环终止。', config: {} },
      reveal('路由应当可读、可测、可限制', '不要把关键控制流藏进自然语言。', '<p>固定流使用 normal edge；只根据 State 选路使用 conditional edge；需要更新并跳转使用 Command。循环必须有业务停止条件与 recursion limit，不能只期待模型“自己停”。</p>'),
      transfer('评价节点返回 feedback，并决定回生成节点还是 END，怎样实现最清晰？', '评价结果和路由来自同一次决策。', 'command-or-edge', [
        { value: 'command-or-edge', label: '写入 grade/feedback，并用 Command 或条件边显式路由' },
        { value: 'prompt', label: '让生成模型自行猜是否结束', feedback: '这会把控制权隐藏到 Prompt。' },
        { value: 'while', label: '永远回生成节点', feedback: '缺少终止条件会形成失控循环。' },
      ], '✓ 对。状态证据和控制流必须同时可检查。'),
    ],
  },
  {
    id: 'lesson-44', number: 44, columnId: 'column-05', shortTitle: '并行、Send 与 Fan-in',
    title: '任务数量运行时才知道，怎样动态创建并行 worker？',
    titleHtml: '从固定并行，走向<span class="cr-marker">动态 Fan-out / Fan-in</span>',
    eyebrow: 'PARALLEL SUPERSTEPS & SEND · LESSON 44',
    description: '比较固定并行边和 Send 动态 worker，配置 worker 私有输入、共享 reducer、失败策略和汇合节点。',
    prerequisites: ['Promise 并发', 'Reducer', 'Map-Reduce 思想'],
    terms: [term('Fan-out', '把一项工作拆给多个并行节点或 worker。'), term('Fan-in', '把多个并行输出通过 reducer 汇合。'), term('Send', '运行时向指定节点发送不同输入，动态创建 worker 调用。'), term('Worker State', '每个动态 worker 独立读取的局部输入。')],
    officialReference: official(sources.useGraph, sources.workflows),
    stages: [
      prediction('报告章节数量由 Planner 动态决定，能预先画固定 12 条边吗？', 'worker 数量应由运行时计划决定。', 'send', [
        { value: 'fixed', label: '固定画 12 条边' }, { value: 'send', label: '使用 Send 动态分发' }, { value: 'serial', label: '全部串行处理' },
      ], '✓ 对。Send 用于运行时才确定数量和输入的动态 worker。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-parallel-send', title: '配置动态研究 worker 并观察汇合', description: '调整任务数量、并发上限、失败策略和 reducer；对比固定并行、Send 与串行执行。', config: {} },
      reveal('并行速度提升依赖正确的状态隔离与汇合', 'Send 不是“自动多 Agent”。', '<p>固定分支适合已知并行节点；Send 适合 Planner 运行后才知道的任务集合。每个 worker 应接收局部输入，输出写入带 reducer 的共享字段；还要定义部分失败、超时和并发预算。</p>'),
      transfer('五个 worker 同时写 completedSections，最关键的 State 设置是什么？', '汇合字段必须能累积所有结果。', 'reducer', [
        { value: 'reducer', label: 'completedSections 使用 concat reducer' },
        { value: 'overwrite', label: '默认覆盖', feedback: '并行结果会相互覆盖。' },
        { value: 'global', label: '共享可变全局数组', feedback: '破坏可重放与状态隔离。' },
      ], '✓ 对。动态并行的正确性首先来自 State 合并契约。'),
    ],
  },
  {
    id: 'lesson-45', number: 45, columnId: 'column-05', shortTitle: '六类工作流模式',
    title: 'Prompt Chaining、Routing、Parallel、Orchestrator 和 Agent 到底怎么选？',
    titleHtml: '不要所有问题都做成 Agent，<span class="cr-marker">先选择控制模式</span>',
    eyebrow: 'WORKFLOW PATTERN CATALOG · LESSON 45',
    description: '在六类真实任务中比较 Prompt Chaining、Parallelization、Routing、Orchestrator-worker、Evaluator-optimizer 与 Agent。',
    prerequisites: ['结构化输出', '并行与 Send', '模型工具循环'],
    terms: [term('Prompt Chaining', '固定多阶段处理，每一步输出进入下一步。'), term('Orchestrator-worker', '规划器动态拆任务，worker 并行完成后汇总。'), term('Evaluator-optimizer', '生成—评价—反馈循环直到达标或达到预算。'), term('Dynamic Agent', '模型根据反馈自行选择工具和下一动作。')],
    officialReference: official(sources.workflows, sources.overview),
    stages: [
      prediction('“翻译→术语检查→格式检查”路径完全确定，必须用动态 Agent 吗？', '固定可验证路径更适合 Workflow。', 'workflow', [
        { value: 'agent', label: '必须使用 Agent' }, { value: 'workflow', label: '不必，Prompt Chaining 更清晰' }, { value: 'random', label: '随机选择即可' },
      ], '✓ 对。确定性任务优先使用可预测工作流。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-workflow-patterns', title: '为不同任务匹配工作流模式', description: '识别路径是否已知、任务数量是否动态、是否需要迭代评价、是否允许模型自主选择工具。', config: {} },
      reveal('Workflow 与 Agent 的差异是控制权', '自治程度越高，越需要预算、验证和观察。', '<p>Prompt chaining 适合固定阶段；parallelization 适合独立子任务；routing 适合明确垂直域；orchestrator-worker 适合动态拆分；evaluator-optimizer 适合有清晰质量标准的迭代；agent 适合路径不可预知的问题。</p>'),
      transfer('未知数量的代码文件需要先规划改动，再并行修改并汇总，最适合什么？', '子任务数量由输入决定。', 'orchestrator', [
        { value: 'orchestrator', label: 'Orchestrator-worker + Send' },
        { value: 'chain', label: '固定三步 Prompt Chain', feedback: '无法适应动态文件数量。' },
        { value: 'single', label: '一个超长 Prompt 完成全部文件', feedback: '缺少任务隔离和并行汇总。' },
      ], '✓ 对。先规划，再动态分发 worker，最后综合。'),
    ],
  },
];
