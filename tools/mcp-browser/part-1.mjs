export async function runMcpBrowserPart1(ctx) {
  const { assert, page, enterLesson, completeTransfer, runDecision, runClassification } = ctx;

  await enterLesson(59);
  const titleLayout = await page.locator('.cr-hero h1').evaluate((heading) => {
    const lineCount = (element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const tops = [...range.getClientRects()]
        .filter((rect) => rect.width > 1 && rect.height > 1)
        .map((rect) => Math.round(rect.top));
      return new Set(tops).size;
    };
    const marker = heading.querySelector('.cr-marker');
    const parent = heading.parentElement;
    const course = heading.closest('.cr-course');
    const courseRect = course.getBoundingClientRect();
    return {
      titleLines: lineCount(heading),
      markerLines: marker ? lineCount(marker) : 0,
      headingWidth: heading.getBoundingClientRect().width,
      parentWidth: parent.getBoundingClientRect().width,
      courseWidth: courseRect.width,
      leftGutter: courseRect.left,
      rightGutter: window.innerWidth - courseRect.right,
      viewportWidth: window.innerWidth,
      fontSize: getComputedStyle(heading).fontSize,
    };
  });
  assert.equal(titleLayout.titleLines, 1, `Lesson 59 desktop title should fit one line: ${JSON.stringify(titleLayout)}`);
  assert.equal(titleLayout.markerLines, 1, `Highlighted phrase must not split into an orphan line: ${JSON.stringify(titleLayout)}`);
  assert.ok(titleLayout.headingWidth <= titleLayout.parentWidth + 1, `Title should use, but not exceed, its container: ${JSON.stringify(titleLayout)}`);
  assert.ok(titleLayout.courseWidth <= titleLayout.viewportWidth * .9, `Desktop lesson content should not fill the viewport: ${JSON.stringify(titleLayout)}`);
  assert.ok(titleLayout.leftGutter >= titleLayout.viewportWidth * .05, `Desktop lesson needs a visible left breathing gutter: ${JSON.stringify(titleLayout)}`);
  assert.ok(titleLayout.rightGutter >= titleLayout.viewportWidth * .05, `Desktop lesson needs a visible right breathing gutter: ${JSON.stringify(titleLayout)}`);
  assert.ok(Math.abs(titleLayout.leftGutter - titleLayout.rightGutter) <= 2, `Desktop lesson should remain centered: ${JSON.stringify(titleLayout)}`);
  await page.screenshot({ path: 'artifacts/responsive-course-layout-desktop.png', fullPage: true });
  await runDecision(['function', 'mcp', 'api', 'app', 'a2a', 'resource']);
  await completeTransfer(59);

  await enterLesson(60);
  const links = page.locator('input[data-link]');
  for (let index = 0; index < await links.count(); index += 1) await links.nth(index).check();
  await page.locator('[data-run]').click();
  await page.locator('.mcp-result.good').waitFor();
  await page.screenshot({ path: 'artifacts/mcp-topology-trust-boundaries.png', fullPage: true });
  await completeTransfer(60);

  await enterLesson(61);
  for (let index = 0; index < 6; index += 1) await page.locator('[data-next]').click();
  await page.locator('.mcp-result.good').waitFor();
  await page.screenshot({ path: 'artifacts/mcp-protocol-message-inspector.png', fullPage: true });
  await completeTransfer(61);

  await enterLesson(62);
  await runClassification(['tool', 'resource', 'template', 'prompt', 'tool', 'resource', 'prompt', 'template']);
  await completeTransfer(62);

  await enterLesson(63);
  await runDecision(['roots', 'sampling', 'elicitation', 'task', 'fallback']);
  await completeTransfer(63);

  await enterLesson(64);
  await runDecision(['native', 'embedded', 'hosted', 'app', 'tunnel', 'server']);
  await completeTransfer(64);

  await enterLesson(65);
  const hosts = [
    ['codex', 'stdio-http', 'oauth-bearer'],
    ['chatgpt', 'remote', 'oauth'],
    ['claude', 'stdio-http', 'oauth-header'],
    ['vscode', 'stdio-http', 'oauth-header'],
    ['ci', 'http', 'machine'],
  ];
  for (const [host, transport, auth] of hosts) {
    await page.locator(`[data-host="${host}"]`).click();
    await page.locator(`input[name="host-transport"][value="${transport}"]`).check();
    await page.locator('[data-auth]').selectOption(auth);
    await page.locator('[data-check]').click();
  }
  await page.locator('[data-save]').click();
  await page.locator('.mcp-result.good').waitFor();
  await page.screenshot({ path: 'artifacts/mcp-host-compatibility-matrix.png', fullPage: true });
  await completeTransfer(65);
}
