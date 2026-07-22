export async function runRagBrowserPart3(ctx) {
  const { assert, page, errors, navigate, enterLesson, completeTransfer, setRange, selectValue, clickScenario, passExam, assertNoOverflow } = ctx;
  await enterLesson('lesson-34');
  for (const [scenario, transform] of [['identifier', 'normalize'], ['cross', 'translate'], ['broad', 'multi-query'], ['multi-hop', 'decompose']]) {
    await clickScenario(scenario);
    await page.locator(`[data-transform="${transform}"]`).check();
  }
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-34');

  await enterLesson('lesson-35');
  for (const [scenario, model, topN] of [['support', 'fast-cross', 20], ['policy', 'multi-cross', 30], ['legal', 'quality-cross', 40]]) {
    await clickScenario(scenario);
    await page.locator(`[data-model="${model}"]`).click();
    await setRange(page.locator('[data-topn]'), topN);
    await page.locator('[data-run]').click();
  }
  await page.screenshot({ path: 'artifacts/rag-rerank-pareto.png', fullPage: true });
  await completeTransfer('lesson-35');

  await enterLesson('lesson-36');
  const special = {
    table: ['cells', 'table-aware', 'text+schema', 'hybrid', 'cell-range'],
    code: ['ast', 'symbol', 'code+lexical', 'code-hybrid', 'file-lines'],
    scan: ['ocr-layout', 'layout-aware', 'text+image', 'hybrid', 'page-region'],
    visual: ['vision-page', 'page-region', 'multi-vector-vision', 'visual', 'page-region'],
    mixed: ['bilingual', 'structure', 'multilingual', 'hybrid', 'section'],
  };
  for (const [scenario, values] of Object.entries(special)) {
    await clickScenario(scenario);
    for (const [field, value] of [['parse', values[0]], ['chunk', values[1]], ['representation', values[2]], ['retrieval', values[3]], ['citation', values[4]]]) await selectValue(`[data-field="${field}"]`, value);
  }
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-36');

  await enterLesson('lesson-37');
  for (const id of ['d-nvml', 'd-driver-clean']) await page.locator(`[data-candidate="${id}"]`).click();
  for (const option of ['parent', 'dedupe', 'diverse', 'citations', 'abstain']) await page.locator(`[data-option="${option}"]`).check();
  await page.locator('[data-save]').click();
  await clickScenario('legal');
  for (const id of ['d-liquidated-damages', 'd-definition-delay']) await page.locator(`[data-candidate="${id}"]`).click();
  await page.locator('[data-save]').click();
  await completeTransfer('lesson-37');

  await enterLesson('lesson-38');
  for (const fix of ['cross', 'acl', 'fresh']) await page.locator(`[data-fix="${fix}"]`).check();
  for (const check of ['rollback', 'monitor']) await page.locator(`[data-check="${check}"]`).check();
  await page.locator('input[name="release"][value="gray"]').check();
  await page.locator('[data-release]').click();
  await page.screenshot({ path: 'artifacts/rag-production-release-gate.png', fullPage: true });
  await completeTransfer('lesson-38');

  await passExam('exam-column-04-rag');
  await navigate('dashboard');
  await page.waitForSelector('.formal-column-card.active');
  assert.equal((await page.locator('.formal-column-card.active .formal-column-index').textContent()).trim(), 'COLUMN 05');
  await page.screenshot({ path: 'artifacts/column05-unlocked-after-rag.png', fullPage: true });

  await page.locator('[data-action="artifacts"]').click();
  await page.locator('.artifact-drawer:not([hidden])').waitFor();
  const labels = await page.locator('.artifact-item summary b').allTextContents();
  for (const expected of [
    '知识访问架构决策', 'Corpus × Query 检索画像', 'RAG Golden Evaluation Dataset', '文档入库与权限契约',
    'Chunking 基线策略', '高级 Chunking 使用边界', '多语言 Embedding 评测报告', '检索表示与路由策略',
    '检索索引 Schema', '增量索引生命周期', '一阶段召回路由器', 'Hybrid Fusion 策略',
    'Query Transformation 策略', 'Reranking 评测报告', '特殊语料检索策略', 'Evidence 与引用契约', 'RAG 生产发布门禁',
  ]) assert.ok(labels.includes(expected), `Portfolio should include ${expected}`);
  await page.locator('[data-close]').click();

  await page.setViewportSize({ width: 390, height: 844 });
  for (const lessonId of ['lesson-26', 'lesson-28', 'lesson-33', 'lesson-35', 'lesson-38']) {
    await navigate(`lesson/${lessonId}`);
    await page.waitForSelector('.cr-course');
    await assertNoOverflow(lessonId);
  }
  assert.deepEqual(errors, []);
}
