const prediction = (title, description, correctValue, options, correctText, incorrectText = '答案已记录。下面用实验验证。') => ({
  id: 'prediction', type: 'prediction', title, description, correctValue, options, correctText, incorrectText,
});
const reveal = (title, description, html) => ({ id: 'reveal', type: 'content', title, description, html });
const transfer = (title, description, correctValue, options, correctText) => ({ id: 'transfer', type: 'quiz', title, description, correctValue, options, correctText });

const lessons = [
  {
    id: 'lesson-10', number: 10, columnId: 'column-03',
    title: 'LangChain 的 Model 层，到底替我们统一了什么？',
    shortTitle: '完成第一次标准模型调用',
    eyebrow: 'MODEL & AIMESSAGE · LESSON 10',
    titleHtml: '模型供应商可以变化，<span class="cr-marker">应用读取结果的方式不应该跟着重写</span>',
    description: '使用同一组 Messages 切换模型服务，理解 invoke()、AIMessage 和响应元数据的统一接口。',
    stages: [
      prediction('把 OpenAI 换成另一家模型后，业务代码一定要全部重写吗？', '区分供应商 SDK 和 LangChain 标准接口。', 'adapter', [
        { value: 'rewrite', label: '一定要重写', description: '每家模型都有完全不同的业务对象' },
        { value: 'adapter', label: '不一定', description: 'LangChain 在 Model 与 Message 层提供统一接口' },
        { value: 'same', label: '所有模型返回完全相同', description: '供应商差异会彻底消失' },
      ], '✓ 对。LangChain 统一常用调用与消息对象，但不会抹掉所有供应商能力差异。'),
      {
        id: 'lab', type: 'simulator', simulator: 'model-invocation',
        title: '用同一份业务规则完成一次标准模型调用',
        description: '比较字符串输入和 Messages 输入，再切换模型服务，观察业务代码实际读取什么。',
        config: {},
      },
      reveal('invoke() 返回的不是一段裸字符串', 'AIMessage 同时携带文本、工具调用和响应元数据。', `
        <div class="reveal-grid">
          <article><b>Messages</b><p>用 system、user、AI 和 tool 等角色表达上下文。</p></article>
          <article><b>invoke()</b><p>等待本次调用完成，返回一个完整 AIMessage。</p></article>
          <article><b>AIMessage.text</b><p>读取标准文本结果，而不是绑定某家 SDK 的字段。</p></article>
          <article><b>Metadata</b><p>Token 用量、结束原因和供应商响应信息仍然可用。</p></article>
        </div>
        <pre><code>const response = await model.invoke(messages);
console.log(response.text);
console.log(response.usage_metadata);</code></pre>`),
      transfer('什么时候应该保留供应商专属字段？', '统一接口不等于永远只用最小公共能力。', 'capability', [
        { value: 'never', label: '永远不能使用', feedback: '统一接口允许保留供应商扩展信息。' },
        { value: 'capability', label: '当业务确实依赖某家模型的专属能力时，明确隔离在适配层' },
        { value: 'everywhere', label: '所有业务层都直接读取供应商原始响应', feedback: '这会让切换模型的成本扩散到整个系统。' },
      ], '✓ 对。通用逻辑走标准接口，专属能力被明确隔离。'),
    ],
  },
  {
    id: 'lesson-11', number: 11, columnId: 'column-03',
    title: '模型要等十几秒，怎样让用户知道系统还活着？',
    shortTitle: '设计可取消的流式响应',
    eyebrow: 'STREAMING · LESSON 11',
    titleHtml: '流式输出不是打字机特效，<span class="cr-marker">而是一套完整的运行状态</span>',
    description: '比较 invoke() 与 stream()，逐块接收 AIMessageChunk，处理合并、取消、完成和错误状态。',
    stages: [
      prediction('只要把文字一个字一个字显示出来，就算完成流式工程了吗？', '流式体验还包含状态、合并和中断。', 'no', [
        { value: 'yes', label: '是', description: '打字机效果就是全部' },
        { value: 'no', label: '不是', description: '还要处理 chunk、取消、错误与最终合并' },
        { value: 'invoke', label: 'invoke() 自动就是流式', description: '无需改变消费方式' },
      ], '✓ 对。流式是数据消费和状态管理，不只是视觉动画。'),
      {
        id: 'lab', type: 'simulator', simulator: 'streaming-lab',
        title: '逐块接收回答，并把它恢复成完整消息',
        description: '先体验 invoke() 的等待，再切换 stream()；尝试取消、重试和 chunk 合并。',
        config: {},
      },
      reveal('stream() 返回的是异步可迭代的消息块', '每个 chunk 都可能只包含部分文本或部分工具调用参数。', `
        <p><b>invoke()</b> 在模型完成后返回一个完整 AIMessage；<b>stream()</b> 则持续产出 AIMessageChunk。</p>
        <pre><code>const stream = await model.stream(messages);
let full = null;
for await (const chunk of stream) {
  full = full ? full.concat(chunk) : chunk;
  render(full.text);
}</code></pre>
        <p>真正的界面还要明确区分等待、接收中、已取消、失败和完成。</p>`),
      transfer('用户在流式响应中途点击“停止”，正确处理是什么？', '取消不等于把已有内容全部丢掉。', 'cancel', [
        { value: 'ignore', label: '忽略用户操作，继续生成', feedback: '这会浪费成本并破坏用户控制感。' },
        { value: 'cancel', label: '停止后续接收，保留已显示内容，并允许重新开始' },
        { value: 'erase', label: '清空所有已收到内容且不提示', feedback: '用户会无法判断发生了什么。' },
      ], '✓ 对。取消、重试和部分结果都属于流式协议的一部分。'),
    ],
  },
  {
    id: 'lesson-12', number: 12, columnId: 'column-03',
    title: '模型说“我要查订单”，工具到底由谁执行？',
    shortTitle: '完成一次安全的工具调用',
    eyebrow: 'TOOL CALLING · LESSON 12',
    titleHtml: '模型可以提出调用，<span class="cr-marker">但不能直接获得系统权限</span>',
    description: '定义工具描述和 Zod 参数，只开放必要能力，走完 AIMessage.tool_calls 到 ToolMessage 的闭环。',
    stages: [
      prediction('把工具绑定给模型后，模型会直接在你的数据库里执行操作吗？', '区分“生成调用意图”和“执行真实函数”。', 'app', [
        { value: 'model', label: '会直接执行', description: '模型本身拥有数据库权限' },
        { value: 'app', label: '不会', description: '模型生成 tool call，应用校验并执行函数' },
        { value: 'prompt', label: '只是在 Prompt 中写一句话', description: '不需要 Schema 或 ToolMessage' },
      ], '✓ 对。模型提出名称和参数，真正的执行权仍然在应用。'),
      {
        id: 'lab', type: 'simulator', simulator: 'tool-calling-lab',
        title: '只开放查询权限，完成一次退款进度查询',
        description: '选择工具、修正参数 Schema，观察 HumanMessage、AIMessage、ToolMessage 和最终回答如何衔接。',
        config: {},
      },
      reveal('一次工具调用至少跨越四个对象', '工具名、描述和 Schema 会直接影响模型能否产生正确调用。', `
        <pre><code>const lookupRefund = tool(runLookup, {
  name: "lookup_refund",
  description: "根据订单号查询退款状态",
  schema: z.object({ order_id: z.string() })
});

const modelWithTools = model.bindTools([lookupRefund]);</code></pre>
        <ol>
          <li>HumanMessage 提出目标。</li>
          <li>AIMessage.tool_calls 给出工具名、参数和调用 ID。</li>
          <li>应用校验参数并执行真实函数。</li>
          <li>ToolMessage 使用相同 tool_call_id 把结果送回模型。</li>
        </ol>`),
      transfer('为什么不应该把所有写操作工具都默认暴露给模型？', '能力边界也是 Harness 的一部分。', 'least', [
        { value: 'smart', label: '模型足够聪明，不需要限制', feedback: '能力越大，误调用和越权风险越高。' },
        { value: 'least', label: '应该按当前任务遵循最小权限，只暴露必要工具' },
        { value: 'schema', label: '有 Zod 就可以开放所有权限', feedback: 'Schema 只验证参数，不替代授权和审批。' },
      ], '✓ 对。工具 Schema、权限和审批必须分别设计。'),
    ],
  },
  {
    id: 'lesson-13', number: 13, columnId: 'column-03',
    title: '什么时候一次工具调用，变成了一个 Agent？',
    shortTitle: '看懂模型与工具的循环',
    eyebrow: 'AGENT LOOP · LESSON 13',
    titleHtml: 'Agent 不是“更聪明的聊天框”，<span class="cr-marker">而是有停止条件的模型—工具循环</span>',
    description: '单步运行模型判断、工具执行、观察结果和最终回答，理解 createAgent 的最小循环。',
    stages: [
      prediction('Agent 调用一次工具后，一定立刻结束吗？', '工具结果会重新进入模型上下文。', 'loop', [
        { value: 'yes', label: '一定结束', description: '工具就是最终答案' },
        { value: 'loop', label: '不一定', description: '模型要读取 ToolMessage，再决定继续还是回答' },
        { value: 'forever', label: '会永远循环', description: 'Agent 没有停止机制' },
      ], '✓ 对。Agent 在模型和工具之间迭代，直到最终输出或触发停止条件。'),
      {
        id: 'lab', type: 'simulator', simulator: 'agent-loop-lab',
        title: '单步走完一次 Model → Tool → Model 循环',
        description: '设置迭代上限和最终输出停止条件，再观察每一步为什么发生。',
        config: {},
      },
      reveal('createAgent 提供的是图式运行时，不是一个无限 while(true)', '生产 Agent 必须同时拥有目标、工具、状态和停止条件。', `
        <pre><code>const agent = createAgent({
  model,
  tools: [lookupRefund]
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "查询退款状态" }]
});</code></pre>
        <p>典型循环是：模型判断 → 工具执行 → ToolMessage → 模型再次判断。模型给出最终输出、达到迭代上限或发生错误时，循环必须结束。</p>`),
      transfer('Agent 一直重复调用同一个工具，第一优先应该检查什么？', 'Loop 工程首先要保证可以停下来。', 'stop', [
        { value: 'bigger', label: '直接换更大的模型', feedback: '模型能力可能有帮助，但不能替代停止和去重策略。' },
        { value: 'stop', label: '检查工具结果是否被正确送回，以及停止、去重和迭代上限是否生效' },
        { value: 'more', label: '再给它开放更多工具', feedback: '更多能力可能放大循环问题。' },
      ], '✓ 对。可观察轨迹和停止条件，是 Agent Loop 能否交付的基础。'),
    ],
  },
];

