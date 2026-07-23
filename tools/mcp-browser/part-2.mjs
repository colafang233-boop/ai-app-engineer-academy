export async function runMcpBrowserPart2(ctx) {
  const { enterLesson, completeTransfer, runDecision, runChecklist, runClassification } = ctx;

  await enterLesson(66);
  await runChecklist({ mode: 'direct', failure: 'degraded' });
  await completeTransfer(66);

  await enterLesson(67);
  await runDecision(['config', 'plugin', 'app', 'hosted', 'tunnel']);
  await completeTransfer(67);

  await enterLesson(68);
  await runDecision(['tool', 'task', 'appserver', 'a2a']);
  await completeTransfer(68);

  await enterLesson(69);
  await runChecklist({ transport: 'stdio', log: 'stderr' });
  await completeTransfer(69);

  await enterLesson(70);
  await runChecklist({ approval: 'always', token: 'server' });
  await completeTransfer(70);

  await enterLesson(71);
  await runClassification(['direct', 'template', 'direct', 'template', 'subscribe', 'tool', 'tool', 'subscribe']);
  await completeTransfer(71);

  await enterLesson(72);
  await runChecklist({ control: 'user' });
  await completeTransfer(72);
}
