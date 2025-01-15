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
import { Attributes, context } from '@opentelemetry/api';
import {
  IAttributesProcessor,
  createMultiAttributesProcessor,
  createNoopAttributesProcessor,
  createAllowListAttributesProcessor,
  createDenyListAttributesProcessor,
} from '../../src/view/AttributesProcessor';

import * as sinon from 'sinon';

describe('NoopAttributesProcessor', () => {
  const processor = createNoopAttributesProcessor();

  it('should return identical attributes on process', () => {
    assert.deepStrictEqual(
      processor.process({ foo: 'bar' }, context.active()),
      {
        foo: 'bar',
      }
    );
  });
});

describe('AllowListProcessor', () => {
  it('should not add keys when attributes do not exist', () => {
    const processor = createAllowListAttributesProcessor(['foo', 'bar']);
    assert.deepStrictEqual(processor.process({}, context.active()), {});
  });

  it('should only keep allowed attributes', () => {
    const processor = createAllowListAttributesProcessor(['foo', 'bar']);
    assert.deepStrictEqual(
      processor.process(
        {
          foo: 'fooValue',
          bar: 'barValue',
          baz: 'bazValue',
        },
        context.active()
      ),
      {
        foo: 'fooValue',
        bar: 'barValue',
      }
    );
  });
});

describe('DenyListProcessor', () => {
  it('should drop denie attributes', () => {
    const processor = createDenyListAttributesProcessor(['foo', 'bar']);
    assert.deepStrictEqual(
      processor.process(
        {
          foo: 'fooValue',
          bar: 'barValue',
          baz: 'bazValue',
        },
        context.active()
      ),
      {
        baz: 'bazValue',
      }
    );
  });
});

describe('MultiAttributesProcessor', () => {
  it('should apply in order', () => {
    // arrange
    const firstProcessorOutput: Attributes = { foo: 'firstProcessorFoo' };
    const secondProcessorOutput: Attributes = {
      foo: 'secondProcessorFoo',
      bar: 'secondProcessorBar',
    };
    const firstMockProcessorStubs = {
      process: sinon.stub().returns(firstProcessorOutput),
    };
    const firstMockProcessor = firstMockProcessorStubs as IAttributesProcessor;

    const secondMockProcessorStubs = {
      process: sinon.stub().returns(secondProcessorOutput),
    };
    const secondMockProcessor =
      secondMockProcessorStubs as IAttributesProcessor;

    const processor = createMultiAttributesProcessor([
      firstMockProcessor,
      secondMockProcessor,
    ]);

    // act
    const input: Attributes = { foo: 'bar' };
    const result = processor.process(input, context.active());

    // assert
    firstMockProcessorStubs.process.calledOnceWithExactly(
      input,
      context.active()
    );
    secondMockProcessorStubs.process.calledOnceWithExactly(
      firstProcessorOutput,
      context.active()
    );
    assert.deepStrictEqual(result, secondProcessorOutput);
  });
});
