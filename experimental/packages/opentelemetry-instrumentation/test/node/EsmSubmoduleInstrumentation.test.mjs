/*
 * Copyright The OpenTelemetry Authors
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

import * as assert from 'assert';

import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
} from '../../build/src/index.js';

class TestInstrumentationSimple extends InstrumentationBase {
  constructor(config) {
    super('test-esm-submodule-exports', '0.0.1', config);
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition(
        '@opentelemetry/esm-submodule-exports',
        ['*'],
        moduleExports => {
          moduleExports.propertyOnMainModule = 'modified string in main module';
          return moduleExports;
        },
        moduleExports => {
          return moduleExports;
        },
        [
          new InstrumentationNodeModuleFile(
            '@opentelemetry/esm-submodule-exports/src/index.js',
            ['*'],
            moduleExports => {
            moduleExports.propertyOnMainModule = 'modified string in main module';
            return moduleExports;

            },
            moduleExports => {
              return moduleExports;
            }
          ),
        ]
      ),
      new InstrumentationNodeModuleDefinition(
        '@opentelemetry/esm-submodule-exports/sub',
        ['*'],
        moduleExports => {
          moduleExports.propertyOnSubModule = 'modified string in sub module';
          return moduleExports;
        },
        moduleExports => {
          return moduleExports;
        },
        [
          new InstrumentationNodeModuleFile(
            '@opentelemetry/esm-submodule-exports/sub',
            ['*'],
            moduleExports => {
              moduleExports.propertyOnSubModule = 'modified string in sub module';
              return moduleExports;
            },
            moduleExports => {
              return moduleExports;
            }
          ),
        ]
      )
    ];
  }
}

describe('instrumenting an esm scoped submodule package', function () {
  it('should patch main module', async function () {
    const instrumentation = new TestInstrumentationSimple({
      enabled: false,
    });
    instrumentation.enable();

    const {
      propertyOnMainModule,
    } = await import('@opentelemetry/esm-submodule-exports');

    assert.strictEqual(propertyOnMainModule, 'modified string in main module');
  });

  it('should patch sub module', async function () {
    const instrumentation = new TestInstrumentationSimple({
      enabled: false,
    });
    instrumentation.enable();

    const {
      propertyOnSubModule,
    } = await import('@opentelemetry/esm-submodule-exports/sub');

    assert.strictEqual(propertyOnSubModule, 'modified string in sub module');
  });
});
