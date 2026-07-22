import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
try {
  await import('./test_column04_rag_browser.mjs');
} catch (error) {
  const detail = [error?.stack ?? String(error), '', `name: ${error?.name ?? 'unknown'}`, `message: ${error?.message ?? 'unknown'}`].join('\n');
  await writeFile('artifacts/rag-failure.txt', detail, 'utf8');
  console.error(detail);
  process.exitCode = 1;
}
