export const mcpVersion = 'MCP Specification 2025-11-25 · @modelcontextprotocol/sdk@1.29.0 · Zod 4.x · Node 22.x';

export const sources = {
  architecture: { label: 'MCP Architecture Overview', url: 'https://modelcontextprotocol.io/docs/learn/architecture' },
  servers: { label: 'Understanding MCP Servers', url: 'https://modelcontextprotocol.io/docs/learn/server-concepts' },
  clients: { label: 'Understanding MCP Clients', url: 'https://modelcontextprotocol.io/docs/learn/client-concepts' },
  specification: { label: 'MCP Specification 2025-11-25', url: 'https://modelcontextprotocol.io/specification/2025-11-25' },
  lifecycle: { label: 'Lifecycle', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle' },
  transports: { label: 'Transports', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/transports' },
  authorization: { label: 'Authorization', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization' },
  security: { label: 'Security Best Practices', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices' },
  tools: { label: 'Tools', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/tools' },
  resources: { label: 'Resources', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/resources' },
  prompts: { label: 'Prompts', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/prompts' },
  roots: { label: 'Roots', url: 'https://modelcontextprotocol.io/specification/2025-11-25/client/roots' },
  sampling: { label: 'Sampling', url: 'https://modelcontextprotocol.io/specification/2025-11-25/client/sampling' },
  elicitation: { label: 'Elicitation', url: 'https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation' },
  tasks: { label: 'Tasks (Experimental)', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks' },
  sdk: { label: 'Official TypeScript SDK', url: 'https://github.com/modelcontextprotocol/typescript-sdk' },
  sdkV1: { label: 'TypeScript SDK v1 API', url: 'https://ts.sdk.modelcontextprotocol.io/' },
  inspector: { label: 'MCP Inspector', url: 'https://modelcontextprotocol.io/docs/tools/inspector' },
  codex: { label: 'Codex MCP Configuration', url: 'https://developers.openai.com/codex/mcp/' },
  agentsJs: { label: 'OpenAI Agents SDK MCP · TypeScript', url: 'https://openai.github.io/openai-agents-js/guides/mcp/' },
  chatgpt: { label: 'ChatGPT Developer Mode and MCP Apps', url: 'https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt-beta' },
  cloudflareRemote: { label: 'Cloudflare Remote MCP Server', url: 'https://developers.cloudflare.com/agents/model-context-protocol/guides/remote-mcp-server/' },
  cloudflareAuth: { label: 'Cloudflare MCP Authorization', url: 'https://developers.cloudflare.com/agents/model-context-protocol/protocol/authorization/' },
  cloudflareClient: { label: 'Cloudflare MCP Client', url: 'https://developers.cloudflare.com/agents/model-context-protocol/apis/client-api/' },
  cloudflareSecurity: { label: 'Securing MCP Servers on Cloudflare', url: 'https://developers.cloudflare.com/agents/model-context-protocol/guides/securing-mcp-server/' },
  vscode: { label: 'VS Code MCP Servers', url: 'https://code.visualstudio.com/docs/copilot/chat/mcp-servers' },
  claude: { label: 'Claude Code MCP', url: 'https://docs.anthropic.com/en/docs/claude-code/mcp' },
};

export const prediction = (title, description, correctValue, options, correctText, incorrectText = '先保留这个判断，下面通过实验验证。') => ({
  id: 'prediction', type: 'prediction', title, description, correctValue, options, correctText, incorrectText,
});

export const reveal = (title, description, html) => ({ id: 'reveal', type: 'content', title, description, html });

export const transfer = (title, description, correctValue, options, correctText) => ({
  id: 'transfer', type: 'quiz', title, description, correctValue, options, correctText,
});

export const official = (...links) => ({
  appliesTo: mcpVersion,
  links,
  note: '本课按 2026-07-23 可用的 MCP 2025-11-25 规范、TypeScript SDK v1 生产线和各 Host 官方文档设计。客户端支持矩阵会变化，升级或接入新 Host 前必须重新核对官方说明。',
});

export const term = (name, definition) => ({ name, definition });
