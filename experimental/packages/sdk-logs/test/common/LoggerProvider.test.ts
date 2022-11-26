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
import * as sinon from "sinon";
import { Resource } from "@opentelemetry/resources";

import type { LogRecordProcessor } from "./../../src/LogRecordProcessor";
import { Logger, LoggerProvider } from "../../src";
import { loadDefaultConfig } from "../../src/config";
import { DEFAULT_EVENT_DOMAIN } from "./../../src/config";

describe("LoggerProvider", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should contruct an instance", () => {
      const provider = new LoggerProvider();
      assert.ok(provider instanceof LoggerProvider);
    });

    it("should have default resource if not pass", () => {
      const provider = new LoggerProvider();
      // @ts-expect-error
      const { resource } = provider._loggerSharedState;
      assert.deepStrictEqual(resource, Resource.default());
    });

    it("should have default logRecordLimits if not pass", () => {
      const provider = new LoggerProvider();
      // @ts-expect-error
      const { logRecordLimits } = provider._loggerSharedState;
      assert.deepStrictEqual(logRecordLimits, loadDefaultConfig().logRecordLimits);
    });

    it("should have default forceFlushTimeoutMillis if not pass", () => {
      const provider = new LoggerProvider();
      // @ts-expect-error
      const { activeProcessor } = provider._loggerSharedState;
      assert.ok(
        // @ts-expect-error
        activeProcessor._forceFlushTimeoutMillis === loadDefaultConfig().forceFlushTimeoutMillis
      );
    });
  });

  describe("getLogger", () => {
    const testName = "test name";
    const testVersion = "test version";
    const testSchemaURL = "test schema url";

    it("should create a logger instance if the name  doesn't exist", () => {
      const provider = new LoggerProvider();
      // @ts-expect-error
      assert.ok(provider._loggers.size === 0);
      provider.getLogger(testName);
      // @ts-expect-error
      assert.ok(provider._loggers.size === 1);
    });

    it("should have default eventDomain if not pass", () => {
      const provider = new LoggerProvider();
      const logger = provider.getLogger("test-name");
      // @ts-expect-error
      assert.ok(logger._eventDomain === DEFAULT_EVENT_DOMAIN);
    });

    it("should create A new object if the name & version & schemaUrl are not unique", () => {
      const provider = new LoggerProvider();
      // @ts-expect-error
      assert.ok(provider._loggers.size === 0);

      provider.getLogger(testName);
      // @ts-expect-error
      assert.ok(provider._loggers.size === 1);
      provider.getLogger(testName, testVersion);
      // @ts-expect-error
      assert.ok(provider._loggers.size === 2);
      provider.getLogger(testName, testVersion, { schemaUrl: testSchemaURL });
      // @ts-expect-error
      assert.ok(provider._loggers.size === 3);
    });

    it("should not create A new object if the name & version & schemaUrl are unique", () => {
      const provider = new LoggerProvider();

      // @ts-expect-error
      assert.ok(provider._loggers.size === 0);
      provider.getLogger(testName);
      // @ts-expect-error
      assert.ok(provider._loggers.size === 1);
      const logger1 = provider.getLogger(testName, testVersion, {
        schemaUrl: testSchemaURL,
      });
      // @ts-expect-error
      assert.ok(provider._loggers.size === 2);
      const logger2 = provider.getLogger(testName, testVersion, {
        schemaUrl: testSchemaURL,
      });
      // @ts-expect-error
      assert.ok(provider._loggers.size === 2);
      assert.ok(logger2 instanceof Logger);
      assert.ok(logger1 === logger2);
    });
  });

  describe("addLogRecordProcessor", () => {
    it("should add logRecord processor", () => {
      // @ts-expect-error
      const logRecordProcessor: LogRecordProcessor = {};
      const provider = new LoggerProvider();
      const callSpy = sinon.spy(
        // @ts-expect-error
        provider._loggerSharedState.activeProcessor,
        "addLogRecordProcessor"
      );
      provider.addLogRecordProcessor(logRecordProcessor);
      assert.strictEqual(callSpy.callCount, 1);
    });
  });

  describe("forceFlush", () => {
    it("should force flush", async () => {
      const provider = new LoggerProvider();
      const callSpy = sinon.spy(
        // @ts-expect-error
        provider._loggerSharedState.activeProcessor,
        "forceFlush"
      );
      await provider.forceFlush();
      assert.strictEqual(callSpy.callCount, 1);
    });

    it("should not flush if already shutdown", async () => {
      const provider = new LoggerProvider();
      const callSpy = sinon.spy(
        // @ts-expect-error
        provider._loggerSharedState.activeProcessor,
        "forceFlush"
      );
      await provider.shutdown();
      await assert.rejects(provider.forceFlush(), /can not flush, it is already shutdown/);
      assert.strictEqual(callSpy.callCount, 0);
    });
  });

  describe("shutdown", () => {
    it("should shutdown", async () => {
      const provider = new LoggerProvider();
      const callSpy = sinon.spy(
        // @ts-expect-error
        provider._loggerSharedState.activeProcessor,
        "shutdown"
      );
      await provider.shutdown();
      assert.strictEqual(callSpy.callCount, 1);
    });

    it("should only shutdown once", async () => {
      const provider = new LoggerProvider();
      const callSpy = sinon.spy(
        // @ts-expect-error
        provider._loggerSharedState.activeProcessor,
        "shutdown"
      );
      await provider.shutdown();
      await provider.shutdown();
      assert.strictEqual(callSpy.callCount, 1);
    });
  });
});
