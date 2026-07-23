import { enterpriseFoundationSimulators } from './simulators-enterprise-foundations.js';
import { enterprisePlatformSimulators } from './simulators-enterprise-platform.js';

export const enterpriseSimulators = {
  ...enterpriseFoundationSimulators,
  ...enterprisePlatformSimulators,
};
