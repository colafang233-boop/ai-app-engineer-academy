import assert from 'node:assert/strict';
import fs from 'node:fs';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';
import { extendWithOfficialColumn03 } from '../courses/ai-app-engineering/column-03-official.js';
import { extendWithRagColumn } from '../courses/ai-app-engineering/column-04-rag.js';
import { extendWithLangGraphColumn } from '../courses/ai-app-engineering/column-05-langgraph.js';
import { extendWithMcpColumn, mcpExam, mcpLessons, mcpResearchBaseline } from '../courses/ai-app-engineering/column-06-mcp.js';
import { mcpSimulators } from '../packages/course-runtime/src/simulators-mcp.js';

const course = extendWithMcpColumn(extendWithLangGraphColumn(extendWithRagColumn(extendWithOfficialColumn03(productizeCourse(sourceCourse)))));
const column = course.columns.find((item) => item.id === 'column-06');

assert.ok(column, 'Column 06 should exist');
assert.equal(course.columns.length, 6);
assert.equal(course.lessons.length, 83);
assert.equal(course.exams.length, 6);
assert.equal(mcpLessons.length, 25);
assert.deepEqual(mcpLessons.map((lesson) => lesson.number), Array.from({ length: 25 }, (_, index) => index + 59));
assert.equal(column.lessonIds.length, 25);
assert.equal(column.examId, 'exam-column-06-mcp');
assert.equal(column.prerequisiteExamId, 'exam-column-05-langgraph');
assert.equal(mcpExam.questions.length, 25);
assert.equal(mcpResearchBaseline.protocol, '2025-11-25');
assert.equal(mcpResearchBaseline.packages['@modelcontextprotocol/sdk'], '1.29.0');
assert.equal(course.qualityReviewModeDefault, false);

const allowedHosts = new Set([
  'modelcontextprotocol.io',
  'github.com',
  'ts.sdk.modelcontextprotocol.io',
  'developers.openai.com',
  'openai.github.io',
  'help.openai.com',
  'developers.cloudflare.com',
  'code.visualstudio.com',
  'docs.anthropic.com',
]);

const simulatorNames = [];
for (const lesson of mcpLessons) {
  assert.equal(lesson.columnId, 'column-06');
  assert.ok(lesson.prerequisites?.length >= 2, `${lesson.id} needs explicit prerequisites`);
  assert.ok(lesson.terms?.length >= 3, `${lesson.id} needs terminology`);
  assert.equal(lesson.stages?.length, 4, `${lesson.id} should keep predict → lab → reveal → transfer`);
  assert.equal(lesson.stages[0].type, 'prediction');
  assert.equal(lesson.stages[1].type, 'simulator');
  assert.equal(lesson.stages[2].type, 'content');
  assert.equal(lesson.stages[3].type, 'quiz');
  assert.ok(lesson.officialReference?.links?.length >= 2, `${lesson.id} needs at least two official sources`);
  assert.match(lesson.officialReference.appliesTo, /MCP Specification 2025-11-25/);
  for (const link of lesson.officialReference.links) {
    const url = new URL(link.url);
    assert.ok(allowedHosts.has(url.hostname), `${lesson.id} source should be official/primary: ${url.hostname}`);
  }
  simulatorNames.push(lesson.stages[1].simulator);
}
assert.equal(new Set(simulatorNames).size, 25);
assert.deepEqual(new Set(simulatorNames), new Set(Object.keys(mcpSimulators)));

const main = fs.readFileSync('apps/runtime-academy/main.js', 'utf8');
const html = fs.readFileSync('apps/runtime-academy/index.html', 'utf8');
const dashboard = fs.readFileSync('packages/course-runtime/src/formal-dashboard.js', 'utf8');
const product = fs.readFileSync('packages/course-runtime/src/mcp-column-product.js', 'utf8');
const responsiveHeadings = fs.readFileSync('apps/runtime-academy/responsive-headings.css', 'utf8');
const responsiveLayout = fs.readFileSync('apps/runtime-academy/responsive-layout.css', 'utf8');
const simulatorSource = [
  'packages/course-runtime/src/simulators-mcp-foundations.js',
  'packages/course-runtime/src/simulators-mcp-access.js',
  'packages/course-runtime/src/simulators-mcp-development.js',
  'packages/course-runtime/src/simulators-mcp-auth-deployment.js',
  'packages/course-runtime/src/simulators-mcp-production.js',
].map((path) => fs.readFileSync(path, 'utf8')).join('\n');

assert.match(main, /extendWithMcpColumn/);
assert.match(main, /installMcpColumnProduct/);
assert.match(main, /mcpSimulators/);
assert.match(html, /mcp\.css/);
assert.match(html, /responsive-headings\.css/);
assert.match(html, /responsive-layout\.css/);
assert.match(responsiveHeadings, /container-type:\s*inline-size/);
assert.match(responsiveHeadings, /font-size:\s*clamp\([^;]*cqi/);
assert.match(responsiveHeadings, /text-wrap:\s*balance/);
assert.match(responsiveHeadings, /\.cr-marker[\s\S]*white-space:\s*nowrap/);
assert.match(responsiveLayout, /--academy-page-ratio:\s*88vw/);
assert.match(responsiveLayout, /width:\s*min\(var\(--academy-page-ratio\),\s*var\(--academy-reading-width\)\)/);
assert.match(responsiveLayout, /\.lesson-topbar[\s\S]*padding-inline:\s*max\(6vw/);
assert.match(responsiveLayout, /\.mcp-knowledge-panel[\s\S]*width:\s*100%/);
assert.match(dashboard, /exam-column-06-mcp/);
assert.match(dashboard, /MCP 协议与 Host 接入基线/);
assert.match(dashboard, /data-column-select/);
assert.match(product, /MCP Host 兼容矩阵/);
assert.match(simulatorSource, /Streamable HTTP/);

console.log('Complete MCP protocol, integration and deployment curriculum checks passed.');
