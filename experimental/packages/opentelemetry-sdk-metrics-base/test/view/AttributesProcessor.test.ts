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
import { context } from '@opentelemetry/api';
import { NoopAttributesProcessor } from '../../src/view/AttributesProcessor';
import { FilteringAttributesProcessor } from '../../src/view/AttributesProcessor';

describe('NoopAttributesProcessor', () => {
  const processor = new NoopAttributesProcessor();

  it('should return identical attributes on process', () => {
    assert.deepStrictEqual(
      processor.process({ foo: 'bar' }, context.active()),
      {
        foo: 'bar',
      }
    );
  });
});

describe('FilteringAttributesProcessor', () => {
  it('should not add keys when attributes do not exist', () => {
    const processor = new FilteringAttributesProcessor(['foo', 'bar']);
    assert.deepStrictEqual(
      processor.process({}, context.active()), {});
  });

  it('should only keep allowed attributes', () => {
    const processor = new FilteringAttributesProcessor(['foo', 'bar']);
    assert.deepStrictEqual(
      processor.process({
        foo: 'fooValue',
        bar: 'barValue',
        baz: 'bazValue'
      }, context.active()),
      {
        foo: 'fooValue',
        bar: 'barValue'
      });
  });
});
