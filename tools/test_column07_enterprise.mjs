import assert from 'node:assert/strict';
import fs from 'node:fs';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';
import { extendWithOfficialColumn03 } from '../courses/ai-app-engineering/column-03-official.js';
import { extendWithRagColumn } from '../courses/ai-app-engineering/column-04-rag.js';
import { extendWithLangGraphColumn } from '../courses/ai-app-engineering/column-05-langgraph.js';
import { extendWithMcpColumn } from '../courses/ai-app-engineering/column-06-mcp.js';
import {
  enterpriseColumnBaseline,
  enterpriseExam,
  enterpriseLessons,
  extendWithEnterpriseColumn,
} from '../courses/ai-app-engineering/column-07-enterprise-service-desk.js';
import {
  enterpriseGoldenCases,
  enterpriseKnowledgeAssets,
  enterprisePolicies,
  enterpriseScenarioRequests,
  enterpriseUsers,
} from '../courses/ai-app-engineering/column-07-enterprise-fixtures.js';
import { enterpriseSimulators } from '../packages/course-runtime/src/simulators-enterprise.js';

const course = extendWithEnterpriseColumn(extendWithMcpColumn(extendWithLangGraphColumn(extendWithRagColumn(extendWithOfficialColumn03(productizeCourse(sourceCourse))))));
const column = course.columns.find((item) => item.id === 'column-07');

assert.ok(column);
assert.equal(course.columns.length, 7);
assert.equal(course.lessons.length, 108);
assert.equal(course.exams.length, 7);
assert.equal(course.qualityReviewModeDefault, true);
assert.equal(enterpriseLessons.length, 25);
assert.deepEqual(enterpriseLessons.map((lesson) => lesson.number), Array.from({ length: 25 }, (_, index) => 84 + index));
assert.equal(column.lessonIds.length, 25);
assert.equal(column.examId, 'exam-column-07-enterprise');
assert.equal(column.prerequisiteExamId, 'exam-column-06-mcp');
assert.equal(enterpriseExam.questions.length, 25);
assert.equal(enterpriseColumnBaseline.artifactNames.length, 25);
assert.equal(enterpriseColumnBaseline.enterprise.tenants.length, 2);
assert.equal(enterpriseColumnBaseline.failureCatalog.length, 16);
assert.equal(enterpriseUsers.length, 9);
assert.ok(enterpriseKnowledgeAssets.length >= 8);
assert.ok(enterprisePolicies.length >= 6);
assert.equal(enterpriseScenarioRequests.length, 8);
assert.equal(enterpriseGoldenCases.length, 10);

const allowedHosts = new Set([
  'www.nist.gov', 'csrc.nist.gov', 'genai.owasp.org', 'sre.google', 'docs.aws.amazon.com',
  'opentelemetry.io', 'openfeature.dev', 'docs.langchain.com', 'modelcontextprotocol.io', 'openai.com',
]);
const simulatorNames = [];
for (const lesson of enterpriseLessons) {
  assert.equal(lesson.columnId, 'column-07');
  assert.ok(lesson.prerequisites?.length >= 3, `${lesson.id} needs prerequisites`);
  assert.ok(lesson.terms?.length >= 4, `${lesson.id} needs enterprise terminology`);
  assert.equal(lesson.stages?.length, 4, `${lesson.id} should keep predict → lab → reveal → transfer`);
  assert.deepEqual(lesson.stages.map((stage) => stage.type), ['prediction', 'simulator', 'content', 'quiz']);
  assert.ok(lesson.officialReference?.links?.length >= 3, `${lesson.id} needs official sources`);
  for (const link of lesson.officialReference.links) {
    const url = new URL(link.url);
    assert.ok(allowedHosts.has(url.hostname), `${lesson.id} source must be official/primary: ${url.hostname}`);
  }
  simulatorNames.push(lesson.stages[1].simulator);
}
assert.equal(new Set(simulatorNames).size, 25);
assert.deepEqual(new Set(simulatorNames), new Set(Object.keys(enterpriseSimulators)));

const main = fs.readFileSync('apps/runtime-academy/main.js', 'utf8');
const html = fs.readFileSync('apps/runtime-academy/index.html', 'utf8');
const dashboard = fs.readFileSync('packages/course-runtime/src/formal-dashboard.js', 'utf8');
const product = fs.readFileSync('packages/course-runtime/src/enterprise-column-product.js', 'utf8');
const css = fs.readFileSync('apps/runtime-academy/enterprise.css', 'utf8');
const blueprint = fs.readFileSync('courses/ai-app-engineering/column-07-enterprise-service-desk-blueprint.md', 'utf8');

assert.match(main, /extendWithEnterpriseColumn/);
assert.match(main, /installEnterpriseColumnProduct/);
assert.match(main, /enterpriseSimulators/);
assert.match(html, /enterprise\.css/);
assert.match(dashboard, /108 节课程/);
assert.match(dashboard, /renderEnterpriseBanner/);
assert.match(dashboard, /不存在未开发占位专栏|全部开发完成/);
assert.doesNotMatch(dashboard, /futureColumns/);
assert.match(product, /targetCount = 110/);
assert.match(product, /lesson-108/);
assert.match(css, /enterprise-control-room/);
assert.match(css, /enterprise-release-board/);
assert.match(css, /enterprise-incident-center/);
assert.match(blueprint, /Modular production architecture/);
assert.match(blueprint, /Lessons 84–108/);
assert.match(blueprint, /permission-aware RAG/);

console.log('Complete Enterprise AI Service Desk curriculum checks passed.');
