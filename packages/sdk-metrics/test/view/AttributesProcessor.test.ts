/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type { Attributes } from '@opentelemetry/api';
import { context } from '@opentelemetry/api';
import type { IAttributesProcessor } from '../../src/view/AttributesProcessor';
import {
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

  it('should support * wildcard to match zero or more characters', () => {
    const processor = createAllowListAttributesProcessor([
      'http.request.header.*',
    ]);
    assert.deepStrictEqual(
      processor.process(
        {
          'http.request.header.content-type': 'application/json',
          'http.request.header.': 'edgeCase',
          'http.response.header.content-type': 'application/json',
        },
        context.active()
      ),
      {
        'http.request.header.content-type': 'application/json',
        'http.request.header.': 'edgeCase',
      }
    );
  });

  it('should support ? wildcard to match exactly one character', () => {
    const processor = createAllowListAttributesProcessor(['attr?']);
    assert.deepStrictEqual(
      processor.process(
        {
          attr1: 'a',
          attr2: 'b',
          attr10: 'c',
          attr: 'd',
        },
        context.active()
      ),
      {
        attr1: 'a',
        attr2: 'b',
      }
    );
  });

  it('should treat other regex meta characters as literal', () => {
    const processor = createAllowListAttributesProcessor(['a.b+c']);
    assert.deepStrictEqual(
      processor.process(
        {
          'a.b+c': 'kept',
          axbyc: 'dropped',
        },
        context.active()
      ),
      {
        'a.b+c': 'kept',
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

  it('should support wildcards when denying attributes', () => {
    const processor = createDenyListAttributesProcessor([
      '*.password',
      'temp_?',
    ]);
    assert.deepStrictEqual(
      processor.process(
        {
          'user.password': 'secret',
          'db.password': 'secret',
          username: 'kept',
          temp_1: 'dropped',
          temp_12: 'kept',
        },
        context.active()
      ),
      {
        username: 'kept',
        temp_12: 'kept',
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
