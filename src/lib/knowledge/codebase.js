import { readdirSync } from 'fs';
import path from 'path';
import { readFileContent, isSupported } from '@/lib/knowledge/readers';

const INCLUDE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.md',
  '.py',
  '.go',
  '.rs',
  '.java',
  '.yaml',
  '.yml',
]);

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '__pycache__',
  '.cache',
  '.turbo',
  'out',
]);

const SKIP_PATTERNS = [
  /\.test\.[tj]sx?$/,
  /\.spec\.[tj]sx?$/,
  /\.min\.js$/,
  /\.d\.ts$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
];

const PRIORITY_NAMES = new Set([
  'index.ts',
  'index.js',
  'index.tsx',
  'index.jsx',
  'api.ts',
  'api.js',
  'lib.ts',
  'lib.js',
  'core.ts',
  'core.js',
  'main.ts',
  'main.js',
  'README.md',
  'readme.md',
]);

function shouldInclude(filePath) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();

  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(basename)) return false;
  }

  if (!INCLUDE_EXTENSIONS.has(ext)) return false;
  if (!isSupported(filePath)) return false;
  return true;
}

export async function scanCodebase(rootPath) {
  const allFiles = [];

  function walkDir(dirPath) {
    let entries;
    try {
      entries = readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryName = entry.name;
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entryName)) continue;
        walkDir(path.join(dirPath, entryName));
      } else if (entry.isFile()) {
        const filePath = path.join(dirPath, entryName);
        if (shouldInclude(filePath)) {
          allFiles.push(filePath);
        }
      }
    }
  }

  walkDir(rootPath);

  allFiles.sort((a, b) => {
    const aName = path.basename(a);
    const bName = path.basename(b);
    const aPriority = PRIORITY_NAMES.has(aName) ? 0 : 1;
    const bPriority = PRIORITY_NAMES.has(bName) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.localeCompare(b);
  });

  return allFiles;
}

export async function readCodebaseFiles(rootPath) {
  const filePaths = await scanCodebase(rootPath);
  const results = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const filePath of filePaths) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const content = await readFileContent(filePath);
      results.push({ path: filePath, content });
    } catch {
      // skip unreadable files
    }
  }

  return results;
}

