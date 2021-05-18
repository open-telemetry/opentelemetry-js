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
import * as sinon from 'sinon';
import { diag, DiagLogger, DiagLogLevel } from '../../src';

class SpyLogger implements DiagLogger {
  debug() {}

  error() {}

  info() {}

  warn() {}

  verbose() {}
}

const loggerFunctions = ['verbose', 'debug', 'info', 'warn', 'error'];

describe('ComponentLogger', () => {
  let logger: DiagLogger;

  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    logger = new SpyLogger();
    sandbox.spy(logger);
    diag.setLogger(logger, DiagLogLevel.ALL);
  });

  afterEach(() => {
    sandbox.restore();
  });

  loggerFunctions.forEach(name => {
    const fName = name as keyof SpyLogger;
    it(`should call global logger function "${name}" with namespace as first param`, () => {
      const componentLogger = diag.createComponentLogger({ namespace: 'foo' });
      componentLogger[fName]('test');

      assert.strictEqual((logger[fName] as sinon.SinonSpy).callCount, 1);
      assert.deepStrictEqual((logger[fName] as sinon.SinonSpy).args[0], [
        'foo',
        'test',
      ]);
    });
  });
});
