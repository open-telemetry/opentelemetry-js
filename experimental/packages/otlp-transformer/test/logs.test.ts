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
import { InstrumentationScope, hexToBase64 } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import {
  createExportLogsServiceRequest,
  ESeverityNumber,
  IExportLogsServiceRequest,
} from '../src';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';

function createExpectedLogJson(useHex: boolean): IExportLogsServiceRequest {
  const traceId = useHex
    ? '00000000000000000000000000000001'
    : hexToBase64('00000000000000000000000000000001');
  const spanId = useHex ? '0000000000000002' : hexToBase64('0000000000000002');

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
            scope: { name: 'scope_name_1', version: '0.1.0' },
            logRecords: [
              {
                timeUnixNano: { low: 4132445859, high: 391214506 },
                observedTimeUnixNano: { low: 584929536, high: 391976663 },
                severityNumber: ESeverityNumber.SEVERITY_NUMBER_ERROR,
                severityText: 'error',
                body: { stringValue: 'some_log_body' },

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

describe('Logs', () => {
  describe('createExportLogsServiceRequest', () => {
    let resource_1: Resource;
    let resource_2: Resource;
    let scope_1: InstrumentationScope;
    let scope_2: InstrumentationScope;
    let log_1_1_1: ReadableLogRecord;
    let log_1_1_2: ReadableLogRecord;
    let log_1_2_1: ReadableLogRecord;
    let log_2_1_1: ReadableLogRecord;

    beforeEach(() => {
      resource_1 = new Resource({
        'resource-attribute': 'some attribute value',
      });
      resource_2 = new Resource({
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
      const log_fragment_1 = {
        hrTime: [1680253513, 123241635] as HrTime,
        hrTimeObserved: [1683526948, 965142784] as HrTime,
        attributes: {
          'some-attribute': 'some attribute value',
        },
        severityNumber: SeverityNumber.ERROR,
        severityText: 'error',
        body: 'some_log_body',
        spanContext: {
          spanId: '0000000000000002',
          traceFlags: TraceFlags.SAMPLED,
          traceId: '00000000000000000000000000000001',
        },
      };
      const log_fragment_2 = {
        hrTime: [1680253797, 687038506] as HrTime,
        hrTimeObserved: [1680253797, 687038506] as HrTime,
        attributes: {
          'another-attribute': 'another attribute value',
        },
      };
      log_1_1_1 = {
        ...log_fragment_1,
        resource: resource_1,
        instrumentationScope: scope_1,
      };
      log_1_1_2 = {
        ...log_fragment_2,
        resource: resource_1,
        instrumentationScope: scope_1,
      };
      log_1_2_1 = {
        ...log_fragment_1,
        resource: resource_1,
        instrumentationScope: scope_2,
      };
      log_2_1_1 = {
        ...log_fragment_1,
        resource: resource_2,
        instrumentationScope: scope_1,
      };
    });

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
      assert.deepStrictEqual(exportRequest, createExpectedLogJson(true));
    });

    it('serializes a log record with useHex = false', () => {
      const exportRequest = createExportLogsServiceRequest([log_1_1_1], {
        useHex: false,
      });
      assert.ok(exportRequest);
      assert.deepStrictEqual(exportRequest, createExpectedLogJson(false));
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
  });
});
