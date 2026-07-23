export async function runMcpBrowserPart3(ctx) {
  const { page, enterLesson, completeTransfer, runDecision, runChecklist } = ctx;

  await enterLesson(73);
  await runChecklist({ failure: 'degraded', collision: 'prefix' });
  await completeTransfer(73);

  await enterLesson(74);
  await runDecision(['stdio', 'http', 'rpc', 'legacy', 'http']);
  await completeTransfer(74);

  await enterLesson(75);
  await runChecklist({ retry: 'query', unknown: 'pending' });
  await completeTransfer(75);

  await enterLesson(76);
  const gates = page.locator('input[data-gate]');
  for (let index = 0; index < await gates.count(); index += 1) await gates.nth(index).check();
  await page.locator('[data-run]').click();
  await page.locator('.mcp-result.good').waitFor();
  await completeTransfer(76);

  await enterLesson(77);
  await runChecklist({ 'scope-set': 'minimal', aud: 'academy' });
  await page.screenshot({ path: 'artifacts/mcp-oauth-delegation-flow.png', fullPage: true });
  await completeTransfer(77);

  await enterLesson(78);
  await runDecision(['env', 'oauth', 'machine', 'workload', 'tunnel', 'anonymous', 'bearer']);
  await completeTransfer(78);
}
