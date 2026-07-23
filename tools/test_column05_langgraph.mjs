import assert from 'node:assert/strict';
import fs from 'node:fs';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';
import { extendWithOfficialColumn03 } from '../courses/ai-app-engineering/column-03-official.js';
import { extendWithRagColumn } from '../courses/ai-app-engineering/column-04-rag.js';
import { extendWithLangGraphColumn, langGraphLessons, langGraphExam, langGraphResearchBaseline } from '../courses/ai-app-engineering/column-05-langgraph.js';
import { langGraphSimulators } from '../packages/course-runtime/src/simulators-langgraph.js';

const course = extendWithLangGraphColumn(extendWithRagColumn(extendWithOfficialColumn03(productizeCourse(sourceCourse))));
assert.equal(course.lessons.length, 58);
assert.equal(course.columns.length, 5);
assert.equal(course.exams.length, 5);
assert.equal(langGraphLessons.length, 20);
assert.equal(langGraphExam.questions.length, 20);
assert.equal(langGraphResearchBaseline.packages['@langchain/langgraph'], '1.4.8');
assert.equal(course.qualityReviewModeDefault, true);
assert.deepEqual(langGraphLessons.map((lesson) => lesson.number), Array.from({ length: 20 }, (_, index) => index + 39));

const simulators = langGraphLessons.map((lesson) => lesson.stages.find((stage) => stage.type === 'simulator')?.simulator);
assert.equal(new Set(simulators).size, 20);
for (const simulator of simulators) assert.equal(typeof langGraphSimulators[simulator], 'function', `Missing simulator: ${simulator}`);

for (const lesson of langGraphLessons) {
  assert.equal(lesson.columnId, 'column-05');
  assert.equal(lesson.stages.length, 4, `${lesson.id} should have four stages`);
  assert.ok(lesson.prerequisites?.length >= 2, `${lesson.id} missing prerequisites`);
  assert.ok(lesson.terms?.length >= 3, `${lesson.id} missing terminology`);
  assert.ok(lesson.officialReference?.links?.length >= 2, `${lesson.id} missing official references`);
  for (const link of lesson.officialReference.links) {
    const host = new URL(link.url).hostname;
    assert.ok(['docs.langchain.com', 'academy.langchain.com'].includes(host), `${lesson.id} uses non-official source: ${host}`);
  }
}

const allText = [
  ...langGraphLessons.map((lesson) => JSON.stringify(lesson)),
  fs.readFileSync('packages/course-runtime/src/simulators-langgraph/foundations.js', 'utf8'),
  fs.readFileSync('packages/course-runtime/src/simulators-langgraph/execution.js', 'utf8'),
  fs.readFileSync('packages/course-runtime/src/simulators-langgraph/advanced.js', 'utf8'),
].join('\n');
for (const concept of ['StateSchema', 'Reducer', 'Superstep', 'Command', 'Send', 'Functional API', 'entrypoint', 'task', 'Checkpoint', 'thread_id', 'interrupt', 'Time Travel', 'Streaming', 'Store', 'Subgraph', 'Multi-agent', 'Agentic RAG', 'Groundedness', 'Partial Execution', 'langgraph.json']) assert.match(allText, new RegExp(concept, 'i'), `Missing concept: ${concept}`);
assert.doesNotMatch(allText, /createReactAgent/);

const reviewMode = fs.readFileSync('packages/course-runtime/src/quality-review-mode.js', 'utf8');
const dashboard = fs.readFileSync('packages/course-runtime/src/formal-dashboard.js', 'utf8');
const product = fs.readFileSync('packages/course-runtime/src/langgraph-column-product.js', 'utf8');
assert.match(reviewMode, /reviewMode/);
assert.match(reviewMode, /质量审阅 · 全部开放/);
assert.match(reviewMode, /previewMode = true/);
assert.match(dashboard, /renderReviewSections/);
assert.match(dashboard, /108 节课程与 7 场考试已开放/);
assert.match(product, /本课专业名词/);
assert.match(product, /开始本课前，你需要知道/);
assert.match(product, /targetCount = 60/);

console.log('LangGraph v1 and Agentic RAG curriculum checks passed.');
