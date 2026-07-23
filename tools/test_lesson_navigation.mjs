import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const navigation = await readFile(new URL('../packages/course-runtime/src/lesson-navigation.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../apps/runtime-academy/lesson-navigation.css', import.meta.url), 'utf8');
const main = await readFile(new URL('../apps/runtime-academy/main.js', import.meta.url), 'utf8');
const entry = await readFile(new URL('../apps/runtime-academy/index.html', import.meta.url), 'utf8');

assert.match(navigation, /上一课/);
assert.match(navigation, /下一课/);
assert.match(navigation, /参加专栏综合考试/);
assert.match(navigation, /完成本课后解锁/);
assert.match(navigation, /课程目录/);
assert.match(navigation, /data-lesson-previous/);
assert.match(navigation, /data-lesson-next/);
assert.match(navigation, /data-lesson-exam/);
assert.match(navigation, /app\.isLessonUnlocked/);
assert.match(navigation, /app\.isExamUnlocked/);
assert.match(navigation, /dashboardSelectedColumnId/);
assert.match(navigation, /baseShowLessonComplete/);
assert.match(main, /installLessonNavigation\(app\)/);
assert.match(entry, /lesson-navigation\.css/);
assert.match(styles, /lesson-page-navigation/);
assert.match(styles, /grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/);
assert.match(styles, /lesson-nav-link\.next\.ready/);

console.log('Persistent lesson previous, next, column and exam navigation checks passed.');
