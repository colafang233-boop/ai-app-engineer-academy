import { createEnterpriseBrowserContext } from './enterprise-browser/context.mjs';
import { runEnterprisePart1 } from './enterprise-browser/part-1.mjs';
import { runEnterprisePart2 } from './enterprise-browser/part-2.mjs';
import { runEnterprisePart3 } from './enterprise-browser/part-3.mjs';
import { runEnterprisePart4 } from './enterprise-browser/part-4.mjs';
import { runEnterprisePart5 } from './enterprise-browser/part-5.mjs';

const ctx = await createEnterpriseBrowserContext();
try {
  await runEnterprisePart1(ctx);
  await runEnterprisePart2(ctx);
  await runEnterprisePart3(ctx);
  await runEnterprisePart4(ctx);
  await runEnterprisePart5(ctx);
  console.log('Complete Enterprise AI Service Desk browser journey passed.');
} catch (error) {
  await ctx.page.screenshot({ path: 'artifacts/enterprise-browser-failure.png', fullPage: true }).catch(() => {});
  throw error;
} finally {
  await ctx.browser.close();
  ctx.server.kill('SIGTERM');
}
