import assert from 'node:assert/strict';
import fs from 'node:fs';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';
import { extendWithColumn03 } from '../courses/ai-app-engineering/column-03.js';
import { langChainSimulators } from '../packages/course-runtime/src/simulators-langchain.js';

const course = extendWithColumn03(productizeCourse(sourceCourse));
const column = course.columns.find((item) => item.id === 'column-03');
const exam = course.exams.find((item) => item.id === 'exam-column-03');
const lessons = course.lessons.filter((lesson) => lesson.columnId === 'column-03');

assert.equal(course.lessons.length, 13);
assert.equal(course.columns.length, 3);
assert.equal(course.exams.length, 3);
assert.deepEqual(column.lessonIds, ['lesson-10', 'lesson-11', 'lesson-12', 'lesson-13']);
assert.equal(column.prerequisiteExamId, 'exam-column-02');
assert.equal(column.examId, 'exam-column-03');
assert.equal(exam.questions.length, 5);
assert.match(exam.description, /RAG/);

const expectedSimulators = {
  'lesson-10': 'model-invocation',
  'lesson-11': 'streaming-lab',
  'lesson-12': 'tool-calling-lab',
  'lesson-13': 'agent-loop-lab',
};

for (const lesson of lessons) {
  assert.equal(lesson.stages.length, 4, `${lesson.id} should have four teaching stages`);
  assert.equal(lesson.stages[0].type, 'prediction');
  assert.equal(lesson.stages[1].type, 'simulator');
  assert.equal(lesson.stages[1].simulator, expectedSimulators[lesson.id]);
  assert.equal(typeof langChainSimulators[lesson.stages[1].simulator], 'function');
  assert.equal(lesson.stages[2].type, 'content');
  assert.equal(lesson.stages[3].type, 'quiz');
}

const lesson10 = lessons.find((lesson) => lesson.id === 'lesson-10');
const lesson11 = lessons.find((lesson) => lesson.id === 'lesson-11');
const lesson12 = lessons.find((lesson) => lesson.id === 'lesson-12');
const lesson13 = lessons.find((lesson) => lesson.id === 'lesson-13');

assert.match(lesson10.stages[2].html, /model\.invoke\(messages\)/);
assert.match(lesson10.stages[2].html, /AIMessage/);
assert.match(lesson11.stages[2].html, /model\.stream\(messages\)/);
assert.match(lesson11.stages[2].html, /AIMessageChunk/);
assert.match(lesson12.stages[2].html, /tool\(runLookup/);
assert.match(lesson12.stages[2].html, /bindTools/);
assert.match(lesson12.stages[2].html, /ToolMessage/);
assert.match(lesson13.stages[2].html, /createAgent/);
assert.match(lesson13.stages[2].html, /迭代上限/);

const simulatorSource = fs.readFileSync('packages/course-runtime/src/simulators-langchain.js', 'utf8');
for (const artifact of ['modelInvocation', 'streamingContract', 'toolRegistry', 'agentLoopTrace']) {
  assert.match(simulatorSource, new RegExp(`artifacts\\.set\\('${artifact}'`));
}
assert.match(simulatorSource, /只向模型开放 lookup_refund/);
assert.match(simulatorSource, /达到迭代上限/);
assert.match(simulatorSource, /持续合并/);

const main = fs.readFileSync('apps/runtime-academy/main.js', 'utf8');
assert.match(main, /extendWithColumn03/);
assert.match(main, /langChainSimulators/);
assert.match(main, /installColumn03Product/);

console.log('LangChain core column checks passed.');
