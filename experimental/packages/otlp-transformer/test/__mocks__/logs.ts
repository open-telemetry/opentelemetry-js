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

import type { ReadableLogRecord } from "@opentelemetry/sdk-logs";
import { Resource } from "@opentelemetry/resources";
import { SeverityNumber } from "@opentelemetry/api-logs";

export const MOCK_RESOURCE1 = new Resource({
  service: "service 1",
  version: "1.0,",
  success: true,
});

export const MOCK_RESOURCE2 = new Resource({
  service: "service 2",
  version: "1.0,",
  success: true,
});

export const MOCK_INSTRUMENTATION_SCOPE1 = {
  name: "test name 1",
  version: "1.0.0",
  schemaUrl: "test schemaUrl",
};

export const MOCK_INSTRUMENTATION_SCOPE2 = {
  name: "test name 2",
  version: "1.0.0",
  schemaUrl: "test schemaUrl",
};

export const MOCK_CONTEXT = {
  traceFlags: 1,
  traceId: "test traceId",
  spanId: "test spanId",
};

export const MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION1: ReadableLogRecord = {
  resource: MOCK_RESOURCE1,
  instrumentationScope: MOCK_INSTRUMENTATION_SCOPE1,
  context: MOCK_CONTEXT,
  timestamp: [1668400065, 217499921],
  severityNumber: SeverityNumber.DEBUG,
  severityText: "debug",
  body: "body",
  attributes: { name: "test name" },
};

export const MOCK_LOG_RECORD2_RESOURCE1_INSTRUMENTATION1: ReadableLogRecord = {
  timestamp: [1668400065, 217499921],
  attributes: {},
  resource: MOCK_RESOURCE1,
  instrumentationScope: MOCK_INSTRUMENTATION_SCOPE1,
  context: MOCK_CONTEXT,
};

export const MOCK_LOG_RECORD1_RESOURCE1_INSTRUMENTATION2: ReadableLogRecord = {
  timestamp: [1668400065, 217499921],
  attributes: {},
  resource: MOCK_RESOURCE1,
  instrumentationScope: MOCK_INSTRUMENTATION_SCOPE2,
  context: MOCK_CONTEXT,
};

export const MOCK_LOG_RECORD1_RESOURCE2_INSTRUMENTATION2: ReadableLogRecord = {
  timestamp: [1668400065, 217499921],
  attributes: {},
  resource: MOCK_RESOURCE2,
  instrumentationScope: MOCK_INSTRUMENTATION_SCOPE2,
  context: MOCK_CONTEXT,
};
