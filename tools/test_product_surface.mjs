import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';
import { extendWithOfficialColumn03 } from '../courses/ai-app-engineering/column-03-official.js';

const academyApp = await readFile(new URL('../packages/course-runtime/src/academy-app.js', import.meta.url), 'utf8');
const productCopy = await readFile(new URL('../packages/course-runtime/src/product-copy.js', import.meta.url), 'utf8');
const productAdapter = await readFile(new URL('../packages/course-runtime/src/official-column-product.js', import.meta.url), 'utf8');
const runtime = await readFile(new URL('../packages/course-runtime/src/course-runtime.js', import.meta.url), 'utf8');
const entry = await readFile(new URL('../apps/runtime-academy/index.html', import.meta.url), 'utf8');
const course = extendWithOfficialColumn03(productizeCourse(sourceCourse));

assert.equal(course.lessons.length, 21);
assert.equal(course.title, 'AI 应用开发学院');
assert.equal(course.lessons[2].shortTitle, '修复异步模型调用');
assert.equal(course.lessons[7].shortTitle, '选择有效的 Few-shot 示例');
assert.equal(course.lessons[9].shortTitle, '看懂 LangChain v1 的边界');
assert.equal(course.lessons[20].shortTitle, 'LangSmith 与生产综合项目');
assert.match(course.lessons[8].description, /回归/);

assert.match(entry, /AI 应用开发学院/);
assert.match(entry, /langchain-v1\.css/);
assert.doesNotMatch(entry, /CourseRuntime|完整体验版|配置驱动/);

assert.match(academyApp, /我的项目成果/);
assert.match(academyApp, /学习路径/);
assert.match(academyApp, /\?debug=1/);
assert.doesNotMatch(academyApp, />产物账本</);
assert.doesNotMatch(academyApp, />体验模式</);

assert.match(productCopy, /已带入上一步成果/);
assert.match(productCopy, /检查代码/);
assert.match(productCopy, /已保存为本课项目成果/);
assert.match(productAdapter, /LangChain v1 生产交付蓝图/);
assert.match(runtime, /本课官方依据/);
assert.match(runtime, /OFFICIAL DOCUMENTATION/);

console.log('Learner-facing product surface checks passed.');
