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
import { HrTime, TraceFlags } from '@opentelemetry/api';
import { InstrumentationScope } from '@opentelemetry/core';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import * as assert from 'assert';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { hexToBase64 } from '../src/common/utils';
import { fromBinary, toBinary, create, toJson } from '@bufbuild/protobuf';
import {
  ExportLogsServiceRequestSchema,
  ExportLogsServiceResponseSchema,
} from '../src/generated/opentelemetry/proto/collector/logs/v1/logs_service_pb';
import { OtlpEncodingOptions } from '../src/common/internal-types';
import {
  ESeverityNumber,
  IExportLogsServiceRequest,
} from '../src/logs/internal-types';
import { createExportLogsServiceRequest } from '../src/logs/internal';
import { ProtobufLogsSerializer } from '../src/logs/protobuf';
import { JsonLogsSerializer } from '../src/logs/json';
import { hexToBinary } from '../src/common/hex-to-binary';

function createExpectedLogJson(
  options: OtlpEncodingOptions
): IExportLogsServiceRequest {
  const useHex = options.useHex ?? false;
  const useLongBits = options.useLongBits ?? true;

  const timeUnixNano = useLongBits
    ? { low: 4132445859, high: 391214506 }
    : '1680253513123241635';
  const observedTimeUnixNano = useLongBits
    ? { low: 584929536, high: 391976663 }
    : '1683526948965142784';

  const traceId = useHex
    ? '00000000000000000000000000000001'
    : hexToBinary('00000000000000000000000000000001');
  const spanId = useHex ? '0000000000000002' : hexToBinary('0000000000000002');

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

// Returns untyped object for JSON comparison (toJson output differs from typed interface)
function createExpectedLogProtobuf(): unknown {
  // protobuf JSON format uses base64 for bytes
  const traceId = hexToBase64('00000000000000000000000000000001');
  const spanId = hexToBase64('0000000000000002');

  // protobuf JSON format uses string representation for 64-bit integers
  const timeUnixNano = '1680253513123241635';
  const observedTimeUnixNano = '1683526948965142784';

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
        },
        scopeLogs: [
          {
            scope: { name: 'scope_name_1', version: '0.1.0' },
            logRecords: [
              {
                timeUnixNano: timeUnixNano,
                observedTimeUnixNano: observedTimeUnixNano,
                // protobuf-es toJson outputs enums as strings
                severityNumber: 'SEVERITY_NUMBER_ERROR',
                severityText: 'error',
                body: { stringValue: 'some_log_body' },
                eventName: 'some.event.name',
                attributes: [
                  {
                    key: 'some-attribute',
                    value: { stringValue: 'some attribute value' },
                  },
                ],
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
      assert.deepStrictEqual(
        createExportLogsServiceRequest([], { useHex: true }),
        {
          resourceLogs: [],
        }
      );
    });

    it('serializes a log record with useHex = true', () => {
      const exportRequest = createExportLogsServiceRequest([log_1_1_1], {
        useHex: true,
      });
      assert.ok(exportRequest);
      assert.deepStrictEqual(
        exportRequest,
        createExpectedLogJson({ useHex: true })
      );
    });

    it('serializes a log record with useHex = false', () => {
      const exportRequest = createExportLogsServiceRequest([log_1_1_1], {
        useHex: false,
      });
      assert.ok(exportRequest);
      assert.deepStrictEqual(
        exportRequest,
        createExpectedLogJson({ useHex: false })
      );
    });

    it('aggregates multiple logs with same resource and same scope', () => {
      const exportRequest = createExportLogsServiceRequest(
        [log_1_1_1, log_1_1_2],
        { useHex: false }
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
        { useHex: false }
      );
      assert.ok(exportRequest);
      assert.strictEqual(exportRequest.resourceLogs?.length, 1);
      assert.strictEqual(exportRequest.resourceLogs?.[0].scopeLogs.length, 2);
    });

    it('aggregates multiple logs with different resources', () => {
      const exportRequest = createExportLogsServiceRequest(
        [log_1_1_1, log_2_1_1],
        { useHex: false }
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

      const exportRequest = createExportLogsServiceRequest([logWithSchema], {
        useHex: true,
      });

      assert.ok(exportRequest);
      assert.strictEqual(exportRequest.resourceLogs?.length, 1);
      assert.strictEqual(
        exportRequest.resourceLogs?.[0].schemaUrl,
        'https://opentelemetry.test/schemas/1.2.3'
      );
    });
  });

  describe('ProtobufLogsSerializer', function () {
    it('serializes an export request', () => {
      const serialized = ProtobufLogsSerializer.serializeRequest([log_1_1_1]);
      assert.ok(serialized, 'serialized response is undefined');
      const decoded = fromBinary(ExportLogsServiceRequestSchema, serialized);
      const expected = createExpectedLogProtobuf();
      // toJson converts to protobuf JSON format (strings for 64-bit ints, base64 for bytes)
      const decodedJson = toJson(ExportLogsServiceRequestSchema, decoded);
      assert.deepStrictEqual(decodedJson, expected);
    });

    it('serializes an empty request', () => {
      const serialized = ProtobufLogsSerializer.serializeRequest([]);
      assert.ok(serialized, 'serialized response is undefined');
      const decoded = fromBinary(ExportLogsServiceRequestSchema, serialized);
      assert.deepStrictEqual(
        toJson(ExportLogsServiceRequestSchema, decoded),
        {}
      );
    });

    it('deserializes a response', () => {
      const response = create(ExportLogsServiceResponseSchema, {
        partialSuccess: {
          errorMessage: 'foo',
          rejectedLogRecords: BigInt(1),
        },
      });
      const protobufSerializedResponse = toBinary(
        ExportLogsServiceResponseSchema,
        response
      );

      const deserializedResponse = ProtobufLogsSerializer.deserializeResponse(
        protobufSerializedResponse
      );

      assert.ok(
        deserializedResponse.partialSuccess,
        'partialSuccess not present in the deserialized message'
      );
      assert.equal(deserializedResponse.partialSuccess.errorMessage, 'foo');
      assert.equal(deserializedResponse.partialSuccess.rejectedLogRecords, 1);
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
        JSON.stringify(
          createExpectedLogJson({ useHex: true, useLongBits: false })
        )
      );
      const serialized = JsonLogsSerializer.serializeRequest([log_1_1_1]);

      const decoder = new TextDecoder();
      assert.deepStrictEqual(JSON.parse(decoder.decode(serialized)), expected);
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
