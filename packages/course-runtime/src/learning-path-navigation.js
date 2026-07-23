function currentRoute() {
  return window.location.hash.replace(/^#/, '') || 'dashboard';
}

function scrollToLearningPath(app) {
  const target = app.content?.querySelector('#columns');
  if (!target) return false;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

export function installLearningPathNavigation(app) {
  const baseRoute = app.route.bind(app);
  const baseMount = app.mount.bind(app);

  app.route = function routeWithLearningPathTarget() {
    const result = baseRoute();
    if (this.pendingLearningPathScroll) {
      requestAnimationFrame(() => {
        if (scrollToLearningPath(this)) this.pendingLearningPathScroll = false;
      });
    }
    return result;
  };

  app.mount = function mountWithLearningPathNavigation() {
    baseMount();
    const button = this.root.querySelector('.academy-nav-actions [data-route="dashboard"]');
    if (!button) return;

    button.addEventListener('click', () => {
      this.pendingLearningPathScroll = true;
      if (currentRoute() === 'dashboard' && scrollToLearningPath(this)) {
        this.pendingLearningPathScroll = false;
      }
    });
  };
}
