import { ragFoundationSimulators } from './simulators-rag/foundations.js';
import { ragRepresentationSimulators } from './simulators-rag/representations.js';
import { ragRetrievalSimulators } from './simulators-rag/retrieval.js';
import { ragQueryRouterSimulator } from './simulators-rag/query-router.js';
import { ragProductionSimulators } from './simulators-rag/production.js';

export const ragSimulators = {
  ...ragFoundationSimulators,
  ...ragRepresentationSimulators,
  ...ragRetrievalSimulators,
  ...ragQueryRouterSimulator,
  ...ragProductionSimulators,
};
