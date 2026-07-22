const prediction = (title, description, correctValue, options, correctText, incorrectText = '答案已记录。下面用实验验证。') => ({ id: 'prediction', type: 'prediction', title, description, correctValue, options, correctText, incorrectText });
const reveal = (title, description, html) => ({ id: 'reveal', type: 'content', title, description, html });
const transfer = (title, description, correctValue, options, correctText) => ({ id: 'transfer', type: 'quiz', title, description, correctValue, options, correctText });

const initialTsSource = `import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const EmailIntent = z.object({
  intent: z.enum(["refund", "refund_query", "complaint", "unknown"]),
  confidence: z.number().min(0).max(1),
  reason: z.string()
});

const model = new ChatOpenAI({ model: "gpt-4.1-mini" });

function classifyEmail(email: string) {
  const result = model.invoke([
    { role: "system", content: "询问退款到账时间时，优先返回 refund_query。" },
    { role: "user", content: email }
  ]);

  return result.content;
}`;

export const course = {
  id: 'ai-app-engineering-foundations', title: 'AI 应用开发学院', subtitle: 'Java CRUD 开发者的交互式 AI 工程路线',
  columns: [
    { id: 'column-01', title: '专栏一 · 从 CRUD 到模型请求', description: '建立 AI 应用认知、技术路线、最小 TypeScript 和 Messages 请求模型。', lessonIds: ['lesson-01', 'lesson-02', 'lesson-03', 'lesson-04'], examId: 'exam-column-01' },
    { id: 'column-02', title: '专栏二 · Prompt 与输出契约工程', description: '把模糊需求变成可执行指令、可验证输出、Few-shot 行为和回归评估。', lessonIds: ['lesson-05', 'lesson-06', 'lesson-07', 'lesson-08', 'lesson-09'], examId: 'exam-column-02', prerequisiteExamId: 'exam-column-01' },
  ],
  lessons: [
    {
      id: 'lesson-01', number: 1, columnId: 'column-01', title: '为什么只会 CRUD，还不等于会做 AI 应用？', shortTitle: 'CRUD 与概率系统', eyebrow: 'PROBABILISTIC SYSTEM · LESSON 01',
      titleHtml: '为什么只会 CRUD，<span class="cr-marker">还不等于会做 AI 应用？</span>', description: '同一个接口连续运行 20 次，观察业务规则、Schema 和失败兜底分别解决什么问题。',
      stages: [
        prediction('同一输入调用模型两次，结果一定完全一样吗？', '先区分确定性服务与概率性系统。', 'no', [
          { value: 'yes', label: '一定一样', description: '输入相同，输出就应完全相同' }, { value: 'no', label: '不一定', description: '模型输出存在概率性，应用需要工程约束' }, { value: 'cache', label: '只看缓存', description: '有缓存就不需要处理不确定性' },
        ], '✓ 对。模型调用不是普通数据库查询，应用必须管理概率性。'),
        { id: 'lab', type: 'simulator', simulator: 'distribution-lab', title: '连续跑 20 次，不要只看一个漂亮答案', description: '分别打开规则、Schema 和兜底，观察三条独立指标。', config: {} },
        reveal('Harness 不是额外套壳，而是让概率系统可交付', '模型能力之外，业务应用还需要规则、契约、校验和失败路径。', '<div class="reveal-grid"><article><b>规则</b><p>让判断边界更稳定。</p></article><article><b>Schema</b><p>让后端拿到固定字段与类型。</p></article><article><b>业务校验</b><p>阻止合法但不可接受的结果。</p></article><article><b>Fallback</b><p>重试、unknown 或人工审核。</p></article></div>'),
        transfer('Schema 打开后，分类一定更准确吗？', '区分格式稳定与判断准确。', 'no', [
          { value: 'yes', label: '一定更准确', feedback: 'Schema 主要固定输出结构，不会自动补齐业务判断规则。' }, { value: 'no', label: '不一定；Schema 主要保证返回契约' }, { value: 'model', label: '只要换更大模型就都解决', feedback: '更强模型仍需要业务规则、校验和失败路径。' },
        ], '✓ 对。准确性、格式稳定和失败处理必须分别设计。'),
      ],
    },
    {
      id: 'lesson-02', number: 2, columnId: 'column-01', title: 'Java、Python、TypeScript 都能做 AI，为什么本课选 TS？', shortTitle: '语言约束混合器', eyebrow: 'TECH CHOICE · LESSON 02',
      titleHtml: '语言没有总冠军，<span class="cr-marker">项目约束才是裁判</span>', description: '自由组合团队、运行环境和生态约束，让三种语言的匹配度实时变化。',
      stages: [
        prediction('有没有一种语言“天生”不能做 AI 应用？', '不要把生态优势误解成能力禁区。', 'no', [
          { value: 'java', label: 'Java 不适合 AI', description: 'AI 只能用 Python' }, { value: 'no', label: '没有', description: '三种语言都可以，选择取决于项目约束' }, { value: 'ts', label: '只有 TypeScript 能做交互课程', description: '浏览器只能运行 TypeScript' },
        ], '✓ 对。课程选择 TS 是工程权衡，不是能力宣判。'),
        { id: 'lab', type: 'simulator', simulator: 'constraint-mixer', title: '自己组合项目条件，而不是接受固定结论', description: '切换已有系统、团队能力、浏览器实验和 MCP 等约束。', config: { conditions: [
          { id: 'spring', label: '已有 Spring Boot 系统', weights: { java: 28, python: -4, ts: -5 } }, { id: 'javaTeam', label: '团队只熟悉 Java', weights: { java: 24, python: -8, ts: -9 } }, { id: 'science', label: '需要科学计算与研究', weights: { java: -5, python: 32, ts: -4 } }, { id: 'online', label: '浏览器内在线运行', weights: { java: -7, python: -3, ts: 25 } }, { id: 'shared', label: '前后端共享类型', weights: { java: -2, python: -4, ts: 22 } }, { id: 'langchain', label: '课程主线 LangChain JS', weights: { java: -5, python: 3, ts: 26 } }, { id: 'mcp', label: '开发 MCP Server', weights: { java: 4, python: 10, ts: 18 } }, { id: 'algorithm', label: '快速验证算法', weights: { java: -6, python: 24, ts: 2 } },
        ] } },
        reveal('这门课选择 TypeScript 的真正原因', '课程本身需要浏览器实验、Node 运行时和前后端共享模型。', '<p>Java 适合已有企业系统，Python 适合研究与数据生态；本课程选择 TypeScript，是因为教学产品、浏览器实验、LangChain JS 与 MCP 可以使用同一语言贯通。</p>'),
        transfer('已有大型 Spring Boot 系统，只新增一个 AI 审批能力，首选什么？', '技术选择要服从现有资产。', 'java', [
          { value: 'java', label: '优先 Java，在现有系统内接入模型与校验' }, { value: 'ts', label: '必须整体重写成 TypeScript', feedback: '没有必要为了 AI 接口重写成熟系统。' }, { value: 'python', label: '必须拆成 Python 微服务', feedback: '可能可行，但不是默认唯一答案。' },
        ], '✓ 对。语言选择是迁移成本、团队能力和运行环境的综合结果。'),
      ],
    },
    {
      id: 'lesson-03', number: 3, columnId: 'column-01', title: 'Java 开发者真正需要的最小 TypeScript', shortTitle: 'TypeScript 代码修理厂', eyebrow: 'TYPESCRIPT REPAIR · LESSON 03',
      titleHtml: '不要背完整语法，<span class="cr-marker">先修好一段异步 AI 代码</span>', description: '逐层修复 async、await、运行时 Schema 和返回契约，最终产出下一课可用的 TS 源码。',
      stages: [
        prediction('代码写了类型，就一定能安全接住模型返回吗？', '静态类型不会自动验证外部系统的真实数据。', 'repair', [
          { value: 'yes', label: '可以', description: '有 interface 或类型声明就够了' }, { value: 'repair', label: '还需要运行时校验', description: 'Promise 与真实返回结构都要处理' }, { value: 'java', label: '只能改回 Java', description: 'TypeScript 无法做运行时校验' },
        ], '✓ 对。TypeScript 管编译期，Zod 等 Schema 管系统边界。'),
        { id: 'lab', type: 'simulator', simulator: 'code-repair', title: '运行诊断，逐个修复真实失败', description: '不是点亮概念卡，而是修改同一份源码直到所有检查通过。', config: { initialSource: initialTsSource, artifactInputs: ['businessRisk', 'languageDecision'], successOutput: '✓ async/await 通过\n✓ JSON 解析通过\n✓ Zod 运行时校验通过\n✓ 返回 parsed 契约对象', issues: [
          { code: 'TS-ASYNC-01', title: '函数没有声明为 async', explanation: '模型调用返回 Promise，函数签名必须表达异步边界。', test: (s) => s.includes('async function classifyEmail'), fix: (s) => s.replace('function classifyEmail', 'async function classifyEmail') },
          { code: 'TS-AWAIT-02', title: 'model.invoke 没有 await', explanation: '现在的 result 是 Promise，不是模型响应。', test: (s) => /await\s+model\.invoke/.test(s), fix: (s) => s.replace('const result = model.invoke', 'const result = await model.invoke') },
          { code: 'RUNTIME-03', title: '没有验证模型真实返回', explanation: '静态类型在运行时不会自动检查 LLM 返回。', test: (s) => s.includes('EmailIntent.parse(JSON.parse(String(result.content)))'), fix: (s) => s.replace('  return result.content;', '  const parsed = EmailIntent.parse(JSON.parse(String(result.content)));\n\n  return result.content;') },
          { code: 'CONTRACT-04', title: '仍返回未校验原文', explanation: '调用方应该只拿到通过契约的数据。', test: (s) => s.includes('return parsed;'), fix: (s) => s.replace('return result.content;', 'return parsed;') },
        ] } },
        reveal('TypeScript 提供两层保护', '编译器发现代码问题，Schema 检查模型真实返回。', '<p><b>编译期：</b>函数签名、Promise 和字段访问。</p><p><b>运行时：</b>JSON、Zod Schema 和业务规则。</p><p>两层不能互相替代。</p>'),
        transfer('为什么只写 interface 还不够？', '迁移到所有外部 AI API。', 'runtime', [
          { value: 'runtime', label: '模型返回来自运行时边界，需要验证真实数据' }, { value: 'speed', label: 'interface 运行速度慢', feedback: 'interface 在运行时不会存在。' }, { value: 'java', label: '只有 Java Bean Validation 能校验', feedback: 'TypeScript 可使用 Zod 等运行时 Schema。' },
        ], '✓ 对。静态类型约束代码，Schema 验证系统边界。'),
      ],
    },
    {
      id: 'lesson-04', number: 4, columnId: 'column-01', title: '一次模型请求里，到底装了什么？', shortTitle: 'Messages 上下文窗口', eyebrow: 'MESSAGE WINDOW · LESSON 04',
      titleHtml: '一次请求不是一句话，<span class="cr-marker">而是一只有限容量的行李箱</span>', description: '选择 System、History、Reference 和 User，调整 Token 预算，看旧信息如何被挤出。',
      stages: [
        prediction('用户说“继续用那个方案”，只发当前一句够吗？', '指代需要历史上下文。', 'history', [
          { value: 'yes', label: '够', description: '模型会自己知道“那个方案”' }, { value: 'history', label: '不够，需要必要历史', description: '当前句缺少指代对象' }, { value: 'all', label: '把所有历史永久塞进去', description: '上下文越多越好' },
        ], '✓ 对。不是历史越多越好，而是保留完成当前任务所需的信息。'),
        { id: 'lab', type: 'simulator', simulator: 'context-window', title: '把消息放进行李箱，观察挤出', description: '至少保留 System、必要历史和当前 User，再控制无关内容。', config: { messages: [
          { id: 'system', role: 'system', label: '业务分类规则', content: '退款到账时间优先 refund_query。', tokens: 70 }, { id: 'old', role: 'history', label: '三轮无关寒暄', content: '你好、天气、闲聊。', tokens: 95 }, { id: 'history', role: 'history', label: '上轮确定的退款方案', content: '方案 A：先查询退款进度。', tokens: 65 }, { id: 'reference', role: 'reference', label: '完整公司制度 PDF', content: '公司制度全文……', tokens: 160 }, { id: 'snippet', role: 'reference', label: '相关制度片段', content: '退款通常 3 个工作日到账。', tokens: 55 }, { id: 'user', role: 'user', label: '继续用那个方案', content: '继续用那个方案，帮我查一下。', tokens: 45 },
        ] } },
        reveal('Messages 是一次运行时上下文，不是永久记忆', '角色、顺序和预算共同决定模型实际看到什么。', '<p>System 定义行为边界，History 解决指代，Reference 提供事实，User 给出当前任务。超过窗口后，被挤出的内容等于本次不存在。</p>'),
        transfer('上下文窗口快满时，优先怎么处理？', '保留任务相关性，而不是机械保留全部历史。', 'select', [
          { value: 'select', label: '保留规则、必要历史和相关片段，删除无关内容' }, { value: 'system', label: '先删 System 规则', feedback: '删掉系统规则会失去行为边界。' }, { value: 'all', label: '继续全部追加，超过预算也没关系', feedback: '超过窗口的内容不会被模型看到。' },
        ], '✓ 对。上下文工程的核心是选择，不是堆积。'),
      ],
    },
    {
      id: 'lesson-05', number: 5, columnId: 'column-02', title: 'Prompt 里到底应该放什么？', shortTitle: 'Prompt 反事实实验', eyebrow: 'PROMPT ANATOMY · LESSON 05',
      titleHtml: '不要背万能公式，<span class="cr-marker">删掉一块看看哪里会坏</span>', description: '构造完整 Prompt，再逐块删除任务、上下文、规则、输出和失败策略。',
      stages: [
        prediction('Prompt 越长，效果就一定越好吗？', '长度不是目标，减少关键歧义才是目标。', 'no', [
          { value: 'yes', label: '越长越好', description: '信息越多模型越聪明' }, { value: 'no', label: '不一定', description: '关键是职责清楚、规则一致和出口合法' }, { value: 'short', label: '越短越好', description: '一句话永远最优' },
        ], '✓ 对。Prompt 工程是减少模型脑补，不是追求字数。'),
        { id: 'lab', type: 'simulator', simulator: 'prompt-anatomy', title: '完整后再删除，证明每一块的必要性', description: '点击块切换启用状态，观察对应失败。', config: { blocks: [
          { id: 'task', name: '任务', summary: '判断邮件意图', content: '判断用户邮件属于哪个业务意图。', failure: '模型不知道应该分类、摘要还是回复。' }, { id: 'context', name: '业务上下文', summary: '类别代表什么', content: 'refund 是申请退款；refund_query 是查询退款到账进度。', failure: '类别含义重新依赖模型常识。' }, { id: 'rules', name: '判断规则', summary: '边界与优先级', content: '只要询问到账时间，优先 refund_query；不要被不满语气误导。', failure: '混合意图和边界输入开始摇摆。' }, { id: 'output', name: '输出要求', summary: '固定字段', content: '只返回 intent、confidence 和 reason 的 JSON。', failure: '后端重新拿到一段自然语言散文。' }, { id: 'failure', name: '失败策略', summary: '信息不足怎么办', content: '信息不足返回 unknown，不要猜测。', failure: '模型在缺信息时被迫编一个答案。' },
        ] } },
        reveal('Prompt 的五块不是形式主义', '每一块对应一种可以被复现的失败。', '<p>任务解决“做什么”，上下文解决“这里是什么意思”，规则解决“边界怎么判”，输出解决“系统怎么接”，失败策略解决“不知道时怎么办”。</p>'),
        transfer('信息不足时，哪种指令更可执行？', '给模型一个合法出口。', 'unknown', [
          { value: 'guess', label: '尽量猜一个最可能的类别', feedback: '这会把不确定性伪装成确定结果。' }, { value: 'unknown', label: '证据不足时返回 unknown，并说明缺少什么' }, { value: 'long', label: '把 Prompt 再写长一点', feedback: '长度不能替代明确的失败策略。' },
        ], '✓ 对。可靠系统必须允许模型承认信息不足。'),
      ],
    },
    {
      id: 'lesson-06', number: 6, columnId: 'column-02', title: '怎样把模糊要求写成可执行指令？', shortTitle: '规则路由台', eyebrow: 'RULE ROUTING · LESSON 06',
      titleHtml: '规则不只是句子，<span class="cr-marker">还需要优先级和冲突处理</span>', description: '调整规则顺序，批量重跑一组邮件，直接观察边界误路由。',
      stages: [
        prediction('两条规则都命中时，模型会自动理解业务优先级吗？', '没有明确优先级，模型只能自行裁决。', 'no', [
          { value: 'yes', label: '会自动理解', description: '自然语言常识足够' }, { value: 'no', label: '不一定', description: '需要显式优先级与多意图规则' }, { value: 'orderless', label: '规则顺序永远无关', description: '所有规则地位完全相同' },
        ], '✓ 对。冲突规则需要明确谁优先。'),
        { id: 'lab', type: 'simulator', simulator: 'rule-routing', title: '移动规则顺序，观察所有历史邮件重新路由', description: '让到账查询优先于投诉语气。', config: { rules: [
          { id: 'complaint', label: '出现客服差/态度差 → complaint', description: '当前排在最前，会误吃混合意图', output: 'complaint', match: (t) => /客服|态度|很差/.test(t) }, { id: 'refund_query', label: '询问到账时间 → refund_query', description: '应该移动到投诉之前', output: 'refund_query', match: (t) => /到账|什么时候/.test(t) }, { id: 'refund', label: '明确申请退款 → refund', description: '处理退款动作', output: 'refund', match: (t) => /我要退款|申请退款/.test(t) }, { id: 'query', label: '查询订单状态 → query', description: '普通订单查询', output: 'query', match: (t) => /订单状态|查订单/.test(t) }, { id: 'unknown', label: '其他 → unknown', description: '必须放在最后', output: 'unknown', match: () => true },
        ], emails: [
          { name: '混合意图', text: '客服很差，退款什么时候到账？', expected: 'refund_query' }, { name: '纯投诉', text: '客服态度太差了', expected: 'complaint' }, { name: '退款申请', text: '我要退款', expected: 'refund' }, { name: '订单查询', text: '帮我查订单状态', expected: 'query' }, { name: '信息不足', text: '帮我处理一下', expected: 'unknown' },
        ] } },
        reveal('可执行规则需要覆盖定义、优先级和出口', '单条规则正确，不代表规则集合没有冲突。', '<p>定义告诉模型类别是什么，优先级处理多意图冲突，unknown 给信息不足一个合法出口。测试集则证明这些规则在真实边界上能工作。</p>'),
        transfer('哪种规则最容易执行和测试？', '规则需要可观察的条件与结果。', 'explicit', [
          { value: 'good', label: '请合理判断用户真正想法', feedback: '“合理”无法稳定测试。' }, { value: 'explicit', label: '只要询问退款到账时间，即使语气不满，也优先 refund_query' }, { value: 'smart', label: '请更聪明地分类', feedback: '没有给出边界和优先级。' },
        ], '✓ 对。可执行规则必须能落到具体输入和预期输出。'),
      ],
    },
    {
      id: 'lesson-07', number: 7, columnId: 'column-02', title: '结构化输出与 Zod：为什么 JSON 能解析还不够？', shortTitle: '三道验证门', eyebrow: 'STRUCTURED OUTPUT · LESSON 07',
      titleHtml: 'JSON 只是第一道门，<span class="cr-marker">业务可用还要再过两道</span>', description: '编辑模型返回，依次通过 JSON 语法、Schema 字段类型和业务组合检查。',
      stages: [
        prediction('JSON.parse 成功，结果就可以直接入库吗？', '语法正确不等于字段正确，更不等于业务合理。', 'no', [
          { value: 'yes', label: '可以直接入库', description: '能解析就是合法数据' }, { value: 'no', label: '还不够', description: '还要 Schema 和业务规则' }, { value: 'string', label: '只要返回字符串最安全', description: '后端自己猜字段' },
        ], '✓ 对。三道门负责三种不同失败。'),
        { id: 'lab', type: 'simulator', simulator: 'structured-output', title: '编辑 JSON，观察失败停在哪一道门', description: '使用预设坏样例，也可以自己修字段。', config: { presets: [
          { label: '类型错误', json: '{\n  "intent": "refund_query",\n  "confidence": "high",\n  "reason": "询问到账时间"\n}' }, { label: '业务冲突', json: '{\n  "intent": "unknown",\n  "confidence": 0.95,\n  "reason": "信息不足"\n}' }, { label: '正确样例', json: '{\n  "intent": "refund_query",\n  "confidence": 0.91,\n  "reason": "用户询问退款到账时间"\n}' },
        ], schema: (v) => { if (!v || typeof v !== 'object') return { ok: false, reason: '必须是对象' }; if (!['refund', 'refund_query', 'complaint', 'query', 'unknown'].includes(v.intent)) return { ok: false, reason: 'intent 不在枚举中' }; if (typeof v.confidence !== 'number' || v.confidence < 0 || v.confidence > 1) return { ok: false, reason: 'confidence 必须是 0~1 数字' }; if (typeof v.reason !== 'string' || !v.reason.trim()) return { ok: false, reason: 'reason 必须是非空字符串' }; return { ok: true }; }, business: (v) => v.intent === 'unknown' && v.confidence > 0.5 ? { ok: false, reason: 'unknown 不应高置信度自动流转' } : { ok: true }, schemaSource: 'z.object({ intent: z.enum(["refund", "refund_query", "complaint", "query", "unknown"]), confidence: z.number().min(0).max(1), reason: z.string().min(1) })' } },
        reveal('Schema 与业务校验不能合并成一句“数据合法”', '它们失败后的处理策略也不同。', '<p>JSON 失败通常重试格式；Schema 失败说明字段或类型错误；业务规则失败则可能进入人工审核、unknown 或拒绝自动流转。</p>'),
        transfer('`intent=unknown, confidence=0.95` 通过 Schema 后该怎么办？', '字段类型合法，但业务组合可疑。', 'business', [
          { value: 'accept', label: '直接自动流转', feedback: '高置信度 unknown 与业务语义冲突。' }, { value: 'business', label: '交给业务校验，拒绝自动流转或人工审核' }, { value: 'json', label: '再次 JSON.parse', feedback: '语法已经没有问题。' },
        ], '✓ 对。业务校验负责 Schema 表达不了的组合约束。'),
      ],
    },
    {
      id: 'lesson-08', number: 8, columnId: 'column-02', title: 'Few-shot 不是多放几个例子，而是选择行为边界', shortTitle: 'Few-shot 语义地图', eyebrow: 'FEW-SHOT MAP · LESSON 08',
      titleHtml: '预算只够三个示例，<span class="cr-marker">你会选最近的三个吗？</span>', description: '在语义地图中选择示例，比较相关性、重复度、边界覆盖和失败出口。',
      stages: [
        prediction('Few-shot 会永久修改模型权重吗？', '示例只进入本次上下文。', 'no', [
          { value: 'yes', label: '会微调模型', description: '示例会永久写进参数' }, { value: 'no', label: '不会', description: '它通过当前上下文展示期望行为' }, { value: 'cache', label: '只影响浏览器缓存', description: '与模型行为无关' },
        ], '✓ 对。Few-shot 是上下文中的行为演示，不是训练。'),
        { id: 'lab', type: 'simulator', simulator: 'few-shot-map', title: '预算内同时覆盖边界、对比和失败出口', description: '最近的三个例子可能互相重复，不能代表完整决策边界。', config: { examples: [
          { id: 'boundary', label: '问了三次还没到账', kind: 'boundary', tokens: 95, x: 57, y: 43 }, { id: 'near', label: '退款什么时候到', kind: 'normal', tokens: 95, x: 63, y: 38 }, { id: 'duplicate', label: '退款何时到账', kind: 'normal', tokens: 90, x: 65, y: 40 }, { id: 'contrast', label: '客服态度太差', kind: 'contrast', tokens: 90, x: 31, y: 68 }, { id: 'failure', label: '帮我处理一下', kind: 'failure', tokens: 80, x: 42, y: 22 }, { id: 'refund', label: '我要申请退款', kind: 'normal', tokens: 105, x: 76, y: 67 },
        ] } },
        reveal('好的示例集同时管理相关性、覆盖和多样性', '不是“越像当前输入越好”。', '<p>相关例告诉模型当前任务的局部行为；边界例展示冲突优先级；对比例区分相邻类别；失败例告诉模型不知道时如何退出。</p>'),
        transfer('三个几乎相同的退款到账示例有什么问题？', '它们很相关，但覆盖价值低。', 'duplicate', [
          { value: 'best', label: '最可靠，因为都很相似', feedback: '重复示例会浪费预算，无法展示边界和失败出口。' }, { value: 'duplicate', label: '相关性高但重复，应该换入边界、对比或失败例' }, { value: 'train', label: '会把模型永久训练成退款模型', feedback: 'Few-shot 不修改模型权重。' },
        ], '✓ 对。有限预算下要最大化行为覆盖，而不是重复投票。'),
      ],
    },
    {
      id: 'lesson-09', number: 9, columnId: 'column-02', title: 'Prompt 评估、版本与回归', shortTitle: '可重跑评估矩阵', eyebrow: 'PROMPT EVALUATION · LESSON 09',
      titleHtml: 'Prompt 改了一行，<span class="cr-marker">不要只试一个成功案例</span>', description: '修改 Prompt、重跑固定 Dataset、筛选失败和新增 Golden Case。',
      stages: [
        prediction('v2 平均准确率比 v1 高，就一定可以发布吗？', '平均分可能掩盖关键旧能力回归。', 'no', [
          { value: 'yes', label: '可以', description: '平均分提高说明全面变好' }, { value: 'no', label: '不一定', description: '还要检查关键案例和旧能力回归' }, { value: 'length', label: '看 Prompt 是否更长', description: '越长越适合发布' },
        ], '✓ 对。发布判断需要 Dataset、版本、Evaluator 和回归检查。'),
        { id: 'lab', type: 'simulator', simulator: 'evaluation-matrix', title: '修改规则，用同一组案例重跑', description: '默认 Prompt 修复了部分问题，却错误拒绝缺订单号的退款申请。', config: { initialPrompt: '类别：refund / refund_query / complaint / query / unknown\n规则：询问到账时间优先 refund_query。\n信息不足返回 unknown。\n退款申请缺订单号时返回 unknown。', cases: [
          { name: '普通退款申请', text: '我要退款', expected: 'refund', v1: 'refund' }, { name: '询问退款到账', text: '退款什么时候到账', expected: 'refund_query', v1: 'refund' }, { name: '不满+到账查询', text: '问了三次还没到账', expected: 'refund_query', v1: 'complaint' }, { name: '纯服务投诉', text: '客服态度太差', expected: 'complaint', v1: 'complaint' }, { name: '信息不足', text: '帮我处理一下', expected: 'unknown', v1: 'refund' }, { name: '退款缺订单号', text: '我要退款，但没找到订单号', expected: 'refund', v1: 'refund' }, { name: '普通订单查询', text: '查订单状态', expected: 'query', v1: 'query' }, { name: '混合多意图', text: '客服很差，退款何时到账', expected: 'refund_query', v1: 'complaint' },
        ] } },
        reveal('Prompt 应像代码一样拥有测试资产', '版本文本本身不是全部，Dataset 和报告同样是产物。', '<p><b>Dataset</b> 固定输入与期望；<b>Target</b> 是被测试的 Prompt/应用；<b>Evaluator</b> 定义通过标准；<b>Regression</b> 检查旧能力是否被新版本破坏。</p>'),
        transfer('发布 Prompt v2 前，哪套流程更可靠？', '可比较、可回退、可解释。', 'release', [
          { value: 'release', label: '保留 v1，v2 跑同一 Dataset；检查回归，通过后发布并保留回退' }, { value: 'one', label: '只测最新发现的一个成功案例', feedback: '单例无法证明旧能力没有回归。' }, { value: 'overwrite', label: '直接覆盖旧 Prompt', feedback: '没有版本和报告就无法解释或回退。' },
        ], '✓ 对。Prompt 发布也应有版本、测试集、报告和回退能力。'),
      ],
    },
  ],
  exams: [
    { id: 'exam-column-01', columnId: 'column-01', title: '专栏一综合考试', description: '通过线 80%，通过后解锁 Prompt 与输出契约专栏。', questions: [
      { text: 'Schema 主要解决什么？', options: ['固定返回字段与类型', '自动提高所有分类准确率', '永久训练模型'], correct: 0 }, { text: '为什么课程选择 TypeScript？', options: ['TypeScript 是唯一能调用模型的语言', '项目需要浏览器、Node 和共享类型贯通', 'Java 不能做 AI'], correct: 1 }, { text: '为什么外部模型返回还需要 Zod？', options: ['静态类型不会验证运行时真实数据', 'Zod 让代码更短', 'Promise 只能由 Zod 处理'], correct: 0 }, { text: '上下文窗口满时优先做什么？', options: ['删除 System', '选择任务相关内容并移除无关历史', '继续无限追加'], correct: 1 }, { text: '低置信度结果应该如何处理？', options: ['始终自动流转', '根据策略重试、unknown 或人工审核', '忽略 confidence'], correct: 1 },
    ] },
    { id: 'exam-column-02', columnId: 'column-02', title: '专栏二综合考试', description: '通过线 80%，证明你已经能把 Prompt 当成可测试的软件资产。', questions: [
      { text: 'Prompt 的失败策略解决什么？', options: ['信息不足时提供合法出口', '让 Prompt 字数更长', '替代业务规则'], correct: 0 }, { text: '规则集合为什么需要优先级？', options: ['同一输入可能命中多条规则', '模型只能读第一行', '优先级会训练权重'], correct: 0 }, { text: 'JSON.parse 成功后还需要什么？', options: ['Schema 与业务组合校验', '再解析三次', '直接入库'], correct: 0 }, { text: 'Few-shot 选择的核心是什么？', options: ['只选最近的重复例', '兼顾相关性、边界、对比和失败出口', '越多越好'], correct: 1 }, { text: 'Prompt v2 平均分更高时还要检查什么？', options: ['关键案例回归与可回退版本', 'Prompt 字数', '模型名称是否更长'], correct: 0 },
    ] },
  ],
};
