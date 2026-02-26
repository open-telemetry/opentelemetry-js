/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { ErrorHandler, loggingErrorHandler } from '../../src';

describe('loggingErrorHandler', () => {
  let handler: ErrorHandler;
  const errorStub = sinon.fake();

  beforeEach(() => {
    handler = loggingErrorHandler();
    diag.setLogger({
      error: errorStub,
    } as any);
  });

  it('logs from string', () => {
    const err = 'not found';
    handler(err);
    assert.ok(errorStub.calledOnceWith(err));
  });

  it('logs from an object', () => {
    const err = {
      name: 'NotFoundError',
      message: 'not found',
      randomString: 'random value',
      randomNumber: 42,
      randomArray: [1, 2, 3],
      randomObject: { a: 'a' },
      stack: 'a stack',
    };

    handler(err);

    const [result] = errorStub.lastCall.args;

    assert.ok(result.includes(err.name));
    assert.ok(result.includes(err.message));
    assert.ok(result.includes(err.randomString));
    assert.ok(result.includes(err.randomNumber));
    assert.ok(result.includes(err.randomArray));
    assert.ok(result.includes(err.randomObject));
    assert.ok(result.includes(JSON.stringify(err.stack)));
  });

  it('logs from an error', () => {
    const err = new Error('this is bad');

    handler(err);

    const [result] = errorStub.lastCall.args;

    assert.ok(result.includes(err.name));
    assert.ok(result.includes(err.message));
    assert.ok(result.includes(JSON.stringify(err.stack)));
  });
});
