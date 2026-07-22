const artifactLabels = {
  businessRisk: 'AI 应用风险清单',
  languageDecision: '技术路线选择',
  tsSource: 'TypeScript 调用骨架',
  messages: '模型请求消息包',
  promptV1: 'Prompt v1',
  classificationRules: '分类规则与优先级',
  outputSchema: '结构化输出契约',
  fewShotExamples: 'Few-shot 示例集',
  promptV2: '通过评估的 Prompt',
  evaluationDataset: '回归测试集',
  evaluationReport: 'Prompt 评估报告',
};

const exactText = new Map([
  ['前置产物', '已带入上一步成果'],
  ['课程产物账本', '我的项目成果'],
  ['20 次重复运行', '重复运行同一个请求'],
  ['项目条件混合器', '选择适合当前项目的技术路线'],
  ['TypeScript AI 调用修理厂', '修复这段 TypeScript 模型调用'],
  ['Messages 行李箱', '组装一次完整的模型请求'],
  ['最终请求窗口', '本次发送给模型的内容'],
  ['Prompt 反事实实验', '验证 Prompt 每一部分的作用'],
  ['规则路由台', '调整分类规则的优先级'],
  ['结构化输出验证流水线', '检查模型返回能否进入业务系统'],
  ['Few-shot 语义地图', '从候选示例中选出最有价值的三个'],
  ['Prompt 评估矩阵', '用固定案例检验 Prompt 是否可靠'],
  ['运行诊断', '检查代码'],
  ['应用当前修复', '修复当前问题'],
  ['保存技术决策', '确认这次选择'],
  ['发送请求', '使用这个请求继续'],
  ['运行评估', '运行全部测试'],
  ['只看失败/回归', '只看需要处理的案例'],
  ['所有诊断通过', '所有检查都已通过'],
]);

const phraseReplacements = [
  ['已写入课程产物账本', '已保存为本课项目成果'],
  ['已写入课程产物', '已保存为本课项目成果'],
  ['已保存到课程产物账本', '已保存为本课项目成果'],
  ['诊断失败：', '代码还存在问题：'],
  ['已应用 ', '已经修复 '],
  [' 修复。继续运行诊断。', '。请再次检查代码。'],
  ['下一课会在这个请求包之上构造 Prompt', '下一课会继续使用这个请求内容来完善 Prompt'],
  ['课程产物', '项目成果'],
  ['Runtime 学习进度', '学习进度'],
  ['前两个专栏已经全部完成。', '下一专栏已经加入你的学习路径。'],
];

function replacePhrases(value) {
  let result = value;
  for (const [from, to] of phraseReplacements) result = result.replaceAll(from, to);
  return result;
}

function replaceDirectTextNodes(element) {
  for (const node of element.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const next = replacePhrases(node.textContent);
    if (next !== node.textContent) node.textContent = next;
  }
}

function polishElement(element) {
  if (!(element instanceof HTMLElement)) return;

  if (exactText.has(element.textContent.trim()) && element.children.length === 0) {
    const next = exactText.get(element.textContent.trim());
    if (next !== element.textContent) element.textContent = next;
  }

  if (element.matches('.sim-chip')) {
    const key = Object.keys(artifactLabels).find((name) => element.textContent.includes(name));
    if (key) {
      const ready = element.textContent.includes('已读取');
      const next = `${artifactLabels[key]} · ${ready ? '已带入' : '尚未完成'}`;
      if (next !== element.textContent) element.textContent = next;
    }
  }

  if (element.matches('.exam-result')) {
    replaceDirectTextNodes(element);
  }

  if (element.matches('.sim-result, .v1-result, .code-grid pre, .all-pass, .cr-feedback, .cr-complete')) {
    const next = replacePhrases(element.textContent);
    if (next !== element.textContent) element.textContent = next;
  }

  if (element.matches('button, b, small, span') && element.children.length === 0) {
    const trimmed = element.textContent.trim();
    if (exactText.has(trimmed)) {
      const next = exactText.get(trimmed);
      if (next !== element.textContent) element.textContent = next;
    }
  }
}

function scan(root) {
  if (root instanceof HTMLElement) polishElement(root);
  root.querySelectorAll?.('*').forEach(polishElement);
}

export function mountProductCopy(root = document.body) {
  scan(root);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        polishElement(mutation.target.parentElement);
        continue;
      }
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) scan(node);
        else if (node.parentElement) polishElement(node.parentElement);
      });
    }
  });
  observer.observe(root, { childList: true, subtree: true, characterData: true });
  return () => observer.disconnect();
}
