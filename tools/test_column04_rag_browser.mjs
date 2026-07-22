import { createRagBrowserContext } from './rag-browser/context.mjs';
import { runRagBrowserPart1 } from './rag-browser/part-1.mjs';
import { runRagBrowserPart2 } from './rag-browser/part-2.mjs';
import { runRagBrowserPart3 } from './rag-browser/part-3.mjs';

const ctx = await createRagBrowserContext();
try {
  await runRagBrowserPart1(ctx);
  await runRagBrowserPart2(ctx);
  await runRagBrowserPart3(ctx);
  console.log('Complete framework-neutral RAG browser journey passed.');
} finally {
  await ctx.browser.close();
  ctx.server.kill('SIGTERM');
}
