/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import { HttpInstrumentation } from '../../src/http';
import { AddressInfo } from 'net';
import * as nock from 'nock';
import * as sinon from 'sinon';
import { httpRequest } from '../utils/httpRequest';
import { isWrapped } from '@opentelemetry/instrumentation';

const instrumentation = new HttpInstrumentation();
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';
import {
  trace,
  TracerProvider,
  INVALID_SPAN_CONTEXT,
} from '@opentelemetry/api';

describe('HttpInstrumentation', () => {
  let server: http.Server;
  let serverPort = 0;

  describe('disable()', () => {
    let provider: TracerProvider;
    let startSpanStub: sinon.SinonStub;

    before(() => {
      provider = {
        getTracer: () => {
          startSpanStub = sinon
            .stub()
            .returns(trace.wrapSpanContext(INVALID_SPAN_CONTEXT));
          return { startSpan: startSpanStub } as any;
        },
      };
      nock.cleanAll();
      nock.enableNetConnect();
      instrumentation.enable();
      assert.strictEqual(isWrapped(http.Server.prototype.emit), true);
      instrumentation.setTracerProvider(provider);

      server = http.createServer((request, response) => {
        response.end('Test Server Response');
      });

      server.listen(serverPort);
      server.once('listening', () => {
        serverPort = (server.address() as AddressInfo).port;
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    after(() => {
      server.close();
    });
    describe('unpatch()', () => {
      it('should not call provider methods for creating span', async () => {
        instrumentation.disable();
        assert.strictEqual(isWrapped(http.Server.prototype.emit), false);

        const testPath = '/incoming/unpatch/';

        const options = { host: 'localhost', path: testPath, port: serverPort };

        await httpRequest.get(options).then(() => {
          sinon.assert.notCalled(startSpanStub);
        });
      });
    });
  });
});
