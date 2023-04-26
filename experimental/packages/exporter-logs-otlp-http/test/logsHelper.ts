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
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import { VERSION } from '@opentelemetry/core';
import {
  IAnyValue,
  IKeyValue,
  ILogRecord,
  IResource,
} from '@opentelemetry/otlp-transformer';
import {
  ReadableLogRecord,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogsExporter } from '../src';
import { IExportLogsServiceRequest } from '@opentelemetry/otlp-transformer';

const traceIdArr = [
  31, 16, 8, 220, 142, 39, 14, 133, 196, 10, 13, 124, 57, 57, 178, 120,
];
const spanIdArr = [94, 16, 114, 97, 246, 79, 165, 62];

if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {
    from: function (arr: []) {
      return new Uint8Array(arr);
    },
  };
}

const defaultResource = Resource.default().merge(
  new Resource({
    service: 'ui',
    version: 1,
    cost: 112.12,
  })
);

let loggerProvider = new LoggerProvider({ resource: defaultResource });
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(new OTLPLogsExporter())
);
let logger = loggerProvider.getLogger('default', '0.0.1');

export function setUp() {
  loggerProvider = new LoggerProvider({ resource: defaultResource });
  loggerProvider.addLogRecordProcessor(
    new SimpleLogRecordProcessor(new OTLPLogsExporter())
  );
  logger = loggerProvider.getLogger('default', '0.0.1');
  return logger;
}

export async function shutdown() {
  await loggerProvider.shutdown();
}

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
          value: 'stringValue',
        },
      },
    ],
    'exported attributes are incorrect'
  );
}

export function ensureExportedBodyIsCorrect(body?: IAnyValue) {
  assert.deepStrictEqual(
    body,
    { stringValue: 'some_log_body', value: 'stringValue' },
    'exported attributes are incorrect'
  );
}

export function ensureExportedLogRecordIsCorrect(logRecord: ILogRecord) {
  ensureExportedBodyIsCorrect(logRecord.body);
  ensureExportedAttributesAreCorrect(logRecord.attributes);
  assert.strictEqual(
    logRecord.timeUnixNano,
    '1680253513123241728',
    'timeUnixNano is wrong'
  );
  assert.strictEqual(
    logRecord.observedTimeUnixNano,
    '1680253513123241728',
    'observedTimeUnixNano is wrong'
  );
  assert.strictEqual(
    logRecord.severityNumber,
    'SEVERITY_NUMBER_ERROR',
    'severityNumber is wrong'
  );
  assert.strictEqual(logRecord.severityText, 'error', 'severityText is wrong');
  assert.strictEqual(
    logRecord.droppedAttributesCount,
    0,
    'droppedAttributesCount is wrong'
  );
  assert.strictEqual(logRecord.flags, TraceFlags.SAMPLED, 'flags is wrong');
  assert.deepStrictEqual(
    logRecord.traceId,
    Buffer.from(traceIdArr),
    'traceId is wrong'
  );
  assert.deepStrictEqual(
    logRecord.spanId,
    Buffer.from(spanIdArr),
    'spanId is wrong'
  );
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

export function ensureHeadersContain(
  actual: { [key: string]: string },
  expected: { [key: string]: string }
) {
  Object.entries(expected).forEach(([k, v]) => {
    assert.strictEqual(
      v,
      actual[k],
      `Expected ${actual} to contain ${k}: ${v}`
    );
  });
}

export function ensureWebResourceIsCorrect(resource: IResource) {
  assert.strictEqual(resource.attributes.length, 7);
  assert.strictEqual(resource.attributes[0].key, 'service.name');
  assert.strictEqual(
    resource.attributes[0].value.stringValue,
    'unknown_service'
  );
  assert.strictEqual(resource.attributes[1].key, 'telemetry.sdk.language');
  assert.strictEqual(resource.attributes[1].value.stringValue, 'webjs');
  assert.strictEqual(resource.attributes[2].key, 'telemetry.sdk.name');
  assert.strictEqual(resource.attributes[2].value.stringValue, 'opentelemetry');
  assert.strictEqual(resource.attributes[3].key, 'telemetry.sdk.version');
  assert.strictEqual(resource.attributes[3].value.stringValue, VERSION);
  assert.strictEqual(resource.attributes[4].key, 'service');
  assert.strictEqual(resource.attributes[4].value.stringValue, 'ui');
  assert.strictEqual(resource.attributes[5].key, 'version');
  assert.strictEqual(resource.attributes[5].value.intValue, 1);
  assert.strictEqual(resource.attributes[6].key, 'cost');
  assert.strictEqual(resource.attributes[6].value.doubleValue, 112.12);
  assert.strictEqual(resource.droppedAttributesCount, 0);
}

export function ensureExportLogsServiceRequestIsSet(
  json: IExportLogsServiceRequest
) {
  const resourceLogs = json.resourceLogs;

  assert.strictEqual(
    resourceLogs?.length,
    1,
    'resourceMetrics has incorrect length'
  );

  const resource = resourceLogs[0].resource;
  assert.ok(resource, 'resource is missing');

  const scopeLogs = resourceLogs[0].scopeLogs;
  assert.strictEqual(scopeLogs?.length, 1, 'scopeLogs is missing');

  const scope = scopeLogs[0].scope;
  assert.ok(scope, 'scope is missing');

  const logRecords = resourceLogs[0].scopeLogs[0].logRecords;
  assert.strictEqual(logRecords?.length, 3, 'logRecords are missing');
}
