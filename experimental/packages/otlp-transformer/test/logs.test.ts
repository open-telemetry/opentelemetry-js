/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { HrTime, TraceFlags } from '@opentelemetry/api';
import { InstrumentationScope } from '@opentelemetry/core';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import * as assert from 'assert';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { JSON_ENCODER, PROTOBUF_ENCODER, Encoder } from '../src/common/utils';
import { toBase64 } from './utils';
import * as root from '../src/generated/root';
import {
  ESeverityNumber,
  IExportLogsServiceRequest,
} from '../src/logs/internal-types';
import { createExportLogsServiceRequest } from '../src/logs/internal';
import { ProtobufLogsSerializer } from '../src/logs/protobuf';
import { JsonLogsSerializer } from '../src/logs/json';

function createExpectedLogJson(encoder: Encoder): IExportLogsServiceRequest {
  const timeUnixNano = encoder.encodeHrTime([1680253513, 123241635]);
  const observedTimeUnixNano = encoder.encodeHrTime([1683526948, 965142784]);

  const traceId = encoder.encodeSpanContext('00000000000000000000000000000001');
  const spanId = encoder.encodeSpanContext('0000000000000002');

  // Encode Uint8Array test bytes
  const testBytes = new Uint8Array([1, 2, 3, 4, 5]);
  const bytesValue = encoder.encodeUint8Array(testBytes);

  return {
    resourceLogs: [
      {
        resource: {
          attributes: [
            {
              key: 'resource-attribute',
              value: { stringValue: 'some attribute value' },
            },
          ],
          droppedAttributesCount: 0,
        },
        schemaUrl: undefined,
        scopeLogs: [
          {
            scope: {
              name: 'scope_name_1',
              version: '0.1.0',
            },
            logRecords: [
              {
                timeUnixNano,
                observedTimeUnixNano,
                severityNumber: ESeverityNumber.SEVERITY_NUMBER_ERROR,
                severityText: 'error',
                body: { stringValue: 'some_log_body' },
                eventName: 'some.event.name',

                attributes: [
                  {
                    key: 'some-attribute',
                    value: { stringValue: 'some attribute value' },
                  },
                  {
                    key: 'bytes-attribute',
                    value: { bytesValue: bytesValue },
                  },
                ],
                droppedAttributesCount: 0,
                flags: 1,
                traceId: traceId,
                spanId: spanId,
              },
            ],
            schemaUrl: 'http://url.to.schema',
          },
        ],
      },
    ],
  };
}

function createExpectedLogProtobuf(): IExportLogsServiceRequest {
  const traceId = toBase64('00000000000000000000000000000001');
  const spanId = toBase64('0000000000000002');

  // Base64 encoding of Uint8Array([1, 2, 3, 4, 5])
  // Note: protobuf serializer encodes as binary. However, when decoding, with protobuf.js
  // we use `bytes: String`, as otherwise the type will be different for Node.js (Buffer) and Browser (Uint8Array)
  // which makes assertions overly complex.
  const bytesValue = 'AQIDBAU=';

  return {
    resourceLogs: [
      {
        resource: {
          attributes: [
            {
              key: 'resource-attribute',
              value: { stringValue: 'some attribute value' },
            },
          ],
          droppedAttributesCount: 0,
        },
        scopeLogs: [
          {
            scope: { name: 'scope_name_1', version: '0.1.0' },
            logRecords: [
              {
                timeUnixNano: 1680253513123241700,
                observedTimeUnixNano: 1683526948965142800,
                severityNumber: ESeverityNumber.SEVERITY_NUMBER_ERROR,
                severityText: 'error',
                body: { stringValue: 'some_log_body' },
                eventName: 'some.event.name',
                attributes: [
                  {
                    key: 'some-attribute',
                    value: { stringValue: 'some attribute value' },
                  },
                  {
                    key: 'bytes-attribute',
                    value: { bytesValue: bytesValue },
                  },
                ],
                droppedAttributesCount: 0,
                flags: 1,
                traceId: traceId,
                spanId: spanId,
              },
            ],
            schemaUrl: 'http://url.to.schema',
          },
        ],
      },
    ],
  };
}

const DEFAULT_LOG_FRAGMENT: Omit<
  ReadableLogRecord,
  'resource' | 'instrumentationScope'
