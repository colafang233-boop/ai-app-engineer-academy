export async function runLangGraphPart3(ctx) {
  const { page, assert, browser, errors, navigate, enterLesson, completeTransfer, select, check, setRange, passExam, assertNoOverflow } = ctx;

  await enterLesson('lesson-53');
  for (const [id, value] of Object.entries({ worker: 'invocation', support: 'thread', validator: 'stateless', accounting: 'invocation' })) await select(`[data-choice="${id}"]`, value);
  for (const id of ['map', 'namespace', 'errors']) await check(`[data-${id}]`);
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-53');

  await enterLesson('lesson-54');
  for (const [id, value] of Object.entries({ single: 'single', parallel: 'router', context: 'subagents', conversation: 'handoff', workflow: 'workflow' })) await select(`[data-choice="${id}"]`, value);
  for (const id of ['contract', 'context', 'budget', 'trace']) await check(`[data-${id}]`);
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-54');

  await enterLesson('lesson-55');
  for (const [id, value] of Object.entries({ smalltalk: 'none', balance: 'api', policy: 'vector', error: 'hybrid', mixed: 'parallel', forbidden: 'deny' })) await select(`[data-choice="${id}"]`, value);
  for (const id of ['typed', 'acl', 'source', 'budget']) await check(`[data-${id}]`);
  await page.locator('[data-save]').click();
  await page.screenshot({ path: 'artifacts/langgraph-agentic-rag-router.png', fullPage: true });
  await completeTransfer('lesson-55');

  await enterLesson('lesson-56');
  for (const [id, value] of Object.entries({ wording: 'rewrite', multihop: 'decompose', cross: 'translate', permission: 'stop', missing: 'abstain' })) await select(`[data-choice="${id}"]`, value);
  await setRange('[data-attempts]', 2);
  for (const id of ['original', 'diff', 'candidates', 'cost']) await check(`[data-${id}]`);
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-56');

  await enterLesson('lesson-57');
  for (const [id, value] of Object.entries({ insufficient: 'retrieve', citation: 'revise', irrelevant: 'regenerate', conflict: 'human', none: 'abstain' })) await select(`[data-choice="${id}"]`, value);
  await setRange('[data-budget]', 6);
  for (const id of ['sufficiency', 'grounded', 'citation', 'relevance', 'stop']) await check(`[data-${id}]`);
  await page.locator('[data-save]').click();
  await page.screenshot({ path: 'artifacts/langgraph-evidence-grounding-loop.png', fullPage: true });
  await completeTransfer('lesson-57');

  await enterLesson('lesson-58');
  for (const id of ['node-tests', 'route-tests', 'partial', 'checkpoint', 'interrupt', 'migration', 'trace', 'stream', 'budget', 'security', 'deploy', 'rollback']) await check(`[data-item="${id}"]`);
  for (const [id, value] of Object.entries({ crash: 'resume', schema: 'migrate', loop: 'budget', acl: 'block' })) await select(`[data-fault="${id}"]`, value);
  await select('[data-decision]', 'canary');
  await page.locator('[data-release]').click();
  await page.screenshot({ path: 'artifacts/langgraph-production-release.png', fullPage: true });
  await completeTransfer('lesson-58');

  await passExam('exam-column-05-langgraph');
  await navigate('dashboard');
  await page.waitForSelector('.formal-dashboard.review-mode');
  assert.equal(await page.locator('.formal-column-card').count(), 7);
  assert.equal(await page.locator('.formal-column-card.locked').count(), 0);
  assert.equal(await page.locator('.review-column-section').count(), 7);
  assert.equal(await page.locator('.lesson-card').count(), 108);
  assert.equal(await page.locator('.column-exam:disabled').count(), 0);
  assert.match(await page.locator('.preview-badge').textContent(), /质量审阅/);
  assert.equal(await page.locator('.review-roadmap').count(), 0);
  assert.equal(await page.locator('.review-graduation').count(), 1);
  await page.screenshot({ path: 'artifacts/all-columns-quality-review.png', fullPage: true });

  await page.locator('[data-action="artifacts"]').click();
  await page.locator('.artifact-drawer:not([hidden])').waitFor();
  const labels = await page.locator('.artifact-item summary b').allTextContents();
  for (const expected of [
    'LangGraph 编排适用性决策', 'Graph 执行模型快照', 'StateSchema 与 Reducer 契约', 'Node 边界与副作用策略',
    'Edge、Routing 与 Command 策略', 'Superstep 与 Send 并行策略', 'LangGraph 工作流模式目录', 'Graph API / Functional API 决策',
    'Durable Execution 策略', 'Checkpoint 与 Thread 契约', 'Interrupt 与 Resume 契约', 'Time Travel 调试方案',
    'Graph Streaming UI 契约', '短期与长期 Memory Scope', 'Subgraph 组合与持久化策略', 'Multi-agent 架构决策',
    'Agentic RAG 知识路由器', '检索自纠错循环', 'Evidence 与 Grounding 质量闭环', 'LangGraph 生产交付蓝图',
  ]) assert.ok(labels.includes(expected), `Portfolio should include ${expected}`);
  await page.locator('[data-close]').click();

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['dashboard', 'lesson/lesson-41', 'lesson/lesson-49', 'lesson/lesson-55', 'lesson/lesson-58', 'exam/exam-column-05-langgraph']) {
    await navigate(route);
    await page.waitForTimeout(180);
    await assertNoOverflow(route);
  }

  const strictPage = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  await strictPage.addInitScript(() => localStorage.clear());
  await strictPage.goto('http://127.0.0.1:4176/apps/runtime-academy/?review=0#dashboard', { waitUntil: 'domcontentloaded' });
  await strictPage.waitForSelector('.formal-column-path');
  assert.ok(await strictPage.locator('.formal-column-card.locked').count() > 0, 'review=0 should restore sequential locks');
  await strictPage.close();

  assert.deepEqual(errors, []);
}
