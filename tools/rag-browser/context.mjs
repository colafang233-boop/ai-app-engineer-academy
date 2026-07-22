import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { course as sourceCourse } from '../../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../../courses/ai-app-engineering/product-course.js';
import { extendWithOfficialColumn03 } from '../../courses/ai-app-engineering/column-03-official.js';
import { extendWithRagColumn } from '../../courses/ai-app-engineering/column-04-rag.js';

const course = extendWithRagColumn(extendWithOfficialColumn03(productizeCourse(sourceCourse)));
const PORT = 4174;
const BASE = `http://127.0.0.1:${PORT}/apps/runtime-academy/`;
let navigationCounter = 0;

function lessonById(id) { return course.lessons.find((lesson) => lesson.id === id); }
function examById(id) { return course.exams.find((exam) => exam.id === id); }

export async function createRagBrowserContext() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: process.cwd(), stdio: 'ignore' });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) break;
    } catch {}
    if (attempt === 49) throw new Error('Static server did not start');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  await mkdir('artifacts', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

  async function navigate(hash) {
    navigationCounter += 1;
    await page.goto(`${BASE}?preview=1&test=${navigationCounter}#${hash}`, { waitUntil: 'domcontentloaded' });
  }
  async function enterLesson(lessonId) {
    const lesson = lessonById(lessonId);
    await navigate(`lesson/${lessonId}`);
    await page.waitForSelector('.cr-course');
    assert.match(await page.locator('.cr-official-reference code').textContent(), /Framework-neutral RAG research baseline/);
    const correctIndex = lesson.stages[0].options.findIndex((option) => option.value === lesson.stages[0].correctValue);
    await page.locator('[data-stage="prediction"] .cr-option').nth(correctIndex).click();
    await page.locator('[data-stage="lab"]:not(.cr-locked)').waitFor();
  }
  async function completeTransfer(lessonId) {
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
  async function selectValue(selector, value) {
    await page.locator(selector).selectOption(value);
    await page.locator(selector).dispatchEvent('change');
  }
  async function clickScenario(id) { await page.locator(`[data-scenario="${id}"]`).click(); }
  async function assertNoOverflow(label) {
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    assert.ok(dimensions.scrollWidth <= dimensions.clientWidth + 1, `${label} overflow: ${JSON.stringify(dimensions)}`);
  }
  async function passExam(examId) {
    const exam = examById(examId);
    await navigate(`exam/${examId}`);
    await page.waitForSelector('.exam-questions');
    for (let index = 0; index < exam.questions.length; index += 1) {
      await page.locator(`[data-question="${index}"][data-option="${exam.questions[index].correct}"]`).click();
    }
    await page.locator('[data-submit]').click();
    await page.locator('.exam-result.good').waitFor();
  }
  return {
    assert,
    browser,
    page,
    server,
    errors,
    navigate,
    enterLesson,
    completeTransfer,
    setRange,
    selectValue,
    clickScenario,
    assertNoOverflow,
    passExam,
  };
}
