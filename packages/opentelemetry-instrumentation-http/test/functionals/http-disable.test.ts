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
import { NoopTracerProvider, NOOP_TRACER } from '@opentelemetry/api';
import { NoopLogger } from '@opentelemetry/core';
import * as assert from 'assert';
import { HttpInstrumentation } from '../../src/http';
import { AddressInfo } from 'net';
import * as nock from 'nock';
import * as sinon from 'sinon';
import { httpRequest } from '../utils/httpRequest';
import { isWrapped } from '@opentelemetry/instrumentation';

const logger = new NoopLogger();
const instrumentation = new HttpInstrumentation({ logger });
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';

describe('HttpInstrumentation', () => {
  let server: http.Server;
  let serverPort = 0;

  describe('disable()', () => {
    const provider = new NoopTracerProvider();
    before(() => {
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

    beforeEach(() => {
      NOOP_TRACER.startSpan = sinon.spy();
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

        await httpRequest.get(options).then(result => {
          assert.strictEqual(
            (NOOP_TRACER.startSpan as sinon.SinonSpy).called,
            false
          );
        });
      });
    });
  });
});
