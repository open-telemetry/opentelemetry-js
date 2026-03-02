/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogger, DiagLogLevel } from '../../../src';

class SpyLogger implements DiagLogger {
  debug() {}
  error() {}
  info() {}
  warn() {}
  verbose() {}
}

const loggerFunctions = ['verbose', 'debug', 'info', 'warn', 'error'];

describe('ComponentLogger', function () {
  let logger: DiagLogger;

  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    logger = new SpyLogger();
    sandbox.spy(logger);
    diag.setLogger(logger, DiagLogLevel.ALL);
    // clean any messages up that might be there from the registration
    sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  loggerFunctions.forEach(name => {
    const fName = name as keyof SpyLogger;
    it(`should call global logger function "${name}" with namespace as first param`, function () {
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
