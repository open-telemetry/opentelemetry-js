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

import { ReadableSpan } from '@opentelemetry/tracing';
import * as assert from 'assert';
import { SpanAttributes, SpanNames } from '../src/enum';

export function assertResolveSpan(
  span: ReadableSpan,
  fieldName: string,
  fieldPath: string,
  fieldType: string,
  source: string,
  parentSpanId?: string
) {
  const attrs = span.attributes;
  assert.deepStrictEqual(span.name, SpanNames.RESOLVE);
  assert.deepStrictEqual(attrs[SpanAttributes.FIELD_NAME], fieldName);
  assert.deepStrictEqual(attrs[SpanAttributes.FIELD_PATH], fieldPath);
  assert.deepStrictEqual(attrs[SpanAttributes.FIELD_TYPE], fieldType);
  assert.deepStrictEqual(attrs[SpanAttributes.SOURCE], source);
  if (parentSpanId) {
    assert.deepStrictEqual(span.parentSpanId, parentSpanId);
  }
}