const exam = {
  id: 'exam-column-03', columnId: 'column-03',
  title: '专栏三综合考试',
  description: '通过线 80%。通过后解锁 RAG 知识库工程。',
  questions: [
    { text: 'model.invoke(messages) 通常返回什么？', options: ['完整 AIMessage', '数据库连接', '只能是一段字符串'], correct: 0 },
    { text: 'stream() 返回的 chunk 为什么需要合并？', options: ['每个 chunk 可能只是部分消息', '为了永久训练模型', '因为 invoke() 不支持文本'], correct: 0 },
    { text: '模型产生 tool call 后，谁执行真实工具？', options: ['应用代码', '模型参数本身', '浏览器 CSS'], correct: 0 },
    { text: 'ToolMessage 最关键的关联字段是什么？', options: ['与 AIMessage tool call 对应的调用 ID', '用户昵称', '页面主题颜色'], correct: 0 },
    { text: 'Agent Loop 为什么需要迭代上限？', options: ['避免重复调用和无限循环', '让工具拥有更多权限', '让 Prompt 自动变长'], correct: 0 },
  ],
};

export function extendWithColumn03(course) {
  if (course.columns.some((column) => column.id === 'column-03')) return course;
  return {
    ...course,
    columns: [
      ...course.columns,
      {
        id: 'column-03',
        title: '专栏三 · LangChain 核心开发',
        description: '掌握标准模型调用、流式响应、工具调用和 Agent Loop，搭好后续 RAG 与 LangGraph 的运行基础。',
        lessonIds: lessons.map((lesson) => lesson.id),
        examId: exam.id,
        prerequisiteExamId: 'exam-column-02',
      },
    ],
    lessons: [...course.lessons, ...lessons],
    exams: [...course.exams, exam],
  };
}

export { lessons as column03Lessons, exam as column03Exam };
