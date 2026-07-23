export async function runEnterprisePart2(ctx) {
  const { page, enterLesson, completeTransfer, runDecision, runChecklist, runClassification } = ctx;

  await enterLesson(89);
  await runChecklist({ 'flag-fallback': 'off', secret: 'secret-store' });
  await completeTransfer(89);

  await enterLesson(90);
  await runDecision(['permit', 'deny', 'obligations', 'deny', 'deny', 'redact']);
  await page.screenshot({ path: 'artifacts/enterprise-policy-decision-workbench.png', fullPage: true });
  await completeTransfer(90);

  await enterLesson(91);
  await runChecklist({ delivery: 'at-least-once', timeout: 'query' });
  await completeTransfer(91);

  await enterLesson(92);
  await runDecision(['expire', 'tombstone', 'priority', 'not-publish', 'context', 'mark']);
  await completeTransfer(92);

  await enterLesson(93);
  await runDecision(['small', 'evaluated', 'schema', 'deny', 'abstain', 'release']);
  await completeTransfer(93);

  await enterLesson(94);
  await runClassification(['stream', 'evidence', 'approval', 'approval', 'unknown', 'stream', 'handoff', 'handoff', 'evidence', 'stream']);
  await page.screenshot({ path: 'artifacts/enterprise-ai-ux-states.png', fullPage: true });
  await completeTransfer(94);
}
