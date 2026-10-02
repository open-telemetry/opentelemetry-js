/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from '@react-native/metro-config';
import Metro from 'metro';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const entry = 'src/index.js';
const packages = [
  ...readFileSync(path.join(projectRoot, entry), 'utf8').matchAll(/^import '(.+)';$/gm),
].map(m => m[1]);

let bundled = new Set();
// metro.config.js is the config we recommend to apps; the rest is test harness.
const config = mergeConfig(
  await Metro.loadConfig({ config: path.join(projectRoot, 'metro.config.js') }),
  {
    // The linked packages resolve from their real paths inside the repo.
    watchFolders: [path.resolve(projectRoot, '../../..')],
    resolver: {
      // Babel injects @babel/runtime imports into the linked packages' files.
      nodeModulesPaths: [path.join(projectRoot, 'node_modules')],
    },
    serializer: {
      // Only resolution is under test, so leave out React Native's own runtime.
      getModulesRunBeforeMainModule: () => [],
      getPolyfills: () => [],
      processModuleFilter: module => {
        bundled.add(module.path);
        return true;
      },
    },
    reporter: { update() {} },
    resetCache: true,
  }
);

const failures = [];
for (const platform of ['ios', 'android']) {
  bundled = new Set();
  try {
    await Metro.runBuild(config, { entry, platform, minify: false });
  } catch (err) {
    failures.push(`${platform}: build failed: ${err.message.split('\n')[0]}`);
    continue;
  }
  for (const file of bundled) {
    if (/[\\/]dist[\\/]platform[\\/]node[\\/]/.test(file)) {
      failures.push(`${platform}: bundled node implementation ${file}`);
    }
  }
  for (const name of packages) {
    const browserDir = path.join(
      realpathSync(path.join(projectRoot, 'node_modules', name)),
      'dist/platform/browser/'
    );
    if (![...bundled].some(file => file.startsWith(browserDir))) {
      failures.push(`${platform}: ${name} bundled no browser implementation`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('metro build succeeded for ios and android with browser implementations');
