export async function runEnterprisePart5(ctx) {
  const { assert, page, errors, navigate, enterLesson, completeTransfer, passExam, assertNoOverflow } = ctx;

  await enterLesson(108);
  const incidentSteps = page.locator('input[data-incident]');
  for (let index = 0; index < await incidentSteps.count(); index += 1) await incidentSteps.nth(index).check();
  await page.locator('[data-run]').click();
  await page.locator('.mcp-result.good').waitFor();
  await page.screenshot({ path: 'artifacts/enterprise-incident-command-center.png', fullPage: true });
  await completeTransfer(108);

  await passExam('exam-column-07-enterprise');

  await navigate('dashboard');
  await page.waitForSelector('.formal-dashboard.review-mode');
  assert.equal(await page.locator('[data-review-column]').count(), 7);
  assert.equal(await page.locator('.review-column-stack .lesson-card').count(), 108);
  assert.equal(await page.locator('.review-column-stack [data-exam]').count(), 7);
  assert.equal(await page.locator('.review-roadmap').count(), 0);
  assert.equal(await page.locator('.review-graduation').count(), 1);
  assert.match(await page.locator('.quality-review-banner').textContent(), /108 节课程.*7 场考试/);
  await page.screenshot({ path: 'artifacts/complete-108-lessons-quality-review.png', fullPage: true });

  await page.locator('[data-action="artifacts"]').click();
  await page.locator('.artifact-drawer:not([hidden])').waitFor();
  assert.ok(await page.locator('.artifact-item').count() >= 25);
  const labels = await page.locator('.artifact-item summary b').allTextContents();
  for (const expected of [
    '企业级成熟度模型', 'NovaTech 产品章程', '企业身份与授权策略', '制度问答生产发布',
    '权限申请审批工作流', '发布故障诊断工作流', '离线评估发布门禁', '可观测性、SLO 与成本契约',
    '企业 Agentic AI 威胁模型', '企业发布与回滚策略', 'Enterprise AI Service Desk 生产蓝图',
  ]) assert.ok(labels.includes(expected), `Portfolio should include ${expected}`);
  await page.locator('[data-close]').click();

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    'dashboard', 'lesson/lesson-84', 'lesson/lesson-90', 'lesson/lesson-95', 'lesson/lesson-99',
    'lesson/lesson-104', 'lesson/lesson-107', 'lesson/lesson-108', 'exam/exam-column-07-enterprise',
  ]) {
    await navigate(route);
    await page.waitForTimeout(180);
    await assertNoOverflow(route);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => localStorage.clear());
  await navigate('dashboard', 'review=0');
  await page.waitForSelector('.formal-dashboard');
  assert.equal(await page.locator('.quality-review-banner').count(), 0);
  assert.ok(await page.locator('.formal-column-card.locked').count() >= 1);
  await navigate('lesson/lesson-84', 'review=0');
  await page.waitForSelector('.locked-page');
  assert.match(await page.locator('.locked-page').textContent(), /还没有开放|完成上一课/);

  assert.deepEqual(errors, []);
}
