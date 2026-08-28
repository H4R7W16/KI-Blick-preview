import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = dirname(scriptPath);
const policy = JSON.parse(await readFile(join(scriptDir, 'public-tree-policy.json'), 'utf8'));
const textExtensions = new Set(['.css', '.example', '.html', '.js', '.json', '.md', '.mjs', '.php', '.sql', '.ts', '.tsx', '.txt', '.yaml', '.yml']);
const textNames = new Set(['.gitignore', '.htaccess']);
const secretPatterns = [
  /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/
];

function trackedFiles(root) {
  const gitRoot = execFileSync('git', ['-C', root, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const prefix = relative(gitRoot, root).replaceAll('\\', '/');
  const pathspec = prefix || '.';
  const output = execFileSync('git', ['-C', gitRoot, 'ls-files', '-z', '--', pathspec]);
  return output.toString('utf8').split('\0').filter(Boolean).map((entry) => {
    const normalized = entry.replaceAll('\\', '/');
    return prefix ? normalized.slice(prefix.length + 1) : normalized;
  });
}

export async function validatePublicTree(inputRoot) {
  const root = resolve(inputRoot);
  const errors = [];
  for (const relativePath of trackedFiles(root)) {
    const parts = relativePath.split('/');
    const rootEntry = parts[0];
    const isRootFile = parts.length === 1;
    if (isRootFile && !policy.allowedRootFiles.includes(rootEntry)) {
      errors.push(`Unexpected root file: ${relativePath}`);
    }
    if (!isRootFile && !policy.allowedRootDirectories.includes(rootEntry)) {
      errors.push(`Unexpected root directory: ${rootEntry}`);
    }
    for (const directory of parts.slice(0, -1)) {
      if (policy.forbiddenDirectoryNames.includes(directory)) {
        errors.push(`Forbidden directory in tracked path: ${relativePath}`);
      }
    }
    if (policy.forbiddenFileNames.includes(basename(relativePath))) {
      errors.push(`Forbidden file: ${relativePath}`);
    }
    const fullPath = join(root, ...parts);
    const fileStat = await stat(fullPath);
    if (fileStat.size > policy.maxFileBytes) {
      errors.push(`File exceeds ${policy.maxFileBytes} bytes: ${relativePath}`);
    }
    const extension = extname(relativePath).toLowerCase();
    if (fileStat.size <= 1_000_000 && (textExtensions.has(extension) || textNames.has(basename(relativePath)))) {
      const content = await readFile(fullPath, 'utf8');
      if (secretPatterns.some((pattern) => pattern.test(content))) {
        errors.push(`Potential secret in tracked text file: ${relativePath}`);
      }
    }
  }
  return [...new Set(errors)].sort();
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(scriptPath)) {
  const errors = await validatePublicTree(resolve(process.argv[2] ?? '.'));
  if (errors.length) {
    errors.forEach((entry) => console.error(entry));
    process.exitCode = 1;
  } else {
    console.log('Public tree policy passed.');
  }
}
