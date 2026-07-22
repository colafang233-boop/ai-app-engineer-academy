import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}/apps/runtime-academy/?preview=1`;
const server = spawn('python3', ['-m', 'http.server', String(PORT)], {
  cwd: process.cwd(),
  stdio: 'ignore',
});

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${BASE}#dashboard`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Static server did not start');
}

async function selectExamAnswers(page, examId, answers) {
  await page.goto(`${BASE}#exam/${examId}`);
  await page.waitForSelector('.exam-questions');
  for (let question = 0; question < answers.length; question += 1) {
    await page.locator(`[data-question="${question}"][data-option="${answers[question]}"]`).click();
  }
  await page.locator('[data-submit]').click();
  await page.locator('.exam-result.good').waitFor();
}

async function enterLesson(page, lessonId) {
  await page.goto(`${BASE}#lesson/${lessonId}`);
  await page.waitForSelector('.cr-course');
  await page.locator('[data-stage="prediction"] .cr-option').nth(1).click();
}

async function completeTransfer(page) {
  await page.locator('[data-stage="transfer"] .cr-quiz-option').nth(1).click();
  await page.locator('[data-role="lesson-complete"]:not([hidden])').waitFor();
}

async function assertNoOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.equal(metrics.scrollWidth > metrics.clientWidth + 1, false, `${label} should not overflow horizontally: ${JSON.stringify(metrics)}`);
}

await waitForServer();
await mkdir('artifacts', { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});
page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

try {
  await page.goto(`${BASE}#dashboard`);
  await page.waitForSelector('.formal-column-path');
  assert.equal(await page.locator('.formal-column-card').count(), 7);

  await selectExamAnswers(page, 'exam-column-01', [0, 1, 0, 1, 1]);
  await selectExamAnswers(page, 'exam-column-02', [0, 0, 0, 1, 0]);

  await page.goto(`${BASE}#dashboard`);
  await page.waitForSelector('.formal-column-card.active');
  assert.equal((await page.locator('.formal-column-card.active .formal-column-index').textContent()).trim(), 'COLUMN 03');
  await page.screenshot({ path: 'artifacts/column03-dashboard.png', fullPage: true });

  await enterLesson(page, 'lesson-10');
  await page.locator('[data-run]').click();
  await page.locator('.lc-result.warn').waitFor();
  await page.locator('[data-mode="messages"]').click();
  await page.locator('[data-system]').check();
  await page.locator('[data-run]').click();
  await page.locator('.lc-result.good').waitFor();
  await completeTransfer(page);

  await enterLesson(page, 'lesson-11');
  await page.locator('[data-start]').click();
  await page.waitForTimeout(1100);
  await page.locator('.lc-result.warn').waitFor();
  await page.locator('[data-stream-mode="stream"]').click();
  await page.locator('[data-start]').click();
  await page.waitForTimeout(2100);
  await page.locator('.lc-result.warn').waitFor();
  await page.locator('[data-merge]').check();
  await page.locator('[data-start]').click();
  await page.waitForTimeout(2100);
  await page.locator('.lc-result.good').waitFor();
  await completeTransfer(page);

  await enterLesson(page, 'lesson-12');
  await page.locator('[data-run]').click();
  await page.locator('.lc-result.warn').waitFor();
  await page.locator('[data-tool="create_refund"]').uncheck();
  await page.locator('[data-run]').click();
  await page.locator('.lc-result.warn').waitFor();
  await page.locator('[data-schema="order_id"]').click();
  await page.locator('[data-run]').click();
  await page.locator('.lc-result.good').waitFor();
  await page.screenshot({ path: 'artifacts/lesson12-tool-calling.png', fullPage: true });
  await completeTransfer(page);

  await enterLesson(page, 'lesson-13');
  await page.locator('[data-limit]').evaluate((element) => {
    element.value = '1';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('[data-step]').click();
  await page.locator('[data-step]').click();
  await page.locator('.lc-result.warn').waitFor();
  await page.locator('[data-reset]').click();
  await page.locator('[data-limit]').evaluate((element) => {
    element.value = '3';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('[data-auto]').click();
  await page.locator('.lc-result.good').waitFor({ timeout: 6000 });
  await completeTransfer(page);

  await selectExamAnswers(page, 'exam-column-03', [0, 0, 0, 0, 0]);
  await page.goto(`${BASE}#dashboard`);
  await page.waitForSelector('.formal-column-card.active');
  assert.equal((await page.locator('.formal-column-card.active .formal-column-index').textContent()).trim(), 'COLUMN 04');
  assert.match(await page.locator('.future-column-preview').textContent(), /RAG 知识库工程/);
  await page.screenshot({ path: 'artifacts/column04-unlocked.png', fullPage: true });

  const resultLabels = await page.locator('.artifact-item summary b').allTextContents();
  for (const label of ['标准模型调用配置', '流式响应协议', '工具注册表', 'Agent Loop 运行轨迹']) {
    assert.ok(resultLabels.includes(label), `Project results should include ${label}; actual=${JSON.stringify(resultLabels)}`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['dashboard', 'lesson/lesson-10', 'lesson/lesson-11', 'lesson/lesson-12', 'lesson/lesson-13', 'exam/exam-column-03']) {
    await page.goto(`${BASE}#${route}`);
    await page.waitForTimeout(250);
    await assertNoOverflow(page, route);
  }

  assert.deepEqual(errors, []);
  console.log('Column 03 browser flow passed.');
} catch (error) {
  let bodyText = '';
  try {
    bodyText = (await page.locator('body').innerText()).slice(-5000);
  } catch {}
  await writeFile('artifacts/failure.txt', [
    error?.stack ?? String(error),
    `URL: ${page.url()}`,
    `Console errors: ${JSON.stringify(errors, null, 2)}`,
    'Visible body tail:',
    bodyText,
  ].join('\n\n'));
  throw error;
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
