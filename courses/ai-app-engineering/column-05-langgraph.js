import { langGraphLessons39To45 } from './column-05-langgraph-lessons-39-45.js';
import { langGraphLessons46To52 } from './column-05-langgraph-lessons-46-52.js';
import { langGraphLessons53To58 } from './column-05-langgraph-lessons-53-58.js';

export const langGraphLessons = [...langGraphLessons39To45, ...langGraphLessons46To52, ...langGraphLessons53To58];

export const langGraphExam = {
  id: 'exam-column-05-langgraph',
  columnId: 'column-05',
  title: '专栏五综合考试 · LangGraph 与 Agentic RAG',
  description: '通过线 80%。覆盖架构选择、State、Reducer、路由、并行、工作流模式、Functional API、Durable Execution、Persistence、Interrupt、Time Travel、Streaming、Memory、Subgraph、Multi-agent、Agentic RAG 与生产交付。',
  questions: [
    { text: '只有简单模型—工具循环且无自定义持久化需求，优先选择什么？', options: ['createAgent 或普通代码', '立即手写复杂 StateGraph', '全局 while(true)'], correct: 0 },
    { text: 'Node、Edge 与 State 的正确关系是什么？', options: ['节点做工作，边定去向，State 保存快照', '节点只画 UI', 'Edge 保存所有业务数据'], correct: 0 },
    { text: '多个并行 worker 写同一数组字段，怎样避免覆盖？', options: ['定义 concat/union reducer', '依赖最后写入', '使用全局可变数组'], correct: 0 },
    { text: '节点过粗最直接的恢复代价是什么？', options: ['失败时重复更多工作和副作用', '节点名更短', '模型 Token 自动减少'], correct: 0 },
    { text: '同一节点既要更新 classification 又要跳转，适合什么？', options: ['Command', '只用普通 Edge', '修改全局变量'], correct: 0 },
    { text: 'worker 数量运行时才知道，应使用什么？', options: ['Send 动态 fan-out', '预画固定 100 条边', '全部串行'], correct: 0 },
    { text: '路径固定、步骤可验证的任务，优先什么模式？', options: ['Workflow/Prompt Chaining', '无限自治 Agent', '随机路由'], correct: 0 },
    { text: '已有大量 if/for 代码，只想渐进加入 checkpoint，应考虑什么？', options: ['Functional API entrypoint/task', '必须全部重写', '浏览器 localStorage'], correct: 0 },
    { text: '为什么随机数、外部 API 和副作用应进入 task？', options: ['支持确定性重放和结果保存', '让代码更长', '因为 Node 不能异步'], correct: 0 },
    { text: 'thread_id 的核心作用是什么？', options: ['隔离一条 checkpoint 执行历史', '给消息加标签', '选择模型供应商'], correct: 0 },
    { text: 'interrupt 后恢复执行使用什么？', options: ['Command({ resume })', '修改前端变量', '重新从 START 猜测'], correct: 0 },
    { text: '修改历史 State 探索另一条路径属于什么？', options: ['Fork', 'Replay 原状态', '删除日志'], correct: 0 },
    { text: '展示节点业务进度而非模型 Token，优先使用什么流？', options: ['custom + updates', '只用 messages', '只等最终输出'], correct: 0 },
    { text: '跨线程用户偏好应放在哪里？', options: ['按 namespace/key 组织的 Store', '某个 thread messages', '模型参数'], correct: 0 },
    { text: '一次性独立子 Agent 的推荐持久化模式通常是什么？', options: ['per-invocation', '所有调用共享 per-thread', '全局变量'], correct: 0 },
    { text: '多个垂直域可能同时相关并需并行综合，适合什么？', options: ['Router + Send', '随机 Handoff 一个 Agent', '所有 Agent 共享全部工具'], correct: 0 },
    { text: '实时余额与制度文档同时需要，合理知识路由是什么？', options: ['API + 文档检索并行后综合', '只查向量库', '让模型猜余额'], correct: 0 },
    { text: 'ACL 拒绝导致无证据，是否应该不断改写 Query？', options: ['不应，应返回无权限或请求授权', '应该绕过过滤', '关闭 ACL'], correct: 0 },
    { text: '答案引用相关文档但不支持某个金额，属于什么？', options: ['Groundedness/Citation failure', '只要 Recall 高就通过', '纯样式问题'], correct: 0 },
    { text: '图结构升级且旧 checkpoint 存在，发布前必须验证什么？', options: ['State migration、旧线程恢复与回滚', '只看首页截图', '删除所有历史'], correct: 0 },
  ],
};

export const langGraphResearchBaseline = {
  asOf: '2026-07-23',
  packages: {
    '@langchain/langgraph': '1.4.8',
    '@langchain/core': '1.2.3',
    langchain: '1.5.3',
    zod: '4.4.3',
    node: '22.x',
  },
  teachingOrder: ['orchestration fit', 'state and execution', 'workflows', 'durability', 'human input', 'agentic retrieval', 'production'],
  note: '课程以 LangGraph v1 稳定核心 API 为基线；createReactAgent 已不作为主线，简单 Agent 优先使用 LangChain createAgent。',
};

export function extendWithLangGraphColumn(course) {
  return {
    ...course,
    qualityReviewModeDefault: true,
    langGraphResearchBaseline,
    columns: [
      ...course.columns,
      {
        id: 'column-05',
        title: '专栏五 · LangGraph 与 Agentic RAG',
        description: '从 State、Reducer、Node 与 Edge 的执行模型，到工作流模式、Durable Execution、Checkpoint、Interrupt、Time Travel、Memory、Subgraph、多 Agent 与可控 Agentic RAG。',
        lessonIds: langGraphLessons.map((lesson) => lesson.id),
        examId: langGraphExam.id,
        prerequisiteExamId: 'exam-column-04-rag',
      },
    ],
    lessons: [...course.lessons, ...langGraphLessons],
    exams: [...course.exams, langGraphExam],
  };
}
