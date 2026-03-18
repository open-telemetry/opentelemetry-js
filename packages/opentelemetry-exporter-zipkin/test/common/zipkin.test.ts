/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
