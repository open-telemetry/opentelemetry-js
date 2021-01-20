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
import { getLogger } from '../../src/trace/getLogger';
import { Logger } from '../../src/common/Logger';

describe('logger', () => {
  it('getLogger should return a default noop instance', () => {
    const logger = getLogger() as any;
    assert.ok(logger, 'A logger should have been returned');
    assert.ok(
      typeof logger.debug === 'function',
      'Logger should provide a debug function'
    );
    assert.ok(
      typeof logger.info === 'function',
      'Logger should provide a info function'
    );
    assert.ok(
      typeof logger.warn === 'function',
      'Logger should provide a warn function'
    );
    assert.ok(
      typeof logger.error === 'function',
      'Logger should provide a error function'
    );

    assert.doesNotThrow(
      logger.debug,
      "Calling the debug function doesn't throw"
    );
    assert.doesNotThrow(
      logger.info,
      "Calling the debug function doesn't throw"
    );
    assert.doesNotThrow(
      logger.warn,
      "Calling the debug function doesn't throw"
    );
    assert.doesNotThrow(
      logger.error,
      "Calling the debug function doesn't throw"
    );
  });

  it('getLogger with explicit null should return a default noop instance', () => {
    const logger = getLogger(null) as any;
    assert.ok(logger, 'A logger should have been returned');
    assert.ok(
      typeof logger.debug === 'function',
      'Logger should provide a debug function'
    );
    assert.ok(
      typeof logger.info === 'function',
      'Logger should provide a info function'
    );
    assert.ok(
      typeof logger.warn === 'function',
      'Logger should provide a warn function'
    );
    assert.ok(
      typeof logger.error === 'function',
      'Logger should provide a error function'
    );

    assert.doesNotThrow(
      logger.debug,
      "Calling the debug function doesn't throw"
    );
    assert.doesNotThrow(
      logger.info,
      "Calling the debug function doesn't throw"
    );
    assert.doesNotThrow(
      logger.warn,
      "Calling the debug function doesn't throw"
    );
    assert.doesNotThrow(
      logger.error,
      "Calling the debug function doesn't throw"
    );
  });

  it('getLogger with empty object should return a default noop instance', () => {
    const logger = getLogger({} as any) as any;
    assert.ok(logger, 'A logger should have been returned');
    assert.ok(
      typeof logger.debug === 'function',
      'Logger should provide a debug function'
    );
    assert.ok(
      typeof logger.info === 'function',
      'Logger should provide a info function'
    );
    assert.ok(
      typeof logger.warn === 'function',
      'Logger should provide a warn function'
    );
    assert.ok(
      typeof logger.error === 'function',
      'Logger should provide a error function'
    );

    assert.doesNotThrow(
      logger.debug,
      "Calling the debug function doesn't throw"
    );
    assert.doesNotThrow(
      logger.info,
      "Calling the debug function doesn't throw"
    );
    assert.doesNotThrow(
      logger.warn,
      "Calling the debug function doesn't throw"
    );
    assert.doesNotThrow(
      logger.error,
      "Calling the debug function doesn't throw"
    );
  });

  it('getLogger with valid logger passed should return that logger', () => {
    let debugCalled = 0;
    let infoCalled = 0;
    let warnCalled = 0;
    let errorCalled = 0;
    const dummyLogger: Logger = {
      debug: () => {
        debugCalled++;
      },
      info: () => {
        infoCalled++;
      },
      warn: () => {
        warnCalled++;
      },
      error: () => {
        errorCalled++;
      },
    };
    const logger = getLogger(dummyLogger) as any;
    assert.strictEqual(
      logger,
      dummyLogger,
      'The passed in logger should have been returned'
    );

    assert.strictEqual(debugCalled, 0);
    assert.strictEqual(infoCalled, 0);
    assert.strictEqual(warnCalled, 0);
    assert.strictEqual(errorCalled, 0);

    logger.debug('debug log');
    assert.strictEqual(debugCalled, 1);
    assert.strictEqual(infoCalled, 0);
    assert.strictEqual(warnCalled, 0);
    assert.strictEqual(errorCalled, 0);

    logger.info('info log');
    assert.strictEqual(debugCalled, 1);
    assert.strictEqual(infoCalled, 1);
    assert.strictEqual(warnCalled, 0);
    assert.strictEqual(errorCalled, 0);

    logger.warn('warn log');
    assert.strictEqual(debugCalled, 1);
    assert.strictEqual(infoCalled, 1);
    assert.strictEqual(warnCalled, 1);
    assert.strictEqual(errorCalled, 0);

    logger.error('error log');
    assert.strictEqual(debugCalled, 1);
    assert.strictEqual(infoCalled, 1);
    assert.strictEqual(warnCalled, 1);
    assert.strictEqual(errorCalled, 1);
  });

  it('getLogger with missing debug function should still return a default noop instance', () => {
    let infoCalled = 0;
    let warnCalled = 0;
    let errorCalled = 0;
    const dummyLogger = {
      info: () => {
        infoCalled++;
      },
      warn: () => {
        warnCalled++;
      },
      error: () => {
        errorCalled++;
      },
    };
    const logger = getLogger(dummyLogger as any) as any;

    assert.strictEqual(infoCalled, 0);
    assert.strictEqual(warnCalled, 0);
    assert.strictEqual(errorCalled, 0);

    logger.debug('debug log');
    logger.info('info log');
    logger.warn('warn log');
    logger.error('error log');

    assert.strictEqual(infoCalled, 0);
    assert.strictEqual(warnCalled, 0);
    assert.strictEqual(errorCalled, 0);

    assert.notStrictEqual(
      logger,
      dummyLogger,
      'The passed in logger should have been returned'
    );
  });

  it('getLogger with missing info function should still return a default noop instance', () => {
    let debugCalled = 0;
    let warnCalled = 0;
    let errorCalled = 0;
    const dummyLogger = {
      debug: () => {
        debugCalled++;
      },
      warn: () => {
        warnCalled++;
      },
      error: () => {
        errorCalled++;
      },
    };
    const logger = getLogger(dummyLogger as any) as any;

    assert.strictEqual(debugCalled, 0);
    assert.strictEqual(warnCalled, 0);
    assert.strictEqual(errorCalled, 0);

    logger.debug('debug log');
    logger.info('info log');
    logger.warn('warn log');
    logger.error('error log');

    assert.strictEqual(debugCalled, 0);
    assert.strictEqual(warnCalled, 0);
    assert.strictEqual(errorCalled, 0);

    assert.notStrictEqual(
      logger,
      dummyLogger,
      'The passed in logger should have been returned'
    );
  });

  it('getLogger with missing warn function should still return a default noop instance', () => {
    let debugCalled = 0;
    let infoCalled = 0;
    let errorCalled = 0;
    const dummyLogger = {
      debug: () => {
        debugCalled++;
      },
      info: () => {
        infoCalled++;
      },
      error: () => {
        errorCalled++;
      },
    };
    const logger = getLogger(dummyLogger as any) as any;

    assert.strictEqual(debugCalled, 0);
    assert.strictEqual(infoCalled, 0);
    assert.strictEqual(errorCalled, 0);

    logger.debug('debug log');
    logger.info('info log');
    logger.warn('warn log');
    logger.error('error log');

    assert.strictEqual(debugCalled, 0);
    assert.strictEqual(infoCalled, 0);
    assert.strictEqual(errorCalled, 0);

    assert.notStrictEqual(
      logger,
      dummyLogger,
      'The passed in logger should have been returned'
    );
  });

  it('getLogger with missing error function should still return a default noop instance', () => {
    let debugCalled = 0;
    let infoCalled = 0;
    let warnCalled = 0;
    const dummyLogger = {
      debug: () => {
        debugCalled++;
      },
      info: () => {
        infoCalled++;
      },
      warn: () => {
        warnCalled++;
      },
    };
    const logger = getLogger(dummyLogger as any) as any;

    assert.strictEqual(debugCalled, 0);
    assert.strictEqual(infoCalled, 0);
    assert.strictEqual(warnCalled, 0);

    logger.debug('debug log');
    logger.info('info log');
    logger.warn('warn log');
    logger.error('error log');

    assert.strictEqual(debugCalled, 0);
    assert.strictEqual(infoCalled, 0);
    assert.strictEqual(warnCalled, 0);

    assert.notStrictEqual(
      logger,
      dummyLogger,
      'The passed in logger should have been returned'
    );
  });
});
