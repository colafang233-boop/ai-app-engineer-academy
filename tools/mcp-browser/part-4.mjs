export async function runMcpBrowserPart4(ctx) {
  const { assert, page, errors, navigate, enterLesson, completeTransfer, runDecision, runChecklist, passExam, assertNoOverflow } = ctx;

  await enterLesson(79);
  await runChecklist({ state: 'none', transport: 'http' });
  await completeTransfer(79);

  await enterLesson(80);
  await runChecklist({ need: 'yes', record: 'db' });
  await completeTransfer(80);

  await enterLesson(81);
  await runDecision(['untrusted', 'block', 'origin', 'separate', 'acl', 'filter', 'deny', 'approval']);
  await page.screenshot({ path: 'artifacts/mcp-security-chaos-lab.png', fullPage: true });
  await completeTransfer(81);

  await enterLesson(82);
  await runChecklist({ baseline: 'v1', evidence: 'matrix' });
  await completeTransfer(82);

  await enterLesson(83);
  await runChecklist({ deployment: 'separate', write: 'shared', quality: 'cross-host' });
  await page.screenshot({ path: 'artifacts/academy-mcp-production-blueprint.png', fullPage: true });
  await completeTransfer(83);

  await passExam('exam-column-06-mcp');

  await navigate('dashboard');
  await page.waitForSelector('.quality-review-banner');
  assert.equal(await page.locator('.formal-column-card').count(), 7);
  assert.equal(await page.locator('[data-selected-column]').count(), 1);
  await page.locator('[data-column-select="column-06"]').click();
  await page.waitForSelector('[data-selected-column="column-06"]');
  assert.equal(await page.locator('[data-selected-column="column-06"] .lesson-card').count(), 25);
  assert.equal(await page.locator('[data-selected-column="column-06"] [data-exam]').count(), 1);
  assert.equal(await page.locator('.review-column-stack').count(), 0);
  assert.match(await page.locator('.quality-review-banner').textContent(), /108 节课程.*自由选择审阅/);
  await page.screenshot({ path: 'artifacts/all-seven-columns-quality-review.png', fullPage: true });

  await page.locator('[data-action="artifacts"]').click();
  await page.locator('.artifact-drawer:not([hidden])').waitFor();
  assert.ok(await page.locator('.artifact-item').count() >= 25);
  const labels = await page.locator('.artifact-item summary b').allTextContents();
  for (const expected of ['MCP Host 兼容矩阵', 'OAuth 用户委托策略', 'MCP 安全威胁模型', 'Academy MCP 生产交付蓝图']) {
    assert.ok(labels.includes(expected), `Portfolio should include ${expected}`);
  }
  await page.locator('[data-close]').click();

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['dashboard', 'lesson/lesson-60', 'lesson/lesson-65', 'lesson/lesson-77', 'lesson/lesson-81', 'lesson/lesson-83', 'exam/exam-column-06-mcp']) {
    await navigate(route);
    await page.waitForTimeout(180);
    await assertNoOverflow(route);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => localStorage.clear());
  await navigate('dashboard', 'review=0');
  await page.waitForSelector('.formal-dashboard');
  assert.equal(await page.locator('.quality-review-banner').count(), 0);
  assert.equal(await page.locator('.formal-column-card.review-open').count(), 0);
  assert.ok(await page.locator('.formal-column-card.locked').count() >= 1);
  await navigate('lesson/lesson-59', 'review=0');
  await page.waitForSelector('.locked-page');
  assert.match(await page.locator('.locked-page').textContent(), /还没有开放|完成上一课/);

  assert.deepEqual(errors, []);
}
