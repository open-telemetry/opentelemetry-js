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
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import { VERSION } from '@opentelemetry/core';
import {
  IAnyValue,
  IExportLogsServiceRequest,
  IKeyValue,
  ILogRecord,
  IResource,
} from '@opentelemetry/otlp-transformer';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';

export const mockedReadableLogRecord: ReadableLogRecord = {
  resource: Resource.default().merge(
    new Resource({
      'resource-attribute': 'some resource-attr value',
    })
  ),
  instrumentationScope: {
    name: 'scope_name_1',
    version: '0.1.0',
    schemaUrl: 'http://url.to.schema',
  },
  hrTime: [1680253513, 123241635] as HrTime,
  hrTimeObserved: [1680253513, 123241635] as HrTime,
  attributes: {
    'some-attribute': 'some attribute value',
  },
  severityNumber: SeverityNumber.ERROR,
  severityText: 'error',
  body: 'some_log_body',
  spanContext: {
    traceFlags: TraceFlags.SAMPLED,
    traceId: '1f1008dc8e270e85c40a0d7c3939b278',
    spanId: '5e107261f64fa53e',
  },
};
export function ensureExportedAttributesAreCorrect(attributes: IKeyValue[]) {
  assert.deepStrictEqual(
    attributes,
    [
      {
        key: 'some-attribute',
        value: {
          stringValue: 'some attribute value',
        },
      },
    ],
    'exported attributes are incorrect'
  );
}

export function ensureExportedBodyIsCorrect(body?: IAnyValue) {
  assert.deepStrictEqual(
    body,
    { stringValue: 'some_log_body' },
    'exported attributes are incorrect'
  );
}

export function ensureExportedLogRecordIsCorrect(logRecord: ILogRecord) {
  ensureExportedBodyIsCorrect(logRecord.body);
  ensureExportedAttributesAreCorrect(logRecord.attributes);
  assert.deepStrictEqual(
    logRecord.timeUnixNano,
    '1680253513123241635',
    'timeUnixNano is wrong'
  );
  assert.deepStrictEqual(
    logRecord.observedTimeUnixNano,
    '1680253513123241635',
    'observedTimeUnixNano is wrong'
  );
  assert.strictEqual(
    logRecord.severityNumber,
    SeverityNumber.ERROR,
    'severityNumber is wrong'
  );
  assert.strictEqual(logRecord.severityText, 'error', 'severityText is wrong');
  assert.strictEqual(
    logRecord.droppedAttributesCount,
    0,
    'droppedAttributesCount is wrong'
  );
  assert.strictEqual(logRecord.flags, TraceFlags.SAMPLED, 'flags is wrong');
}

export function ensureResourceIsCorrect(resource: IResource) {
  assert.deepStrictEqual(resource, {
    attributes: [
      {
        key: 'service.name',
        value: {
          stringValue: `unknown_service:${process.argv0}`,
          value: 'stringValue',
        },
      },
      {
        key: 'telemetry.sdk.language',
        value: {
          stringValue: 'nodejs',
          value: 'stringValue',
        },
      },
      {
        key: 'telemetry.sdk.name',
        value: {
          stringValue: 'opentelemetry',
          value: 'stringValue',
        },
      },
      {
        key: 'telemetry.sdk.version',
        value: {
          stringValue: VERSION,
          value: 'stringValue',
        },
      },
      {
        key: 'resource-attribute',
        value: {
          stringValue: 'some resource-attr value',
          value: 'stringValue',
        },
      },
    ],
    droppedAttributesCount: 0,
  });
}

export function ensureExportLogsServiceRequestIsSet(
  json: IExportLogsServiceRequest
) {
  const resourceLogs = json.resourceLogs;
  assert.strictEqual(resourceLogs?.length, 1, 'resourceLogs is missing');

  const resource = resourceLogs?.[0].resource;
  assert.ok(resource, 'resource is missing');

  const scopeLogs = resourceLogs?.[0].scopeLogs;
  assert.strictEqual(scopeLogs?.length, 1, 'scopeLogs is missing');

  const scope = scopeLogs?.[0].scope;
  assert.ok(scope, 'scope is missing');

  const logRecords = scopeLogs?.[0].logRecords;
  assert.strictEqual(logRecords?.length, 1, 'logs are missing');
}
