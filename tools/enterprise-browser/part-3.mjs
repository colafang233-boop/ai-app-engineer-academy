export async function runEnterprisePart3(ctx) {
  const { page, enterLesson, completeTransfer, runDecision, runChecklist } = ctx;

  await enterLesson(95);
  await runDecision(['answer', 'deny', 'current', 'escalate', 'abstain', 'fail']);
  await page.screenshot({ path: 'artifacts/enterprise-permission-aware-policy-qa.png', fullPage: true });
  await completeTransfer(95);

  await enterLesson(96);
  await runDecision(['account', 'credentials', 'resume', 'update', 'handoff', 'ticket']);
  await completeTransfer(96);

  await enterLesson(97);
  await runChecklist({ summary: 'advice', automation: 'stop' });
  await page.screenshot({ path: 'artifacts/enterprise-support-handoff.png', fullPage: true });
  await completeTransfer(97);

  await enterLesson(98);
  await runDecision(['structured', 'obligations', 'record', 'escalate', 'reevaluate', 'stepup']);
  await completeTransfer(98);

  await enterLesson(99);
  await runChecklist({ timeout: 'reconcile', revocation: 'incident' });
  await page.screenshot({ path: 'artifacts/enterprise-privileged-access-lifecycle.png', fullPage: true });
  await completeTransfer(99);

  await enterLesson(100);
  await runDecision(['read-only', 'namespace', 'select', 'untrusted', 'diagnose', 'approval', 'resume']);
  await page.screenshot({ path: 'artifacts/enterprise-multi-mcp-deployment-diagnosis.png', fullPage: true });
  await completeTransfer(100);

  await enterLesson(101);
  await runChecklist({ confidence: 'clarify', 'mcp-failure': 'degrade' });
  await completeTransfer(101);
}
