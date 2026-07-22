import { langChainV1FoundationSimulators } from './simulators-langchain-v1-foundations.js';
import { langChainV1ExecutionSimulators } from './simulators-langchain-v1-execution.js';
import { langChainV1ProductionSimulators } from './simulators-langchain-v1-production.js';

export const langChainV1Simulators = {
  ...langChainV1FoundationSimulators,
  ...langChainV1ExecutionSimulators,
  ...langChainV1ProductionSimulators,
};
