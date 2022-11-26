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

import type { ReadableLogRecord } from "../../../src";
import { InMemoryLogRecordExporter } from "../../../src";

describe("InMemoryLogRecordExporter", () => {
  describe("export", () => {
    it("should export information about log record", (done) => {
      const memoryExporter = new InMemoryLogRecordExporter();
      const logs: ReadableLogRecord[] = [];
      for (let i = 0; i < 10; i++) {
        // @ts-expect-error
        logs.push({});
      }
      memoryExporter.export(logs, () => {
        // @ts-expect-error
        assert.strictEqual(memoryExporter._finishedLogRecords.length, logs.length);
        done();
      });
    });
  });

  describe("shutdown", () => {
    it("should clear all log records", (done) => {
      const memoryExporter = new InMemoryLogRecordExporter();
      const logs: ReadableLogRecord[] = [];
      for (let i = 0; i < 10; i++) {
        // @ts-expect-error
        logs.push({});
      }
      memoryExporter.export(logs, () => {
        // @ts-expect-error
        assert.strictEqual(memoryExporter._finishedLogRecords.length, logs.length);
        memoryExporter.shutdown();
        // @ts-expect-error
        assert.strictEqual(memoryExporter._finishedLogRecords.length, 0);
        done();
      });
    });
  });

  describe("getFinishedLogRecords", () => {
    it("should get all log records", (done) => {
      const memoryExporter = new InMemoryLogRecordExporter();
      const logs: ReadableLogRecord[] = [];
      for (let i = 0; i < 10; i++) {
        // @ts-expect-error
        logs.push({});
      }
      memoryExporter.export(logs, () => {
        assert.strictEqual(memoryExporter.getFinishedLogRecords().length, logs.length);
        done();
      });
    });
  });

  describe("reset", () => {
    it("should clear all log records", (done) => {
      const memoryExporter = new InMemoryLogRecordExporter();
      const logs: ReadableLogRecord[] = [];
      for (let i = 0; i < 10; i++) {
        // @ts-expect-error
        logs.push({});
      }
      memoryExporter.export(logs, () => {
        // @ts-expect-error
        assert.strictEqual(memoryExporter._finishedLogRecords.length, logs.length);
        memoryExporter.reset();
        // @ts-expect-error
        assert.strictEqual(memoryExporter._finishedLogRecords.length, 0);
        done();
      });
    });
  });
});
