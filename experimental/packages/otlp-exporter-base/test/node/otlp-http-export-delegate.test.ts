/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { createOtlpHttpExportDelegate } from '../../src/otlp-http-export-delegate';
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { ExportResultCode } from '@opentelemetry/core';

import * as sinon from 'sinon';
import * as http from 'http';
import * as assert from 'assert';

// IMPLEMENTATION NOTE:
//
// This file should only include rather simple test cases for integration testing the used components.
// Think: "is the correct component used?", rather than "does the underlying component work correctly?"
// Features and fixes for components that are used by createOtlpHttpExportDelegate() should be tested in-depth
// in the component's respective unit-test files.

describe('createOtlpHttpExportDelegate', function () {
  let server: http.Server;
  beforeEach(function (done) {
    server = http.createServer((request, response) => {
      response.statusCode = 200;
      response.end('Test Server Response');
    });
    server.listen(8083);
    server.once('listening', () => {
      done();
    });
  });

  afterEach(function (done) {
    server.close(() => {
      done();
    });
  });

  it('creates delegate that exports via http', function (done) {
    const serializer: ISerializer<string, string> = {
      serializeRequest: sinon.stub().returns(Buffer.from([1, 2, 3])),
      deserializeResponse: sinon.stub().returns('response'),
    };
    const delegate = createOtlpHttpExportDelegate(
      {
        url: 'http://localhost:8083',
        agentFactory: () => new http.Agent(),
        compression: 'none',
        concurrencyLimit: 30,
        headers: async () => ({}),
        timeoutMillis: 1000,
      },
      serializer
    );

    delegate.export('foo', result => {
      try {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
