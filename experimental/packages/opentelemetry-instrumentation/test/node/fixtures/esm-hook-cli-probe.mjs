/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
} from '../../../build/src/index.js';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const targetPath = path.join(dir, '../esm/test.mjs');

class TestInstrumentation extends InstrumentationBase {
  constructor() {
    super('test-esm-hook-cli', '0.0.1', { enabled: false });
  }
  init() {
    return new InstrumentationNodeModuleDefinition(
      targetPath,
      ['*'],
      undefined,
      undefined,
      [
        new InstrumentationNodeModuleFile(
          'test',
          ['*'],
          moduleExports => {
            this._wrap(moduleExports, 'testFunction', () => {
              return function wrappedTestFunction() {
                return 'patched';
              };
            });
            return moduleExports;
          },
          moduleExports => {
            this._unwrap(moduleExports, 'testFunction');
            return moduleExports;
          }
        ),
      ]
    );
  }
}

const instrumentation = new TestInstrumentation();
instrumentation.enable();
const { testFunction } = await import(pathToFileURL(targetPath).href);
process.stdout.write(`PROBE_RESULT=${testFunction()}\n`);
