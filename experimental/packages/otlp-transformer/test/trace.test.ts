/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as signals from '../test/generated/signals';
import { diag, SpanKind, SpanStatusCode, TraceFlags } from '@opentelemetry/api';
import type { InstrumentationScope } from '@opentelemetry/core';
import { TraceState } from '@opentelemetry/core';
import type { Resource } from '@opentelemetry/resources';
import { resourceFromAttributes } from '@opentelemetry/resources';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { toBase64 } from './utils';
import type { OtlpEncodingOptions } from '../src/common/internal-types';
import { ESpanKind, EStatusCode } from '../src/trace/internal-types';
import { createExportTraceServiceRequest } from '../src/trace/internal';
import { ProtobufTraceSerializer } from '../src/trace/protobuf';
import { JsonTraceSerializer } from '../src/trace/json';
import { hexToBinary } from '../src/common/hex-to-binary';
import type { ISpan } from '../src/trace/internal-types';
import { JSON_ENCODER, PROTOBUF_ENCODER } from '../src/common/utils';
import {
  GROWING_BUFFER_DEBUG_MESSAGE,
  ProtobufWriter,
} from '../src/common/protobuf/protobuf-writer';

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
                    flags: 0x101, // TraceFlags (0x01) | HAS_IS_REMOTE
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
                flags: 0x101, // TraceFlags (0x01) | HAS_IS_REMOTE
              },
            ],
            schemaUrl: 'http://url.to.schema',
          },
        ],
      },
    ],
  };
}

function createExpectedSpanData(options: OtlpEncodingOptions) {
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
    traceId,
    spanId,
    parentSpanId,
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
            value: { stringValue: 'string value' },
          },
        ],
        flags: 0x101,
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
            value: { stringValue: 'some string value' },
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
    flags: 0x101,
  };
}

function createExpectedMultiResourceSpanJson(options: OtlpEncodingOptions) {
  const spanData = createExpectedSpanData(options);

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
            scope: { name: 'myLib', version: '0.1.0' },
            spans: [spanData],
            schemaUrl: 'http://url.to.schema',
          },
          {
            scope: { name: 'myOtherLib' },
            spans: [spanData],
            schemaUrl: undefined,
          },
        ],
      },
      {
        resource: {
          attributes: [
            {
              key: 'resource-attribute',
              value: { stringValue: 'another resource value' },
            },
          ],
          droppedAttributesCount: 0,
        },
        schemaUrl: undefined,
        scopeSpans: [
          {
            scope: { name: 'myLib', version: '0.1.0' },
            spans: [spanData],
            schemaUrl: 'http://url.to.schema',
          },
        ],
      },
    ],
  };
}

function createExpectedMultiResourceSpanProtobuf() {
  const startTime = 1640715557342725400;
  const endTime = 1640715558642725400;
  const eventTime = 1640715558542725400;

  const traceId = toBase64('00000000000000000000000000000001');
  const spanId = toBase64('0000000000000002');
  const parentSpanId = toBase64('0000000000000001');
  const linkSpanId = toBase64('0000000000000003');
  const linkTraceId = toBase64('00000000000000000000000000000002');

  const spanData = {
    traceId,
    spanId,
    traceState: 'span=bar',
    parentSpanId,
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
            value: { stringValue: 'string value' },
          },
        ],
        flags: 0x101,
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
            value: { stringValue: 'some string value' },
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
    flags: 0x101,
  };

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
            spans: [spanData],
            schemaUrl: 'http://url.to.schema',
          },
          {
            scope: { name: 'myOtherLib' },
            spans: [spanData],
          },
        ],
      },
      {
        resource: {
          attributes: [
            {
              key: 'resource-attribute',
              value: { stringValue: 'another resource value' },
            },
          ],
          droppedAttributesCount: 0,
        },
        scopeSpans: [
          {
            scope: { name: 'myLib', version: '0.1.0' },
            spans: [spanData],
            schemaUrl: 'http://url.to.schema',
          },
        ],
      },
    ],
  };
}

