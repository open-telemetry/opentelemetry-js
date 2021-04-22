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
import { ZipkinExporter } from '../../src';
import * as sinon from 'sinon';
import { mockedReadableSpan } from '../helper';

describe('zipkin - header interceptor', () => {
  describe('getExportRequestHeaders', () => {
    describe('when callback is defined', () => {
      it('should call callback before sending', () => {
        const getExportRequestHeaders = sinon.spy();
        const span = Object.assign({}, mockedReadableSpan);
        const exporter = new ZipkinExporter({
          getExportRequestHeaders,
        });
        const oldFunction = exporter['_send'];
        exporter.export([span], () => {});

        assert.strictEqual(getExportRequestHeaders.callCount, 1);
        assert.notStrictEqual(exporter['_getHeaders'], undefined);
        assert.notStrictEqual(oldFunction, exporter['_send']);
      });
    });
    describe('when callback is NOT defined', () => {
      it('should call callback before sending', () => {
        const span = Object.assign({}, mockedReadableSpan);
        const exporter = new ZipkinExporter();
        const oldFunction = exporter['_send'];
        assert.strictEqual(exporter['_getHeaders'], undefined);
        exporter.export([span], () => {});
        assert.strictEqual(oldFunction, exporter['_send']);
      });
    });
  });
});
