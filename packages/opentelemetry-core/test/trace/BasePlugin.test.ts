/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BasePlugin, NoopTracer, NoopLogger } from '../../src';
import * as assert from 'assert';
import * as path from 'path';

const tracer = new NoopTracer();
const logger = new NoopLogger();

describe('BasePlugin', () => {
  describe('internalFilesLoader', () => {
    it('should load internally exported files', async () => {
      const testPackage = await import(basedir);
      const plugin = new TestPlugin();
      plugin.enable(testPackage, tracer, logger, { basedir });
      assert.ok(plugin['_internalFilesExports']);
      assert.strictEqual(
        plugin['_internalFilesExports'].internal.internallyExportedFunction(),
        true
      );
      assert.strictEqual(
        plugin['_internalFilesExports'].expectUndefined,
        undefined
      );
      assert.strictEqual(
        (plugin['_moduleExports']!['externallyExportedFunction'] as Function)(),
        true
      );
    });
  });
});

class TestPlugin extends BasePlugin<{ [key: string]: Function }> {
  readonly moduleName = 'test-package';
  readonly version = '0.0.1';

  protected readonly _internalFilesList = {
    '0.0.1': {
      internal: 'foo/bar/internal.js',
    },
    '^1.0.0': {
      expectUndefined: 'foo/bar/internal.js',
    },
  };

  protected patch(): { [key: string]: Function } {
    return this._moduleExports;
  }
  protected unpatch(): void {}
}

const basedir = path.dirname(require.resolve('./fixtures/test-package'));
