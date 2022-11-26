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

import type { Attributes, AttributeValue } from "@opentelemetry/api";
import * as assert from "assert";
import * as sinon from "sinon";
import { Resource } from "@opentelemetry/resources";

import type { LogRecordData, LogRecordLimits } from "./../../src";
import { LogRecord } from "./../../src";
import { loadDefaultConfig } from "../../src/config";
import { MultiLogRecordProcessor } from "../../src/MultiLogRecordProcessor";
import { invalidAttributes, validAttributes } from "./utils";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { timeInputToHrTime } from "@opentelemetry/core";

const setup = (limits?: LogRecordLimits, shutdown?: boolean, data?: LogRecordData) => {
  const { forceFlushTimeoutMillis, logRecordLimits } = loadDefaultConfig();
  const logRecord = new LogRecord(
    {
      activeProcessor: new MultiLogRecordProcessor(forceFlushTimeoutMillis),
      resource: Resource.default(),
      logRecordLimits: {
        attributeValueLengthLimit: limits?.attributeValueLengthLimit ?? logRecordLimits.attributeValueLengthLimit,
        attributeCountLimit: limits?.attributeCountLimit ?? logRecordLimits.attributeCountLimit,
      },
      // @ts-expect-error
      shutdownOnceFeature: { isCalled: shutdown },
    },
    data || {}
  );
  return { logRecord };
};

