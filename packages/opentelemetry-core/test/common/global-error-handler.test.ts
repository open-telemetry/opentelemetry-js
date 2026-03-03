/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { globalErrorHandler, setGlobalErrorHandler } from '../../src';
import { Exception } from '@opentelemetry/api';

describe('globalErrorHandler', () => {
  let defaultHandler: sinon.SinonSpy;

  beforeEach(() => {
    defaultHandler = sinon.spy();
    setGlobalErrorHandler(defaultHandler);
  });

  it('receives errors', () => {
    const err = new Error('this is bad');
    globalErrorHandler(err);
    sinon.assert.calledOnceWithExactly(defaultHandler, err);
  });

  it('replaces delegate when handler is updated', () => {
    const err = new Error('this is bad');
    const newHandler = sinon.spy();
    setGlobalErrorHandler(newHandler);

    globalErrorHandler(err);

    sinon.assert.calledOnceWithExactly(newHandler, err);
    sinon.assert.notCalled(defaultHandler);
  });

  it('catches exceptions thrown in handler', () => {
    setGlobalErrorHandler((ex: Exception) => {
      throw new Error('bad things');
    });

    assert.doesNotThrow(() => {
      globalErrorHandler('an error');
    });
  });
});