> = {
  hrTime: [1680253513, 123241635] as HrTime,
  hrTimeObserved: [1683526948, 965142784] as HrTime,
  attributes: {
    'some-attribute': 'some attribute value',
    'bytes-attribute': new Uint8Array([1, 2, 3, 4, 5]),
  },
  droppedAttributesCount: 0,
  severityNumber: SeverityNumber.ERROR,
  severityText: 'error',
  body: 'some_log_body',
  eventName: 'some.event.name',
  spanContext: {
    spanId: '0000000000000002',
    traceFlags: TraceFlags.SAMPLED,
    traceId: '00000000000000000000000000000001',
  },
} as const;

describe('Logs', () => {
  let resource_1: Resource;
  let resource_2: Resource;
  let scope_1: InstrumentationScope;
  let scope_2: InstrumentationScope;

  /*
  The following log_X_Y_Z should follow the pattern
    - X is the resource
    - Y is the scope
    - Z is the log fragment
   */

  // using `resource_1`, `scope_1`, `log_fragment_1`
  let log_1_1_1: ReadableLogRecord;
  // using `resource_1`, `scope_1`, `log_fragment_2`
  let log_1_1_2: ReadableLogRecord;
  // using `resource_1`, `scope_2`, `log_fragment_1`
  let log_1_2_1: ReadableLogRecord;
  // using `resource_2`, `scope_1`, `log_fragment_1`
  let log_2_1_1: ReadableLogRecord;

  function createReadableLogRecord(
    resource: Resource,
    scope: InstrumentationScope,
    logFragment: Omit<ReadableLogRecord, 'resource' | 'instrumentationScope'>
  ): ReadableLogRecord {
    return {
      ...logFragment,
      resource: resource,
      instrumentationScope: scope,
    } as ReadableLogRecord;
  }

  beforeEach(() => {
    resource_1 = resourceFromAttributes({
      'resource-attribute': 'some attribute value',
    });
    resource_2 = resourceFromAttributes({
      'resource-attribute': 'another attribute value',
    });
    scope_1 = {
      name: 'scope_name_1',
      version: '0.1.0',
      schemaUrl: 'http://url.to.schema',
    };
    scope_2 = {
      name: 'scope_name_2',
    };

    const log_fragment_1 = DEFAULT_LOG_FRAGMENT;
    const log_fragment_2 = {
      hrTime: [1680253797, 687038506] as HrTime,
      hrTimeObserved: [1680253797, 687038506] as HrTime,
      attributes: {
        'another-attribute': 'another attribute value',
      },
      droppedAttributesCount: 0,
    };

    log_1_1_1 = createReadableLogRecord(resource_1, scope_1, log_fragment_1);
    log_1_1_2 = createReadableLogRecord(resource_1, scope_1, log_fragment_2);
    log_1_2_1 = createReadableLogRecord(resource_1, scope_2, log_fragment_1);
    log_2_1_1 = createReadableLogRecord(resource_2, scope_1, log_fragment_1);
  });

  describe('createExportLogsServiceRequest', () => {
    it('returns null on an empty list', () => {
      assert.deepStrictEqual(createExportLogsServiceRequest([], JSON_ENCODER), {
        resourceLogs: [],
      });
    });

    it('serializes a log record with useHex = true', () => {
      const exportRequest = createExportLogsServiceRequest(
        [log_1_1_1],
        JSON_ENCODER
      );
      assert.ok(exportRequest);
      assert.deepStrictEqual(
        exportRequest,
        createExpectedLogJson(JSON_ENCODER)
      );
    });

    it('serializes a log record with useHex = false', () => {
      const exportRequest = createExportLogsServiceRequest(
        [log_1_1_1],
        PROTOBUF_ENCODER
      );
      assert.ok(exportRequest);
      assert.deepStrictEqual(
        exportRequest,
        createExpectedLogJson(PROTOBUF_ENCODER)
      );
    });

    it('aggregates multiple logs with same resource and same scope', () => {
      const exportRequest = createExportLogsServiceRequest(
        [log_1_1_1, log_1_1_2],
        PROTOBUF_ENCODER
      );
      assert.ok(exportRequest);
      assert.strictEqual(exportRequest.resourceLogs?.length, 1);
      assert.strictEqual(exportRequest.resourceLogs?.[0].scopeLogs.length, 1);
      assert.strictEqual(
        exportRequest.resourceLogs?.[0].scopeLogs?.[0].logRecords?.length,
        2
      );
    });

    it('aggregates multiple logs with same resource and different scopes', () => {
      const exportRequest = createExportLogsServiceRequest(
        [log_1_1_1, log_1_2_1],
        PROTOBUF_ENCODER
      );
      assert.ok(exportRequest);
      assert.strictEqual(exportRequest.resourceLogs?.length, 1);
      assert.strictEqual(exportRequest.resourceLogs?.[0].scopeLogs.length, 2);
    });

    it('aggregates multiple logs with different resources', () => {
      const exportRequest = createExportLogsServiceRequest(
        [log_1_1_1, log_2_1_1],
        PROTOBUF_ENCODER
      );
      assert.ok(exportRequest);
      assert.strictEqual(exportRequest.resourceLogs?.length, 2);
    });

    it('supports schema URL on resource', () => {
      const resourceWithSchema = resourceFromAttributes(
        {},
        { schemaUrl: 'https://opentelemetry.test/schemas/1.2.3' }
      );

      const logWithSchema = createReadableLogRecord(
        resourceWithSchema,
        scope_1,
        DEFAULT_LOG_FRAGMENT
      );

      const exportRequest = createExportLogsServiceRequest(
        [logWithSchema],
        JSON_ENCODER
      );

      assert.ok(exportRequest);
      assert.strictEqual(exportRequest.resourceLogs?.length, 1);
      assert.strictEqual(
        exportRequest.resourceLogs?.[0].schemaUrl,
        'https://opentelemetry.test/schemas/1.2.3'
      );
    });

    it('encodes Uint8Array to base64 when used with JSON_ENCODER', () => {
      const exportRequest = createExportLogsServiceRequest(
        [log_1_1_1],
        JSON_ENCODER
      );
      assert.ok(exportRequest);
      const bytesAttr =
        exportRequest.resourceLogs?.[0].scopeLogs[0].logRecords?.[0].attributes?.find(
          attr => attr.key === 'bytes-attribute'
        );
      assert.ok(bytesAttr, 'bytes-attribute not found');
      // JSON_ENCODER should encode Uint8Array as base64 string in bytesValue
      assert.strictEqual(bytesAttr.value.bytesValue, 'AQIDBAU=');
      assert.strictEqual(bytesAttr.value.stringValue, undefined);
    });
  });

  describe('ProtobufLogsSerializer', function () {
    it('serializes an export request', () => {
      const serialized = ProtobufLogsSerializer.serializeRequest([log_1_1_1]);
      assert.ok(serialized, 'serialized response is undefined');
      const decoded =
        root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.decode(
          serialized
        );

      const expected = createExpectedLogProtobuf();
      const decodedObj =
        root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.toObject(
          decoded,
          {
            // This incurs some precision loss that's taken into account in createExpectedLogsProtobuf()
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
        root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.encode(
          {
            partialSuccess: {
              errorMessage: 'foo',
              rejectedLogRecords: 1,
            },
          }
        ).finish();

      const deserializedResponse = ProtobufLogsSerializer.deserializeResponse(
        protobufSerializedResponse
      );

      assert.ok(
        deserializedResponse.partialSuccess,
        'partialSuccess not present in the deserialized message'
      );
      assert.equal(deserializedResponse.partialSuccess.errorMessage, 'foo');
      assert.equal(
        Number(deserializedResponse.partialSuccess.rejectedLogRecords),
        1
      );
    });

    it('does not throw when deserializing an empty response', () => {
      assert.doesNotThrow(() =>
        ProtobufLogsSerializer.deserializeResponse(new Uint8Array([]))
      );
    });
  });

  describe('JsonLogsSerializer', function () {
    it('serializes an export request', () => {
      // stringify, then parse to remove undefined keys in the expected JSON
      const expected = JSON.parse(
        JSON.stringify(createExpectedLogJson(JSON_ENCODER))
      );
      const serialized = JsonLogsSerializer.serializeRequest([log_1_1_1]);

      const decoder = new TextDecoder();
      const actual = JSON.parse(decoder.decode(serialized));

      assert.deepStrictEqual(actual, expected);
    });

    it('deserializes a response', () => {
      const expectedResponse = {
        partialSuccess: {
          errorMessage: 'foo',
          rejectedLogRecords: 1,
        },
      };
      const encoder = new TextEncoder();
      const encodedResponse = encoder.encode(JSON.stringify(expectedResponse));

      const deserializedResponse =
        JsonLogsSerializer.deserializeResponse(encodedResponse);

      assert.ok(
        deserializedResponse.partialSuccess,
        'partialSuccess not present in the deserialized message'
      );
      assert.equal(deserializedResponse.partialSuccess.errorMessage, 'foo');
      assert.equal(
        Number(deserializedResponse.partialSuccess.rejectedLogRecords),
        1
      );
    });

    it('does not throw when deserializing an empty response', () => {
      assert.doesNotThrow(() =>
        JsonLogsSerializer.deserializeResponse(new Uint8Array([]))
      );
    });
  });
});
