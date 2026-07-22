import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';

const academyApp = await readFile(new URL('../packages/course-runtime/src/academy-app.js', import.meta.url), 'utf8');
const productCopy = await readFile(new URL('../packages/course-runtime/src/product-copy.js', import.meta.url), 'utf8');
const entry = await readFile(new URL('../apps/runtime-academy/index.html', import.meta.url), 'utf8');
const course = productizeCourse(sourceCourse);

assert.equal(course.lessons.length, 9);
assert.equal(course.title, 'AI 应用开发学院');
assert.equal(course.lessons[2].shortTitle, '修复异步模型调用');
assert.equal(course.lessons[7].shortTitle, '选择有效的 Few-shot 示例');
assert.match(course.lessons[8].description, /回归/);

assert.match(entry, /AI 应用开发学院/);
assert.doesNotMatch(entry, /CourseRuntime|完整体验版|配置驱动/);

assert.match(academyApp, /我的项目成果/);
assert.match(academyApp, /学习路径/);
assert.match(academyApp, /\?debug=1/);
assert.doesNotMatch(academyApp, />产物账本</);
assert.doesNotMatch(academyApp, />体验模式</);

assert.match(productCopy, /已带入上一步成果/);
assert.match(productCopy, /检查代码/);
assert.match(productCopy, /已保存为本课项目成果/);

console.log('Learner-facing product surface checks passed.');
