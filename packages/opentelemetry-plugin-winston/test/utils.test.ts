/*!
 * Copyright 2019, OpenTelemetry Authors
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

import * as types from '@opentelemetry/types';
import * as sinon from 'sinon';
import { TRACE_PARAM_NAME, WinstonChunk } from '../src/types';
import * as utils from '../src/utils';

describe('utils', () => {
  describe('addTraceToChunk', () => {
    it('should add trace information to chunk', () => {
      const chunk: WinstonChunk = {
        foo: 'bar',
      };
      const span: types.Span = createTestSpan();
      const newChunk: WinstonChunk = utils.addTraceToChunk(chunk, span);
      assert.deepStrictEqual(newChunk, {
        foo: 'bar',
        [TRACE_PARAM_NAME]: {
          traceId: '1',
          spanId: '2',
        },
      });
    });
  });
  describe('processArgs', () => {
    it('should add trace when there are no extra params', () => {
      const args: any[] = [];
      const span: types.Span = createTestSpan();
      const processedArgs = utils.processArgs(args, span);
      assert.deepStrictEqual(processedArgs, [
        {
          [TRACE_PARAM_NAME]: {
            spanId: '2',
            traceId: '1',
          },
        },
      ]);
    });
    it('should add trace when there are no extra params and callback exists', () => {
      const callback = function() {};
      const args: any[] = [callback];
      const span: types.Span = createTestSpan();
      const processedArgs = utils.processArgs(args, span);
      assert.deepStrictEqual(processedArgs, [
        {
          [TRACE_PARAM_NAME]: {
            spanId: '2',
            traceId: '1',
          },
        },
        callback,
      ]);
    });
    it('should add trace when there are already extra params', () => {
      const args: any[] = ['foo', { foo1: 'bar' }];
      const span: types.Span = createTestSpan();
      const processedArgs = utils.processArgs(args, span);
      assert.deepStrictEqual(processedArgs, [
        'foo',
        {
          foo1: 'bar',
          [TRACE_PARAM_NAME]: {
            spanId: '2',
            traceId: '1',
          },
        },
      ]);
    });
    it(
      'should add trace when there are already extra params and callback' +
        ' exists',
      () => {
        const callback = function() {};
        const args: any[] = ['foo', { foo1: 'bar' }, callback];
        const span: types.Span = createTestSpan();
        const processedArgs = utils.processArgs(args, span);
        assert.deepStrictEqual(processedArgs, [
          'foo',
          {
            foo1: 'bar',
            [TRACE_PARAM_NAME]: {
              spanId: '2',
              traceId: '1',
            },
          },
          callback,
        ]);
      }
    );
  });
});

function createTestSpan() {
  const span: types.Span = {
    context: function() {
      return {
        traceId: '1',
        spanId: '2',
      };
    },
    setAttribute: sinon.spy(),
    setAttributes: sinon.spy(),
    addEvent: sinon.spy(),
    setStatus: sinon.spy(),
    updateName: sinon.spy(),
    end: sinon.spy(),
    isRecording: sinon.spy(),
  };
  return span;
}
