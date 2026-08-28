import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC_DIR = join(process.cwd(), 'src');
const FILE_EXTENSIONS = new Set(['.ts', '.tsx']);
const BASEPATH_PATTERN = /\$\{[^}]*basePath[^}]*\}\/\$\{[^}]+\}/;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    const dotIndex = fullPath.lastIndexOf('.');
    const extension = dotIndex >= 0 ? fullPath.slice(dotIndex) : '';
    if (FILE_EXTENSIONS.has(extension)) {
      files.push(fullPath);
    }
  }
  return files;
}

function collectViolations(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const violations = [];

  lines.forEach((line, index) => {
    if (!BASEPATH_PATTERN.test(line)) return;
    if (line.includes('resolveAssetPath(')) return;
    violations.push({
      filePath,
      lineNumber: index + 1,
      line: line.trim(),
    });
  });

  return violations;
}

const files = walk(SRC_DIR);
const violations = files.flatMap(collectViolations);

if (violations.length === 0) {
  console.log('Asset path check passed.');
  process.exit(0);
}

console.error('Asset path check failed. Use resolveAssetPath(...) for basePath image URLs.');
for (const violation of violations) {
  console.error(`- ${violation.filePath}:${violation.lineNumber}`);
  console.error(`  ${violation.line}`);
}
process.exit(1);
