export async function runRagBrowserPart1(ctx) {
  const { assert, page, navigate, enterLesson, completeTransfer, selectValue, clickScenario } = ctx;
  await navigate('dashboard');
  await page.waitForSelector('.formal-column-path');
  assert.equal(await page.locator('.formal-column-card').count(), 7);
  assert.match(await page.locator('.formal-column-card').nth(3).textContent(), /RAG 检索与知识库工程/);

  await enterLesson('lesson-22');
  for (const [scenario, mode] of [['support', 'hybrid-rag'], ['policy', 'rag'], ['legal', 'rag-review'], ['small', 'long-context'], ['sql', 'sql-api']]) {
    await clickScenario(scenario);
    await page.locator(`input[name="access-mode"][value="${mode}"]`).check();
  }
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-22');

  await enterLesson('lesson-23');
  for (const scenario of ['support', 'policy']) {
    await clickScenario(scenario);
    const selects = page.locator('[data-dimension]');
    for (let index = 0; index < await selects.count(); index += 1) await selects.nth(index).selectOption({ index: 1 });
  }
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-23');

  await enterLesson('lesson-24');
  for (const [index, value] of ['fully', 'partially', 'hard-negative', 'no-answer', 'permission-denied'].entries()) await selectValue(`[data-label="${index}"]`, value);
  for (const slice of ['language', 'query', 'acl', 'no-answer']) await page.locator(`[data-slice="${slice}"]`).check();
  await page.locator('[data-run]').click();
  await completeTransfer('lesson-24');

  await enterLesson('lesson-25');
  for (const id of ['structure', 'source', 'acl', 'ocr', 'stable']) await page.locator(`[data-check-id="${id}"]`).check();
  await page.locator('[data-check]').click();
  await completeTransfer('lesson-25');

  await enterLesson('lesson-26');
  for (const index of [0, 1, 2]) await page.locator(`[data-boundary="${index}"]`).click();
  await page.locator('[data-save]').click();
  await clickScenario('support');
  for (const index of [0, 1, 2]) await page.locator(`[data-boundary="${index}"]`).click();
  await page.locator('[data-save]').click();
  await page.screenshot({ path: 'artifacts/rag-chunk-boundary-lab.png', fullPage: true });
  await completeTransfer('lesson-26');

  await enterLesson('lesson-27');
  for (const [scenario, strategy] of [['legal-definition', 'parent-child'], ['ambiguous-manual', 'contextual'], ['long-policy', 'late'], ['clean-markdown', 'baseline']]) {
    await clickScenario(scenario);
    await page.locator(`input[name="advanced-chunk"][value="${strategy}"]`).check();
  }
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-27');
}
