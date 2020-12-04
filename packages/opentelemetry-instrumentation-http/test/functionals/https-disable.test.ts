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
import * as fs from 'fs';
import type { AddressInfo } from 'net';
import * as nock from 'nock';
import * as sinon from 'sinon';
import { HttpInstrumentation } from '../../src';
import { isWrapped } from '@opentelemetry/instrumentation';

const logger = new NoopLogger();
const instrumentation = new HttpInstrumentation({ logger });
instrumentation.enable();
instrumentation.disable();

import * as https from 'https';
import { httpsRequest } from '../utils/httpsRequest';

describe('HttpsInstrumentation', () => {
  let server: https.Server;
  let serverPort = 0;

  describe('disable()', () => {
    const provider = new NoopTracerProvider();
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();

      instrumentation.enable();
      assert.strictEqual(isWrapped(https.Server.prototype.emit), true);
      instrumentation.setTracerProvider(provider);

      server = https.createServer(
        {
          key: fs.readFileSync('test/fixtures/server-key.pem'),
          cert: fs.readFileSync('test/fixtures/server-cert.pem'),
        },
        (request, response) => {
          response.end('Test Server Response');
        }
      );

      server.listen(serverPort);
      server.once('listening', () => {
        serverPort = (server.address() as AddressInfo).port;
      });
    });

    beforeEach(() => {
      NOOP_TRACER.startSpan = sinon.spy();
      NOOP_TRACER.withSpan = sinon.spy();
    });

    afterEach(() => {
      sinon.restore();
    });

    after(() => {
      server.close();
    });
    describe('unpatch()', () => {
      it('should not call tracer methods for creating span', async () => {
        instrumentation.disable();
        const testPath = '/incoming/unpatch/';

        const options = { host: 'localhost', path: testPath, port: serverPort };

        await httpsRequest.get(options).then(result => {
          assert.strictEqual(
            (NOOP_TRACER.startSpan as sinon.SinonSpy).called,
            false
          );

          assert.strictEqual(isWrapped(https.Server.prototype.emit), false);
          assert.strictEqual(
            (NOOP_TRACER.withSpan as sinon.SinonSpy).called,
            false
          );
        });
      });
    });
  });
});
