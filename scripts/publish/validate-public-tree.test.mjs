import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, open, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { validatePublicTree } from './validate-public-tree.mjs';

const roots = [];

async function makeRepo(entries) {
  const root = await mkdtemp(join(tmpdir(), 'ki-blick-policy-'));
  roots.push(root);
  execFileSync('git', ['init'], { cwd: root, stdio: 'ignore' });
  for (const [relativePath, value] of Object.entries(entries)) {
    const fullPath = join(root, relativePath);
    await mkdir(dirname(fullPath), { recursive: true });
    if (typeof value === 'number') {
      const handle = await open(fullPath, 'w');
      await handle.truncate(value);
      await handle.close();
    } else {
      await writeFile(fullPath, value, 'utf8');
    }
  }
  execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'ignore' });
  return root;
}

test.afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

test('accepts a minimal allowlisted public tree', async () => {
  const root = await makeRepo({
    'README.md': '# KI:Blick',
    'src/main.tsx': 'export const app = true;',
    'public/images/example.webp': 'test-image'
  });
  assert.deepEqual(await validatePublicTree(root), []);
});

test('rejects production env files and dependency directories', async () => {
  const root = await makeRepo({
    '.env.production': 'TOKEN=secret',
    'node_modules/pkg/index.js': 'export default 1;'
  });
  const errors = await validatePublicTree(root);
  assert.match(errors.join('\n'), /\.env\.production/);
  assert.match(errors.join('\n'), /node_modules/);
});

test('rejects unexpected root entries and files above 50 MB', async () => {
  const root = await makeRepo({
    'planung/intern.md': 'private',
    'public/huge.bin': 50_000_001
  });
  const errors = await validatePublicTree(root);
  assert.ok(errors.some((entry) => entry.includes('planung')));
  assert.ok(errors.some((entry) => entry.includes('50000000')));
});
