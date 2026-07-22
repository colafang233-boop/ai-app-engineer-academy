import assert from 'node:assert/strict';
import fs from 'node:fs';

const dashboard = fs.readFileSync('packages/course-runtime/src/formal-dashboard.js', 'utf8');
const css = fs.readFileSync('apps/runtime-academy/formal-dashboard.css', 'utf8');
const main = fs.readFileSync('apps/runtime-academy/main.js', 'utf8');
const html = fs.readFileSync('apps/runtime-academy/index.html', 'utf8');
const officialColumn = fs.readFileSync('courses/ai-app-engineering/column-03-official.js', 'utf8');
const ragColumn = fs.readFileSync('courses/ai-app-engineering/column-04-rag.js', 'utf8');
const ragCommon = fs.readFileSync('courses/ai-app-engineering/column-04-rag-common.js', 'utf8');

assert.match(dashboard, /七个专栏，一条完整学习路径/);
assert.match(dashboard, /COLUMN \$\{String\(index \+ 1\)\.padStart\(2, '0'\)\}/);
assert.match(ragColumn, /RAG 检索与知识库工程/);
assert.match(dashboard, /LangGraph 与 Agentic RAG/);
assert.match(dashboard, /MCP 工具与协议/);
assert.match(dashboard, /企业 AI 应用实战/);
assert.match(dashboard, /officialVersion/);
assert.match(dashboard, /ragResearchBaseline/);
assert.match(dashboard, /不为固定数字压缩知识/);
assert.match(officialColumn, /LangChain JavaScript v1/);
assert.match(officialColumn, /lessonIds: lessons\.map/);
assert.match(ragCommon, /Framework-neutral RAG research baseline/);
assert.match(ragColumn, /lessonIds: ragLessons\.map/);
assert.match(dashboard, /formal-stats/);
assert.match(dashboard, /formal-continue-sheet/);
assert.match(css, /grid-template-columns:repeat\(7,minmax\(150px,1fr\)\)/);
assert.match(css, /nth-child\(1\).*translateY\(28px\)/s);
assert.match(css, /nth-child\(6\).*translateY\(5px\)/s);
assert.match(main, /installFormalDashboard\(app\)/);
assert.match(main, /extendWithOfficialColumn03/);
assert.match(main, /extendWithRagColumn/);
assert.match(html, /formal-dashboard\.css/);
assert.match(html, /langchain-v1\.css/);
assert.match(html, /rag\.css/);

console.log('Formal seven-column dashboard checks passed.');
