/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
