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
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import { createExportTraceServiceRequest, ESpanKind, EStatusCode } from '../src';

describe('Trace', () => {
  describe('createExportTraceServiceRequest', () => {
    let resource: Resource;
    let span: ReadableSpan;
    let expectedSpanJson: any;

    beforeEach(() => {
      resource = new Resource({
        'resource-attribute': 'resource attribute value',
      });
      span = {
        spanContext: () => ({
          spanId: '0000000000000002',
          traceFlags: 1,
          traceId: '00000000000000000000000000000001',
          isRemote: false,
          traceState: new TraceState(''),
        }),
        parentSpanId: '0000000000000001',
        attributes: { 'string-attribute': 'some attribute value' },
        duration: [1, 300000000],
        endTime: [1640715558, 642725388],
        ended: true,
        events: [
          {
            name: 'some event',
            time: [1640715558, 542725388],
            attributes: {
              'event-attribute': 'some string value'
            }
          }
        ],
        instrumentationLibrary: {
          name: 'myLib',
          version: '0.1.0',
          schemaUrl: 'http://url.to.schema',
        },
        kind: SpanKind.CLIENT,
        links: [
          {
            context: {
              spanId: '0000000000000003',
              traceId: '00000000000000000000000000000002',
              traceFlags: 1,
              isRemote: false,
              traceState: new TraceState('')
            },
            attributes: {
              'link-attribute': 'string value'
            }
          }
        ],
        name: 'span-name',
        resource,
        startTime: [1640715557, 342725388],
        status: {
          code: SpanStatusCode.OK,
        },
      };

      expectedSpanJson = {
        resourceSpans: [
          {
            resource: {
              attributes: [
                {
                  key: 'resource-attribute',
                  value: { stringValue: 'resource attribute value' },
                },
              ],
              droppedAttributesCount: 0,
            },
            schemaUrl: undefined,
            instrumentationLibrarySpans: [
              {
                instrumentationLibrary: { name: 'myLib', version: '0.1.0' },
                spans: [
                  {
                    traceId: '00000000000000000000000000000001',
                    spanId: '0000000000000002',
                    parentSpanId: '0000000000000001',
                    name: 'span-name',
                    kind: ESpanKind.SPAN_KIND_CLIENT,
                    links: [
                      {
                        droppedAttributesCount: 0,
                        spanId: '0000000000000003',
                        traceId: '00000000000000000000000000000002',
                        attributes: [
                          {
                            key: 'link-attribute',
                            value: {
                              stringValue: 'string value'
                            }
                          }
                        ]
                      }
                    ],
                    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
                    startTimeUnixNano: 1640715557342725388,
                    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
                    endTimeUnixNano: 1640715558642725388,
                    events: [
                      {
                        droppedAttributesCount: 0,
                        attributes: [
                          {
                            key: 'event-attribute',
                            value: {
                              stringValue: 'some string value'
                            }
                          }
                        ],
                        name: 'some event',
                        timeUnixNano: 1640715558542725400
                      }
                    ],
                    attributes: [
                      {
                        key: 'string-attribute',
                        value: { stringValue: 'some attribute value' },
                      },
                    ],
                    droppedAttributesCount: 0,
                    droppedEventsCount: 0,
                    droppedLinksCount: 0,
                    status: {
                      code: EStatusCode.STATUS_CODE_OK,
                      message: undefined,
                    },
                  },
                ],
                schemaUrl: 'http://url.to.schema',
              },
            ],
          },
        ],
      };
    });

    it('returns null on an empty list', () => {
      assert.deepStrictEqual(createExportTraceServiceRequest([]), { resourceSpans: [] });
    });

    it('serializes a span', () => {
      const exportRequest = createExportTraceServiceRequest([span]);
      assert.ok(exportRequest);
      assert.deepStrictEqual(exportRequest, expectedSpanJson);
    });

    it('serializes a span', () => {
      const exportRequest = createExportTraceServiceRequest([span]);
      assert.ok(exportRequest);
      assert.deepStrictEqual(exportRequest, expectedSpanJson);
    });

    it('serializes a span without a parent', () => {
      (span as any).parentSpanId = undefined;
      const exportRequest = createExportTraceServiceRequest([span]);
      assert.ok(exportRequest);
      assert.strictEqual(exportRequest.resourceSpans?.[0].instrumentationLibrarySpans[0].spans?.[0].parentSpanId, undefined);

    });

    describe('status code', () => {
      it('error', () => {
        span.status.code = SpanStatusCode.ERROR;
        span.status.message = 'error message';
        const exportRequest = createExportTraceServiceRequest([span]);
        assert.ok(exportRequest);
        const spanStatus = exportRequest.resourceSpans?.[0].instrumentationLibrarySpans[0].spans?.[0].status;
        assert.strictEqual(spanStatus?.code, EStatusCode.STATUS_CODE_ERROR);
        assert.strictEqual(spanStatus?.message, 'error message');
      });

      it('unset', () => {
        span.status.code = SpanStatusCode.UNSET;
        const exportRequest = createExportTraceServiceRequest([span]);
        assert.ok(exportRequest);
        assert.strictEqual(exportRequest.resourceSpans?.[0].instrumentationLibrarySpans[0].spans?.[0].status.code, EStatusCode.STATUS_CODE_UNSET);
      });
    });

    describe('span kind', () => {
      it('consumer', () => {
        (span as any).kind = SpanKind.CONSUMER;
        const exportRequest = createExportTraceServiceRequest([span]);
        assert.ok(exportRequest);
        assert.strictEqual(exportRequest.resourceSpans?.[0].instrumentationLibrarySpans[0].spans?.[0].kind, ESpanKind.SPAN_KIND_CONSUMER);
      });
      it('internal', () => {
        (span as any).kind = SpanKind.INTERNAL;
        const exportRequest = createExportTraceServiceRequest([span]);
        assert.ok(exportRequest);
        assert.strictEqual(exportRequest.resourceSpans?.[0].instrumentationLibrarySpans[0].spans?.[0].kind, ESpanKind.SPAN_KIND_INTERNAL);
      });
      it('producer', () => {
        (span as any).kind = SpanKind.PRODUCER;
        const exportRequest = createExportTraceServiceRequest([span]);
        assert.ok(exportRequest);
        assert.strictEqual(exportRequest.resourceSpans?.[0].instrumentationLibrarySpans[0].spans?.[0].kind, ESpanKind.SPAN_KIND_PRODUCER);
      });
      it('server', () => {
        (span as any).kind = SpanKind.SERVER;
        const exportRequest = createExportTraceServiceRequest([span]);
        assert.ok(exportRequest);
        assert.strictEqual(exportRequest.resourceSpans?.[0].instrumentationLibrarySpans[0].spans?.[0].kind, ESpanKind.SPAN_KIND_SERVER);
      });
      it('unspecified', () => {
        (span as any).kind = undefined;
        const exportRequest = createExportTraceServiceRequest([span]);
        assert.ok(exportRequest);
        assert.strictEqual(exportRequest.resourceSpans?.[0].instrumentationLibrarySpans[0].spans?.[0].kind, ESpanKind.SPAN_KIND_UNSPECIFIED);
      });
    });
  });
});
