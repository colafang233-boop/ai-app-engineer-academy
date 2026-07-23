import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { course as sourceCourse } from '../../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../../courses/ai-app-engineering/product-course.js';
import { extendWithOfficialColumn03 } from '../../courses/ai-app-engineering/column-03-official.js';
import { extendWithRagColumn } from '../../courses/ai-app-engineering/column-04-rag.js';
import { extendWithLangGraphColumn } from '../../courses/ai-app-engineering/column-05-langgraph.js';

const course = extendWithLangGraphColumn(extendWithRagColumn(extendWithOfficialColumn03(productizeCourse(sourceCourse))));
const PORT = 4176;
const BASE = `http://127.0.0.1:${PORT}/apps/runtime-academy/`;
let navigationCounter = 0;
function lessonById(id) { return course.lessons.find((lesson) => lesson.id === id); }
function examById(id) { return course.exams.find((exam) => exam.id === id); }

export async function createLangGraphBrowserContext() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: process.cwd(), stdio: 'ignore' });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { if ((await fetch(BASE)).ok) break; } catch {}
    if (attempt === 49) throw new Error('Static server did not start');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  await mkdir('artifacts', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

  async function navigate(hash, { review = 1 } = {}) { navigationCounter += 1; await page.goto(`${BASE}?review=${review}&test=${navigationCounter}#${hash}`, { waitUntil: 'domcontentloaded' }); }
  async function enterLesson(lessonId) {
    const lesson = lessonById(lessonId);
    await navigate(`lesson/${lessonId}`);
    await page.waitForSelector('.cr-course');
    assert.match(await page.locator('.cr-official-reference code').textContent(), /@langchain\/langgraph@1\.4\.8/);
    assert.ok(await page.locator('.cr-official-reference a').count() >= 2);
    assert.ok(await page.locator('[data-langgraph-knowledge]').count() === 1);
    assert.ok(await page.locator('.lg-prerequisites article').count() >= 2);
    assert.ok(await page.locator('.lg-glossary article').count() >= 3);
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
  async function select(selector, value) { await page.locator(selector).selectOption(value); }
  async function check(selector) { await page.locator(selector).check(); }
  async function setRange(selector, value) {
    const locator = typeof selector === 'string' ? page.locator(selector) : selector;
    await locator.evaluate((element, next) => { element.value = String(next); element.dispatchEvent(new Event('input', { bubbles: true })); }, value);
  }
  async function passExam(examId) {
    const exam = examById(examId);
    await navigate(`exam/${examId}`);
    await page.waitForSelector('.exam-questions');
    for (let index = 0; index < exam.questions.length; index += 1) await page.locator(`[data-question="${index}"][data-option="${exam.questions[index].correct}"]`).click();
    await page.locator('[data-submit]').click();
    await page.locator('.exam-result.good').waitFor();
  }
  async function assertNoOverflow(label) {
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    assert.ok(dimensions.scrollWidth <= dimensions.clientWidth + 1, `${label} overflow: ${JSON.stringify(dimensions)}`);
  }
  return { assert, browser, page, server, errors, course, navigate, enterLesson, completeTransfer, select, check, setRange, passExam, assertNoOverflow };
}
