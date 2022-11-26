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

import * as assert from "assert";
import { hrTimeToNanoseconds } from "@opentelemetry/core";

import { toResourceLogs } from "../src/logs/internal";
import {
  MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1,
  MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION2,
  MOCK_LOG_RECORD1_RESOURCE2_INSTRUMENTATION2,
  MOCK_LOG_RECORD2_RESOURCE1_INSTRUMENTATION1,
} from "./__mocks__/logs";
import { toAnyValue, toAttributes } from "../src/common/internal";

describe("transform", () => {
  describe("toResourceLogs", () => {
    it("should aggregated into the same ResourceLog if resource is the same", () => {
      const resourceLogs = toResourceLogs([
        MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1,
        MOCK_LOG_RECORD2_RESOURCE1_INSTRUMENTATION1,
        MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION2,
        MOCK_LOG_RECORD1_RESOURCE2_INSTRUMENTATION2,
      ]);
      assert.strictEqual(resourceLogs.length, 2);
    });

    it("should aggregated into the same instrumentationLog if instrumentationScope is the same", () => {
      const resourceLogs = toResourceLogs([
        MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1,
        MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1,
        MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION2,
      ]);
      assert.strictEqual(resourceLogs.length, 1);
      assert.strictEqual(resourceLogs[0].scopeLogs.length, 2);
    });

    it("should aggregated into the same logs if instrumentationScope is the same", () => {
      const resourceLogs = toResourceLogs([
        MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1,
        MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1,
      ]);
      assert.strictEqual(resourceLogs.length, 1);
      assert.strictEqual(resourceLogs[0].scopeLogs.length, 1);
      assert.strictEqual(resourceLogs[0].scopeLogs?.[0]?.logRecords?.length, 2);
    });

    it("should convert readable log record to resource log record", () => {
      const resourceLogs = toResourceLogs([MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1]);
      const logRecord = resourceLogs[0].scopeLogs?.[0]?.logRecords?.[0];
      assert.notStrictEqual(logRecord, undefined);
      assert.strictEqual(
        logRecord?.timeUnixNano,
        hrTimeToNanoseconds(MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1.timestamp)
      );
      assert.strictEqual(logRecord?.severityNumber, MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1.severityNumber);
      assert.strictEqual(logRecord?.severityText, MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1.severityText);
      assert.deepStrictEqual(logRecord?.body, toAnyValue(MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1.body));
      assert.deepStrictEqual(
        logRecord?.attributes,
        toAttributes(MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1.attributes!)
      );
      assert.strictEqual(logRecord?.flags, MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1.context?.traceFlags);
      assert.strictEqual(logRecord?.traceId, MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1.context?.traceId);
      assert.strictEqual(logRecord?.spanId, MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1.context?.spanId);
    });
  });
});
