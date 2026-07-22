import { ragLessons22To27 } from './column-04-rag-lessons-22-27.js';
import { ragLessons28To33 } from './column-04-rag-lessons-28-33.js';
import { ragLessons34To38 } from './column-04-rag-lessons-34-38.js';

export const ragLessons = [...ragLessons22To27, ...ragLessons28To33, ...ragLessons34To38];

export const ragExam = {
  id: 'exam-column-04-rag',
  columnId: 'column-04',
  title: '专栏四综合考试 · RAG 检索与知识库工程',
  description: '通过线 80%。覆盖问题画像、评测、解析、Chunking、多语言向量、表示、索引、召回、融合、改写、重排、特殊语料、Evidence 与生产门禁。',
  questions: [
    { text: '实时订单余额的权威答案来自数据库，优先方案是什么？', options: ['SQL/API', '向量检索', '微调模型'], correct: 0 },
    { text: '选择 Embedding 前最重要的前置工作是什么？', options: ['建立 Query/Corpus 画像和 Golden Set', '先看排行榜第一', '先选向量数据库'], correct: 0 },
    { text: '相关文档进入 top-10 但总在第 9 位，应重点看什么？', options: ['MRR/nDCG', '只看 Recall@10', '索引大小'], correct: 0 },
    { text: 'ACL 应默认在哪里执行？', options: ['检索前 pre-filter', '生成后让模型删除', '前端隐藏'], correct: 0 },
    { text: '固定 chunkSize=1000 的正确定位是什么？', options: ['可测试起点，不是通用最佳实践', '生产标准答案', '越大越好'], correct: 0 },
    { text: '结构基线已很好且高级 Chunking 无收益，应该怎么做？', options: ['保留简单基线', '叠加全部高级方法', '增加最大 overlap'], correct: 0 },
    { text: '多语言 Embedding 排行榜第一能否直接决定生产模型？', options: ['不能，需业务切片评测', '可以', '只看参数规模'], correct: 0 },
    { text: '错误码和自然语言故障并存时的合理基线是什么？', options: ['Lexical + Dense hybrid', '只用 Dense', '只用随机向量'], correct: 0 },
    { text: '向量 metric 与 normalization 应如何管理？', options: ['形成统一写入与查询契约', '让数据库自动猜', '不需要记录'], correct: 0 },
    { text: 'Embedding 维度升级时应该怎么迁移？', options: ['新索引验证后切 alias', '混写旧索引', '直接忽略'], correct: 0 },
    { text: '结构化实时查询误路由到向量库，正确修复是什么？', options: ['路由到 SQL/API', '增大 topK', '换 Reranker'], correct: 0 },
    { text: '两个 Retriever 原始分数量纲不同，低标注场景的融合基线是什么？', options: ['RRF', '原始分数直接相加', '只保留一个'], correct: 0 },
    { text: 'HyDE 或多查询改写的主要风险是什么？', options: ['Query Drift 与额外成本', '无法生成文本', '一定降低 Recall'], correct: 0 },
    { text: 'Reranker 能否找回未进入候选集的文档？', options: ['不能', '一定可以', '只要模型够大'], correct: 0 },
    { text: '代码检索最可验证的引用单位是什么？', options: ['文件/符号/行号', '随机 Chunk ID', '模型摘要'], correct: 0 },
    { text: 'Evidence 不足时应该怎么做？', options: ['补充检索或拒答', '让模型猜', '只返回置信度'], correct: 0 },
    { text: 'ACL 切片发生一次泄漏但总平均很高，是否可全量发布？', options: ['不可', '可以', '只需隐藏日志'], correct: 0 },
  ],
};

export const ragResearchBaseline = {
  asOf: '2026-07-23',
  positioning: 'problem-first, evaluation-first, framework-neutral',
  modelCandidates: ['BGE-M3', 'Qwen3-Embedding/Reranker', 'jina-embeddings-v3', 'ColBERT/late interaction'],
  note: '模型与数据库不固定为唯一版本；每次升级必须在业务 Golden Set 和部署环境中重新评测。',
};

export function extendWithRagColumn(course) {
  return {
    ...course,
    ragResearchBaseline,
    columns: [
      ...course.columns,
      {
        id: 'column-04',
        title: '专栏四 · RAG 检索与知识库工程',
        description: '框架中立、问题驱动、评估先行：从是否需要 RAG，到 Chunking、多语言向量、Hybrid、Rerank、特殊语料、Evidence 与生产门禁。',
        lessonIds: ragLessons.map((lesson) => lesson.id),
        examId: ragExam.id,
        prerequisiteExamId: 'exam-column-03-official',
      },
    ],
    lessons: [...course.lessons, ...ragLessons],
    exams: [...course.exams, ragExam],
  };
}
