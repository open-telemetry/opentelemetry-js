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
import * as root from '../src/generated/root';
import { SpanKind, SpanStatusCode, TraceFlags } from '@opentelemetry/api';
import { TraceState, hexToBinary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import {
  OtlpEncodingOptions,
  createExportTraceServiceRequest,
  ESpanKind,
  EStatusCode,
  ProtobufTraceSerializer,
  JsonTraceSerializer,
} from '../src';
import { toBase64 } from './utils';

function createExpectedSpanJson(options: OtlpEncodingOptions) {
  const useHex = options.useHex ?? false;
  const useLongBits = options.useLongBits ?? true;

  const startTime = useLongBits
    ? { low: 1155450124, high: 382008859 }
    : '1640715557342725388';
  const endTime = useLongBits
    ? { low: 2455450124, high: 382008859 }
    : '1640715558642725388';
  const eventTime = useLongBits
    ? { low: 2355450124, high: 382008859 }
    : '1640715558542725388';

  const traceId = useHex
    ? '00000000000000000000000000000001'
    : hexToBinary('00000000000000000000000000000001');
  const spanId = useHex ? '0000000000000002' : hexToBinary('0000000000000002');
  const parentSpanId = useHex
    ? '0000000000000001'
    : hexToBinary('0000000000000001');
  const linkSpanId = useHex
    ? '0000000000000003'
    : hexToBinary('0000000000000003');
  const linkTraceId = useHex
    ? '00000000000000000000000000000002'
    : hexToBinary('00000000000000000000000000000002');

  return {
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
        scopeSpans: [
          {
            scope: {
              name: 'myLib',
              version: '0.1.0',
            },
            spans: [
              {
                traceId: traceId,
                spanId: spanId,
                parentSpanId: parentSpanId,
                traceState: 'span=bar',
                name: 'span-name',
                kind: ESpanKind.SPAN_KIND_CLIENT,
                links: [
                  {
                    droppedAttributesCount: 0,
                    spanId: linkSpanId,
                    traceId: linkTraceId,
                    traceState: 'link=foo',
                    attributes: [
                      {
                        key: 'link-attribute',
                        value: {
                          stringValue: 'string value',
                        },
                      },
                    ],
                  },
                ],
                startTimeUnixNano: startTime,
                endTimeUnixNano: endTime,
                events: [
                  {
                    droppedAttributesCount: 0,
                    attributes: [
                      {
                        key: 'event-attribute',
                        value: {
                          stringValue: 'some string value',
                        },
                      },
                    ],
                    name: 'some event',
                    timeUnixNano: eventTime,
                  },
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
}

function createExpectedSpanProtobuf() {
  const startTime = 1640715557342725400;
  const endTime = 1640715558642725400;
  const eventTime = 1640715558542725400;

  const traceId = toBase64('00000000000000000000000000000001');
  const spanId = toBase64('0000000000000002');
  const parentSpanId = toBase64('0000000000000001');
  const linkSpanId = toBase64('0000000000000003');
  const linkTraceId = toBase64('00000000000000000000000000000002');

  return {
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
        scopeSpans: [
          {
            scope: { name: 'myLib', version: '0.1.0' },
            spans: [
              {
                traceId: traceId,
                spanId: spanId,
                traceState: 'span=bar',
                parentSpanId: parentSpanId,
                name: 'span-name',
                kind: ESpanKind.SPAN_KIND_CLIENT,
                links: [
                  {
                    droppedAttributesCount: 0,
                    spanId: linkSpanId,
                    traceId: linkTraceId,
                    traceState: 'link=foo',
                    attributes: [
                      {
                        key: 'link-attribute',
                        value: {
                          stringValue: 'string value',
                        },
                      },
                    ],
                  },
                ],
                startTimeUnixNano: startTime,
                endTimeUnixNano: endTime,
                events: [
                  {
                    droppedAttributesCount: 0,
                    attributes: [
                      {
                        key: 'event-attribute',
                        value: {
                          stringValue: 'some string value',
                        },
                      },
                    ],
                    name: 'some event',
                    timeUnixNano: eventTime,
                  },
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
                },
              },
            ],
            schemaUrl: 'http://url.to.schema',
          },
        ],
      },
    ],
  };
}

describe('Trace', () => {
  let resource: Resource;
  let span: ReadableSpan;

  beforeEach(() => {
    resource = new Resource({
      'resource-attribute': 'resource attribute value',
    });
    span = {
      spanContext: () => ({
        spanId: '0000000000000002',
        traceFlags: TraceFlags.SAMPLED,
        traceId: '00000000000000000000000000000001',
        isRemote: false,
        traceState: new TraceState('span=bar'),
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
            'event-attribute': 'some string value',
          },
        },
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
            traceFlags: TraceFlags.SAMPLED,
            isRemote: false,
            traceState: new TraceState('link=foo'),
          },
          attributes: {
            'link-attribute': 'string value',
          },
        },
      ],
      name: 'span-name',
      resource,
      startTime: [1640715557, 342725388],
      status: {
        code: SpanStatusCode.OK,
      },
      droppedAttributesCount: 0,
      droppedEventsCount: 0,
      droppedLinksCount: 0,
    };
  });

  describe('createExportTraceServiceRequest', () => {
    it('returns null on an empty list', () => {
      assert.deepStrictEqual(
        createExportTraceServiceRequest([], { useHex: true }),
        {
          resourceSpans: [],
        }
      );
    });

    it('serializes a span with useHex = true', () => {
      const exportRequest = createExportTraceServiceRequest([span], {
        useHex: true,
      });
      assert.ok(exportRequest);
      assert.deepStrictEqual(
        exportRequest,
        createExpectedSpanJson({ useHex: true })
      );
    });

    it('serializes a span with useHex = false', () => {
      const exportRequest = createExportTraceServiceRequest([span], {
        useHex: false,
      });
      assert.ok(exportRequest);
      assert.deepStrictEqual(
        exportRequest,
        createExpectedSpanJson({ useHex: false })
      );
    });

    it('serializes a span with string timestamps', () => {
      const options: OtlpEncodingOptions = { useLongBits: false };
      const exportRequest = createExportTraceServiceRequest([span], options);
      assert.ok(exportRequest);
      assert.deepStrictEqual(exportRequest, createExpectedSpanJson(options));
    });

    it('serializes a span without a parent with useHex = true', () => {
      (span as any).parentSpanId = undefined;
      const exportRequest = createExportTraceServiceRequest([span], {
        useHex: true,
      });
      assert.ok(exportRequest);
      assert.strictEqual(
        exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].parentSpanId,
        undefined
      );
    });

    it('serializes a span without a parent with useHex = false', () => {
      (span as any).parentSpanId = undefined;
      const exportRequest = createExportTraceServiceRequest([span], {
        useHex: false,
      });
      assert.ok(exportRequest);
      assert.strictEqual(
        exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].parentSpanId,
        undefined
      );
    });

    describe('status code', () => {
      it('error', () => {
        span.status.code = SpanStatusCode.ERROR;
        span.status.message = 'error message';
        const exportRequest = createExportTraceServiceRequest([span], {
          useHex: true,
        });
        assert.ok(exportRequest);
        const spanStatus =
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].status;
        assert.strictEqual(spanStatus?.code, EStatusCode.STATUS_CODE_ERROR);
        assert.strictEqual(spanStatus?.message, 'error message');
      });

      it('unset', () => {
        span.status.code = SpanStatusCode.UNSET;
        const exportRequest = createExportTraceServiceRequest([span], {
          useHex: true,
        });
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].status.code,
          EStatusCode.STATUS_CODE_UNSET
        );
      });
    });

    describe('span kind', () => {
      it('consumer', () => {
        (span as any).kind = SpanKind.CONSUMER;
        const exportRequest = createExportTraceServiceRequest([span], {
          useHex: true,
        });
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].kind,
          ESpanKind.SPAN_KIND_CONSUMER
        );
      });
      it('internal', () => {
        (span as any).kind = SpanKind.INTERNAL;
        const exportRequest = createExportTraceServiceRequest([span], {
          useHex: true,
        });
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].kind,
          ESpanKind.SPAN_KIND_INTERNAL
        );
      });
      it('producer', () => {
        (span as any).kind = SpanKind.PRODUCER;
        const exportRequest = createExportTraceServiceRequest([span], {
          useHex: true,
        });
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].kind,
          ESpanKind.SPAN_KIND_PRODUCER
        );
      });
      it('server', () => {
        (span as any).kind = SpanKind.SERVER;
        const exportRequest = createExportTraceServiceRequest([span], {
          useHex: true,
        });
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].kind,
          ESpanKind.SPAN_KIND_SERVER
        );
      });
      it('unspecified', () => {
        (span as any).kind = undefined;
        const exportRequest = createExportTraceServiceRequest([span], {
          useHex: true,
        });
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].kind,
          ESpanKind.SPAN_KIND_UNSPECIFIED
        );
      });
    });
  });

  describe('ProtobufTracesSerializer', function () {
    it('serializes an export request', () => {
      const serialized = ProtobufTraceSerializer.serializeRequest([span]);
      assert.ok(serialized, 'serialized response is undefined');
      const decoded =
        root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.decode(
          serialized
        );

      const expected = createExpectedSpanProtobuf();
      const decodedObj =
        root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.toObject(
          decoded,
          {
            // This incurs some precision loss that's taken into account in createExpectedSpanProtobuf()
            // Using String here will incur the same precision loss on browser only, using Number to prevent having to
            // have different assertions for browser and Node.js
            longs: Number,
            // Convert to String (Base64) as otherwise the type will be different for Node.js (Buffer) and Browser (Uint8Array)
            // and this fails assertions.
            bytes: String,
          }
        );

      assert.deepStrictEqual(decodedObj, expected);
    });

    it('deserializes a response', () => {
      const protobufSerializedResponse =
        root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.encode(
          {
            partialSuccess: {
              errorMessage: 'foo',
              rejectedSpans: 1,
            },
          }
        ).finish();

      const deserializedResponse = ProtobufTraceSerializer.deserializeResponse(
        protobufSerializedResponse
      );

      assert.ok(
        deserializedResponse.partialSuccess,
        'partialSuccess not present in the deserialized message'
      );
      assert.equal(deserializedResponse.partialSuccess.errorMessage, 'foo');
      assert.equal(
        Number(deserializedResponse.partialSuccess.rejectedSpans),
        1
      );
    });
  });

  describe('JsonTracesSerializer', function () {
    it('serializes an export request', () => {
      // stringify, then parse to remove undefined keys in the expected JSON
      const expected = JSON.parse(
        JSON.stringify(
          createExpectedSpanJson({
            useHex: true,
            useLongBits: false,
          })
        )
      );
      const serialized = JsonTraceSerializer.serializeRequest([span]);

      const decoder = new TextDecoder();
      assert.deepStrictEqual(JSON.parse(decoder.decode(serialized)), expected);
    });

    it('deserializes a response', () => {
      const expectedResponse = {
        partialSuccess: {
          errorMessage: 'foo',
          rejectedSpans: 1,
        },
      };
      const encoder = new TextEncoder();
      const encodedResponse = encoder.encode(JSON.stringify(expectedResponse));

      const deserializedResponse =
        JsonTraceSerializer.deserializeResponse(encodedResponse);

      assert.ok(
        deserializedResponse.partialSuccess,
        'partialSuccess not present in the deserialized message'
      );
      assert.equal(deserializedResponse.partialSuccess.errorMessage, 'foo');
      assert.equal(
        Number(deserializedResponse.partialSuccess.rejectedSpans),
        1
      );
    });
  });
});