describe('Trace', () => {
  let resource_1: Resource;
  let resource_2: Resource;

  /*
  The following span_X_Y should follow the pattern
    - X is the resource
    - Y is the scope
   */

  // using `resource_1`, `scope_1`
  let span_1_1: ReadableSpan;
  // using `resource_1`, `scope_2`
  let span_1_2: ReadableSpan;
  // using `resource_2`, `scope_1`
  let span_2_1: ReadableSpan;

  const scope_1: InstrumentationScope = {
    name: 'myLib',
    version: '0.1.0',
    schemaUrl: 'http://url.to.schema',
  };

  const scope_2: InstrumentationScope = {
    name: 'myOtherLib',
  };

  function createSpan(
    spanResource: Resource,
    scope: InstrumentationScope
  ): ReadableSpan {
    return {
      spanContext: () => ({
        spanId: '0000000000000002',
        traceFlags: TraceFlags.SAMPLED,
        traceId: '00000000000000000000000000000001',
        isRemote: false,
        traceState: new TraceState('span=bar'),
      }),
      parentSpanContext: {
        spanId: '0000000000000001',
        traceId: '00000000000000000000000000000001',
        traceFlags: TraceFlags.SAMPLED,
      },
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
      instrumentationScope: scope,
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
      resource: spanResource,
      startTime: [1640715557, 342725388],
      status: {
        code: SpanStatusCode.OK,
      },
      droppedAttributesCount: 0,
      droppedEventsCount: 0,
      droppedLinksCount: 0,
    };
  }

  beforeEach(() => {
    resource_1 = resourceFromAttributes({
      'resource-attribute': 'resource attribute value',
    });
    resource_2 = resourceFromAttributes({
      'resource-attribute': 'another resource value',
    });
    span_1_1 = createSpan(resource_1, scope_1);
    span_1_2 = createSpan(resource_1, scope_2);
    span_2_1 = createSpan(resource_2, scope_1);
  });

  describe('createExportTraceServiceRequest', () => {
    it('returns null on an empty list', () => {
      assert.deepStrictEqual(
        createExportTraceServiceRequest([], JSON_ENCODER),
        {
          resourceSpans: [],
        }
      );
    });

    it('serializes a span with json encoder', () => {
      const exportRequest = createExportTraceServiceRequest(
        [span_1_1],
        JSON_ENCODER
      );
      assert.ok(exportRequest);
      assert.deepStrictEqual(
        exportRequest,
        createExpectedSpanJson({ useHex: true, useLongBits: false })
      );
    });

    it('serializes a span with protobuf encoder', () => {
      const exportRequest = createExportTraceServiceRequest(
        [span_1_1],
        PROTOBUF_ENCODER
      );
      assert.ok(exportRequest);
      assert.deepStrictEqual(
        exportRequest,
        createExpectedSpanJson({ useHex: false })
      );
    });

    it('serializes a span with string timestamps', () => {
      const exportRequest = createExportTraceServiceRequest(
        [span_1_1],
        JSON_ENCODER
      );
      assert.ok(exportRequest);
      assert.deepStrictEqual(
        exportRequest,
        createExpectedSpanJson({ useLongBits: false, useHex: true })
      );
    });

    it('serializes a span without a parent with useHex = true', () => {
      (span_1_1 as any).parentSpanContext.spanId = undefined;
      const exportRequest = createExportTraceServiceRequest(
        [span_1_1],
        JSON_ENCODER
      );
      assert.ok(exportRequest);
      assert.strictEqual(
        (exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0] as ISpan)
          .parentSpanId,
        undefined
      );
    });

    it('serializes a span without a parent with useHex = false', () => {
      (span_1_1 as any).parentSpanContext.spanId = undefined;
      const exportRequest = createExportTraceServiceRequest(
        [span_1_1],
        PROTOBUF_ENCODER
      );
      assert.ok(exportRequest);
      assert.strictEqual(
        (exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0] as ISpan)
          .parentSpanId,
        undefined
      );
    });

    describe('status code', () => {
      it('error', () => {
        span_1_1.status.code = SpanStatusCode.ERROR;
        span_1_1.status.message = 'error message';
        const exportRequest = createExportTraceServiceRequest(
          [span_1_1],
          JSON_ENCODER
        );
        assert.ok(exportRequest);
        const spanStatus =
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].status;
        assert.strictEqual(spanStatus?.code, EStatusCode.STATUS_CODE_ERROR);
        assert.strictEqual(spanStatus?.message, 'error message');
      });

      it('unset', () => {
        span_1_1.status.code = SpanStatusCode.UNSET;
        const exportRequest = createExportTraceServiceRequest(
          [span_1_1],
          JSON_ENCODER
        );
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].status.code,
          EStatusCode.STATUS_CODE_UNSET
        );
      });
    });

    describe('span kind', () => {
      it('consumer', () => {
        (span_1_1 as any).kind = SpanKind.CONSUMER;
        const exportRequest = createExportTraceServiceRequest(
          [span_1_1],
          JSON_ENCODER
        );
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].kind,
          ESpanKind.SPAN_KIND_CONSUMER
        );
      });
      it('internal', () => {
        (span_1_1 as any).kind = SpanKind.INTERNAL;
        const exportRequest = createExportTraceServiceRequest(
          [span_1_1],
          JSON_ENCODER
        );
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].kind,
          ESpanKind.SPAN_KIND_INTERNAL
        );
      });
      it('producer', () => {
        (span_1_1 as any).kind = SpanKind.PRODUCER;
        const exportRequest = createExportTraceServiceRequest(
          [span_1_1],
          JSON_ENCODER
        );
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].kind,
          ESpanKind.SPAN_KIND_PRODUCER
        );
      });
      it('server', () => {
        (span_1_1 as any).kind = SpanKind.SERVER;
        const exportRequest = createExportTraceServiceRequest(
          [span_1_1],
          JSON_ENCODER
        );
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].kind,
          ESpanKind.SPAN_KIND_SERVER
        );
      });
      it('unspecified', () => {
        (span_1_1 as any).kind = undefined;
        const exportRequest = createExportTraceServiceRequest(
          [span_1_1],
          JSON_ENCODER
        );
        assert.ok(exportRequest);
        assert.strictEqual(
          exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].kind,
          ESpanKind.SPAN_KIND_UNSPECIFIED
        );
      });
    });

    it('supports schema URL on resource', () => {
      const resourceWithSchema = resourceFromAttributes(
        { 'resource-attribute': 'resource attribute value' },
        { schemaUrl: 'https://opentelemetry.test/schemas/1.2.3' }
      );

      const spanFromSDK = createSpan(resourceWithSchema, scope_1);

      const exportRequest = createExportTraceServiceRequest(
        [spanFromSDK],
        JSON_ENCODER
      );

      assert.ok(exportRequest);
      assert.strictEqual(exportRequest.resourceSpans?.length, 1);
      assert.strictEqual(
        exportRequest.resourceSpans?.[0].schemaUrl,
        'https://opentelemetry.test/schemas/1.2.3'
      );
    });
  });

  describe('ProtobufTracesSerializer', function () {
    let diagStub: sinon.SinonStub;

    beforeEach(function () {
      diagStub = sinon.stub(diag, 'debug');
    });

    afterEach(function () {
      sinon.restore();
    });

    it('serializes an export request', () => {
      const serialized = ProtobufTraceSerializer.serializeRequest([
        span_1_1,
        span_1_2,
        span_2_1,
      ]);
      assert.ok(serialized, 'serialized response is undefined');
      const decoded =
        signals.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.decode(
          serialized
        );
      const expected = createExpectedMultiResourceSpanProtobuf();
      const decodedObj =
        signals.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.toObject(
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
      sinon.assert.neverCalledWith(diagStub, GROWING_BUFFER_DEBUG_MESSAGE);
    });

    it('deserializes a response', () => {
      const protobufSerializedResponse =
        signals.opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.encode(
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

    it('does not throw when deserializing an empty response', () => {
      assert.doesNotThrow(() =>
        ProtobufTraceSerializer.deserializeResponse(new Uint8Array([]))
      );
      sinon.assert.neverCalledWith(diagStub, GROWING_BUFFER_DEBUG_MESSAGE);
    });

    it('does not throw when encountering unexpected wiretypes during deserialization', function () {
      const writer = new ProtobufWriter(50);
      // Construct an ExportTraceServiceResponse where the embedded
      // ExportTracePartialSuccess has fields encoded with incorrect wire types.
      // ExportTraceServiceResponse { 1: partial_success (length-delimited) }
      // ExportTracePartialSuccess expects:
      //   1: rejected_spans (varint)
      //   2: error_message (length-delimited string)

      // first pretend the field number 1 is a varint (type 0, correct format expects a length delimited field)
      writer.writeTag(1, 0);
      writer.writeVarint(3);

      // also pretend we have an extra field that we don't know yet what to do with
      writer.writeTag(99, 0);
      writer.writeVarint(42);

      // now write field 1 again, but this time as length-delimited, as expected.
      writer.writeTag(1, 2);
      const lengthVarintPosition = writer.startLengthDelimited();
      const innerStartPos = writer.pos;
      // instead of putting the correct data here, we put unexpected wire-types for each field, ensuring it's handled gracefully.
      // Write field 1 but with wire type 2 (length-delimited) and a string (correct format expects a varint)
      writer.writeTag(1, 2);
      writer.writeString('not-a-number');
      // Write field 2 but with wire type 0 (varint) instead of length-delimited (correct format expects a string, which is length delimited)
      writer.writeTag(2, 0);
      writer.writeVarint(12345);
      // Write field 99, which is completely unknown to us; pretend it's a varint (type 0)
      writer.writeTag(99, 0);
      writer.writeVarint(42);

      // finish up
      writer.finishLengthDelimited(
        lengthVarintPosition,
        writer.pos - innerStartPos
      );

      // Ensure deserialization does not throw when encountering these
      // unexpected wire types.
      assert.doesNotThrow(() =>
        ProtobufTraceSerializer.deserializeResponse(writer.finish())
      );
    });
  });

  describe('JsonTracesSerializer', function () {
    it('serializes an export request', () => {
      // stringify, then parse to remove undefined keys in the expected JSON
      const expected = JSON.parse(
        JSON.stringify(
          createExpectedMultiResourceSpanJson({
            useHex: true,
            useLongBits: false,
          })
        )
      );
      const serialized = JsonTraceSerializer.serializeRequest([
        span_1_1,
        span_1_2,
        span_2_1,
      ]);

      const decoder = new TextDecoder();
      assert.deepStrictEqual(JSON.parse(decoder.decode(serialized)), expected);
    });

    it('hrtime contains float value', () => {
      const span = createSpan(resource_1, scope_1);
      (span as any).startTime = [1640715557.5, 342725388.5];
      JsonTraceSerializer.serializeRequest([span]);
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

    it('deserializes a malformed response', () => {
      const malformedResponse =
        '{ "partialSuccess": { "errorMessage": foo, "rejectedLogRecords": 1, }';
      const encoder = new TextEncoder();
      const encodedResponse = encoder.encode(malformedResponse);
      const deserializedResponse =
        JsonTraceSerializer.deserializeResponse(encodedResponse);

      assert.deepEqual(
        deserializedResponse,
        {},
        'Malformed response should result in an empty object being returned'
      );
    });

    it('does not throw when deserializing an empty response', () => {
      assert.doesNotThrow(() =>
        JsonTraceSerializer.deserializeResponse(new Uint8Array([]))
      );
    });
  });

  describe('span flags', () => {
    it('sets flags to 0x101 for local parent span context', () => {
      const exportRequest = createExportTraceServiceRequest(
        [span_1_1],
        JSON_ENCODER
      );
      assert.ok(exportRequest);
      const spanFlags =
        exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].flags;
      assert.strictEqual(spanFlags, 0x101); // TraceFlags (0x01) | HAS_IS_REMOTE
    });

    it('sets flags to 0x301 for remote parent span context', () => {
      // Create a span with a remote parent context
      const remoteParentSpanContext = {
        spanId: '0000000000000001',
        traceId: '00000000000000000000000000000001',
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true, // This is the key difference
      };

      const spanWithRemoteParent = {
        ...span_1_1,
        parentSpanContext: remoteParentSpanContext,
      };

      const exportRequest = createExportTraceServiceRequest(
        [spanWithRemoteParent],
        JSON_ENCODER
      );
      assert.ok(exportRequest);
      const spanFlags =
        exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].flags;
      assert.strictEqual(spanFlags, 0x301); // TraceFlags (0x01) | HAS_IS_REMOTE | IS_REMOTE
    });

    it('sets flags to 0x101 for links with local context', () => {
      const exportRequest = createExportTraceServiceRequest(
        [span_1_1],
        JSON_ENCODER
      );
      assert.ok(exportRequest);
      const linkFlags =
        exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].links?.[0]
          .flags;
      assert.strictEqual(linkFlags, 0x101); // TraceFlags (0x01) | HAS_IS_REMOTE
    });

    it('sets flags to 0x301 for links with remote context', () => {
      // Create a span with a remote link context
      const remoteLinkContext = {
        spanId: '0000000000000003',
        traceId: '00000000000000000000000000000002',
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true, // This is the key difference
      };

      const remoteLink = {
        context: remoteLinkContext,
        attributes: { 'link-attribute': 'string value' },
        droppedAttributesCount: 0,
      };

      const spanWithRemoteLink = {
        ...span_1_1,
        links: [remoteLink],
      };

      const exportRequest = createExportTraceServiceRequest(
        [spanWithRemoteLink],
        JSON_ENCODER
      );
      assert.ok(exportRequest);
      const linkFlags =
        exportRequest.resourceSpans?.[0].scopeSpans[0].spans?.[0].links?.[0]
          .flags;
      assert.strictEqual(linkFlags, 0x301); // TraceFlags (0x01) | HAS_IS_REMOTE | IS_REMOTE
    });
  });

  describe('span/link flags matrix', () => {
    const cases = [
      { tf: 0x00, local: 0x100, remote: 0x300 },
      { tf: 0x01, local: 0x101, remote: 0x301 },
      { tf: 0x05, local: 0x105, remote: 0x305 },
      { tf: 0xff, local: 0x1ff, remote: 0x3ff },
    ];

    it('composes span flags with local and remote parent across traceFlags', () => {
      const baseCtx = span_1_1.spanContext();
      for (const c of cases) {
        // Local parent
        const spanLocal = {
          ...span_1_1,
          spanContext: () => ({
            spanId: baseCtx.spanId,
            traceId: baseCtx.traceId,
            traceFlags: c.tf,
            isRemote: false,
            traceState: baseCtx.traceState,
          }),
          parentSpanContext: {
            ...span_1_1.parentSpanContext,
            isRemote: false,
          },
        } as unknown as ReadableSpan;
        const reqLocal = createExportTraceServiceRequest(
          [spanLocal],
          JSON_ENCODER
        );
        const spanFlagsLocal =
          reqLocal.resourceSpans?.[0].scopeSpans[0].spans?.[0].flags;
        assert.strictEqual(spanFlagsLocal, c.local);

        // Remote parent
        const spanRemote = {
          ...spanLocal,
          parentSpanContext: {
            ...span_1_1.parentSpanContext,
            isRemote: true,
          },
        } as unknown as ReadableSpan;
        const reqRemote = createExportTraceServiceRequest(
          [spanRemote],
          JSON_ENCODER
        );
        const spanFlagsRemote =
          reqRemote.resourceSpans?.[0].scopeSpans[0].spans?.[0].flags;
        assert.strictEqual(spanFlagsRemote, c.remote);
      }
    });

    it('composes link flags with local and remote context across traceFlags', () => {
      for (const c of cases) {
        const linkLocal = {
          context: {
            spanId: '0000000000000003',
            traceId: '00000000000000000000000000000002',
            traceFlags: c.tf,
            isRemote: false,
            traceState: new TraceState('link=foo'),
          },
          attributes: { 'link-attribute': 'string value' },
          droppedAttributesCount: 0,
        };
        const spanWithLocalLink = {
          ...span_1_1,
          links: [linkLocal],
        } as unknown as ReadableSpan;
        const reqLocal = createExportTraceServiceRequest(
          [spanWithLocalLink],
          JSON_ENCODER
        );
        const linkFlagsLocal =
          reqLocal.resourceSpans?.[0].scopeSpans[0].spans?.[0].links?.[0].flags;
        assert.strictEqual(linkFlagsLocal, c.local);

        const linkRemote = {
          ...linkLocal,
          context: { ...linkLocal.context, isRemote: true },
        };
        const spanWithRemoteLink = {
          ...span_1_1,
          links: [linkRemote],
        } as unknown as ReadableSpan;
        const reqRemote = createExportTraceServiceRequest(
          [spanWithRemoteLink],
          JSON_ENCODER
        );
        const linkFlagsRemote =
          reqRemote.resourceSpans?.[0].scopeSpans[0].spans?.[0].links?.[0]
            .flags;
        assert.strictEqual(linkFlagsRemote, c.remote);
      }
    });

    it('composes root span flags across traceFlags (no parent)', () => {
      const baseCtx = span_1_1.spanContext();
      for (const c of cases) {
        const rootSpan = {
          ...span_1_1,
          spanContext: () => ({
            spanId: baseCtx.spanId,
            traceId: baseCtx.traceId,
            traceFlags: c.tf,
            isRemote: false,
            traceState: baseCtx.traceState,
          }),
          parentSpanContext: undefined,
        } as unknown as ReadableSpan;
        const req = createExportTraceServiceRequest([rootSpan], JSON_ENCODER);
        const flags = req.resourceSpans?.[0].scopeSpans[0].spans?.[0].flags;
        assert.strictEqual(flags, c.local);
      }
    });
  });
});
