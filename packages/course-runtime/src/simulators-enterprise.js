import { enterpriseFoundationSimulators } from './simulators-enterprise-foundations.js';
import { enterprisePlatformSimulators } from './simulators-enterprise-platform.js';
import { enterpriseFlowSimulators } from './simulators-enterprise-flows.js';
import { enterpriseGovernanceSimulators } from './simulators-enterprise-governance.js';

export const enterpriseSimulators = {
  ...enterpriseFoundationSimulators,
  ...enterprisePlatformSimulators,
  ...enterpriseFlowSimulators,
  ...enterpriseGovernanceSimulators,
};
