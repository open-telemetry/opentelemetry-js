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
