import { ArtifactStore } from '../../packages/course-runtime/src/artifact-store.js';
import { EventBus } from '../../packages/course-runtime/src/event-bus.js';
import { ProgressStore } from '../../packages/course-runtime/src/progress-store.js';
import { AcademyRuntimeApp } from '../../packages/course-runtime/src/academy-app.js';
import { installFormalDashboard } from '../../packages/course-runtime/src/formal-dashboard.js';
import { simulators } from '../../packages/course-runtime/src/simulators.js';
import { mountProductCopy } from '../../packages/course-runtime/src/product-copy.js';
import { course as sourceCourse } from '../../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../../courses/ai-app-engineering/product-course.js';

const eventBus = new EventBus();
const artifacts = new ArtifactStore({ eventBus });
const progress = new ProgressStore({ eventBus });
const course = productizeCourse(sourceCourse);
const app = new AcademyRuntimeApp({
  root: document.querySelector('#app'),
  course,
  artifacts,
  progress,
  eventBus,
  simulators,
});

installFormalDashboard(app);
app.mount();
mountProductCopy(document.querySelector('#app'));
