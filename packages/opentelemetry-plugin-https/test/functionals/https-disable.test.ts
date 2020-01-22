/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { NoopLogger } from '@opentelemetry/core';
import { Http } from '@opentelemetry/plugin-http';
import * as assert from 'assert';
import * as fs from 'fs';
import * as https from 'https';
import { AddressInfo } from 'net';
import * as nock from 'nock';
import * as sinon from 'sinon';
import { plugin } from '../../src/https';
import { DummyPropagation } from '../utils/DummyPropagation';
import { httpsRequest } from '../utils/httpsRequest';
import { NodeTracerRegistry } from '@opentelemetry/node';
import * as types from '@opentelemetry/api';

describe('HttpsPlugin', () => {
  let server: https.Server;
  let serverPort = 0;

  describe('disable()', () => {
    const httpTextFormat = new DummyPropagation();
    const logger = new NoopLogger();
    const registry = new NodeTracerRegistry({
      logger,
      httpTextFormat,
    });
    // const tracer = registry.getTracer('test-https')
    let tracer: types.Tracer;
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();

      plugin.enable((https as unknown) as Http, registry, registry.logger);
      tracer = plugin['_tracer'];
      // Ensure that https module is patched.
      assert.strictEqual(https.Server.prototype.emit.__wrapped, true);
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
      tracer.startSpan = sinon.spy();
      tracer.withSpan = sinon.spy();
    });

    afterEach(() => {
      sinon.restore();
    });

    after(() => {
      server.close();
    });
    describe('unpatch()', () => {
      it('should not call tracer methods for creating span', async () => {
        plugin.disable();
        const testPath = '/incoming/unpatch/';

        const options = { host: 'localhost', path: testPath, port: serverPort };

        await httpsRequest.get(options).then(result => {
          assert.strictEqual(
            (tracer.startSpan as sinon.SinonSpy).called,
            false
          );

          assert.strictEqual(https.Server.prototype.emit.__wrapped, undefined);
          assert.strictEqual((tracer.withSpan as sinon.SinonSpy).called, false);
        });
      });
    });
  });
});
