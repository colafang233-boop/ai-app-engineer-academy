import { ArtifactStore } from '../../packages/course-runtime/src/artifact-store.js';
import { EventBus } from '../../packages/course-runtime/src/event-bus.js';
import { ProgressStore } from '../../packages/course-runtime/src/progress-store.js';
import { AcademyRuntimeApp } from '../../packages/course-runtime/src/academy-app.js';
import { installFormalDashboard } from '../../packages/course-runtime/src/formal-dashboard.js';
import { installOfficialColumnProduct } from '../../packages/course-runtime/src/official-column-product.js';
import { installRagColumnProduct } from '../../packages/course-runtime/src/rag-column-product.js';
import { installLangGraphColumnProduct } from '../../packages/course-runtime/src/langgraph-column-product.js';
import { installMcpColumnProduct } from '../../packages/course-runtime/src/mcp-column-product.js';
import { installQualityReviewMode } from '../../packages/course-runtime/src/quality-review-mode.js';
import { simulators } from '../../packages/course-runtime/src/simulators.js';
import { langChainV1Simulators } from '../../packages/course-runtime/src/simulators-langchain-v1.js';
import { ragSimulators } from '../../packages/course-runtime/src/simulators-rag.js';
import { langGraphSimulators } from '../../packages/course-runtime/src/simulators-langgraph.js';
import { mcpSimulators } from '../../packages/course-runtime/src/simulators-mcp.js';
import { mountProductCopy } from '../../packages/course-runtime/src/product-copy.js';
import { course as sourceCourse } from '../../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../../courses/ai-app-engineering/product-course.js';
import { extendWithOfficialColumn03 } from '../../courses/ai-app-engineering/column-03-official.js';
import { extendWithRagColumn } from '../../courses/ai-app-engineering/column-04-rag.js';
import { extendWithLangGraphColumn } from '../../courses/ai-app-engineering/column-05-langgraph.js';
import { extendWithMcpColumn } from '../../courses/ai-app-engineering/column-06-mcp.js';

const eventBus = new EventBus();
const artifacts = new ArtifactStore({ eventBus });
const progress = new ProgressStore({ eventBus });
const course = extendWithMcpColumn(extendWithLangGraphColumn(extendWithRagColumn(extendWithOfficialColumn03(productizeCourse(sourceCourse)))));
const app = new AcademyRuntimeApp({
  root: document.querySelector('#app'),
  course,
  artifacts,
  progress,
  eventBus,
  simulators: { ...simulators, ...langChainV1Simulators, ...ragSimulators, ...langGraphSimulators, ...mcpSimulators },
});

installFormalDashboard(app);
installOfficialColumnProduct(app);
installRagColumnProduct(app);
installLangGraphColumnProduct(app);
installMcpColumnProduct(app);
installQualityReviewMode(app);
app.mount();
mountProductCopy(document.querySelector('#app'));
