import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';
import { extendWithOfficialColumn03 } from '../courses/ai-app-engineering/column-03-official.js';

const course = extendWithOfficialColumn03(productizeCourse(sourceCourse));
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

function lessonById(id) {
  return course.lessons.find((lesson) => lesson.id === id);
}

function examById(id) {
  return course.exams.find((exam) => exam.id === id);
}

async function selectExamAnswers(page, examId) {
  const exam = examById(examId);
  await page.goto(`${BASE}#exam/${examId}`);
  await page.waitForSelector('.exam-questions');
  for (let question = 0; question < exam.questions.length; question += 1) {
    await page.locator(`[data-question="${question}"][data-option="${exam.questions[question].correct}"]`).click();
  }
  await page.locator('[data-submit]').click();
  await page.locator('.exam-result.good').waitFor();
}

async function enterLesson(page, lessonId) {
  const lesson = lessonById(lessonId);
  await page.goto(`${BASE}#lesson/${lessonId}`);
  await page.waitForSelector('.cr-course');
  assert.match(await page.locator('.cr-official-reference code').textContent(), /langchain@1\.5\.3/);
  assert.ok(await page.locator('.cr-official-reference a').count() >= 1);
  const prediction = lesson.stages[0];
  const correctIndex = prediction.options.findIndex((option) => option.value === prediction.correctValue);
  await page.locator('[data-stage="prediction"] .cr-option').nth(correctIndex).click();
  await page.locator('[data-stage="lab"]:not(.cr-locked)').waitFor();
}

async function completeTransfer(page, lessonId) {
  const lesson = lessonById(lessonId);
  const transfer = lesson.stages[3];
  const correctIndex = transfer.options.findIndex((option) => option.value === transfer.correctValue);
  await page.locator('[data-stage="transfer"] .cr-quiz-option').nth(correctIndex).click();
  await page.locator('[data-role="lesson-complete"]:not([hidden])').waitFor();
}

