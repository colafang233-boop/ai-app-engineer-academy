import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('artifacts', { recursive: true });
try {
  await import('./test_column05_langgraph_browser.mjs');
} catch (error) {
  await writeFile('artifacts/langgraph-failure.txt', error?.stack ?? String(error), 'utf8');
  console.error(error?.stack ?? error);
  process.exitCode = 1;
}
