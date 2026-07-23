const SYNC_DELAY_MS = 650;

function safeTimestamp(value) {
  const timestamp = Date.parse(value ?? '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function latestIso(...values) {
  const latest = values.filter(Boolean).sort((a, b) => safeTimestamp(b) - safeTimestamp(a))[0];
  return latest ?? new Date().toISOString();
}

function earliestIso(...values) {
  return values.filter(Boolean).sort((a, b) => safeTimestamp(a) - safeTimestamp(b))[0] ?? null;
}

function mergeLesson(localLesson = {}, remoteLesson = {}) {
  const completedStages = [...new Set([
    ...(Array.isArray(localLesson.completedStages) ? localLesson.completedStages : []),
    ...(Array.isArray(remoteLesson.completedStages) ? remoteLesson.completedStages : []),
  ])];
  const completed = localLesson.completed === true || remoteLesson.completed === true;

  return {
    ...remoteLesson,
    ...localLesson,
    completedStages,
    completed,
    completedAt: completed ? earliestIso(localLesson.completedAt, remoteLesson.completedAt) : null,
    updatedAt: latestIso(
      localLesson.updatedAt,
      localLesson.completedAt,
      remoteLesson.updatedAt,
      remoteLesson.completedAt,
    ),
  };
}

function mergeExam(localExam = {}, remoteExam = {}) {
  return {
    score: Math.max(Number(localExam.score) || 0, Number(remoteExam.score) || 0),
    passed: localExam.passed === true || remoteExam.passed === true,
    attempts: Math.max(Number(localExam.attempts) || 0, Number(remoteExam.attempts) || 0),
    updatedAt: latestIso(localExam.updatedAt, remoteExam.updatedAt),
  };
}

function mergeProgress(local = {}, remote = {}) {
  const lessons = {};
  const lessonIds = new Set([
    ...Object.keys(local.lessons ?? {}),
    ...Object.keys(remote.lessons ?? {}),
  ]);
  for (const lessonId of lessonIds) {
    lessons[lessonId] = mergeLesson(local.lessons?.[lessonId], remote.lessons?.[lessonId]);
  }

  const exams = {};
  const examIds = new Set([
    ...Object.keys(local.exams ?? {}),
    ...Object.keys(remote.exams ?? {}),
  ]);
  for (const examId of examIds) {
    exams[examId] = mergeExam(local.exams?.[examId], remote.exams?.[examId]);
  }

  return { lessons, exams };
}

function mergeArtifacts(local = {}, remote = {}) {
  const merged = { __meta: {} };
  const localMeta = local.__meta ?? {};
  const remoteMeta = remote.__meta ?? {};
  const names = new Set([
    ...Object.keys(local).filter((name) => name !== '__meta'),
    ...Object.keys(remote).filter((name) => name !== '__meta'),
  ]);

  for (const name of names) {
    const localExists = Object.prototype.hasOwnProperty.call(local, name);
    const remoteExists = Object.prototype.hasOwnProperty.call(remote, name);
    const localUpdated = safeTimestamp(localMeta[name]?.updatedAt);
    const remoteUpdated = safeTimestamp(remoteMeta[name]?.updatedAt);
    const useLocal = localExists && (!remoteExists || localUpdated >= remoteUpdated);
    merged[name] = useLocal ? local[name] : remote[name];
    merged.__meta[name] = {
      ...(useLocal ? remoteMeta[name] : localMeta[name]),
      ...(useLocal ? localMeta[name] : remoteMeta[name]),
      updatedAt: latestIso(localMeta[name]?.updatedAt, remoteMeta[name]?.updatedAt),
    };
  }

  if (names.size === 0) return {};
  return merged;
}

function initials(email = '') {
  const value = email.split('@')[0].replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '');
  return (value.slice(0, 2) || 'AI').toUpperCase();
}

function shortEmail(email = '') {
  const [name = '', domain = ''] = email.split('@');
  const compactName = name.length > 12 ? `${name.slice(0, 10)}…` : name;
  return domain ? `${compactName}@${domain}` : compactName;
}

function isSchemaMissing(error) {
  const code = String(error?.code ?? '');
  const message = String(error?.message ?? '');
  return ['42P01', 'PGRST204', 'PGRST205'].includes(code)
    || /could not find the table|relation .* does not exist/i.test(message);
}

function throwOnError(result) {
  if (result?.error) throw result.error;
  return result?.data ?? [];
}

