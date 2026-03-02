/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import {
  InstrumentationBase,
  InstrumentationConfig,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
} from '../../src';

class TestInstrumentationSimple extends InstrumentationBase {
  constructor(config: InstrumentationConfig) {
    super('test-scoped-package-instrumentation', '0.0.1', config);
  }
  init() {
    return new InstrumentationNodeModuleDefinition(
      '@opentelemetry/scoped-test-module',
      ['*'],
      moduleExports => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        moduleExports.propertyOnMainModule = 'modified string in main module';
        return moduleExports;
      },
      moduleExports => {
        return moduleExports;
      },
      [
        new InstrumentationNodeModuleFile(
          '@opentelemetry/scoped-test-module/src/internal.js',
          ['*'],
          moduleExports => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore no types
            moduleExports.testString = 'modified internal string';
            return moduleExports;
          },
          moduleExports => {
            return moduleExports;
          }
        ),
      ]
    );
  }
}

describe('instrumenting a scoped package', function () {
  /**
   * On Windows, instrumentation would fail on internal files of scoped packages.
   * The reason: the path would include a '/' separator in the package name:
   * - actual:   @opentelemetry/scoped-test-module\src\internal.js
   * - expected: @opentelemetry\scoped-test-module\src\internal.js
   * This resulted in internal files of scoped packages not being instrumented.
   *
   * See https://github.com/open-telemetry/opentelemetry-js/issues/4436
   */
  it('should patch internal file and main module', function () {
    const instrumentation = new TestInstrumentationSimple({
      enabled: false,
    });
    instrumentation.enable();

    const { getString } = require('@opentelemetry/scoped-test-module');

    assert.strictEqual(getString(), 'from index.js: modified internal string');
  });

  /**
   * Normalizing everything passed to onRequire() from RequireInTheMiddleSingleton would cause main modules from a
   * scoped package not to be instrumented.
   * The reason: we'd check:
   * '@opentelemetry\scoped-test-module' === '@opentelemetry/scoped-test-module'
   *
   * then determine that since this evaluates to false, this is not the main module, and we'd never instrument it.
   *
   * Therefore, the fix to the above test (internal files) is not to normalize everything passed to onRequire()
   */
  it('should patch main module', function () {
    const instrumentation = new TestInstrumentationSimple({
      enabled: false,
    });
    instrumentation.enable();

    const {
      propertyOnMainModule,
    } = require('@opentelemetry/scoped-test-module');

    assert.strictEqual(propertyOnMainModule, 'modified string in main module');
  });
});
