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

import * as assert from 'assert';
import * as http from 'http';
import * as nock from 'nock';
import * as sinon from 'sinon';

import { plugin } from '../../src/http';
import {
  NoopLogger,
  NoopTracerRegistry,
  noopTracer,
} from '@opentelemetry/core';
import { AddressInfo } from 'net';
import { httpRequest } from '../utils/httpRequest';

describe('HttpPlugin', () => {
  let server: http.Server;
  let serverPort = 0;

  describe('disable()', () => {
    const logger = new NoopLogger();
    const registry = new NoopTracerRegistry();
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();

      plugin.enable(http, registry, logger);
      // Ensure that http module is patched.
      assert.strictEqual(http.Server.prototype.emit.__wrapped, true);
      server = http.createServer((request, response) => {
        response.end('Test Server Response');
      });

      server.listen(serverPort);
      server.once('listening', () => {
        serverPort = (server.address() as AddressInfo).port;
      });
    });

    beforeEach(() => {
      noopTracer.startSpan = sinon.spy();
      noopTracer.withSpan = sinon.spy();
    });

    afterEach(() => {
      sinon.restore();
    });

    after(() => {
      server.close();
    });
    describe('unpatch()', () => {
      it('should not call registry methods for creating span', async () => {
        plugin.disable();
        const testPath = '/incoming/unpatch/';

        const options = { host: 'localhost', path: testPath, port: serverPort };

        await httpRequest.get(options).then(result => {
          assert.strictEqual(
            (noopTracer.startSpan as sinon.SinonSpy).called,
            false
          );

          assert.strictEqual(http.Server.prototype.emit.__wrapped, undefined);
          assert.strictEqual(
            (noopTracer.withSpan as sinon.SinonSpy).called,
            false
          );
        });
      });
    });
  });
});
