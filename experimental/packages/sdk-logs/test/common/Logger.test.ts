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
import { Resource } from "@opentelemetry/resources";

import { Logger, LogRecord } from "../../src";
import { loadDefaultConfig } from "../../src/config";
import { MultiLogRecordProcessor } from "../../src/MultiLogRecordProcessor";
import { EVENT_LOGS_ATTRIBUTES } from "../../src/semantic-conventions";

const setup = () => {
  const { forceFlushTimeoutMillis, logRecordLimits } = loadDefaultConfig();
  const logger = new Logger({
    eventDomain: "eventDomain",
    // @ts-expect-error
    loggerSharedState: {
      activeProcessor: new MultiLogRecordProcessor(forceFlushTimeoutMillis),
      resource: Resource.default(),
      logRecordLimits,
    },
    instrumentationScope: {
      name: "test name",
      version: "test version",
      schemaUrl: "test schema url",
    },
  });
  return { logger };
};

describe("Logger", () => {
  describe("constructor", () => {
    it("should contruct an instance", () => {
      const { logger } = setup();
      assert.ok(logger instanceof Logger);
    });
  });

  describe("getLogRecord", () => {
    it("should get a logRecord instance", () => {
      const { logger } = setup();
      const logRecord = logger.getLogRecord();
      assert.ok(logRecord instanceof LogRecord);
    });
  });

  describe("getLogEvent", () => {
    it("should get a logRecord instance with event attributes", () => {
      const { logger } = setup();
      const eventName = "test event name";
      const logRecord = logger.getLogEvent(eventName);
      assert.ok(logRecord instanceof LogRecord);
      const eventAttributes = {
        [EVENT_LOGS_ATTRIBUTES.name]: eventName,
        // @ts-expect-error
        [EVENT_LOGS_ATTRIBUTES.domain]: logger._eventDomain,
      };
      // @ts-expect-error
      assert.deepStrictEqual(logRecord._attributes, eventAttributes);
    });
  });
});
