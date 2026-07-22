import assert from 'node:assert/strict';
import { EventBus } from '../packages/course-runtime/src/event-bus.js';
import { ArtifactStore } from '../packages/course-runtime/src/artifact-store.js';
import { ProgressStore } from '../packages/course-runtime/src/progress-store.js';
import lesson from '../courses/ai-app-engineering/lessons/lesson-03.js';

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

const storage = new MemoryStorage();
const eventBus = new EventBus();
const artifactEvents = [];
const progressEvents = [];

eventBus.on('artifact:change', (event) => artifactEvents.push(event));
eventBus.on('progress:change', (event) => progressEvents.push(event));

const artifacts = new ArtifactStore({ storage, eventBus });
artifacts.set('languageDecision', { winner: 'ts' }, { lessonId: 'lesson-02' });
assert.equal(artifacts.get('languageDecision').winner, 'ts');
assert.equal(artifactEvents.length, 1);
assert.equal(artifactEvents[0].name, 'languageDecision');

const progress = new ProgressStore({ storage, eventBus });
progress.completeStage(lesson.id, 'prediction');
progress.completeStage(lesson.id, 'prediction');
assert.deepEqual(progress.getLesson(lesson.id).completedStages, ['prediction']);
progress.completeLesson(lesson.id);
assert.equal(progress.getLesson(lesson.id).completed, true);
assert.ok(progressEvents.length >= 2);

const simulatorStage = lesson.stages.find((stage) => stage.simulator === 'code-repair');
assert.ok(simulatorStage, 'Lesson 3 must declare the code-repair simulator');

let source = simulatorStage.config.initialSource;
for (const issue of simulatorStage.config.issues) {
  if (!issue.test(source)) source = issue.fix(source);
}
for (const issue of simulatorStage.config.issues) {
  assert.equal(issue.test(source), true, `${issue.code} should pass after applying fixes`);
}

artifacts.set(simulatorStage.config.artifactOutput, source, {
  lessonId: lesson.id,
  simulator: simulatorStage.simulator,
});
assert.match(artifacts.get('tsSource'), /async function classifyEmail/);
assert.match(artifacts.get('tsSource'), /return parsed/);

console.log('Course runtime foundation checks passed.');
