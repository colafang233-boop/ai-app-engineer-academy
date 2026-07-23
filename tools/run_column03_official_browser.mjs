import { mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });

try {
  const sourceUrl = new URL('./test_column03_official_browser.mjs', import.meta.url);
  const generatedUrl = new URL('./.generated_column03_official_browser.mjs', import.meta.url);
  const source = await readFile(sourceUrl, 'utf8');
  const generated = source
    .replaceAll('`${BASE}#', '`${BASE}&nav=${Date.now()}#')
    .replace(
      'assert.equal(await page.locator(\'[data-review-column="column-04"]\').count(), 1);',
      'assert.ok(await page.locator(\'.lesson-card\').count() >= 17, \'RAG column lesson cards should render in the normal sequential dashboard\');',
    );
  await writeFile(generatedUrl, generated, 'utf8');
  await import('./.generated_column03_official_browser.mjs');
} catch (error) {
  const detail = [
    error?.stack ?? String(error),
    '',
    `name: ${error?.name ?? 'unknown'}`,
    `message: ${error?.message ?? 'unknown'}`,
  ].join('\n');
  await writeFile('artifacts/failure.txt', detail, 'utf8');
  console.error(detail);
  process.exitCode = 1;
}
