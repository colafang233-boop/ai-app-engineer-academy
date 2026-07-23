import assert from 'node:assert/strict';
import { course as sourceCourse } from '../courses/ai-app-engineering/course-config.js';
import { productizeCourse } from '../courses/ai-app-engineering/product-course.js';
import { extendWithOfficialColumn03 } from '../courses/ai-app-engineering/column-03-official.js';
import { extendWithRagColumn } from '../courses/ai-app-engineering/column-04-rag.js';
import { extendWithLangGraphColumn } from '../courses/ai-app-engineering/column-05-langgraph.js';
import { extendWithMcpColumn } from '../courses/ai-app-engineering/column-06-mcp.js';
import { extendWithEnterpriseColumn } from '../courses/ai-app-engineering/column-07-enterprise-service-desk.js';

const course = extendWithEnterpriseColumn(
  extendWithMcpColumn(
    extendWithLangGraphColumn(
      extendWithRagColumn(
        extendWithOfficialColumn03(productizeCourse(sourceCourse)),
      ),
    ),
  ),
);

assert.equal(course.qualityReviewModeDefault, false, 'Production entry must preserve sequential learning by default');
assert.equal(course.columns.length, 7);
assert.equal(course.lessons.length, 108);
assert.equal(course.exams.length, 7);

assert.equal(new Set(course.columns.map((column) => column.id)).size, course.columns.length, 'Column IDs must be unique');
assert.equal(new Set(course.lessons.map((lesson) => lesson.id)).size, course.lessons.length, 'Lesson IDs must be unique');
assert.equal(new Set(course.lessons.map((lesson) => lesson.number)).size, course.lessons.length, 'Lesson numbers must be unique');
assert.equal(new Set(course.exams.map((exam) => exam.id)).size, course.exams.length, 'Exam IDs must be unique');

assert.deepEqual(
  course.lessons.map((lesson) => lesson.number),
  Array.from({ length: 108 }, (_, index) => index + 1),
  'Lessons must remain a continuous 1–108 learning path',
);

for (const [index, column] of course.columns.entries()) {
  assert.ok(column.lessonIds.length > 0, `${column.id} must contain lessons`);
  assert.ok(course.exams.some((exam) => exam.id === column.examId), `${column.id} exam must exist`);
  if (index === 0) assert.equal(column.prerequisiteExamId, undefined);
  else assert.equal(column.prerequisiteExamId, course.columns[index - 1].examId, `${column.id} must depend on the previous column exam`);

  for (const lessonId of column.lessonIds) {
    const lesson = course.lessons.find((item) => item.id === lessonId);
    assert.ok(lesson, `${column.id} references missing ${lessonId}`);
    assert.equal(lesson.columnId, column.id, `${lessonId} must belong to ${column.id}`);
  }
}

for (const lesson of course.lessons) {
  assert.equal(lesson.stages.length, 4, `${lesson.id} must preserve the four-stage teaching rhythm`);
  assert.deepEqual(lesson.stages.map((stage) => stage.type), ['prediction', 'simulator', 'content', 'quiz']);
}

console.log('Release defaults and complete course identity checks passed.');
