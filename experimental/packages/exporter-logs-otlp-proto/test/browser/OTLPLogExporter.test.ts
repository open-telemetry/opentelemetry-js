/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import * as sinon from 'sinon';

import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';

/*
 * NOTE: Tests here are not intended to test the underlying components directly. They are intended as a quick
 * check if the correct components are used. Use the following packages to test details:
 * - `@opentelemetry/oltp-exporter-base`: OTLP common exporter logic (handling of concurrent exports, ...), HTTP transport code
 * - `@opentelemetry/otlp-transformer`: Everything regarding serialization and transforming internal representations to OTLP
 */

describe('OTLPLogExporter', function () {
  afterEach(() => {
    sinon.restore();
  });

  describe('export', function () {
    it('should successfully send data using fetch', async function () {
      // arrange
      const stubFetch = sinon
        .stub(window, 'fetch')
        .resolves(new Response('', { status: 200 }));
      const loggerProvider = new LoggerProvider({
        processors: [new SimpleLogRecordProcessor(new OTLPLogExporter())],
      });

      // act
      loggerProvider.getLogger('test-logger').emit({ body: 'test-body' });
      await loggerProvider.shutdown();

      // assert
      const request = new Request(...stubFetch.args[0]);
      const body = await request.text();
      assert.throws(
        () => JSON.parse(body),
        'expected requestBody to be in protobuf format, but parsing as JSON succeeded'
      );
    });
  });
});
