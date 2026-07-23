import { mcpFoundationSimulators } from './simulators-mcp-foundations.js';
import { mcpAccessSimulators } from './simulators-mcp-access.js';
import { mcpDevelopmentSimulators } from './simulators-mcp-development.js';
import { mcpAuthDeploymentSimulators } from './simulators-mcp-auth-deployment.js';
import { mcpProductionSimulators } from './simulators-mcp-production.js';

export const mcpSimulators = {
  ...mcpFoundationSimulators,
  ...mcpAccessSimulators,
  ...mcpDevelopmentSimulators,
  ...mcpAuthDeploymentSimulators,
  ...mcpProductionSimulators,
};
