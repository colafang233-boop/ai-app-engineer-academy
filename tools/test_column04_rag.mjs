import assert from 'node:assert/strict';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';
import { extendWithOfficialColumn03 } from '../courses/ai-app-engineering/column-03-official.js';
import { extendWithRagColumn, ragExam, ragLessons, ragResearchBaseline } from '../courses/ai-app-engineering/column-04-rag.js';
import { ragSimulators } from '../packages/course-runtime/src/simulators-rag.js';

const course = extendWithRagColumn(extendWithOfficialColumn03(productizeCourse(sourceCourse)));
const ragColumn = course.columns.find((column) => column.id === 'column-04');

assert.equal(course.lessons.length, 38);
assert.equal(course.columns.length, 4);
assert.equal(ragLessons.length, 17);
assert.deepEqual(ragLessons.map((lesson) => lesson.number), Array.from({ length: 17 }, (_, index) => index + 22));
assert.equal(ragColumn.lessonIds.length, 17);
assert.equal(ragColumn.prerequisiteExamId, 'exam-column-03-official');
assert.equal(ragExam.questions.length, 17);
assert.equal(ragResearchBaseline.positioning, 'problem-first, evaluation-first, framework-neutral');

const artifactKeys = [
  'knowledgeAccessDecision', 'retrievalProblemProfile', 'retrievalEvaluationDataset', 'documentIngestionContract',
  'baselineChunkingPolicy', 'advancedChunkingDecision', 'embeddingBenchmarkReport', 'retrievalRepresentationPolicy',
  'searchIndexSchema', 'indexLifecyclePolicy', 'firstStageRetrievalRouter', 'hybridFusionPolicy',
  'queryTransformationPolicy', 'rerankingBenchmarkReport', 'specialCorpusRetrievalPolicy',
  'evidenceAndCitationContract', 'ragProductionReleaseGate',
];

const simulatorNames = ragLessons.map((lesson) => lesson.stages.find((stage) => stage.type === 'simulator')?.simulator);
assert.equal(new Set(simulatorNames).size, 17);
for (const name of simulatorNames) assert.equal(typeof ragSimulators[name], 'function', `Missing simulator ${name}`);

for (const lesson of ragLessons) {
  assert.equal(lesson.stages.length, 4, `${lesson.id} should have four teaching stages`);
  assert.deepEqual(lesson.stages.map((stage) => stage.type), ['prediction', 'simulator', 'content', 'quiz']);
  assert.match(lesson.officialReference.appliesTo, /Framework-neutral RAG research baseline/);
  assert.ok(lesson.officialReference.links.length >= 2, `${lesson.id} should cite primary sources`);
  for (const link of lesson.officialReference.links) {
    const url = new URL(link.url);
    assert.ok(['arxiv.org', 'aclanthology.org', 'huggingface.co', 'github.com', 'www.elastic.co', 'docs.cohere.com', 'www.anthropic.com'].includes(url.hostname), `${lesson.id} unexpected source ${url.hostname}`);
  }
}

const fs = await import('node:fs/promises');
const curriculumFiles = [
  '../courses/ai-app-engineering/column-04-rag.js',
  '../courses/ai-app-engineering/column-04-rag-common.js',
  '../courses/ai-app-engineering/column-04-rag-lessons-22-27.js',
  '../courses/ai-app-engineering/column-04-rag-lessons-28-33.js',
  '../courses/ai-app-engineering/column-04-rag-lessons-34-38.js',
];
const moduleSource = (await Promise.all(curriculumFiles.map((file) => fs.readFile(new URL(file, import.meta.url), 'utf8')))).join('\n');
assert.doesNotMatch(moduleSource, /from ['"]langchain/);
assert.doesNotMatch(moduleSource, /chunkSize\s*=\s*1000/);
assert.match(moduleSource, /BGE-M3/);
assert.match(moduleSource, /Qwen3/);
assert.match(moduleSource, /Multi-vector/);
assert.match(moduleSource, /RRF/);
assert.match(moduleSource, /ACL/);
assert.match(moduleSource, /Evidence/);

const productSource = await fs.readFile(new URL('../packages/course-runtime/src/rag-column-product.js', import.meta.url), 'utf8');
for (const key of artifactKeys) assert.match(productSource, new RegExp(key));

console.log('Framework-neutral RAG column checks passed.');
