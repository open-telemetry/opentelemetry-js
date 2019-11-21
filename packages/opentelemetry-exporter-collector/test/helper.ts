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

import { ReadableSpan } from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as collectorTypes from '../src/types';

export const mockedReadableSpan: ReadableSpan = {
  name: 'documentFetch',
  kind: 0,
  spanContext: {
    traceId: '1f1008dc8e270e85c40a0d7c3939b278',
    spanId: '5e107261f64fa53e',
    traceFlags: 1,
  },
  parentSpanId: '78a8915098864388',
  startTime: [1574120165, 429803070],
  endTime: [1574120165, 438688070],
  status: { code: 0 },
  attributes: { component: 'document-load' },
  links: [],
  events: [
    { name: 'fetchStart', time: [1574120165, 429803070] },
    {
      name: 'domainLookupStart',
      time: [1574120165, 429803070],
    },
    { name: 'domainLookupEnd', time: [1574120165, 429803070] },
    {
      name: 'connectStart',
      time: [1574120165, 429803070],
    },
    { name: 'connectEnd', time: [1574120165, 429803070] },
    {
      name: 'requestStart',
      time: [1574120165, 435513070],
    },
    { name: 'responseStart', time: [1574120165, 436923070] },
    {
      name: 'responseEnd',
      time: [1574120165, 438688070],
    },
  ],
  duration: [0, 8885000],
};

export function ensureSpanIsCorrect(span: collectorTypes.Span) {
  const timeEvents: collectorTypes.TimeEvents =
    (span.timeEvents && span.timeEvents) || {};
  const timeEvent: collectorTypes.TimeEvent[] = timeEvents.timeEvent || [];

  assert.strictEqual(span.traceId, 'HxAI3I4nDoXECg18OTmyeA==');
  assert.strictEqual(span.spanId, 'XhByYfZPpT4=');
  assert.strictEqual(span.parentSpanId, 'eKiRUJiGQ4g=');
  assert.deepStrictEqual(span.tracestate, {});
  assert.strictEqual(span.name && span.name.value, 'documentFetch');
  assert.strictEqual(span.name && span.name.truncatedByteCount, 0);
  assert.strictEqual(span.kind, 0);
  assert.strictEqual(span.startTime, '2019-11-18T23:36:05.429803070Z');
  assert.strictEqual(span.endTime, '2019-11-18T23:36:05.438688070Z');
  assert.strictEqual(timeEvents.droppedAnnotationsCount, 0);
  assert.strictEqual(timeEvents.droppedMessageEventsCount, 0);
  assert.deepStrictEqual(span.status, { code: 0 });
  assert.strictEqual(span.sameProcessAsParentSpan, true);

  assert.strictEqual(timeEvent.length, 8);
  const timeEvent1 = timeEvent[0];
  assert.deepStrictEqual(timeEvent1, {
    time: '2019-11-18T23:36:05.429803070Z',
    annotation: {
      description: { value: 'fetchStart', truncatedByteCount: 0 },
    },
  });
}
