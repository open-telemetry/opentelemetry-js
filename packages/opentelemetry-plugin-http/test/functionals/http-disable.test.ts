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
import { AsyncHooksScopeManager } from '@opentelemetry/scope-async-hooks';
import { NodeTracer } from '@opentelemetry/node-tracer';
import { NoopLogger } from '@opentelemetry/core';
import { AddressInfo } from 'net';
import { DummyPropagation } from '../utils/DummyPropagation';
import { httpRequest } from '../utils/httpRequest';

describe('HttpPlugin', () => {
  let server: http.Server;
  let serverPort = 0;

  describe('disable()', () => {
    const scopeManager = new AsyncHooksScopeManager();
    const httpTextFormat = new DummyPropagation();
    const logger = new NoopLogger();
    const tracer = new NodeTracer({
      scopeManager,
      logger,
      httpTextFormat,
    });
    before(() => {
      nock.cleanAll();
      nock.enableNetConnect();

      plugin.enable(http, tracer, tracer.logger);
      server = http.createServer((request, response) => {
        response.end('Test Server Response');
      });

      server.listen(serverPort);
      server.once('listening', () => {
        serverPort = (server.address() as AddressInfo).port;
      });
    });

    beforeEach(() => {
      tracer.startSpan = sinon.spy();
      tracer.withSpan = sinon.spy();
      tracer.recordSpanData = sinon.spy();
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

        await httpRequest.get(options).then(result => {
          assert.strictEqual(
            (tracer.startSpan as sinon.SinonSpy).called,
            false
          );
          assert.strictEqual((tracer.withSpan as sinon.SinonSpy).called, false);
          assert.strictEqual(
            (tracer.recordSpanData as sinon.SinonSpy).called,
            false
          );
        });
      });
    });
  });
});
