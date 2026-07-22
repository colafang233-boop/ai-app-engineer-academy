import assert from 'node:assert/strict';
import fs from 'node:fs';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';
import { extendWithColumn03 } from '../courses/ai-app-engineering/column-03.js';

const dashboard = fs.readFileSync('packages/course-runtime/src/formal-dashboard.js', 'utf8');
const css = fs.readFileSync('apps/runtime-academy/formal-dashboard.css', 'utf8');
const columnCss = fs.readFileSync('apps/runtime-academy/column03.css', 'utf8');
const main = fs.readFileSync('apps/runtime-academy/main.js', 'utf8');
const html = fs.readFileSync('apps/runtime-academy/index.html', 'utf8');
const course = extendWithColumn03(productizeCourse(sourceCourse));

assert.equal(course.columns.length, 3);
assert.equal(course.columns[2].title, '专栏三 · LangChain 核心开发');
assert.equal(course.columns[2].lessonIds.length, 4);

assert.match(dashboard, /七个专栏，一条完整学习路径/);
assert.match(dashboard, /COLUMN \$\{String\(index \+ 1\)\.padStart\(2, '0'\)\}/);
assert.match(dashboard, /exam-column-03/);
assert.match(dashboard, /RAG 知识库工程/);
assert.match(dashboard, /LangGraph 与 Agentic RAG/);
assert.match(dashboard, /MCP 工具与协议/);
assert.match(dashboard, /企业 AI 应用实战/);
assert.match(dashboard, /builtColumns/);
assert.match(dashboard, /future-column-preview/);
assert.match(dashboard, /formal-stats/);
assert.match(dashboard, /formal-continue-sheet/);

assert.match(css, /grid-template-columns:repeat\(7,minmax\(150px,1fr\)\)/);
assert.match(css, /nth-child\(1\).*translateY\(28px\)/s);
assert.match(css, /nth-child\(6\).*translateY\(5px\)/s);
assert.match(columnCss, /future-column-preview/);
assert.match(columnCss, /nth-child\(7\).*translateY\(0\)/s);

assert.match(main, /extendWithColumn03/);
assert.match(main, /installFormalDashboard\(app\)/);
assert.match(html, /formal-dashboard\.css/);
assert.match(html, /column03\.css/);
assert.match(html, /langchain\.css/);

console.log('Formal seven-column dashboard with active LangChain column checks passed.');
