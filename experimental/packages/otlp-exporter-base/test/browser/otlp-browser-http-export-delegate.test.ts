/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import * as assert from 'assert';
import { ExportResultCode } from '@opentelemetry/core';
import { createOtlpFetchExportDelegate } from '../../src/otlp-browser-http-export-delegate';
import { createOtlpSendBeaconExportDelegate } from '../../src/index-browser-http';
import { ExporterMetrics } from '../../src';

const noopMetrics = new ExporterMetrics({
  componentType: 'test',
  metricsHelper: { name: 'span', countItems: () => 1 },
  url: 'http://example.test',
  meterProvider: undefined,
  responseAttributesFromError: () => ({}),
});

for (const [name, createDelegate] of [
  ['createOtlpFetchExportDelegate', createOtlpFetchExportDelegate],
  ['createOtlpSendBeaconExportDelegate', createOtlpSendBeaconExportDelegate],
] as const) {
  describe(name, function () {
    afterEach(function () {
      sinon.restore();
    });

    it('passes the compression option to the fetch transport', async function () {
      // arrange
      const fetchStub = sinon
        .stub(globalThis, 'fetch')
        .resolves(new Response('', { status: 200 }));
      const delegate = createDelegate(
        {
          url: 'http://example.test',
          headers: async () => ({ 'Content-Type': 'application/json' }),
          compression: 'gzip',
          timeoutMillis: 10000,
          concurrencyLimit: 1,
        },
        {
          serializeRequest: () => Uint8Array.from([1, 2, 3]),
          deserializeResponse: () => ({}),
        },
        noopMetrics
      );

      // act
      const result = await new Promise<{ code: ExportResultCode }>(resolve =>
        delegate.export({}, resolve)
      );

      // assert
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      const requestInit = fetchStub.firstCall.args[1] as RequestInit;
      assert.strictEqual(
        new Headers(requestInit.headers).get('Content-Encoding'),
        'gzip'
      );
    });
  });
}
