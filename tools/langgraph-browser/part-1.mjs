export async function runLangGraphPart1(ctx) {
  const { page, enterLesson, completeTransfer, select, check, setRange } = ctx;

  await enterLesson('lesson-39');
  for (const [id, value] of Object.entries({ extract: 'plain', tool: 'agent', approval: 'graph', legacy: 'functional', report: 'graph', faq: 'plain' })) await select(`[data-choice="${id}"]`, value);
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-39');

  await enterLesson('lesson-40');
  for (let i = 0; i < 6; i += 1) await page.locator('[data-step]').click();
  await page.screenshot({ path: 'artifacts/langgraph-state-superstep.png', fullPage: true });
  await completeTransfer('lesson-40');

  await enterLesson('lesson-41');
  for (const [id, value] of Object.entries({ route: 'overwrite', sources: 'union', sections: 'append', calls: 'sum', messages: 'messages' })) await select(`[data-reducer="${id}"]`, value);
  await page.locator('[data-run]').click();
  await page.screenshot({ path: 'artifacts/langgraph-reducer-board.png', fullPage: true });
  await completeTransfer('lesson-41');

  await enterLesson('lesson-42');
  for (let i = 0; i < 4; i += 1) await check(`[data-boundary="${i}"]`);
  await check('[data-idempotent]'); await check('[data-raw]');
  await page.locator('[data-run]').click();
  await completeTransfer('lesson-42');

  await enterLesson('lesson-43');
  for (const [id, value] of Object.entries({ fixed: 'edge', branch: 'conditional', parallel: 'conditional', 'update-route': 'command', parent: 'command', loop: 'command' })) await select(`[data-choice="${id}"]`, value);
  await check('[data-limit]');
  await page.locator('[data-check]').click();
  await completeTransfer('lesson-43');

  await enterLesson('lesson-44');
  await setRange('[data-workers]', 4); await setRange('[data-concurrency]', 3);
  await select('[data-mode]', 'send'); await select('[data-reducer]', 'concat'); await check('[data-partial]');
  await page.locator('[data-run]').click();
  await completeTransfer('lesson-44');

  await enterLesson('lesson-45');
  for (const [id, value] of Object.entries({ translate: 'chain', moderate: 'parallel', support: 'routing', report: 'orchestrator', copy: 'evaluator', research: 'agent' })) await select(`[data-choice="${id}"]`, value);
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-45');
}
