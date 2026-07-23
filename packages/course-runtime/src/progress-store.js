const PROGRESS_DEFAULT_KEY = 'ai-academy-progress-v4';

function normalizeState(value) {
  return {
    lessons: value?.lessons && typeof value.lessons === 'object' ? value.lessons : {},
    exams: value?.exams && typeof value.exams === 'object' ? value.exams : {},
  };
}

function readState(storage, key) {
  try {
    return normalizeState(JSON.parse(storage.getItem(key) ?? '{"lessons":{},"exams":{}}'));
  } catch {
    return { lessons: {}, exams: {} };
  }
}

export class ProgressStore {
  constructor({ storage = window.localStorage, key = PROGRESS_DEFAULT_KEY, eventBus } = {}) {
    this.storage = storage;
    this.key = key;
    this.eventBus = eventBus;
    this.state = readState(storage, key);
  }

  getLesson(lessonId) {
    return this.state.lessons?.[lessonId] ?? { completedStages: [], completed: false };
  }

  isLessonComplete(lessonId) {
    return this.getLesson(lessonId).completed === true;
  }

  completeStage(lessonId, stageId) {
    const lesson = this.getLesson(lessonId);
    const completedStages = [...new Set([...lesson.completedStages, stageId])];
    this.#writeLesson(lessonId, {
      ...lesson,
      completedStages,
      updatedAt: new Date().toISOString(),
    });
  }

  completeLesson(lessonId) {
    const lesson = this.getLesson(lessonId);
    const now = new Date().toISOString();
    this.#writeLesson(lessonId, {
      ...lesson,
      completed: true,
      completedAt: lesson.completedAt ?? now,
      updatedAt: now,
    });
  }

  resetLesson(lessonId) {
    const lessons = { ...(this.state.lessons ?? {}) };
    delete lessons[lessonId];
    this.state = { ...this.state, lessons };
    this.#persist({ lessonId, action: 'reset' });
  }

  getExam(examId) {
    return this.state.exams?.[examId] ?? { passed: false, score: 0, attempts: 0 };
  }

  isExamPassed(examId) {
    return this.getExam(examId).passed === true;
  }

  recordExam(examId, { score, passed }) {
    const previous = this.getExam(examId);
    this.state = {
      ...this.state,
      exams: {
        ...(this.state.exams ?? {}),
        [examId]: {
          score,
          passed: previous.passed || passed,
          attempts: previous.attempts + 1,
          updatedAt: new Date().toISOString(),
        },
      },
    };
    this.#persist({ examId, score, passed, action: 'exam' });
  }

  getSnapshot() {
    return JSON.parse(JSON.stringify(this.state));
  }

  getAll() {
    return this.getSnapshot();
  }

  replace(snapshot, { emit = true, source = 'external' } = {}) {
    this.state = normalizeState(JSON.parse(JSON.stringify(snapshot ?? {})));
    this.storage.setItem(this.key, JSON.stringify(this.state));
    if (emit) {
      this.eventBus?.emit('progress:change', {
        action: 'replace',
        source,
        snapshot: this.getSnapshot(),
      });
    }
    return this.getSnapshot();
  }

  resetAll() {
    this.state = { lessons: {}, exams: {} };
    this.storage.setItem(this.key, JSON.stringify(this.state));
    this.eventBus?.emit('progress:reset', {});
  }

  #writeLesson(lessonId, lesson) {
    this.state = {
      ...this.state,
      lessons: {
        ...(this.state.lessons ?? {}),
        [lessonId]: lesson,
      },
    };
    this.#persist({ lessonId, lesson });
  }

  #persist(detail) {
    this.storage.setItem(this.key, JSON.stringify(this.state));
    this.eventBus?.emit('progress:change', detail);
  }
}
