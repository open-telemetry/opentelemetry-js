/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';

import { OTLPMetricExporter } from '../../src/platform/node';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { Stream } from 'stream';

/*
 * NOTE: Tests here are not intended to test the underlying components directly. They are intended as a quick
 * check if the correct components are used. Use the following packages to test details:
 * - `@opentelemetry/oltp-exporter-base`: OTLP common exporter logic (handling of concurrent exports, ...), HTTP transport code
 * - `@opentelemetry/otlp-transformer`: Everything regarding serialization and transforming internal representations to OTLP
 */

describe('OTLPMetricExporter', () => {
  describe('export', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('successfully exports data', function (done) {
      // arrange
      const fakeRequest = new Stream.PassThrough();
      Object.defineProperty(fakeRequest, 'setTimeout', {
        value: function (_timeout: number) {},
      });

      sinon.stub(http, 'request').returns(fakeRequest as any);
      let buff = Buffer.from('');
      fakeRequest.on('finish', () => {
        try {
          // assert
          const requestBody = buff.toString();
          assert.throws(() => {
            JSON.parse(requestBody);
          }, 'expected requestBody to be in protobuf format, but parsing as JSON succeeded');
          done();
        } catch (e) {
          done(e);
        }
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      const meterProvider = new MeterProvider({
        readers: [
          new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter(),
          }),
        ],
      });
      meterProvider.getMeter('test-meter').createCounter('test-counter').add(1);

      // act
      meterProvider.shutdown();
    });
  });
});
