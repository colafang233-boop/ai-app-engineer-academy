import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';
import {
  extendWithOfficialColumn03,
  langChainOfficialVersion,
} from '../courses/ai-app-engineering/column-03-official.js';
import { langChainV1Simulators } from '../packages/course-runtime/src/simulators-langchain-v1.js';

const course = extendWithOfficialColumn03(productizeCourse(sourceCourse));
const column = course.columns.find((item) => item.id === 'column-03');
const lessons = course.lessons.filter((lesson) => lesson.columnId === 'column-03');
const exam = course.exams.find((item) => item.id === 'exam-column-03-official');

assert.deepEqual(langChainOfficialVersion, {
  asOf: '2026-07-22',
  packages: {
    langchain: '1.5.3',
    '@langchain/core': '1.2.3',
    '@langchain/langgraph': '1.4.8',
    langsmith: '0.8.3',
    zod: '4.4.3',
    node: '22.x',
  },
});

assert.equal(course.lessons.length, 21);
assert.equal(course.columns.length, 3);
assert.equal(course.exams.length, 3);
assert.equal(lessons.length, 12);
assert.deepEqual(lessons.map((lesson) => lesson.number), Array.from({ length: 12 }, (_, index) => index + 10));
assert.equal(column.lessonIds.length, 12);
assert.equal(column.prerequisiteExamId, 'exam-column-02');
assert.equal(column.examId, 'exam-column-03-official');
assert.equal(exam.questions.length, 12);

const expectedSimulators = [
  'v1-package-map',
  'content-block-inspector',
  'model-profile-scheduler',
  'structured-strategy-lab',
  'event-stream-router',
  'runtime-tool-lab',
  'agent-state-lab',
  'middleware-hook-lab',
  'thread-memory-lab',
  'reliability-chaos-lab',
  'guardrail-hitl-lab',
  'trace-release-lab',
];

for (const [index, lesson] of lessons.entries()) {
  assert.equal(lesson.stages.length, 4, `${lesson.id} must keep the four-stage teaching rhythm`);
  assert.equal(lesson.stages[0].type, 'prediction');
  assert.equal(lesson.stages[1].type, 'simulator');
  assert.equal(lesson.stages[1].simulator, expectedSimulators[index]);
  assert.equal(typeof langChainV1Simulators[expectedSimulators[index]], 'function');
  assert.equal(lesson.stages[2].type, 'content');
  assert.equal(lesson.stages[3].type, 'quiz');
  assert.match(lesson.officialReference.appliesTo, /langchain@1\.5\.3/);
  assert.ok(lesson.officialReference.links.length >= 1);
  for (const link of lesson.officialReference.links) {
    const url = new URL(link.url);
    assert.equal(url.hostname, 'docs.langchain.com', `${lesson.id} must use official docs only`);
  }
}

const curriculumSource = await readFile(new URL('../courses/ai-app-engineering/column-03-official.js', import.meta.url), 'utf8');
for (const required of [
  '@langchain/classic',
  'contentBlocks',
  'streamEvents v3',
  'Runtime Context',
  'Middleware',
  'Checkpointer',
  'Human-in-the-loop',
  'LangSmith',
]) {
  assert.match(curriculumSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
}

const productSource = await readFile(new URL('../packages/course-runtime/src/official-column-product.js', import.meta.url), 'utf8');
for (const artifact of [
  'langchainArchitectureDecision',
  'messageContractV1',
  'modelRuntimeConfig',
  'structuredOutputPolicy',
  'eventStreamingContract',
  'runtimeToolRegistry',
  'agentStateContract',
  'middlewarePipeline',
  'memoryPolicy',
  'reliabilityPolicy',
  'safetyAndApprovalPolicy',
  'langchainProductionBlueprint',
]) {
  assert.match(productSource, new RegExp(artifact));
}

console.log('Official LangChain v1 column checks passed.');
