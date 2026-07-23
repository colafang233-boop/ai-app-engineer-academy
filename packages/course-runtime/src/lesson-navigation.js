function previousLesson(app, lessonId) {
  const index = app.course.lessons.findIndex((lesson) => lesson.id === lessonId);
  return index > 0 ? app.course.lessons[index - 1] : null;
}

function nextStep(app, lesson) {
  const column = app.columnById(lesson.columnId);
  const index = column.lessonIds.indexOf(lesson.id);
  const nextLessonId = column.lessonIds[index + 1];
  if (nextLessonId) {
    const nextLesson = app.lessonById(nextLessonId);
    return {
      type: 'lesson',
      target: nextLesson,
      enabled: app.isLessonUnlocked(nextLesson),
    };
  }

  const exam = app.examById(column.examId);
  return {
    type: 'exam',
    target: exam,
    enabled: app.isExamUnlocked(exam),
  };
}

function returnToColumn(app, columnId) {
  app.dashboardSelectionExplicit = true;
  app.dashboardSelectedColumnId = columnId;
  app.go('dashboard');
}

function renderPrevious(previous) {
  if (!previous) {
    return '<span class="lesson-nav-empty" aria-hidden="true"></span>';
  }

  return `
    <button class="lesson-nav-link previous" data-lesson-previous="${previous.id}" type="button">
      <span>← 上一课</span>
      <b>第 ${previous.number} 课 · ${previous.shortTitle}</b>
    </button>
  `;
}

function renderNext(step) {
  if (step.type === 'lesson') {
    const lesson = step.target;
    return `
      <button class="lesson-nav-link next ${step.enabled ? 'ready' : ''}" data-lesson-next="${lesson.id}" ${step.enabled ? '' : 'disabled'} type="button">
        <span>${step.enabled ? '下一课 →' : '完成本课后解锁'}</span>
        <b>第 ${lesson.number} 课 · ${lesson.shortTitle}</b>
      </button>
    `;
  }

  const exam = step.target;
  return `
    <button class="lesson-nav-link next exam ${step.enabled ? 'ready' : ''}" data-lesson-exam="${exam.id}" ${step.enabled ? '' : 'disabled'} type="button">
      <span>${step.enabled ? '完成本专栏 →' : '完成本课后解锁'}</span>
      <b>参加专栏综合考试</b>
    </button>
  `;
}

function mountLessonNavigation(app, lessonId) {
  const lessonRoot = app.content?.querySelector('[data-lesson-root]');
  const lesson = app.lessonById(lessonId);
  if (!lessonRoot || !lesson) return;

  app.content.querySelector('[data-lesson-navigation]')?.remove();

  const column = app.columnById(lesson.columnId);
  const previous = previousLesson(app, lessonId);
  const step = nextStep(app, lesson);
  const navigation = document.createElement('nav');
  navigation.className = 'lesson-page-navigation';
  navigation.dataset.lessonNavigation = lessonId;
  navigation.setAttribute('aria-label', '课程前后导航');
  navigation.innerHTML = `
    ${renderPrevious(previous)}
    <button class="lesson-nav-column" data-lesson-column="${column.id}" type="button">
      <span>课程目录</span>
      <b>${column.title.replace(/^专栏[一二三四五六七] · /, '')}</b>
    </button>
    ${renderNext(step)}
  `;

  navigation.querySelector('[data-lesson-previous]')?.addEventListener('click', (event) => {
    app.go(`lesson/${event.currentTarget.dataset.lessonPrevious}`);
  });
  navigation.querySelector('[data-lesson-column]')?.addEventListener('click', () => returnToColumn(app, column.id));
  navigation.querySelector('[data-lesson-next]')?.addEventListener('click', (event) => {
    app.go(`lesson/${event.currentTarget.dataset.lessonNext}`);
  });
  navigation.querySelector('[data-lesson-exam]')?.addEventListener('click', (event) => {
    app.go(`exam/${event.currentTarget.dataset.lessonExam}`);
  });

  lessonRoot.insertAdjacentElement('afterend', navigation);
}

export function installLessonNavigation(app) {
  const baseRenderLesson = app.renderLesson.bind(app);
  const baseShowLessonComplete = app.showLessonComplete.bind(app);

  app.renderLesson = function renderLessonWithNavigation(lessonId) {
    baseRenderLesson(lessonId);
    mountLessonNavigation(this, lessonId);
  };

  app.showLessonComplete = function showLessonCompleteWithNavigation(lessonId) {
    baseShowLessonComplete(lessonId);
    mountLessonNavigation(this, lessonId);
  };
}
