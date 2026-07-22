import assert from 'node:assert/strict';
import { EventBus } from '../packages/course-runtime/src/event-bus.js';
import { ArtifactStore } from '../packages/course-runtime/src/artifact-store.js';
import { ProgressStore } from '../packages/course-runtime/src/progress-store.js';
import { course } from '../courses/ai-app-engineering/course-config.js';
import { simulators } from '../packages/course-runtime/src/simulators.js';

class MemoryStorage {
  constructor(){ this.data = new Map(); }
  getItem(k){ return this.data.has(k) ? this.data.get(k) : null; }
  setItem(k,v){ this.data.set(k,String(v)); }
}

assert.equal(course.lessons.length, 9);
assert.equal(course.columns.length, 2);
assert.equal(course.exams.length, 2);
assert.deepEqual(course.columns[0].lessonIds, ['lesson-01','lesson-02','lesson-03','lesson-04']);
assert.deepEqual(course.columns[1].lessonIds, ['lesson-05','lesson-06','lesson-07','lesson-08','lesson-09']);
for (const lesson of course.lessons) {
  assert.equal(lesson.stages.length, 4, `${lesson.id} should have 4 stages`);
  assert.equal(lesson.stages[0].type, 'prediction');
  assert.equal(lesson.stages[1].type, 'simulator');
  assert.equal(typeof simulators[lesson.stages[1].simulator], 'function', `${lesson.id} simulator missing`);
  assert.equal(lesson.stages[2].type, 'content');
  assert.equal(lesson.stages[3].type, 'quiz');
}

const storage = new MemoryStorage();
const bus = new EventBus();
const artifacts = new ArtifactStore({ storage, eventBus: bus });
const progress = new ProgressStore({ storage, eventBus: bus });
artifacts.set('businessRisk', { ok: true });
assert.equal(artifacts.get('businessRisk').ok, true);
progress.completeStage('lesson-01', 'prediction');
progress.completeLesson('lesson-01');
assert.equal(progress.isLessonComplete('lesson-01'), true);
progress.recordExam('exam-column-01', { score: 80, passed: true });
assert.equal(progress.isExamPassed('exam-column-01'), true);

const l3 = course.lessons.find((l) => l.id === 'lesson-03').stages[1].config;
let source = l3.initialSource;
for (const issue of l3.issues) if (!issue.test(source)) source = issue.fix(source);
for (const issue of l3.issues) assert.equal(issue.test(source), true, issue.code);
assert.match(source, /async function classifyEmail/);
assert.match(source, /return parsed/);

const l6 = course.lessons.find((l) => l.id === 'lesson-06').stages[1].config;
const rules = [...l6.rules];
const refundQueryIndex = rules.findIndex((r) => r.id === 'refund_query');
[rules[refundQueryIndex], rules[refundQueryIndex - 1]] = [rules[refundQueryIndex - 1], rules[refundQueryIndex]];
const classify = (text) => rules.find((r) => r.match(text)).output;
assert.equal(l6.emails.every((e) => classify(e.text) === e.expected), true);

const l7 = course.lessons.find((l) => l.id === 'lesson-07').stages[1].config;
const good = JSON.parse(l7.presets[2].json);
assert.equal(l7.schema(good).ok, true);
assert.equal(l7.business(good).ok, true);

console.log('Full runtime configuration checks passed.');
