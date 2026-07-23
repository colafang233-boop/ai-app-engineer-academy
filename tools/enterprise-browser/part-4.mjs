export async function runEnterprisePart4(ctx) {
  const { page, enterLesson, completeTransfer, runDecision, runChecklist } = ctx;

  await enterLesson(102);
  await runChecklist({ leak: 'block', tool: 'investigate' });
  await completeTransfer(102);

  await enterLesson(103);
  await runDecision(['all', 'risk-sample', 'combine', 'cluster', 'sanitize', 'gate']);
  await completeTransfer(103);

  await enterLesson(104);
  for (const id of ['identity', 'policy', 'retrieval', 'model', 'mcp']) await page.locator(`[data-span="${id}"]`).click();
  for (const id of ['quality', 'cost', 'redact']) await page.locator(`[data-check="${id}"]`).check();
  await page.locator('[data-save]').click();
  await page.locator('.mcp-result.good').waitFor();
  await page.screenshot({ path: 'artifacts/enterprise-control-room.png', fullPage: true });
  await completeTransfer(104);

  await enterLesson(105);
  await runDecision(['pre-filter', 'untrusted', 'validate', 'filter', 'delegation', 'network', 'contain', 'redact']);
  await page.screenshot({ path: 'artifacts/enterprise-agentic-red-team.png', fullPage: true });
  await completeTransfer(105);

  await enterLesson(106);
  await runDecision(['evaluated-fallback', 'partial', 'breaker', 'backpressure', 'dlq', 'reconcile', 'priority']);
  await completeTransfer(106);

  await enterLesson(107);
  const gates = page.locator('input[data-gate]');
  for (let index = 0; index < await gates.count(); index += 1) await gates.nth(index).check();
  await page.locator('[data-release]').click();
  await page.locator('.mcp-result.good').waitFor();
  await page.screenshot({ path: 'artifacts/enterprise-release-gate-board.png', fullPage: true });
  await completeTransfer(107);
}
