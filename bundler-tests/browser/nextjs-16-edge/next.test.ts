/**
 * Next.js 16+ uses Turbopack, which lacks callbacks for build errors or warnings.
 * This script runs the build and fails if Turbopack reports any warnings.
 */
import { execSync } from 'node:child_process';
import path from 'node:path';

const testDir = path.dirname(new URL(import.meta.url).pathname);

// Install dependencies and run build, capturing both stdout and stderr
const output = execSync('npm run build 2>&1', {
  cwd: testDir,
  encoding: 'utf-8',
});

const hasWarning = /Turbopack build encountered/.test(output);
if (hasWarning) {
  console.error('Build produced warnings:\n', output);
  process.exit(1);
}

console.log('Build completed without warnings');