async function setRange(locator, value) {
  await locator.evaluate((element, next) => {
    element.value = String(next);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.ok(dimensions.scrollWidth <= dimensions.clientWidth + 1, `${label} overflow: ${JSON.stringify(dimensions)}`);
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

  await selectExamAnswers(page, 'exam-column-01');
  await selectExamAnswers(page, 'exam-column-02');
  await page.goto(`${BASE}#dashboard`);
  await page.waitForSelector('.formal-column-card.active');
  assert.equal((await page.locator('.formal-column-card.active .formal-column-index').textContent()).trim(), 'COLUMN 03');
  assert.match(await page.locator('.v1-version-banner').textContent(), /langchain@1\.5\.3/);
  assert.match(await page.locator('.v1-version-banner').textContent(), /@langchain\/core@1\.2\.3/);
  await page.screenshot({ path: 'artifacts/langchain-v1-dashboard.png', fullPage: true });

  // Lesson 10: package boundaries.
  await enterLesson(page, 'lesson-10');
  for (const [index, value] of ['langchain', 'core', 'integration', 'langgraph', 'classic', 'langsmith'].entries()) {
    await page.locator(`[data-select="${index}"]`).selectOption(value);
  }
  await page.locator('[data-check]').click();
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-10');

  // Lesson 11: normalize OpenAI and Anthropic content blocks.
  await enterLesson(page, 'lesson-11');
  for (const [index, value] of ['reasoning', 'text', 'tool', 'metadata'].entries()) {
    await page.locator(`[data-map="${index}"]`).selectOption(value);
  }
  await page.locator('[data-check]').click();
  await page.locator('[data-provider="anthropic"]').click();
  for (const [index, value] of ['reasoning', 'text', 'citation', 'metadata'].entries()) {
    await page.locator(`[data-map="${index}"]`).selectOption(value);
  }
  await page.locator('[data-check]').click();
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-11');

  // Lesson 12: model profiles and batch scheduling.
  await enterLesson(page, 'lesson-12');
  await page.locator('[data-model="structured"]').click();
  await page.locator('input[name="method"][value="batch"]').check();
  await setRange(page.locator('[data-concurrency]'), 4);
  await page.locator('[data-check]').click();
  await page.locator('[data-model="vision"]').click();
  await page.locator('input[name="method"][value="invoke"]').check();
  await setRange(page.locator('[data-concurrency]'), 2);
  await page.locator('[data-check]').click();
  await page.locator('[data-model="structured"]').click();
  await setRange(page.locator('[data-concurrency]'), 4);
  await page.locator('[data-check]').click();
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-12');

  // Lesson 13: structured output strategies.
  await enterLesson(page, 'lesson-13');
  for (const value of ['provider', 'tool', 'split', 'model']) {
    await page.locator(`input[name="strategy"][value="${value}"]`).check();
    await page.locator('[data-check]').click();
  }
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-13');

  // Lesson 14: route streaming events and protect frontend state.
  await enterLesson(page, 'lesson-14');
  for (const [index, value] of ['messages', 'updates', 'custom', 'events', 'events', 'events'].entries()) {
    await page.locator(`[data-route="${index}"]`).selectOption(value);
  }
  for (const name of ['cancel', 'dedupe', 'partial']) await page.locator(`[data-${name}]`).check();
  await page.locator('[data-check]').click();
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-14');

  // Lesson 15: least privilege, schema, runtime context and ToolMessage recovery.
  await enterLesson(page, 'lesson-15');
  await page.locator('[data-tool="create_refund"]').uncheck();
  await page.locator('[data-schema]').selectOption('order_id');
  for (const name of ['user', 'tenant', 'db']) await page.locator(`[data-context="${name}"]`).check();
  await page.locator('[data-error]').selectOption('toolmessage');
  await page.locator('[data-run]').click();
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-15');

  // Lesson 16: run createAgent state loop with correct stop conditions.
  await enterLesson(page, 'lesson-16');
  await setRange(page.locator('[data-limit]'), 5);
  await page.locator('[data-auto]').click();
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-16');

  // Lesson 17: reorder middleware hooks and enable context engineering controls.
  await enterLesson(page, 'lesson-17');
  const moveUp = async (label, times) => {
    for (let i = 0; i < times; i += 1) {
      await page.locator('[data-hooks] .v1-card').filter({ hasText: label }).locator('[data-up]').click();
    }
  };
  await moveUp('beforeAgent', 1);
  await moveUp('beforeModel', 2);
  await moveUp('wrapModelCall', 3);
  await moveUp('afterModel', 2);
  for (const name of ['prompt', 'model', 'tools', 'guard']) await page.locator(`[data-cap="${name}"]`).check();
  await page.locator('[data-check]').click();
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-17');

  // Lesson 18: persist and restore isolated threads.
  await enterLesson(page, 'lesson-18');
  await page.locator('[data-checkpointer]').check();
  await page.locator('[data-isolate]').check();
  await page.locator('[data-policy]').selectOption('summarize');
  await page.locator('[data-write]').click();
  await page.locator('[data-thread="thread-b"]').click();
  await page.locator('[data-write]').click();
  await page.locator('[data-restart]').click();
  await page.locator('[data-verify]').click();
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-18');

  // Lesson 19: classify failures and configure bounded retry/fallback.
  await enterLesson(page, 'lesson-19');
  for (const [index, value] of ['model-retry', 'fallback', 'tool-retry', 'fix', 'limit'].entries()) {
    await page.locator(`[data-policy="${index}"]`).selectOption(value);
  }
  for (const name of ['backoff', 'jitter', 'observe']) await page.locator(`[data-${name}]`).check();
  await page.locator('[data-check]').click();
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-19');

  // Lesson 20: PII and HITL decisions.
  await enterLesson(page, 'lesson-20');
  for (const value of ['redact', 'reject', 'edit', 'approve']) {
    await page.locator(`input[name="decision"][value="${value}"]`).check();
    await page.locator('[data-apply]').click();
  }
  await page.locator('.v1-result.good').waitFor();
  await completeTransfer(page, 'lesson-20');

  // Lesson 21: inspect failing runs and finish production release checklist.
  await enterLesson(page, 'lesson-21');
  await page.locator('[data-run="run-mw"]').click();
  await page.locator('[data-cause]').selectOption('tool-context');
  for (const name of ['trace', 'metadata', 'dataset', 'reliability', 'safety', 'rollback']) {
    await page.locator(`[data-item="${name}"]`).check();
  }
  await page.locator('[data-release]').click();
  await page.locator('.v1-result.good').waitFor();
  await page.screenshot({ path: 'artifacts/langsmith-production-blueprint.png', fullPage: true });
  await completeTransfer(page, 'lesson-21');

  await selectExamAnswers(page, 'exam-column-03-official');
  await page.goto(`${BASE}#dashboard`);
  await page.waitForSelector('.formal-column-card.active');
  assert.equal((await page.locator('.formal-column-card.active .formal-column-index').textContent()).trim(), 'COLUMN 04');
  assert.match(await page.locator('.future-column-preview').textContent(), /RAG 知识库工程|后续课程/);
  await page.screenshot({ path: 'artifacts/rag-column-unlocked-official.png', fullPage: true });

  await page.locator('[data-action="artifacts"]').click();
  await page.locator('.artifact-drawer:not([hidden])').waitFor();
  const labels = await page.locator('.artifact-item summary b').allTextContents();
  for (const expected of [
    'LangChain v1 架构与迁移决策',
    'Message 与 Content Blocks 契约',
    '模型运行与批处理配置',
    '结构化输出策略',
    '多通道事件流协议',
    'Runtime Tool 注册表',
    'createAgent State 契约',
    'Middleware Hook 流水线',
    '线程级短期记忆策略',
    'Agent 可靠性策略',
    'Guardrails 与人工审批策略',
    'LangChain v1 生产交付蓝图',
  ]) {
    assert.ok(labels.includes(expected), `Portfolio should include ${expected}`);
  }
  await page.locator('[data-close]').click();

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    'dashboard',
    ...Array.from({ length: 12 }, (_, index) => `lesson/lesson-${index + 10}`),
    'exam/exam-column-03-official',
  ]) {
    await page.goto(`${BASE}#${route}`);
    await page.waitForTimeout(180);
    await assertNoOverflow(page, route);
  }

  assert.deepEqual(errors, []);
  console.log('Official LangChain v1 browser journey passed.');
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
