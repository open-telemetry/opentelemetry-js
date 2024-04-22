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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { OTLPLogExporter } from '../../src/platform/browser/index';

describe('OTLPLogExporter - web', () => {
  let collectorLogsExporter: OTLPLogExporter;
  describe('constructor', () => {
    let onInitSpy: any;
    beforeEach(() => {
      onInitSpy = sinon.stub(OTLPLogExporter.prototype, 'onInit');
      const collectorExporterConfig = {
        hostname: 'foo',
        url: 'http://foo.bar.com',
      };
      collectorLogsExporter = new OTLPLogExporter(collectorExporterConfig);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should create an instance', () => {
      assert.ok(typeof collectorLogsExporter !== 'undefined');
    });
    it('should call onInit', () => {
      assert.strictEqual(onInitSpy.callCount, 1);
    });
    it('should set hostname', () => {
      assert.strictEqual(collectorLogsExporter.hostname, 'foo');
    });

    it('should set url', () => {
      assert.strictEqual(collectorLogsExporter.url, 'http://foo.bar.com');
    });
  });
});
