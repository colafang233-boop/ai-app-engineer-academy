const DEFAULT_KEY = 'ai-academy-progress-v4';

function readState(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) ?? '{"lessons":{}}');
  } catch {
    return { lessons: {} };
  }
}

export class ProgressStore {
  constructor({ storage = window.localStorage, key = DEFAULT_KEY, eventBus } = {}) {
    this.storage = storage;
    this.key = key;
    this.eventBus = eventBus;
    this.state = readState(storage, key);
  }

  getLesson(lessonId) {
    return this.state.lessons?.[lessonId] ?? {
      completedStages: [],
      completed: false,
    };
  }

  completeStage(lessonId, stageId) {
    const lesson = this.getLesson(lessonId);
    const completedStages = [...new Set([...lesson.completedStages, stageId])];
    this.#writeLesson(lessonId, { ...lesson, completedStages });
  }

  completeLesson(lessonId) {
    const lesson = this.getLesson(lessonId);
    this.#writeLesson(lessonId, {
      ...lesson,
      completed: true,
      completedAt: new Date().toISOString(),
    });
  }

  resetLesson(lessonId) {
    const lessons = { ...(this.state.lessons ?? {}) };
    delete lessons[lessonId];
    this.state = { ...this.state, lessons };
    this.#persist({ lessonId, action: 'reset' });
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