describe("LogRecord", () => {
  describe("constructor", () => {
    it("should create an instance", () => {
      const { logRecord } = setup();
      assert.ok(logRecord instanceof LogRecord);
    });

    it("should have a default timestamp", () => {
      const { logRecord } = setup();
      // @ts-expect-error
      const { _timestamp } = logRecord;
      assert.ok(_timestamp !== undefined);
    });

    it("should create an instance with data", () => {
      const logRecordData = {
        instrumentationScope: {
          name: "name",
        },
        timestamp: new Date().getTime(),
        severityNumber: SeverityNumber.DEBUG,
        severityText: "DEBUG",
        body: "this is a body",
        attributes: {
          name: "zhangsan",
        },
        context: {
          traceId: "trance id",
          spanId: "span id",
          traceFlags: 1,
        },
      };
      const logRecord = setup(undefined, undefined, logRecordData).logRecord;
      assert.deepStrictEqual(
        // @ts-expect-error
        logRecord._timestamp,
        timeInputToHrTime(logRecordData.timestamp)
      );
      assert.strictEqual(
        // @ts-expect-error
        logRecord._severityNumber,
        logRecordData.severityNumber
      );
      assert.strictEqual(
        // @ts-expect-error
        logRecord._severityText,
        logRecordData.severityText
      );
      assert.strictEqual(
        // @ts-expect-error
        logRecord._body,
        logRecordData.body
      );
      assert.deepStrictEqual(
        // @ts-expect-error
        logRecord._attributes,
        logRecordData.attributes
      );
      assert.deepStrictEqual(
        // @ts-expect-error
        logRecord._context,
        logRecordData.context
      );
      assert.deepStrictEqual(
        // @ts-expect-error
        logRecord._instrumentationScope,
        logRecordData.instrumentationScope
      );
    });
  });

  describe("setAttribute", () => {
    describe("when default options set", () => {
      it("should set an attribute", () => {
        const { logRecord } = setup();
        for (const [k, v] of Object.entries(validAttributes)) {
          logRecord.setAttribute(k, v);
        }
        for (const [k, v] of Object.entries(invalidAttributes)) {
          logRecord.setAttribute(k, v as unknown as AttributeValue);
        }
        // @ts-expect-error
        assert.deepStrictEqual(logRecord._attributes, validAttributes);
      });

      it("should be able to overwrite attributes", () => {
        const { logRecord } = setup();
        logRecord.setAttribute("overwrite", "initial value");
        logRecord.setAttribute("overwrite", "overwritten value");
        // @ts-expect-error
        assert.deepStrictEqual(logRecord._attributes, {
          overwrite: "overwritten value",
        });
      });
    });

    describe("when logRecordLimits options set", () => {
      describe('when "attributeCountLimit" option defined', () => {
        const { logRecord } = setup({ attributeCountLimit: 100 });
        for (let i = 0; i < 150; i++) {
          logRecord.setAttribute(`foo${i}`, `bar${i}`);
        }

        it("should remove / drop all remaining values after the number of values exceeds this limit", () => {
          // @ts-expect-error
          const { _attributes } = logRecord;
          assert.strictEqual(Object.keys(_attributes).length, 100);
          assert.strictEqual(_attributes.foo0, "bar0");
          assert.strictEqual(_attributes.foo99, "bar99");
          assert.strictEqual(_attributes.foo149, undefined);
        });
      });

      describe('when "attributeValueLengthLimit" option defined', () => {
        const { logRecord } = setup({ attributeValueLengthLimit: 5 });
        // @ts-expect-error
        const { _attributes } = logRecord;

        it("should truncate value which length exceeds this limit", () => {
          logRecord.setAttribute("attr-with-more-length", "abcdefgh");
          assert.strictEqual(_attributes["attr-with-more-length"], "abcde");
        });

        it("should truncate value of arrays which exceeds this limit", () => {
          logRecord.setAttribute("attr-array-of-strings", ["abcdefgh", "abc", "abcde", ""]);
          logRecord.setAttribute("attr-array-of-bool", [true, false]);
          assert.deepStrictEqual(_attributes["attr-array-of-strings"], ["abcde", "abc", "abcde", ""]);
          assert.deepStrictEqual(_attributes["attr-array-of-bool"], [true, false]);
        });

        it("should not truncate value which length not exceeds this limit", () => {
          logRecord.setAttribute("attr-with-less-length", "abc");
          assert.strictEqual(_attributes["attr-with-less-length"], "abc");
        });

        it("should return same value for non-string values", () => {
          logRecord.setAttribute("attr-non-string", true);
          assert.strictEqual(_attributes["attr-non-string"], true);
        });
      });

      describe('when "attributeValueLengthLimit" option is invalid', () => {
        const { logRecord } = setup({ attributeValueLengthLimit: -5 });
        // @ts-expect-error
        const { _attributes } = logRecord;

        it("should not truncate any value", () => {
          logRecord.setAttribute("attr-not-truncate", "abcdefgh");
          logRecord.setAttribute("attr-array-of-strings", ["abcdefgh", "abc", "abcde"]);
          assert.deepStrictEqual(_attributes["attr-not-truncate"], "abcdefgh");
          assert.deepStrictEqual(_attributes["attr-array-of-strings"], ["abcdefgh", "abc", "abcde"]);
        });
      });
    });
  });

  describe("setAttributes", () => {
    it("should be able to set multiple attributes", () => {
      const { logRecord } = setup();
      logRecord.setAttributes(validAttributes);
      logRecord.setAttributes(invalidAttributes as unknown as Attributes);
      // @ts-expect-error
      assert.deepStrictEqual(logRecord._attributes, validAttributes);
    });
  });

  describe("emit", () => {
    it("should be emit", () => {
      const { logRecord } = setup();
      const callSpy = sinon.spy(
        // @ts-expect-error
        logRecord._loggerSharedState.activeProcessor,
        "onEmit"
      );
      logRecord.emit();
      assert.ok(callSpy.called);
    });

    it("should do nothing if already shutdown", () => {
      const { logRecord } = setup(undefined, true);
      const callSpy = sinon.spy(
        // @ts-expect-error
        logRecord._loggerSharedState.activeProcessor,
        "onEmit"
      );
      logRecord.emit();
      assert.ok(callSpy.callCount === 0);
    });

    it("should be allow emit only once", () => {
      const { logRecord } = setup();
      const callSpy = sinon.spy(
        // @ts-expect-error
        logRecord._loggerSharedState.activeProcessor,
        "onEmit"
      );
      logRecord.emit();
      logRecord.emit();
      assert.ok(callSpy.callCount === 1);
    });
  });
});
