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
import { diag, DiagLogLevel, getDiagLoggerFromConfig } from '../../src';
import { DiagLogger, diagLoggerFunctions } from '../../src/diag/logger';

describe('getDiagLoggerFromConfig', () => {
  const calledArgs: any = {
    terminal: null,
    critical: null,
    error: null,
    warn: null,
    info: null,
    debug: null,
    verbose: null,
    startupInfo: null,
  };

  let dummyLogger: DiagLogger;

  beforeEach(() => {
    // mock
    dummyLogger = {} as DiagLogger;
    diagLoggerFunctions.forEach(fName => {
      dummyLogger[fName] = (...args: unknown[]) => {
        calledArgs[fName] = args;
      };
    });
  });

  afterEach(() => {
    // restore
    diagLoggerFunctions.forEach(fName => {
      calledArgs[fName] = null;
    });
  });

  describe('constructor', () => {
    it('fallback to api.diag', () => {
      let logger = getDiagLoggerFromConfig();
      assert.deepStrictEqual(logger, diag);

      logger = getDiagLoggerFromConfig(null);
      assert.deepStrictEqual(logger, diag);

      logger = getDiagLoggerFromConfig(undefined);
      assert.deepStrictEqual(logger, diag);

      logger = getDiagLoggerFromConfig({});
      assert.deepStrictEqual(logger, diag);

      logger = getDiagLoggerFromConfig({
        diagLogger: (null as unknown) as DiagLogger,
      });
      assert.deepStrictEqual(logger, diag);

      logger = getDiagLoggerFromConfig({
        diagLogger: undefined,
      });
      assert.deepStrictEqual(logger, diag);
    });

    it('fallback via callback', () => {
      let logger = getDiagLoggerFromConfig(null, () => dummyLogger);
      assert.deepStrictEqual(logger, dummyLogger);

      logger = getDiagLoggerFromConfig(undefined, () => dummyLogger);
      assert.deepStrictEqual(logger, dummyLogger);

      logger = getDiagLoggerFromConfig({}, () => dummyLogger);
      assert.deepStrictEqual(logger, dummyLogger);

      logger = getDiagLoggerFromConfig(
        {
          diagLogger: (null as unknown) as DiagLogger,
        },
        () => dummyLogger
      );
      assert.deepStrictEqual(logger, dummyLogger);

      logger = getDiagLoggerFromConfig(
        {
          diagLogger: undefined,
        },
        () => dummyLogger
      );
      assert.deepStrictEqual(logger, dummyLogger);
    });

    diagLoggerFunctions.forEach(fName => {
      it(`should log with ${fName} message with no log level`, () => {
        const testConfig = {
          diagLogger: dummyLogger,
        };
        const testLogger = getDiagLoggerFromConfig(testConfig);
        testLogger[fName](`${fName} called %s`, 'param1');
        diagLoggerFunctions.forEach(lName => {
          if (fName === lName) {
            assert.deepStrictEqual(calledArgs[fName], [
              `${fName} called %s`,
              'param1',
            ]);
          } else {
            assert.strictEqual(calledArgs[lName], null);
          }
        });
      });

      it(`should log with ${fName} message with null log level`, () => {
        const testConfig = {
          diagLogger: dummyLogger,
          diagLogLevel: (null as unknown) as DiagLogLevel,
        };
        const testLogger = getDiagLoggerFromConfig(testConfig);
        testLogger[fName](`${fName} called %s`, 'param1');
        diagLoggerFunctions.forEach(lName => {
          if (fName === lName) {
            assert.deepStrictEqual(calledArgs[fName], [
              `${fName} called %s`,
              'param1',
            ]);
          } else {
            assert.strictEqual(calledArgs[lName], null);
          }
        });
      });

      it(`should log with ${fName} message with explicit undefined log level`, () => {
        const testConfig = {
          diagLogger: dummyLogger,
          diagLogLevel: undefined,
        };
        const testLogger = getDiagLoggerFromConfig(testConfig);
        testLogger[fName](`${fName} called %s`, 'param1');
        diagLoggerFunctions.forEach(lName => {
          if (fName === lName) {
            assert.deepStrictEqual(calledArgs[fName], [
              `${fName} called %s`,
              'param1',
            ]);
          } else {
            assert.strictEqual(calledArgs[lName], null);
          }
        });
      });
    });
  });
});
