export function installQualityReviewMode(app) {
  const params = new URLSearchParams(window.location.search);
  const explicit = params.get('review');
  const previewRequested = params.get('preview') === '1';
  app.reviewMode = explicit === '1' || (explicit !== '0' && !previewRequested && app.course.qualityReviewModeDefault === true);
  if (!app.reviewMode) return;

  app.previewMode = true;
  const baseMount = app.mount.bind(app);
  app.mount = function mountQualityReviewMode() {
    baseMount();
    this.root.classList.add('academy-quality-review');
    const actions = this.root.querySelector('.academy-nav-actions');
    let badge = actions?.querySelector('.preview-badge');
    if (!badge && actions) {
      badge = document.createElement('span');
      badge.className = 'preview-badge';
      actions.prepend(badge);
    }
    if (badge) {
      badge.textContent = '质量审阅 · 全部开放';
      badge.title = '临时开放所有已开发课程与考试；使用 ?review=0 恢复顺序解锁。';
    }
  };
}
