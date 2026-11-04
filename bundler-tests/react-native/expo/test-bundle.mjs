/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const outDir = path.join(projectRoot, 'dist');
// Some packages nest platform/ below dist/, e.g. resources' dist/detectors/platform/.
const NODE_IMPL = /[\\/]dist[\\/](?:.+[\\/])?platform[\\/]node[\\/]/;
const BROWSER_IMPL = /[\\/]dist[\\/](?:.+[\\/])?platform[\\/]browser[\\/]/;
const packages = [
  ...readFileSync(path.join(projectRoot, 'src/index.js'), 'utf8').matchAll(/^import '(.+)';$/gm),
].map(m => m[1]);
const platforms = ['ios', 'android'];

try {
  execFileSync(
    process.execPath,
    [
      require.resolve('expo/bin/cli'),
      'export',
      ...platforms.flatMap(p => ['--platform', p]),
      '--output-dir', outDir,
      '--no-minify',
      '--no-bytecode',
      '--source-maps',
    ],
    { cwd: projectRoot, stdio: 'inherit' }
  );
} catch {
  process.exit(1);
}

const failures = [];
for (const platform of platforms) {
  const dir = path.join(outDir, '_expo/static/js', platform);
  const map = readdirSync(dir).find(f => f.endsWith('.map'));
  // Expo writes sources relative to the server root, with a leading slash.
  const bundled = JSON.parse(readFileSync(path.join(dir, map), 'utf8')).sources.map(
    file => path.join(projectRoot, file)
  );
  for (const file of bundled) {
    if (NODE_IMPL.test(file)) {
      failures.push(`${platform}: bundled node implementation ${file}`);
    }
  }
  for (const name of packages) {
    const packageDir = realpathSync(path.join(projectRoot, 'node_modules', name)) + path.sep;
    if (!bundled.some(file => file.startsWith(packageDir) && BROWSER_IMPL.test(file))) {
      failures.push(`${platform}: ${name} bundled no browser implementation`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('expo export succeeded for ios and android with browser implementations');