export class SupabaseAuthSync {
  constructor({ app, config }) {
    this.app = app;
    this.config = config;
    this.client = null;
    this.session = null;
    this.status = 'loading';
    this.statusMessage = '正在连接账号服务…';
    this.applyingCloudState = false;
    this.syncTimers = new Map();
    this.unsubscribers = [];
  }

  mount() {
    const actions = this.app.root.querySelector('.academy-nav-actions');
    if (!actions || actions.querySelector('[data-auth-open]')) return;

    this.accountButton = document.createElement('button');
    this.accountButton.className = 'academy-account-button';
    this.accountButton.dataset.authOpen = '';
    this.accountButton.type = 'button';
    actions.append(this.accountButton);

    this.layer = document.createElement('div');
    this.layer.className = 'academy-auth-layer';
    this.layer.dataset.authLayer = '';
    this.layer.hidden = true;
    this.layer.innerHTML = `
      <div class="academy-auth-backdrop" data-auth-close></div>
      <section class="academy-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="academyAuthTitle">
        <button class="academy-auth-close" data-auth-close type="button" aria-label="关闭登录窗口">×</button>
        <div class="academy-auth-kicker">LEARNING ACCOUNT</div>
        <h2 id="academyAuthTitle">保存并同步你的学习进度</h2>
        <p class="academy-auth-lede">不登录也能继续学习；登录后可以在不同设备恢复课程、考试和项目成果。</p>

        <div data-auth-guest>
          <form class="academy-auth-form" data-auth-form>
            <label for="academyAuthEmail">邮箱地址</label>
            <input id="academyAuthEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
            <button type="submit" data-auth-submit>发送登录链接</button>
          </form>
          <p class="academy-auth-note">第一次登录会自动创建账号，不需要设置密码。</p>
        </div>

        <div class="academy-account-panel" data-auth-user hidden>
          <div class="academy-account-identity">
            <span data-auth-avatar>AI</span>
            <div><b data-auth-email></b><small>Supabase 学习账号</small></div>
          </div>
          <div class="academy-sync-row">
            <span class="academy-sync-dot" data-auth-status-dot></span>
            <div><b data-auth-status-title></b><small data-auth-status-message></small></div>
          </div>
          <button class="academy-signout-button" data-auth-signout type="button">退出当前设备</button>
        </div>

        <p class="academy-auth-message" data-auth-message aria-live="polite"></p>
      </section>
    `;
    this.app.root.append(this.layer);

    this.accountButton.addEventListener('click', () => this.open());
    this.layer.querySelectorAll('[data-auth-close]').forEach((element) => {
      element.addEventListener('click', () => this.close());
    });
    this.layer.querySelector('[data-auth-form]').addEventListener('submit', (event) => this.sendLoginLink(event));
    this.layer.querySelector('[data-auth-signout]').addEventListener('click', () => this.signOut());
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !this.layer.hidden) this.close();
    });
    window.addEventListener('online', () => {
      if (this.session) this.runSync(() => this.pushAll(), '网络已恢复，正在同步…');
    });

    this.bindStoreEvents();
    this.render();
    void this.initializeClient();
  }

  open() {
    this.layer.hidden = false;
    document.body.classList.add('academy-auth-open');
    requestAnimationFrame(() => {
      const focusTarget = this.session
        ? this.layer.querySelector('[data-auth-signout]')
        : this.layer.querySelector('input[name="email"]');
      focusTarget?.focus();
    });
  }

  close() {
    this.layer.hidden = true;
    document.body.classList.remove('academy-auth-open');
    this.accountButton?.focus({ preventScroll: true });
  }

  setMessage(message, tone = '') {
    const target = this.layer?.querySelector('[data-auth-message]');
    if (!target) return;
    target.textContent = message;
    target.dataset.tone = tone;
  }

  setStatus(status, message) {
    this.status = status;
    this.statusMessage = message;
    this.render();
  }

  render() {
    if (!this.accountButton || !this.layer) return;
    const user = this.session?.user;
    const guestPanel = this.layer.querySelector('[data-auth-guest]');
    const userPanel = this.layer.querySelector('[data-auth-user]');

    if (user) {
      this.accountButton.innerHTML = `<span class="academy-account-avatar">${initials(user.email)}</span><span class="academy-account-label">${shortEmail(user.email)}</span>`;
      this.accountButton.setAttribute('aria-label', `账号：${user.email}`);
      guestPanel.hidden = true;
      userPanel.hidden = false;
      this.layer.querySelector('[data-auth-avatar]').textContent = initials(user.email);
      this.layer.querySelector('[data-auth-email]').textContent = user.email ?? '已登录用户';
    } else {
      this.accountButton.innerHTML = '<span class="academy-account-login">登录 / 注册</span>';
      this.accountButton.setAttribute('aria-label', '登录或注册学习账号');
      guestPanel.hidden = false;
      userPanel.hidden = true;
    }

    const statusMap = {
      loading: ['正在连接', this.statusMessage],
      guest: ['当前是游客模式', '学习进度只保存在这台设备'],
      syncing: ['正在同步', this.statusMessage],
      synced: ['云端同步正常', this.statusMessage],
      offline: ['暂时离线', this.statusMessage],
      setup: ['数据库待初始化', this.statusMessage],
      error: ['账号服务异常', this.statusMessage],
    };
    const [title, message] = statusMap[this.status] ?? statusMap.error;
    const dot = this.layer.querySelector('[data-auth-status-dot]');
    if (dot) dot.dataset.state = this.status;
    const titleTarget = this.layer.querySelector('[data-auth-status-title]');
    const messageTarget = this.layer.querySelector('[data-auth-status-message]');
    if (titleTarget) titleTarget.textContent = title;
    if (messageTarget) messageTarget.textContent = message;
    this.accountButton.dataset.syncState = this.status;
  }

  async initializeClient() {
    try {
      const module = await import(this.config.clientModuleUrl);
      this.client = module.createClient(this.config.url, this.config.publishableKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: { 'x-application-name': 'ai-app-engineer-academy' },
        },
      });

      const { data: authListener } = this.client.auth.onAuthStateChange((event, session) => {
        setTimeout(() => void this.applySession(event, session), 0);
      });
      this.authSubscription = authListener.subscription;

      const { data, error } = await this.client.auth.getSession();
      if (error) throw error;
      await this.applySession('INITIAL_SESSION', data.session);
    } catch (error) {
      console.error('Supabase initialization failed', error);
      this.session = null;
      this.setStatus('error', '账号模块加载失败，游客学习不受影响');
      this.setMessage('账号服务暂时无法连接，请稍后刷新重试。', 'bad');
    }
  }

  async sendLoginLink(event) {
    event.preventDefault();
    if (!this.client) {
      this.setMessage('账号服务仍在加载，请稍后再试。', 'bad');
      return;
    }

    const form = event.currentTarget;
    const email = String(new FormData(form).get('email') ?? '').trim();
    const submit = form.querySelector('[data-auth-submit]');
    submit.disabled = true;
    submit.textContent = '正在发送…';
    this.setMessage('');

    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}`;
      const { error } = await this.client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      this.setMessage(`登录链接已发送到 ${email}，请在邮箱中点击。`, 'good');
    } catch (error) {
      console.error('Magic-link request failed', error);
      this.setMessage(error?.message || '发送失败，请稍后重试。', 'bad');
    } finally {
      submit.disabled = false;
      submit.textContent = '重新发送登录链接';
    }
  }

  async signOut() {
    if (!this.client) return;
    const button = this.layer.querySelector('[data-auth-signout]');
    button.disabled = true;
    try {
      const { error } = await this.client.auth.signOut({ scope: 'local' });
      if (error) throw error;
      this.setMessage('已退出当前设备。', 'good');
    } catch (error) {
      this.setMessage(error?.message || '退出失败，请稍后重试。', 'bad');
    } finally {
      button.disabled = false;
    }
  }

  async applySession(event, session) {
    const previousUserId = this.session?.user?.id ?? null;
    const nextUserId = session?.user?.id ?? null;
    this.session = session;

    if (!session) {
      this.setStatus('guest', '登录后可跨设备恢复学习进度');
      if (event === 'SIGNED_OUT') this.setMessage('已退出当前设备。', 'good');
      return;
    }

    this.render();
    if (previousUserId === nextUserId && event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN') return;

    this.setStatus('syncing', '正在合并本机与云端学习记录');
    try {
      await this.ensureProfile(session.user);
      await this.loadMergeAndPush();
      this.setStatus('synced', `最近同步：${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      this.setMessage('登录成功，本机进度已经与账号合并。', 'good');
      if ((window.location.hash.replace(/^#/, '') || 'dashboard') === 'dashboard') {
        this.app.renderDashboard();
      }
    } catch (error) {
      this.handleSyncError(error);
    }
  }

  async ensureProfile(user) {
    const result = await this.client.from('profiles').upsert({
      id: user.id,
      email: user.email ?? null,
      display_name: user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'Learner',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    throwOnError(result);
  }

  async loadMergeAndPush() {
    const userId = this.session.user.id;
    const [lessonRows, examRows, artifactRows] = await Promise.all([
      this.client.from('lesson_progress')
        .select('lesson_id,completed_stages,completed,completed_at,updated_at')
        .eq('user_id', userId),
      this.client.from('exam_results')
        .select('exam_id,score,passed,attempts,updated_at')
        .eq('user_id', userId),
      this.client.from('artifacts')
        .select('artifact_key,artifact_value,metadata,updated_at')
        .eq('user_id', userId),
    ]).then((results) => results.map(throwOnError));

    const remoteProgress = { lessons: {}, exams: {} };
    for (const row of lessonRows) {
      remoteProgress.lessons[row.lesson_id] = {
        completedStages: Array.isArray(row.completed_stages) ? row.completed_stages : [],
        completed: row.completed === true,
        completedAt: row.completed_at,
        updatedAt: row.updated_at,
      };
    }
    for (const row of examRows) {
      remoteProgress.exams[row.exam_id] = {
        score: row.score,
        passed: row.passed,
        attempts: row.attempts,
        updatedAt: row.updated_at,
      };
    }

    const remoteArtifacts = artifactRows.length ? { __meta: {} } : {};
    for (const row of artifactRows) {
      remoteArtifacts[row.artifact_key] = row.artifact_value;
      remoteArtifacts.__meta[row.artifact_key] = {
        ...(row.metadata ?? {}),
        updatedAt: row.updated_at,
      };
    }

    const mergedProgress = mergeProgress(this.app.progress.getSnapshot(), remoteProgress);
    const mergedArtifacts = mergeArtifacts(this.app.artifacts.get(), remoteArtifacts);

    this.applyingCloudState = true;
    try {
      this.app.progress.replace(mergedProgress, { source: 'cloud' });
      this.app.artifacts.replace(mergedArtifacts, { source: 'cloud' });
    } finally {
      this.applyingCloudState = false;
    }

    await this.pushAll();
  }

  bindStoreEvents() {
    this.unsubscribers.push(this.app.eventBus.on('progress:change', (detail = {}) => {
      if (this.applyingCloudState || !this.session) return;
      if (detail.examId) {
        this.scheduleSync(`exam:${detail.examId}`, () => this.syncExam(detail.examId));
      } else if (detail.lessonId) {
        this.scheduleSync(`lesson:${detail.lessonId}`, () => this.syncLesson(detail.lessonId));
      } else {
        this.scheduleSync('progress:all', () => this.pushProgress());
      }
    }));
    this.unsubscribers.push(this.app.eventBus.on('artifact:change', ({ name } = {}) => {
      if (this.applyingCloudState || !this.session || !name) return;
      this.scheduleSync(`artifact:${name}`, () => this.syncArtifact(name));
    }));
    this.unsubscribers.push(this.app.eventBus.on('progress:reset', () => {
      if (this.applyingCloudState || !this.session) return;
      this.scheduleSync('progress:reset', () => this.deleteProgress());
    }));
    this.unsubscribers.push(this.app.eventBus.on('artifact:reset', () => {
      if (this.applyingCloudState || !this.session) return;
      this.scheduleSync('artifact:reset', () => this.deleteArtifacts());
    }));
  }

  scheduleSync(key, task) {
    clearTimeout(this.syncTimers.get(key));
    this.syncTimers.set(key, setTimeout(() => {
      this.syncTimers.delete(key);
      void this.runSync(task, '正在保存最新学习记录');
    }, SYNC_DELAY_MS));
  }

  async runSync(task, message) {
    if (!this.session || !this.client) return;
    this.setStatus('syncing', message);
    try {
      await task();
      this.setStatus('synced', `最近同步：${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch (error) {
      this.handleSyncError(error);
    }
  }

  handleSyncError(error) {
    console.error('Supabase sync failed', error);
    if (isSchemaMissing(error)) {
      this.setStatus('setup', '请先在 Supabase SQL Editor 执行仓库中的初始化 SQL');
      this.setMessage('账号已登录，但数据库表还没有初始化。', 'bad');
      return;
    }
    this.setStatus(navigator.onLine ? 'error' : 'offline', navigator.onLine
      ? (error?.message || '云端同步失败，本地学习仍可继续')
      : '恢复网络后会自动重新同步');
  }

  async pushAll() {
    await Promise.all([this.pushProgress(), this.pushArtifacts()]);
  }

  async pushProgress() {
    const snapshot = this.app.progress.getSnapshot();
    const lessonRows = Object.entries(snapshot.lessons ?? {}).map(([lessonId, lesson]) => ({
      user_id: this.session.user.id,
      lesson_id: lessonId,
      completed_stages: lesson.completedStages ?? [],
      completed: lesson.completed === true,
      completed_at: lesson.completedAt ?? null,
      updated_at: lesson.updatedAt ?? lesson.completedAt ?? new Date().toISOString(),
    }));
    const examRows = Object.entries(snapshot.exams ?? {}).map(([examId, exam]) => ({
      user_id: this.session.user.id,
      exam_id: examId,
      score: Number(exam.score) || 0,
      passed: exam.passed === true,
      attempts: Number(exam.attempts) || 0,
      updated_at: exam.updatedAt ?? new Date().toISOString(),
    }));

    const writes = [];
    if (lessonRows.length) writes.push(this.client.from('lesson_progress').upsert(lessonRows, { onConflict: 'user_id,lesson_id' }));
    if (examRows.length) writes.push(this.client.from('exam_results').upsert(examRows, { onConflict: 'user_id,exam_id' }));
    const results = await Promise.all(writes);
    results.forEach(throwOnError);
  }

  async pushArtifacts() {
    const artifacts = this.app.artifacts.get();
    const metadata = artifacts.__meta ?? {};
    const rows = Object.entries(artifacts)
      .filter(([name, value]) => name !== '__meta' && value !== undefined)
      .map(([name, value]) => ({
        user_id: this.session.user.id,
        artifact_key: name,
        artifact_value: value,
        metadata: metadata[name] ?? {},
        updated_at: metadata[name]?.updatedAt ?? new Date().toISOString(),
      }));
    if (!rows.length) return;
    throwOnError(await this.client.from('artifacts').upsert(rows, { onConflict: 'user_id,artifact_key' }));
  }

  async syncLesson(lessonId) {
    const lesson = this.app.progress.getLesson(lessonId);
    throwOnError(await this.client.from('lesson_progress').upsert({
      user_id: this.session.user.id,
      lesson_id: lessonId,
      completed_stages: lesson.completedStages ?? [],
      completed: lesson.completed === true,
      completed_at: lesson.completedAt ?? null,
      updated_at: lesson.updatedAt ?? lesson.completedAt ?? new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' }));
  }

  async syncExam(examId) {
    const exam = this.app.progress.getExam(examId);
    throwOnError(await this.client.from('exam_results').upsert({
      user_id: this.session.user.id,
      exam_id: examId,
      score: Number(exam.score) || 0,
      passed: exam.passed === true,
      attempts: Number(exam.attempts) || 0,
      updated_at: exam.updatedAt ?? new Date().toISOString(),
    }, { onConflict: 'user_id,exam_id' }));
  }

  async syncArtifact(name) {
    const artifacts = this.app.artifacts.get();
    if (!Object.prototype.hasOwnProperty.call(artifacts, name)) return;
    throwOnError(await this.client.from('artifacts').upsert({
      user_id: this.session.user.id,
      artifact_key: name,
      artifact_value: artifacts[name],
      metadata: artifacts.__meta?.[name] ?? {},
      updated_at: artifacts.__meta?.[name]?.updatedAt ?? new Date().toISOString(),
    }, { onConflict: 'user_id,artifact_key' }));
  }

  async deleteProgress() {
    const userId = this.session.user.id;
    const results = await Promise.all([
      this.client.from('lesson_progress').delete().eq('user_id', userId),
      this.client.from('exam_results').delete().eq('user_id', userId),
    ]);
    results.forEach(throwOnError);
  }

  async deleteArtifacts() {
    throwOnError(await this.client.from('artifacts').delete().eq('user_id', this.session.user.id));
  }
}

export function installSupabaseAuthSync(app, config) {
  const baseMount = app.mount.bind(app);
  app.mount = function mountWithSupabaseAccount() {
    baseMount();
    const controller = new SupabaseAuthSync({ app: this, config });
    this.supabaseAuthSync = controller;
    controller.mount();
  };
}
