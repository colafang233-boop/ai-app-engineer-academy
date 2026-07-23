import assert from 'node:assert/strict';
import { buildExamOptionOrder } from '../packages/course-runtime/src/exam-integrity.js';

const exams = [
  ['exam-column-01', 5],
  ['exam-column-02', 5],
  ['exam-column-03-official', 12],
  ['exam-column-04-rag', 17],
  ['exam-column-05-langgraph', 20],
  ['exam-column-06-mcp', 25],
  ['exam-column-07-enterprise', 25],
];

for (const [examId, questionCount] of exams) {
  const correctPositions = [];
  for (let questionIndex = 0; questionIndex < questionCount; questionIndex += 1) {
    const order = buildExamOptionOrder(examId, questionIndex, 3);
    assert.deepEqual([...order].sort((a, b) => a - b), [0, 1, 2], `${examId} question ${questionIndex + 1} must remain a permutation`);
    correctPositions.push(order.indexOf(0));
  }
  assert.ok(new Set(correctPositions).size >= 2, `${examId} must not expose one fixed correct-answer position`);
}

assert.deepEqual(buildExamOptionOrder('single-option', 0, 1), [0]);
assert.deepEqual(buildExamOptionOrder('empty', 0, 0), []);

console.log('Exam option-order integrity checks passed.');
