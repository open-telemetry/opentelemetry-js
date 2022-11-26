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

import type { ReadableLogRecord } from "./../../../src";
import { ConsoleLogRecordExporter } from "../../../src";

describe("ConsoleLogRecordExporter", () => {
  let previousConsoleDir: typeof console.dir;

  beforeEach(() => {
    previousConsoleDir = console.dir;
    console.dir = () => {};
  });

  afterEach(() => {
    console.dir = previousConsoleDir;
  });

  describe("export", () => {
    it("should export information about log record", (done) => {
      const consoleExporter = new ConsoleLogRecordExporter();
      const spyConsole = sinon.spy(console, "dir");
      const logs: ReadableLogRecord[] = [];
      for (let i = 0; i < 10; i++) {
        // @ts-expect-error
        logs.push({});
      }
      consoleExporter.export(logs, () => {
        assert.strictEqual(spyConsole.callCount, logs.length);
        done();
      });
    });
  });
});
