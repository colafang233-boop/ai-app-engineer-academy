export async function runLangGraphPart2(ctx) {
  const { page, enterLesson, completeTransfer, select, check } = ctx;

  await enterLesson('lesson-46');
  for (const [id, value] of Object.entries({ visual: 'graph', legacy: 'functional', mixed: 'hybrid', private: 'graph', short: 'functional', subgraph: 'graph' })) await page.locator(`input[name="api-${id}"][value="${value}"]`).check();
  await page.locator('[data-check]').click();
  await completeTransfer('lesson-46');

  await enterLesson('lesson-47');
  for (const id of ['clock', 'api', 'email']) await check(`[data-task="${id}"]`);
  for (const id of ['idempotency', 'serializable', 'retry']) await check(`[data-${id}]`);
  await page.locator('[data-run]').click();
  await completeTransfer('lesson-47');

  await enterLesson('lesson-48');
  await page.locator('[data-thread="thread-b"]').click();
  await page.locator('[data-snapshot="1"]').click();
  await page.locator('[data-restart]').click();
  await page.locator('[data-restore]').click();
  await completeTransfer('lesson-48');

  await enterLesson('lesson-49');
  await check('[data-first]'); await check('[data-typed]');
  for (const value of ['edit', 'reject', 'approve', 'respond']) {
    await page.locator(`input[name="resume-decision"][value="${value}"]`).check();
    await page.locator('[data-resume]').click();
  }
  await page.screenshot({ path: 'artifacts/langgraph-interrupt-resume.png', fullPage: true });
  await completeTransfer('lesson-49');

  await enterLesson('lesson-50');
  await page.locator('[data-checkpoint="cp-2"]').click();
  await check('[data-audit]');
  await page.locator('[data-replay]').click();
  await page.locator('[data-fork]').click();
  await page.screenshot({ path: 'artifacts/langgraph-time-travel-fork.png', fullPage: true });
  await completeTransfer('lesson-50');

  await enterLesson('lesson-51');
  for (const [id, value] of Object.entries({ classify: 'updates', token: 'messages', progress: 'custom', snapshot: 'values', diagnostic: 'debug' })) await select(`[data-mode="${id}"]`, value);
  await check('[data-status]'); await check('[data-dedupe]');
  await page.locator('[data-check]').click();
  await completeTransfer('lesson-51');

  await enterLesson('lesson-52');
  for (const [id, value] of Object.entries({ messages: 'thread', order: 'thread', language: 'user-store', terminology: 'org-store', tool: 'thread', public: 'app-store' })) await select(`[data-choice="${id}"]`, value);
  for (const id of ['trim', 'delete', 'db']) await check(`[data-${id}]`);
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-52');
}
