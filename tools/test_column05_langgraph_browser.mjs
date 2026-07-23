import { createLangGraphBrowserContext } from './langgraph-browser/context.mjs';
import { runLangGraphPart1 } from './langgraph-browser/part-1.mjs';
import { runLangGraphPart2 } from './langgraph-browser/part-2.mjs';
import { runLangGraphPart3 } from './langgraph-browser/part-3.mjs';

const ctx = await createLangGraphBrowserContext();
try {
  await runLangGraphPart1(ctx);
  await runLangGraphPart2(ctx);
  await runLangGraphPart3(ctx);
  console.log('Complete LangGraph v1 and Agentic RAG browser journey passed.');
} finally {
  await ctx.browser.close();
  ctx.server.kill('SIGTERM');
}
