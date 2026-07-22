import { ArtifactStore } from '../../packages/course-runtime/src/artifact-store.js';
import { EventBus } from '../../packages/course-runtime/src/event-bus.js';
import { ProgressStore } from '../../packages/course-runtime/src/progress-store.js';
import { AcademyRuntimeApp } from '../../packages/course-runtime/src/academy-app.js';
import { simulators } from '../../packages/course-runtime/src/simulators.js';
import { course } from '../../courses/ai-app-engineering/course-config.js';

const eventBus = new EventBus();
const artifacts = new ArtifactStore({ eventBus });
const progress = new ProgressStore({ eventBus });
const app = new AcademyRuntimeApp({
  root: document.querySelector('#app'),
  course,
  artifacts,
  progress,
  eventBus,
  simulators,
});
app.mount();
