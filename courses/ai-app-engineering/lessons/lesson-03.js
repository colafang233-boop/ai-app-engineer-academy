const initialSource = `import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const EmailIntent = z.object({
  intent: z.enum([
    "refund",
    "refund_query",
    "complaint",
    "unknown"
  ]),
  confidence: z.number().min(0).max(1),
  reason: z.string()
});

const model = new ChatOpenAI({ model: "gpt-4.1-mini" });

function classifyEmail(email: string) {
  const result = model.invoke([
    {
      role: "system",
      content: "询问退款到账时间时，优先返回 refund_query。"
    },
    { role: "user", content: email }
  ]);

  return result.content;
}
`;

export default {
  id: 'lesson-03-typescript-repair',
  eyebrow: 'COURSE RUNTIME REFERENCE · LESSON 03',
  title: 'Java 开发者真正需要的，不是背 TypeScript，',
  titleHtml: 'Java 开发者真正需要的，不是背 TypeScript，<span class="cr-marker">而是读懂并修好异步 AI 代码</span>',
  description: '这是一节由 LessonConfig 驱动的课程。Runtime 负责章节、状态、解锁、产物保存和通用交互；本课只声明教学内容与代码诊断规则。',
  stages: [
    {
      id: 'prediction',
      type: 'prediction',
      title: '下面这段代码有类型，看起来也很像 Java；它能直接工作吗？',
      description: '先下注。预测门不会因为答错而卡住课程。',
      idleText: '选择一个判断，解锁代码修理厂。',
      correctValue: 'repair',
      correctText: '✓ 对。问题不在语法长相，而在异步调用、运行时数据和返回契约。',
      incorrectText: '答案已记录。下面让真实诊断逐层暴露问题。',
      options: [
        {
          value: 'yes',
          label: '可以直接工作',
          description: '有 string、对象和返回值，看起来已经足够安全',
        },
        {
          value: 'repair',
          label: '还需要修复',
          description: '类型不能自动解决 Promise 和运行时返回结构',
        },
        {
          value: 'rewrite-java',
          label: '应该改回 Java',
          description: 'TypeScript 不适合调用大模型',
        },
      ],
    },
    {
      id: 'lab',
      type: 'simulator',
      simulator: 'code-repair',
      title: '让诊断器逐个暴露真实问题',
      description: '运行诊断、应用当前修复，再次运行。每一步都修改同一份源码。',
      config: {
        title: 'TypeScript AI 调用修理厂',
        description: '不是安装四张卡，而是修一段会真正失败的代码',
        initialSource,
        artifactInputs: ['businessRisk', 'languageDecision'],
        artifactOutput: 'tsSource',
        successOutput: `✓ 编译诊断通过
✓ Promise 已等待
✓ 模型返回值已转成可校验对象
✓ Zod 运行时校验通过

输出：{ intent: "refund_query", confidence: 0.91, reason: "用户在询问退款到账时间" }`,
        issues: [
          {
            code: 'TS-ASYNC-01',
            title: '函数没有声明为 async',
            explanation: '调用模型会返回 Promise。函数签名必须明确表达异步边界。',
            test: (source) => source.includes('async function classifyEmail'),
            fix: (source) => source.replace('function classifyEmail', 'async function classifyEmail'),
          },
          {
            code: 'TS-AWAIT-02',
            title: 'model.invoke 没有 await',
            explanation: '现在的 result 是 Promise，而不是模型响应。',
            test: (source) => /await\s+model\.invoke/.test(source),
            fix: (source) => source.replace('const result = model.invoke', 'const result = await model.invoke'),
          },
          {
            code: 'RUNTIME-SCHEMA-03',
            title: '类型声明没有验证模型真实返回值',
            explanation: 'LLM 返回来自系统边界。TypeScript 类型在运行时不会自动验证它。',
            test: (source) => source.includes('EmailIntent.parse(JSON.parse(String(result.content)))'),
            fix: (source) => source.replace(
              '  return result.content;',
              '  const parsed = EmailIntent.parse(JSON.parse(String(result.content)));\n\n  return result.content;'
            ),
          },
          {
            code: 'RETURN-CONTRACT-04',
            title: '函数仍然返回未校验的原始内容',
            explanation: '已经得到 parsed，就应该让调用方只接触通过契约的数据。',
            test: (source) => source.includes('return parsed;'),
            fix: (source) => source.replace('return result.content;', 'return parsed;'),
          },
        ],
      },
    },
    {
      id: 'reveal',
      type: 'content',
      title: 'TypeScript 在这里提供两层保护',
      description: '一层发生在开发阶段，另一层发生在模型返回之后。',
      html: `
        <p><b>编译期：</b>函数签名、Promise、字段访问和调用方式尽量在运行前暴露问题。</p>
        <p><b>运行时：</b>Zod 检查模型真正返回的数据。模型不会因为你写了 TypeScript 类型，就自动遵守那个类型。</p>
        <p><b>课程产物：</b>修复后的源码已经写入 <code>ArtifactStore.tsSource</code>，第 4 课可以直接拿它构造 Messages 请求。</p>
      `,
    },
    {
      id: 'transfer',
      type: 'quiz',
      title: '为什么只写 interface 还不够？',
      description: '把刚才的修复迁移到新的 AI API 调用。',
      correctValue: 'runtime',
      correctText: '✓ 对。静态类型约束我们的代码，Schema 校验系统边界传入的真实数据。',
      options: [
        {
          value: 'runtime',
          label: '因为模型返回来自运行时边界，需要 Schema 检查真实数据',
        },
        {
          value: 'interface-slow',
          label: '因为 interface 的运行速度比 class 慢',
          feedback: '不是性能问题。interface 在运行时甚至不会存在。',
        },
        {
          value: 'java-only',
          label: '因为只有 Java Bean Validation 才能做数据校验',
          feedback: 'TypeScript 也可以使用 Zod 等运行时 Schema。',
        },
      ],
    },
  ],
};
