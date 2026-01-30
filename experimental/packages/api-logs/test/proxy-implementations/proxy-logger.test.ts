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
import { Logger, LoggerProvider } from '../../src';
import { NoopLogger } from '../../src/NoopLogger';
import { ProxyLogger } from '../../src/ProxyLogger';
import { ProxyLoggerProvider } from '../../src/ProxyLoggerProvider';

describe('ProxyLogger', () => {
  let provider: ProxyLoggerProvider;
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    provider = new ProxyLoggerProvider();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when no delegate is set', () => {
    it('should return proxy loggers', () => {
      const logger = provider.getLogger('test');
      assert.ok(logger instanceof ProxyLogger);
    });
  });

  describe('when delegate is set before getLogger', () => {
    let delegate: LoggerProvider;
    let getLoggerStub: sinon.SinonStub;

    beforeEach(() => {
      getLoggerStub = sandbox.stub().returns(new NoopLogger());
      delegate = {
        getLogger: getLoggerStub,
        forEntity(entity) {
          return this;
        },
      };
      provider._setDelegate(delegate);
    });

    it('should return loggers directly from the delegate', () => {
      const logger = provider.getLogger('test', 'v0');

      sandbox.assert.calledOnce(getLoggerStub);
      assert.strictEqual(getLoggerStub.firstCall.returnValue, logger);
      assert.deepStrictEqual(getLoggerStub.firstCall.args, [
        'test',
        'v0',
        undefined,
      ]);
    });

    it('should return loggers directly from the delegate with schema url', () => {
      const logger = provider.getLogger('test', 'v0', {
        schemaUrl: 'https://opentelemetry.io/schemas/1.7.0',
      });

      sandbox.assert.calledOnce(getLoggerStub);
      assert.strictEqual(getLoggerStub.firstCall.returnValue, logger);
      assert.deepStrictEqual(getLoggerStub.firstCall.args, [
        'test',
        'v0',
        { schemaUrl: 'https://opentelemetry.io/schemas/1.7.0' },
      ]);
    });
  });

  describe('when delegate is set after getLogger', () => {
    let logger: Logger;
    let delegateProvider: LoggerProvider;

    let delegateLogger: Logger;
    let emitCalled: boolean;

    beforeEach(() => {
      emitCalled = false;
      delegateLogger = {
        emit() {
          emitCalled = true;
        },
      };

      logger = provider.getLogger('test');

      delegateProvider = {
        getLogger() {
          return delegateLogger;
        },
        forEntity() {
          return this;
        },
      };
      provider._setDelegate(delegateProvider);
    });

    it('should emit from the delegate logger', () => {
      logger.emit({
        body: 'Test',
      });
      assert.ok(emitCalled);
    });
  });
});
