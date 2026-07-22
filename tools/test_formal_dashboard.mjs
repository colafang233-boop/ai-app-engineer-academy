import assert from 'node:assert/strict';
import fs from 'node:fs';

const dashboard = fs.readFileSync('packages/course-runtime/src/formal-dashboard.js', 'utf8');
const css = fs.readFileSync('apps/runtime-academy/formal-dashboard.css', 'utf8');
const main = fs.readFileSync('apps/runtime-academy/main.js', 'utf8');
const html = fs.readFileSync('apps/runtime-academy/index.html', 'utf8');

assert.match(dashboard, /七个专栏，一条完整学习路径/);
assert.match(dashboard, /COLUMN \$\{String\(index \+ 1\)\.padStart\(2, '0'\)\}/);
assert.match(dashboard, /LangChain 核心开发/);
assert.match(dashboard, /RAG 知识库工程/);
assert.match(dashboard, /LangGraph 与 Agentic RAG/);
assert.match(dashboard, /MCP 工具与协议/);
assert.match(dashboard, /企业 AI 应用实战/);
assert.match(dashboard, /formal-stats/);
assert.match(dashboard, /formal-continue-sheet/);
assert.match(css, /grid-template-columns:repeat\(7,minmax\(150px,1fr\)\)/);
assert.match(css, /nth-child\(1\).*translateY\(28px\)/s);
assert.match(css, /nth-child\(6\).*translateY\(5px\)/s);
assert.match(main, /installFormalDashboard\(app\)/);
assert.match(html, /formal-dashboard\.css/);

console.log('Formal seven-column dashboard checks passed.');
