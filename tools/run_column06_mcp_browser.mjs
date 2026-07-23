import { createMcpBrowserContext } from './mcp-browser/context.mjs';
import { runMcpBrowserPart1 } from './mcp-browser/part-1.mjs';
import { runMcpBrowserPart2 } from './mcp-browser/part-2.mjs';
import { runMcpBrowserPart3 } from './mcp-browser/part-3.mjs';
import { runMcpBrowserPart4 } from './mcp-browser/part-4.mjs';

const ctx = await createMcpBrowserContext();
try {
  await runMcpBrowserPart1(ctx);
  await runMcpBrowserPart2(ctx);
  await runMcpBrowserPart3(ctx);
  await runMcpBrowserPart4(ctx);
  console.log('Complete MCP protocol, host integration, authorization and deployment browser journey passed.');
} catch (error) {
  await ctx.page.screenshot({ path: 'artifacts/mcp-browser-failure.png', fullPage: true }).catch(() => {});
  throw error;
} finally {
  await ctx.browser.close();
  ctx.server.kill('SIGTERM');
}
