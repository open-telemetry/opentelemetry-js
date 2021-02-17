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
