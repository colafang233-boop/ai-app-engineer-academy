const primaryMilestones = [
  'businessRisk',
  'languageDecision',
  'tsSource',
  'messages',
  'promptV1',
  'classificationRules',
  'outputSchema',
  'fewShotExamples',
  'evaluationReport',
  'modelInvocation',
  'streamingContract',
  'toolRegistry',
  'agentLoopTrace',
];

const resultByLesson = {
  'lesson-10': '标准模型调用配置',
  'lesson-11': '流式响应协议',
  'lesson-12': '工具注册表',
  'lesson-13': 'Agent Loop 运行轨迹',
};

const metaByArtifact = {
  modelInvocation: {
    label: '标准模型调用配置',
    description: 'Messages、模型参数和 AIMessage 读取方式',
  },
  streamingContract: {
    label: '流式响应协议',
    description: '消息块合并、取消、完成和错误状态',
  },
  toolRegistry: {
    label: '工具注册表',
    description: '工具描述、Zod 参数和最小权限',
  },
  agentLoopTrace: {
    label: 'Agent Loop 运行轨迹',
    description: '模型、工具、观察结果和停止条件',
  },
};

export function installColumn03Product(app) {
  const originalMeta = app.artifactMeta.bind(app);
  const originalPreview = app.artifactPreview.bind(app);
  const originalResultForLesson = app.resultForLesson.bind(app);
  const originalRenderArtifacts = app.renderArtifacts.bind(app);

  app.artifactMeta = function artifactMeta(name) {
    return metaByArtifact[name] ?? originalMeta(name);
  };

  app.artifactPreview = function artifactPreview(name, value) {
    if (name === 'modelInvocation') {
      return `<p>已使用 <b>${this.escape(value?.outputType ?? 'AIMessage')}</b> 统一读取模型结果；当前调用方式：<b>${this.escape(value?.method ?? 'invoke')}</b>。</p>`;
    }
    if (name === 'streamingContract') {
      return `<p>流式响应使用 <b>${this.escape(value?.chunkType ?? 'AIMessageChunk')}</b>，通过 <b>${this.escape(value?.aggregation ?? 'concat')}</b> 合并为完整消息。</p>`;
    }
    if (name === 'toolRegistry') {
      const tools = Array.isArray(value?.tools) ? value.tools : [];
      return `<p>当前向模型开放 <b>${tools.length}</b> 个必要工具，并保留参数校验和最小权限边界。</p>`;
    }
    if (name === 'agentLoopTrace') {
      return `<p>Agent 已完成 <b>${Array.isArray(value?.trace) ? value.trace.length : 0}</b> 个运行步骤，并配置最终输出与迭代上限两类停止条件。</p>`;
    }
    return originalPreview(name, value);
  };

  app.resultForLesson = function resultForLesson(lessonId) {
    return resultByLesson[lessonId] ?? originalResultForLesson(lessonId);
  };

  app.renderArtifacts = function renderArtifacts() {
    originalRenderArtifacts();
    const progressTarget = this.root.querySelector('[data-artifact-progress]');
    if (!progressTarget) return;
    const completed = primaryMilestones.filter((name) => this.artifacts.has(name)).length;
    const percent = Math.round(completed / primaryMilestones.length * 100);
    progressTarget.innerHTML = `<span>项目完成度</span><i><em style="width:${percent}%"></em></i><b>${completed} / ${primaryMilestones.length}</b>`;
  };
}
