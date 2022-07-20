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

import { diag, DiagAPI } from '@opentelemetry/api';
import { DEFAULT_ENVIRONMENT, ENVIRONMENT } from '@opentelemetry/core';
import assert = require('assert');
import Sinon = require('sinon');
import * as grpc from '@grpc/grpc-js';
import { getConnectionOptions } from '../../src/util';

describe('Security', () => {
  describe('getConnectionOptions', () => {
    let env: Required<ENVIRONMENT>;
    let diagSpy: Sinon.SinonSpy;

    beforeEach(() => {
      env = Object.assign({}, DEFAULT_ENVIRONMENT);
      diagSpy = Sinon.spy(diag, 'warn')
    });

    afterEach(() => {
      Sinon.restore();
    })

    it('should use an insecure connection with http://', () => {
      const { credentials } = getConnectionOptions({ url: 'http://foo.bar.baz' }, env);
      assert.strictEqual(credentials._isSecure(), false);
    });

    it('should use a secure connection with https://', () => {
      const { credentials } = getConnectionOptions({ url: 'https://foo.bar.baz' }, env);
      assert.strictEqual(credentials._isSecure(), true);
    });

    it('should get certificate from traces env', () => {
      env.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE = "./test/certs/ca.crt";
      env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE = "./test/certs/client.crt";
      env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY = "./test/certs/client.key";
      const { credentials } = getConnectionOptions({ url: 'https://foo.bar.baz' }, env);
      const opts = credentials._getConnectionOptions();
      assert.ok(opts);
      assert.ok(opts.secureContext);
      // warning is logged if credentials fail to load
      Sinon.assert.notCalled(diagSpy)
    });

    it('should get certificate from global env', () => {
      env.OTEL_EXPORTER_OTLP_CERTIFICATE = "./test/certs/ca.crt";
      env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE = "./test/certs/client.crt";
      env.OTEL_EXPORTER_OTLP_CLIENT_KEY = "./test/certs/client.key";
      const { credentials } = getConnectionOptions({ url: 'https://foo.bar.baz' }, env);
      const opts = credentials._getConnectionOptions();
      assert.ok(opts);
      assert.ok(opts.secureContext);
      // warning is logged if credentials fail to load
      Sinon.assert.notCalled(diagSpy)
    });

    it('should prefer traces env over global', () => {
      env.OTEL_EXPORTER_OTLP_CERTIFICATE = "./test/certs/ca.crt.doesnotexist";
      env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE = "./test/certs/client.crt.doesnotexist";
      env.OTEL_EXPORTER_OTLP_CLIENT_KEY = "./test/certs/client.key.doesnotexist";
      env.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE = "./test/certs/ca.crt";
      env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE = "./test/certs/client.crt";
      env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY = "./test/certs/client.key";
      const { credentials } = getConnectionOptions({ url: 'https://foo.bar.baz' }, env);
      const opts = credentials._getConnectionOptions();
      assert.ok(opts);
      assert.ok(opts.secureContext);
      // warning is logged if credentials fail to load
      Sinon.assert.notCalled(diagSpy)
    });

    it('should log a warning if any credentials cannot be loaded', () => {
      env.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE = "./test/certs/ca.crt.doesnotexist";
      env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE = "./test/certs/client.crt.doesnotexist";
      env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY = "./test/certs/client.key.doesnotexist";
      getConnectionOptions({ url: 'https://foo.bar.baz' }, env);
      Sinon.assert.calledWithExactly(diagSpy.getCall(0), 'Failed to read root certificate file')
      Sinon.assert.calledWithExactly(diagSpy.getCall(1), 'Failed to read client certificate private key file')
      Sinon.assert.calledWithExactly(diagSpy.getCall(2), 'Failed to read client certificate chain file')
    })

    it('should use provided credentials instead of env', () => {
      env.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE = "./test/certs/ca.crt.doesnotexist";
      env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE = "./test/certs/client.crt.doesnotexist";
      env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY = "./test/certs/client.key.doesnotexist";
      getConnectionOptions({ url: 'https://foo.bar.baz', credentials: grpc.credentials.createSsl() }, env);
      // warn would be called if credentials tried to load because files don't exist
      Sinon.assert.notCalled(diagSpy)
    })
  });
});
