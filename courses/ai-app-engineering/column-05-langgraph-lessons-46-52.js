import { official, prediction, reveal, sources, term, transfer } from './column-05-langgraph-common.js';

export const langGraphLessons46To52 = [
  {
    id: 'lesson-46', number: 46, columnId: 'column-05', shortTitle: 'Graph API 还是 Functional API',
    title: '已有大量 if/for 业务代码，必须全部改写成显式图吗？',
    titleHtml: '先选择编程模型，<span class="cr-marker">再组织持久化和控制流</span>',
    eyebrow: 'GRAPH API VS FUNCTIONAL API · LESSON 46',
    description: '比较 StateGraph 与 entrypoint/task，理解显式 State、可视化、动态控制流、渐进式改造和两种 API 混用的边界。',
    prerequisites: ['TypeScript async/await', '普通函数控制流', 'StateGraph 基础'],
    terms: [term('Graph API', '以 State、Node、Edge 显式声明图结构。'), term('Functional API', '以 entrypoint 和 task 为核心，在普通代码控制流中获得持久化、流式与中断能力。'), term('entrypoint', '封装一次可持久化工作流的入口函数。'), term('task', '可异步执行、保存结果、重试和观察的离散工作单元。')],
    officialReference: official(sources.functional, sources.useFunctional, sources.graphApi),
    stages: [
      prediction('一个已有 2,000 行的 TypeScript 工作流，只想先加入 checkpoint 和 interrupt，必须先画完整 StateGraph 吗？', 'Functional API 支持渐进式接入运行时能力。', 'functional', [
        { value: 'graph', label: '必须全部重写成图' }, { value: 'functional', label: '不必，可先用 entrypoint/task' }, { value: 'none', label: 'LangGraph 无法接入旧代码' },
      ], '✓ 对。Functional API 适合在标准 if/for/function 控制流中渐进增加持久化与中断。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-api-choice', title: '为六种团队与代码库选择 API', description: '根据可视化、共享 State、渐进改造、动态分支、子图和团队协作要求，选择 Graph、Functional 或 Hybrid。', config: {} },
      reveal('两种 API 共享同一个运行时', '选择的是表达方式，不是能力高低。', '<p>Graph API 强调显式 State 与图结构，适合复杂路由、共享状态和可视化；Functional API 使用普通语言控制流，代码更短，适合渐进改造。两者都支持 checkpoint、streaming、interrupt，并可互相调用。</p>'),
      transfer('需要动态可视化节点状态，同时复用一段已有 Functional workflow，最合理方案是什么？', '两种 API 可以混用。', 'hybrid', [
        { value: 'hybrid', label: '外层 StateGraph，节点内调用 entrypoint/task' },
        { value: 'rewrite', label: '删除旧代码全部重写', feedback: '没有必要为了形式统一增加迁移风险。' },
        { value: 'global', label: '用全局变量连接两套代码', feedback: '会破坏状态与持久化边界。' },
      ], '✓ 对。Hybrid 允许显式编排与渐进复用同时存在。'),
    ],
  },
  {
    id: 'lesson-47', number: 47, columnId: 'column-05', shortTitle: 'Durable Execution 真义',
    title: '恢复执行为什么要求随机性和外部调用必须进入 task？',
    titleHtml: '可恢复不等于重跑全部，<span class="cr-marker">而是确定性重放 + 已保存结果</span>',
    eyebrow: 'DURABLE EXECUTION · LESSON 47',
    description: '模拟 API、随机数、时间、数据库写入和邮件发送，配置 task、retry、cache、幂等键与恢复边界。',
    prerequisites: ['Checkpoint', '副作用与幂等', 'Promise 失败处理'],
    terms: [term('Durable Execution', '故障或暂停后从已保存进度恢复，而非从头重新运行全部工作。'), term('Determinism', '重放控制流时，相同已保存输入产生可预测的执行路径。'), term('Task Result', '被 checkpoint 保存、恢复时可复用的离散工作结果。'), term('Replay', '从 checkpoint 重新执行后续控制流；已保存 task 结果可跳过重复计算。')],
    officialReference: official(sources.functional, sources.useFunctional, sources.persistence),
    stages: [
      prediction('工作流中直接调用 Date.now() 和随机 API，interrupt 后恢复一定得到相同路径吗？', '未封装的不确定操作可能在重放时产生不同结果。', 'no', [
        { value: 'yes', label: '一定相同' }, { value: 'no', label: '不一定', description: '随机性和 I/O 应放进 task' }, { value: 'model', label: '由模型自动修正' },
      ], '✓ 对。恢复会重放控制流，不确定操作必须封装并保存结果。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-durable-execution', title: '给长时工作流注入崩溃并恢复', description: '把 API、随机性和写操作分配到 task，配置 retry 与 idempotency，观察哪些步骤被复用、哪些被重跑。', config: {} },
      reveal('Durable Execution 依赖确定性控制流和可保存 task', '否则恢复可能重复副作用或走向不同分支。', '<p>entrypoint 或 graph 会重放控制流；耗时 I/O、随机性和副作用应封装成 task。task 输出必须可序列化，并应为写操作提供幂等键。可恢复异常适合有限重试，确定性错误应修复输入。</p>'),
      transfer('支付 API 已成功但客户端超时，恢复时怎样避免重复扣款？', '外部副作用必须支持重复请求识别。', 'idempotency', [
        { value: 'idempotency', label: 'task 使用稳定 idempotency key，并保存支付结果' },
        { value: 'retry', label: '无限重试同一支付请求', feedback: '没有幂等保证会重复扣款。' },
        { value: 'prompt', label: '让模型记住已经支付', feedback: '模型记忆不是支付系统事务保证。' },
      ], '✓ 对。恢复安全首先是副作用幂等。'),
    ],
  },
  {
    id: 'lesson-48', number: 48, columnId: 'column-05', shortTitle: 'Checkpoint、Thread 与 Snapshot',
    title: 'Checkpointer 保存的是聊天记录，还是整张图的状态历史？',
    titleHtml: '从“记住消息”升级为<span class="cr-marker">保存每一步 State Snapshot</span>',
    eyebrow: 'PERSISTENCE & THREADS · LESSON 48',
    description: '切换多个 thread_id，检查 checkpoint、StateSnapshot、next、tasks 和历史记录，模拟服务重启后恢复。',
    prerequisites: ['StateSchema', '数据库持久化', '会话隔离'],
    terms: [term('Checkpointer', '在图执行步骤边界保存 State snapshot 的持久化实现。'), term('Thread', '由 thread_id 标识的一条独立执行历史。'), term('StateSnapshot', '某个 checkpoint 的 values、next、tasks、metadata 与 config。'), term('Checkpoint History', '同一线程按时间排列的历史状态。')],
    officialReference: official(sources.persistence, sources.memory),
    stages: [
      prediction('两个用户共用同一个 thread_id，只要 messages 里写了用户名就安全隔离吗？', 'thread_id 决定 checkpoint 命名空间。', 'no', [
        { value: 'yes', label: '可以共用' }, { value: 'no', label: '不可以', description: '会串联同一状态历史' }, { value: 'prompt', label: 'Prompt 会自动隔离' },
      ], '✓ 对。Thread 是持久化隔离边界，不是消息中的一个普通字段。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-checkpoint-thread', title: '查看三个线程的 Checkpoint 时间线', description: '运行、暂停、重启和恢复不同线程，检查 snapshots、next、tasks 和 metadata。', config: {} },
      reveal('Checkpointer 保存整张图的执行进度', '消息只是 State 的一种字段。', '<p>图在每个 superstep 后保存 checkpoint，并按 thread_id 组织。Snapshot 包含当前 values、下一节点、待执行 tasks 和元数据。生产环境应使用数据库 checkpointer，并在部署阶段执行 schema migration。</p>'),
      transfer('想知道线程在进入 review 节点前的状态，应该读取什么？', '需要读取历史 checkpoint，而不是日志字符串。', 'history', [
        { value: 'history', label: '线程 State history 中对应的 StateSnapshot' },
        { value: 'final', label: '只读取最终输出', feedback: '最终状态不会保留所有中间 next/tasks。' },
        { value: 'memory', label: '浏览器内存变量', feedback: '无法跨进程可靠恢复。' },
      ], '✓ 对。Snapshot 是检查和恢复执行位置的正式对象。'),
    ],
  },
  {
    id: 'lesson-49', number: 49, columnId: 'column-05', shortTitle: 'Interrupt 与 Human-in-the-loop',
    title: '审批暂停后，为什么不能简单从节点下一行继续？',
    titleHtml: 'Interrupt 会保存位置，<span class="cr-marker">Command(resume) 提供外部决定</span>',
    eyebrow: 'INTERRUPT & RESUME · LESSON 49',
    description: '设计审批、补充信息和风险复核流程，触发 interrupt、检查暂停 State，并用 Command 恢复。',
    prerequisites: ['Checkpointer', 'Command', '高风险工具审批'],
    terms: [term('interrupt()', '在节点内动态暂停图，并向外部返回可序列化请求。'), term('Command(resume)', '再次调用图时，把外部输入作为 interrupt 的返回值恢复执行。'), term('Dynamic Interrupt', '根据运行时条件在节点任意位置暂停，而非固定断点。'), term('Typed Interrupt', 'v1 中为 interrupt 输入与恢复值约束类型。')],
    officialReference: official(sources.interrupts, sources.v1, sources.persistence),
    stages: [
      prediction('interrupt 前先发送邮件，再等待审批，恢复时邮件一定不会重复发送吗？', '恢复会重新进入节点，interrupt 前的副作用可能重放。', 'no', [
        { value: 'yes', label: '一定不会重复' }, { value: 'no', label: '不能保证', description: 'interrupt 应先发生或副作用必须任务化、幂等' }, { value: 'hidden', label: '把审批藏在 Prompt 即可' },
      ], '✓ 对。Interrupt 节点中的副作用顺序必须按可重放规则设计。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-interrupt-hitl', title: '完成一次暂停—审阅—编辑—恢复流程', description: '检查暂停 State，尝试 approve、edit、reject 和补充信息，并观察恢复后的路由。', config: {} },
      reveal('Interrupt 把 Human-in-the-loop 变成执行协议', '不是在 UI 上加一个确认框。', '<p>interrupt 会持久化当前 State 并无限等待。外部系统读取 interrupt payload，用户做出决定后用 Command({resume}) 恢复。节点会从头重放，因此 interrupt 应放在副作用之前，或把不确定工作封装为 task。</p>'),
      transfer('审批人修改退款金额后继续，恢复值应该表达什么？', '恢复输入必须包含经过验证的决策。', 'typed', [
        { value: 'typed', label: '类型化 decision + edited arguments' },
        { value: 'text', label: '任意一句自然语言', feedback: '关键业务决定应有明确 Schema。' },
        { value: 'global', label: '修改前端全局变量', feedback: '恢复执行读取不到可靠的持久化决定。' },
      ], '✓ 对。Typed interrupt 让暂停与恢复契约可验证。'),
    ],
  },
  {
    id: 'lesson-50', number: 50, columnId: 'column-05', shortTitle: 'Replay、Fork 与 Time Travel',
    title: '线上一次错误路由，怎样从历史节点复现并测试另一条路径？',
    titleHtml: '不是修改日志，而是<span class="cr-marker">从 Checkpoint Replay 或 Fork</span>',
    eyebrow: 'TIME TRAVEL DEBUGGING · LESSON 50',
    description: '浏览 checkpoint 树，从历史状态 Replay，修改 State Fork 新分支，并比较后续模型调用、工具和最终输出。',
    prerequisites: ['StateSnapshot', 'Checkpoint history', '副作用幂等'],
    terms: [term('Replay', '从历史 checkpoint 继续执行原有状态，重跑后续节点。'), term('Fork', '修改历史 State 后创建新的执行分支。'), term('Checkpoint Tree', '同一线程因 fork 形成的状态分支结构。'), term('Historical Config', '定位某个 checkpoint 的 configurable 配置。')],
    officialReference: official(sources.timeTravel, sources.persistence),
    stages: [
      prediction('从 checkpoint Replay 时，checkpoint 之前的节点会再次调用外部 API 吗？', '之前节点结果已保存在历史状态中。', 'no', [
        { value: 'yes', label: '全部从 START 重跑' }, { value: 'no', label: '不会', description: '只重跑 checkpoint 之后的节点' }, { value: 'never', label: '任何节点都不会重跑' },
      ], '✓ 对。Replay 复用 checkpoint 前结果，重新执行之后的节点。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-time-travel', title: '从失败 Checkpoint Replay 并 Fork 新状态', description: '选择历史节点，分别执行 Replay 与修改 state 后 Fork，比较两条分支的 Trace 和结果。', config: {} },
      reveal('Time Travel 是基于 State 的可重复实验', '它比“复制输入再试一次”保留更多上下文。', '<p>Replay 使用历史 checkpoint 原状态继续执行；Fork 先修改历史 State，再创建新分支。checkpoint 之后的模型、API 和 interrupt 会重新执行，因此必须继续遵守副作用和确定性规则。</p>'),
      transfer('想验证“如果分类是 refund 而不是 complaint”，应该怎么做？', '需要从分类后的 checkpoint 修改 State。', 'fork', [
        { value: 'fork', label: '从对应 checkpoint Fork，并更新 classification' },
        { value: 'log', label: '手工修改日志文本', feedback: '日志不会改变真实图状态。' },
        { value: 'replay', label: '只 Replay 原状态', feedback: 'Replay 不会自动改变分类结果。' },
      ], '✓ 对。Fork 用于探索可控的反事实路径。'),
    ],
  },
  {
    id: 'lesson-51', number: 51, columnId: 'column-05', shortTitle: 'Streaming 与节点级前端',
    title: '用户看到“思考中”三个字，为什么仍然不知道图在做什么？',
    titleHtml: '把每个节点变成<span class="cr-marker">可观察、可流式呈现的产品状态</span>',
    eyebrow: 'STREAMING & FRONTEND · LESSON 51',
    description: '组合 values、updates、messages、custom 与 debug 流，把节点运行、Token、业务进度和最终状态映射到前端卡片。',
    prerequisites: ['Event streaming', '前端状态机', 'Graph node names'],
    terms: [term('values', '每一步后的完整 State。'), term('updates', '每个节点产生的局部 State update。'), term('messages', '模型消息与 token 流。'), term('custom', '节点主动发送的业务进度数据。'), term('debug', '包含更丰富执行与 checkpoint 调试信息的流。')],
    officialReference: official(sources.streaming, sources.frontend),
    stages: [
      prediction('前端只监听 messages token，能完整展示检索、审批和并行 worker 状态吗？', '这些阶段不一定产生模型 token。', 'no', [
        { value: 'yes', label: 'Token 足够' }, { value: 'no', label: '不够', description: '要组合 updates/custom/values 等模式' }, { value: 'poll', label: '只能轮询数据库' },
      ], '✓ 对。图执行状态与模型 token 是不同通道。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-streaming-ui', title: '把多种流路由到节点卡片', description: '为 classify、retrieve、grade、review 和 generate 节点配置状态、Token、业务进度、错误与完成显示。', config: {} },
      reveal('Streaming 是执行协议，也是产品体验', '图的节点名可以直接映射 UI。', '<p>updates 适合节点进度，values 适合状态快照，messages 适合 token，custom 适合业务进度，debug 用于诊断。前端需要区分 pending、running、interrupted、error、completed，并按 run/node 标识去重。</p>'),
      transfer('并行检索 3 个数据源，前端要显示每个源完成度，应该使用什么？', '业务进度不是模型 token。', 'custom', [
        { value: 'custom', label: '每个 worker 发送 custom progress，并结合 updates' },
        { value: 'messages', label: '伪造模型 token', feedback: '会混淆生成文本和业务状态。' },
        { value: 'final', label: '只等最终输出', feedback: '用户无法看到长时间执行进度。' },
      ], '✓ 对。Custom stream 让业务步骤成为真实 UI 状态。'),
    ],
  },
  {
    id: 'lesson-52', number: 52, columnId: 'column-05', shortTitle: '短期与长期 Memory',
    title: 'Thread 里的聊天历史和跨会话用户偏好，为什么不能放同一个地方？',
    titleHtml: 'Checkpointer 管线程，<span class="cr-marker">Store 管跨线程长期记忆</span>',
    eyebrow: 'MEMORY SCOPES · LESSON 52',
    description: '区分 thread-scoped State 与 namespace/key Store，配置消息压缩、用户记忆、组织知识和语义搜索。',
    prerequisites: ['Checkpoint/thread_id', 'Embedding 基础', '租户隔离'],
    terms: [term('Short-term Memory', '保存在线程 State 中、随每一步读取和更新的会话上下文。'), term('Long-term Memory', '跨线程存在的用户或应用级 JSON 记忆。'), term('Store', '按 namespace 与 key 组织长期记忆的持久化接口。'), term('Namespace', '用于用户、组织、应用场景隔离的层级路径。')],
    officialReference: official(sources.memory, sources.persistence),
    stages: [
      prediction('用户语言偏好需要在多个新会话中复用，应该只存在某个 thread checkpoint 里吗？', '新线程不会自动继承旧线程 State。', 'store', [
        { value: 'thread', label: '只写 thread State' }, { value: 'store', label: '写入长期 Store namespace' }, { value: 'prompt', label: '让模型永久记住' },
      ], '✓ 对。跨线程记忆应进入 Store，并按用户/组织命名空间隔离。'),
      { id: 'lab', type: 'simulator', simulator: 'lg-memory-scopes', title: '在 Thread State 与 Store 之间分配记忆', description: '处理消息历史、订单上下文、用户偏好、组织术语和临时工具结果，测试跨线程读取与隔离。', config: {} },
      reveal('Memory 的核心是 Scope 与生命周期', '不是把所有文本塞进 messages。', '<p>短期记忆属于 thread State，通过 checkpointer 恢复；长期记忆进入 Store，以 namespace/key 组织，可做语义搜索。生产环境需使用数据库实现，并明确写入时机、隐私、过期和删除策略。</p>'),
      transfer('公司级术语表要被所有用户线程检索，namespace 应怎样设计？', '它不是某个用户线程私有状态。', 'org', [
        { value: 'org', label: '[organizationId, "terminology"]' },
        { value: 'thread', label: '[threadId]', feedback: '每个线程都会重复且无法共享。' },
        { value: 'global', label: '所有租户共用无隔离 global', feedback: '可能造成跨组织数据泄漏。' },
      ], '✓ 对。长期记忆的命名空间必须表达业务隔离。'),
    ],
  },
];
