export async function runRagBrowserPart2(ctx) {
  const { page, enterLesson, completeTransfer, setRange, selectValue, clickScenario } = ctx;
  await enterLesson('lesson-28');
  await page.locator('[data-model="multi-balanced"]').click();
  await setRange(page.locator('[data-dim]'), 1152);
  await page.locator('[data-normalize]').check();
  await page.locator('[data-query-instruction]').check();
  for (const scenario of ['zh', 'cross', 'mixed']) {
    await clickScenario(scenario);
    await page.locator('[data-run]').click();
  }
  await page.screenshot({ path: 'artifacts/rag-multilingual-embedding-benchmark.png', fullPage: true });
  await completeTransfer('lesson-28');

  await enterLesson('lesson-29');
  for (const [scenario, representation] of [['support', 'hybrid'], ['policy', 'dense'], ['legal', 'hybrid'], ['code', 'multi-vector']]) {
    await clickScenario(scenario);
    await page.locator(`input[name="representation"][value="${representation}"]`).check();
  }
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-29');

  await enterLesson('lesson-30');
  for (const id of ['stable-id', 'metadata', 'prefilter', 'normalize', 'alias']) await page.locator(`[data-requirement="${id}"]`).check();
  await selectValue('[data-metric]', 'cosine');
  await page.locator('[data-check]').click();
  await completeTransfer('lesson-30');

  await enterLesson('lesson-31');
  for (const event of ['duplicate', 'modify', 'remove']) await page.locator(`[data-event="${event}"]`).click();
  for (const operation of ['checksum', 'upsert', 'delete', 'dual', 'verify', 'alias', 'rollback']) await page.locator(`[data-operation="${operation}"]`).check();
  await page.locator('[data-run]').click();
  await completeTransfer('lesson-31');

  await enterLesson('lesson-32');
  await page.locator('[data-run]').click();
  await completeTransfer('lesson-32');

  await enterLesson('lesson-33');
  await page.locator('[data-save]').click();
  await clickScenario('policy');
  await page.locator('input[name="fusion-mode"][value="linear"]').check();
  await setRange(page.locator('[data-dense]'), 65);
  await setRange(page.locator('[data-lex]'), 35);
  await page.locator('[data-save]').click();
  await clickScenario('legal');
  await page.locator('[data-save]').click();
  await page.screenshot({ path: 'artifacts/rag-hybrid-rank-diff.png', fullPage: true });
  await completeTransfer('lesson-33');
}
