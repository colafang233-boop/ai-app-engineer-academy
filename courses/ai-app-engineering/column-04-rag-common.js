const BASELINE = 'Framework-neutral RAG research baseline · 2026-07-23';

const sources = {
  ragSurvey: { label: 'Retrieval-Augmented Generation for Large Language Models: A Survey', url: 'https://arxiv.org/abs/2312.10997' },
  beir: { label: 'BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models', url: 'https://arxiv.org/abs/2104.08663' },
  mteb: { label: 'MTEB: Massive Text Embedding Benchmark', url: 'https://arxiv.org/abs/2210.07316' },
  mmteb: { label: 'MMTEB: Massive Multilingual Text Embedding Benchmark', url: 'https://arxiv.org/abs/2502.13595' },
  miracl: { label: 'MIRACL Multilingual Retrieval Benchmark', url: 'https://arxiv.org/abs/2210.09984' },
  ragchecker: { label: 'RAGChecker: Fine-grained RAG Diagnostics', url: 'https://arxiv.org/abs/2408.08067' },
  ragas: { label: 'RAGAS: Automated Evaluation of RAG', url: 'https://arxiv.org/abs/2309.15217' },
  lateChunking: { label: 'Late Chunking', url: 'https://arxiv.org/abs/2409.04701' },
  adaptiveChunking: { label: 'Adaptive Chunking (2026)', url: 'https://arxiv.org/abs/2603.25333' },
  contextual: { label: 'Anthropic Contextual Retrieval', url: 'https://www.anthropic.com/engineering/contextual-retrieval' },
  bgeM3: { label: 'BGE-M3 Model Card', url: 'https://huggingface.co/BAAI/bge-m3' },
  qwen3: { label: 'Qwen3 Embedding & Reranker', url: 'https://github.com/QwenLM/Qwen3-Embedding' },
  jinaV3: { label: 'jina-embeddings-v3', url: 'https://arxiv.org/abs/2409.10173' },
  colbert: { label: 'ColBERTv2', url: 'https://arxiv.org/abs/2112.01488' },
  elasticHybrid: { label: 'Elasticsearch Hybrid Search', url: 'https://www.elastic.co/docs/solutions/search/hybrid-search' },
  elasticRrf: { label: 'Elasticsearch Reciprocal Rank Fusion', url: 'https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion' },
  hyde: { label: 'HyDE: Precise Zero-Shot Dense Retrieval', url: 'https://aclanthology.org/2023.acl-long.99/' },
  cohereRerank: { label: 'Cohere Rerank Documentation', url: 'https://docs.cohere.com/docs/rerank' },
  colpali: { label: 'ColPali: Visual Document Retrieval', url: 'https://arxiv.org/abs/2407.01449' },
  lostMiddle: { label: 'Lost in the Middle', url: 'https://arxiv.org/abs/2307.03172' },
};

const prediction = (title, description, correctValue, options, correctText, incorrectText) => ({
  id: 'prediction', type: 'prediction', title, description, correctValue, options, correctText, incorrectText,
});
const reveal = (title, description, html) => ({ id: 'reveal', type: 'content', title, description, html });
const transfer = (title, description, correctValue, options, correctText) => ({ id: 'transfer', type: 'quiz', title, description, correctValue, options, correctText });
const research = (...links) => ({
  appliesTo: BASELINE,
  referenceEyebrow: 'RESEARCH & PRIMARY SOURCES',
  referenceTitle: '本课研究依据与实现参考',
  links,
  note: '本专栏不绑定单一框架、模型或数据库。论文、模型卡和厂商文档用于解释候选能力；生产结论必须在自己的 Golden Set、语言切片、SLA 和部署条件上重新验证。',
});

export { BASELINE, sources, prediction, reveal, transfer, research };
