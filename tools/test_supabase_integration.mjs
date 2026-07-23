import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const config = await readFile(new URL('../packages/course-runtime/src/supabase-config.js', import.meta.url), 'utf8');
const authSync = await readFile(new URL('../packages/course-runtime/src/supabase-auth-sync.js', import.meta.url), 'utf8');
const progressStore = await readFile(new URL('../packages/course-runtime/src/progress-store.js', import.meta.url), 'utf8');
const artifactStore = await readFile(new URL('../packages/course-runtime/src/artifact-store.js', import.meta.url), 'utf8');
const main = await readFile(new URL('../apps/runtime-academy/main.js', import.meta.url), 'utf8');
const entry = await readFile(new URL('../apps/runtime-academy/index.html', import.meta.url), 'utf8');
const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');

assert.match(config, /https:\/\/wdwbaazjpkxtesaldapb\.supabase\.co/);
assert.match(config, /sb_publishable_/);
assert.doesNotMatch(config, /service_role|sb_secret_/);
assert.match(authSync, /import\(this\.config\.clientModuleUrl\)/);
assert.match(authSync, /signInWithOtp/);
assert.match(authSync, /onAuthStateChange/);
assert.match(authSync, /signOut\(\{ scope: 'local' \}\)/);
assert.match(authSync, /lesson_progress/);
assert.match(authSync, /exam_results/);
assert.match(authSync, /artifacts/);
assert.match(authSync, /mergeProgress/);
assert.match(authSync, /mergeArtifacts/);
assert.match(progressStore, /replace\(snapshot/);
assert.match(artifactStore, /replace\(snapshot/);
assert.match(main, /installSupabaseAuthSync/);
assert.match(entry, /auth\.css/);

for (const table of ['profiles', 'lesson_progress', 'exam_results', 'artifacts']) {
  assert.match(schema, new RegExp(`create table if not exists public\\.${table}`));
  assert.match(schema, new RegExp(`alter table public\\.${table} enable row level security`));
}
assert.match(schema, /to authenticated/);
assert.match(schema, /\(select auth\.uid\(\)\)/);
assert.doesNotMatch(schema, /using \(true\)|with check \(true\)/i);

console.log('Supabase auth, cloud sync, and RLS checks passed.');
