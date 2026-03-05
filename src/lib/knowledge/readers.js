import { readFile as fsReadFile } from 'fs/promises';
import path from 'path';

const SUPPORTED_EXTENSIONS = new Set([
  '.md',
  '.txt',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.py',
  '.go',
  '.rs',
  '.java',
  '.json',
  '.yaml',
  '.yml',
  '.env.example',
]);

export function isSupported(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (filePath.endsWith('.env.example')) return true;

  const basename = path.basename(filePath);
  if (basename.endsWith('.min.js') || basename.endsWith('.min.ts')) return false;
  if (basename === 'package-lock.json' || basename === 'yarn.lock') return false;

  return SUPPORTED_EXTENSIONS.has(ext);
}

export async function readFileContent(filePath) {
  if (!isSupported(filePath)) {
    const ext = path.extname(filePath);
    throw new Error(`Unsupported file extension: ${ext} (${filePath})`);
  }

  const content = await fsReadFile(filePath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    try {
      return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      return content;
    }
  }

  return content;
}

