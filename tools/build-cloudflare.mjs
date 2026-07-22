import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const copies = [
  ['apps/runtime-academy', 'apps/runtime-academy'],
  ['packages/course-runtime', 'packages/course-runtime'],
  ['courses/ai-app-engineering', 'courses/ai-app-engineering'],
];

for (const [source, target] of copies) {
  await cp(resolve(root, source), resolve(dist, target), { recursive: true });
}

const redirect = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="refresh" content="0; url=/apps/runtime-academy/">
  <title>AI 应用开发学院</title>
  <script>location.replace('/apps/runtime-academy/' + location.search + location.hash);</script>
</head>
<body>
  <p>正在进入 <a href="/apps/runtime-academy/">AI 应用开发学院</a>…</p>
</body>
</html>`;

await writeFile(resolve(dist, 'index.html'), redirect, 'utf8');
console.log('Cloudflare artifact created at dist/');
