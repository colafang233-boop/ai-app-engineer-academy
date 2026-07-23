export async function runEnterprisePart1(ctx) {
  const { page, enterLesson, completeTransfer, runDecision, runChecklist, runClassification } = ctx;

  await enterLesson(84);
  await runDecision(['not-ready', 'blocked', 'evidence', 'recover', 'unsafe', 'loop']);
  await completeTransfer(84);

  await enterLesson(85);
  await runChecklist({ 'north-star': 'resolved', 'risk-appetite': 'zero' });
  await completeTransfer(85);

  await enterLesson(86);
  await runClassification(['ai', 'deterministic', 'ai', 'deterministic', 'hybrid', 'deterministic', 'ai', 'human', 'human', 'deterministic', 'hybrid', 'ai', 'deterministic', 'hybrid', 'human', 'deterministic']);
  await page.screenshot({ path: 'artifacts/enterprise-ai-deterministic-boundary.png', fullPage: true });
  await completeTransfer(86);

  await enterLesson(87);
  await runDecision(['separate', 'invariant', 'case', 'execution', 'asset', 'database']);
  await completeTransfer(87);

  await enterLesson(88);
  await runClassification(['core', 'core', 'web', 'worker', 'worker', 'worker', 'gateway', 'worker']);
  await page.screenshot({ path: 'artifacts/enterprise-architecture-adr.png', fullPage: true });
  await completeTransfer(88);
}
