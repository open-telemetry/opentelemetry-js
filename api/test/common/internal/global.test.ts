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
import { getGlobal } from '../../../src/internal/global-utils';
import { _globalThis } from '../../../src/platform';
import { NoopContextManager } from '../../../src/context/NoopContextManager';
import { DiagLogLevel } from '../../../src/diag/types';

const api1 = require('../../../src') as typeof import('../../../src');

// clear cache and load a second instance of the api
for (const key of Object.keys(require.cache)) {
  delete require.cache[key];
}
const api2 = require('../../../src') as typeof import('../../../src');

// This will need to be changed manually on major version changes.
// It is intentionally not autogenerated to ensure the author of the change is aware of what they are doing.
const GLOBAL_API_SYMBOL_KEY = 'opentelemetry.js.api.1';

const getMockLogger = () => ({
  verbose: sinon.spy(),
  debug: sinon.spy(),
  info: sinon.spy(),
  warn: sinon.spy(),
  error: sinon.spy(),
});

describe('Global Utils', function() {
  // prove they are separate instances
  assert.notEqual(api1, api2);
  // that return separate noop instances to start
  assert.notStrictEqual(
    api1.context['_getContextManager'](),
    api2.context['_getContextManager']()
  );

  beforeEach(() => {
    api1.context.disable();
    api1.propagation.disable();
    api1.trace.disable();
    api1.diag.disable();
    // @ts-expect-error we are modifying internals for testing purposes here
    delete _globalThis[Symbol.for(GLOBAL_API_SYMBOL_KEY)];
  });

  it('should change the global context manager', function() {
    const original = api1.context['_getContextManager']();
    const newContextManager = new NoopContextManager();
    api1.context.setGlobalContextManager(newContextManager);
    assert.notStrictEqual(api1.context['_getContextManager'](), original);
    assert.strictEqual(api1.context['_getContextManager'](), newContextManager);
  });

  it('should load an instance from one which was set in the other', function() {
    api1.context.setGlobalContextManager(new NoopContextManager());
    assert.strictEqual(
      api1.context['_getContextManager'](),
      api2.context['_getContextManager']()
    );
  });

  it('should disable both if one is disabled', function() {
    const manager = new NoopContextManager();
    api1.context.setGlobalContextManager(manager);

    assert.strictEqual(manager, api1.context['_getContextManager']());
    api2.context.disable();
    assert.notStrictEqual(manager, api1.context['_getContextManager']());
  });

  it('should not register if the version is a mismatch', function() {
    const logger1 = getMockLogger();
    const logger2 = getMockLogger();

    api1.diag.setLogger(logger1);
    const globalInstance = getGlobal('diag');
    assert.ok(globalInstance);
    // @ts-expect-error we are modifying internals for testing purposes here
    _globalThis[Symbol.for(GLOBAL_API_SYMBOL_KEY)].version = '0.0.1';

    assert.equal(false, api1.diag.setLogger(logger2)); // won't happen

    api1.diag.info('message');
    sinon.assert.notCalled(logger2.error);
    sinon.assert.notCalled(logger2.info);
    sinon.assert.notCalled(logger2.warn);
  });

  it('should debug log registrations', function() {
    const logger = getMockLogger();
    api1.diag.setLogger(logger, DiagLogLevel.DEBUG);

    const newContextManager = new NoopContextManager();
    api1.context.setGlobalContextManager(newContextManager);

    sinon.assert.calledWith(logger.debug, sinon.match(/global for context/));
    sinon.assert.calledWith(logger.debug, sinon.match(/global for diag/));
    sinon.assert.calledTwice(logger.debug);
  });

  it('should log an error if there is a duplicate registration', function() {
    const logger = getMockLogger();
    api1.diag.setLogger(logger);

    api1.context.setGlobalContextManager(new NoopContextManager());
    api1.context.setGlobalContextManager(new NoopContextManager());

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.args.length, 1);
    assert.ok(
      logger.error.firstCall.args[0].startsWith(
        'Error: @opentelemetry/api: Attempted duplicate registration of API: context'
      )
    );
  });

  it('should allow duplicate registration of the diag logger', function() {
    const logger1 = getMockLogger();
    const logger2 = getMockLogger();

    api1.diag.setLogger(logger1);
    api1.diag.setLogger(logger2);

    const MSG = '__log message__';
    api1.diag.info(MSG);

    sinon.assert.notCalled(logger1.error);
    sinon.assert.notCalled(logger1.info);
    sinon.assert.calledOnce(logger1.warn);
    sinon.assert.calledWith(logger1.warn, sinon.match(/will be overwritten/i));

    sinon.assert.notCalled(logger2.error);
    sinon.assert.calledOnce(logger2.warn);
    sinon.assert.calledWith(logger2.warn, sinon.match(/will overwrite/i));
    sinon.assert.calledOnce(logger2.info);
    sinon.assert.calledWith(logger2.info, MSG);
  });
});
