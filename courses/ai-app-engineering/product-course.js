const lessonPresentation = {
  'lesson-01': {
    shortTitle: '从 CRUD 到概率系统',
    description: '让同一个模型请求连续运行多次，亲眼看到业务规则、返回结构和失败处理分别解决什么问题。',
    labTitle: '连续运行同一个请求，观察结果如何变化',
    labDescription: '逐步加入业务规则、结构化输出和低置信度处理，比较三类工程能力带来的变化。',
  },
  'lesson-02': {
    shortTitle: '如何选择项目语言',
    description: '根据现有系统、团队能力和运行环境做技术选择，而不是接受“AI 只能用某种语言”的固定结论。',
    labTitle: '为一个真实项目选择合适的技术路线',
    labDescription: '组合不同项目条件，观察 Java、Python 和 TypeScript 的适配程度如何变化。',
  },
  'lesson-03': {
    shortTitle: '修复异步模型调用',
    description: '从一段看似正确的 TypeScript 代码出发，逐步解决异步调用、运行时数据和返回契约问题。',
    labTitle: '把这段模型调用修到可以安全交付',
    labDescription: '每次只处理一个真实问题，直到代码能够稳定返回通过校验的业务对象。',
  },
  'lesson-04': {
    shortTitle: '组装一次模型请求',
    description: '把系统规则、必要历史、参考资料和当前问题放进有限上下文，理解模型本次到底看见了什么。',
    labTitle: '为“继续用那个方案”准备完整上下文',
    labDescription: '保留解决当前任务所需的信息，并观察无关内容如何挤占窗口。',
  },
  'lesson-05': {
    shortTitle: 'Prompt 的五个组成部分',
    description: '不是背一套万能模板，而是通过删除实验理解任务、上下文、规则、输出和失败策略各自承担什么责任。',
    labTitle: '删掉一部分，看看 Prompt 会在哪里失效',
    labDescription: '逐项关闭 Prompt 组成部分，观察模型行为和后端接入方式发生什么变化。',
  },
  'lesson-06': {
    shortTitle: '让分类规则可执行',
    description: '通过一组真实边界邮件，学习如何写清类别定义、优先级、冲突规则和信息不足出口。',
    labTitle: '调整规则顺序，修复边界邮件误判',
    labDescription: '改变规则优先级后重新运行全部案例，直到每封邮件都进入正确路径。',
  },
  'lesson-07': {
    shortTitle: '验证结构化输出',
    description: '让模型返回依次通过 JSON、字段结构和业务规则检查，理解“能解析”为什么不等于“能使用”。',
    labTitle: '检查这份模型返回能否进入业务系统',
    labDescription: '修改返回内容，观察它会在哪一道检查中被拦下，以及为什么。',
  },
  'lesson-08': {
    shortTitle: '选择有效的 Few-shot 示例',
    description: '在有限 Token 预算内，同时考虑相关性、边界覆盖、失败出口和示例多样性。',
    labTitle: '从候选示例中选出最有价值的三个',
    labDescription: '不要只选最相似的例子，还要覆盖容易混淆的边界和信息不足情况。',
  },
  'lesson-09': {
    shortTitle: '建立 Prompt 回归测试',
    description: '用固定测试集比较 Prompt 版本，识别平均分背后的关键回归，并形成可以发布和回退的版本记录。',
    labTitle: '修改一条规则，然后运行全部测试',
    labDescription: '查看修复了哪些案例，又破坏了哪些旧能力，直到关键测试全部通过。',
  },
};

export function productizeCourse(sourceCourse) {
  return {
    ...sourceCourse,
    title: 'AI 应用开发学院',
    subtitle: '面向 Java 开发者的互动式 AI 应用工程课程',
    lessons: sourceCourse.lessons.map((lesson) => {
      const presentation = lessonPresentation[lesson.id] ?? {};
      return {
        ...lesson,
        shortTitle: presentation.shortTitle ?? lesson.shortTitle,
        description: presentation.description ?? lesson.description,
        stages: lesson.stages.map((stage) => stage.id === 'lab'
          ? {
              ...stage,
              title: presentation.labTitle ?? stage.title,
              description: presentation.labDescription ?? stage.description,
            }
          : stage),
      };
    }),
  };
}
