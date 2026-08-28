/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '@opentelemetry/api';
import { config } from '@opentelemetry/api-config';
import { createConfigProvider } from '@opentelemetry/configuration';
import type { ConfigProvider } from '@opentelemetry/api-config';
import { HttpInstrumentation } from '../../src/http';

describe('HttpInstrumentation declarative config', function () {
  let warn: sinon.SinonStub;

  const created: HttpInstrumentation[] = [];
  function makeInstrumentation(
    configProvider: ConfigProvider,
    config?: ConstructorParameters<typeof HttpInstrumentation>[0]
  ): HttpInstrumentation {
    const instrumentation = new HttpInstrumentation(config);
    instrumentation.setConfigProvider(configProvider);
    created.push(instrumentation);
    return instrumentation;
  }

  beforeEach(function () {
    warn = sinon.stub();
    diag.setLogger(
      {
        verbose: () => {},
        debug: () => {},
        info: () => {},
        warn,
        error: () => {},
      },
      DiagLogLevel.WARN
    );
  });

  afterEach(function () {
    created.forEach(instrumentation => instrumentation.disable());
    created.length = 0;
    config.disable();
    diag.disable();
    sinon.restore();
  });

  it('reads supported "general.http.*" and "js.$instrumentationScope.*" config', function () {
    const configProvider = createConfigProvider({
      'instrumentation/development': {
        js: {
          '@opentelemetry/instrumentation-http': {
            disable_incoming_request_instrumentation: true,
            disable_outgoing_request_instrumentation: true,
            require_parent_for_incoming_spans: true,
            // Test warning for an invalid `boolean`.
            require_parent_for_outgoing_spans: 42,
            server_name: 'my-server',
            enable_synthetic_source_detection: true,
            // Test warning for an invalid `string[]`.
            redacted_query_params: ['token', 42],
          },
        },
        general: {
          http: {
            client: {
              request_captured_headers: ['A', 'B'],
              response_captured_headers: ['C', 'D'],
              // This is to test that we get a diag.warn, because
              // instrumentation-http doesn't currently support this setting.
              known_methods:
                'GET,HEAD,POST,PUT,DELETE,CONNECT,OPTIONS,TRACE'.split(','),
            },
            server: {
              request_captured_headers: ['E', 'F'],
              response_captured_headers: ['G', 'H'],
            },
          },
        },
      },
    });
    const config = makeInstrumentation(configProvider).getConfig();

    assert.strictEqual(config.disableIncomingRequestInstrumentation, true);
    assert.strictEqual(config.disableOutgoingRequestInstrumentation, true);
    assert.strictEqual(config.requireParentforIncomingSpans, true);
    assert.strictEqual(config.serverName, 'my-server');
    assert.strictEqual(config.enableSyntheticSourceDetection, true);

    // Ensure the default value is kept when there is a type mismatch.
    assert.strictEqual(config.requireParentforOutgoingSpans, undefined);
    assert.deepStrictEqual(config.redactedQueryParams, undefined);

    assert.deepStrictEqual(config.headersToSpanAttributes, {
      client: {
        requestHeaders: ['A', 'B'],
        responseHeaders: ['C', 'D'],
      },
      server: {
        requestHeaders: ['E', 'F'],
        responseHeaders: ['G', 'H'],
      },
    });

    sinon.assert.calledThrice(warn);
    sinon.assert.calledWithMatch(
      warn.firstCall,
      '@opentelemetry/instrumentation-http',
      'unexpected type for declarative config property "instrumentation/development.js.@opentelemetry/instrumentation-http.require_parent_for_outgoing_spans": expected "boolean", got "number"'
    );
    sinon.assert.calledWithMatch(
      warn.secondCall,
      '@opentelemetry/instrumentation-http',
      'unexpected type for declarative config property "instrumentation/development.js.@opentelemetry/instrumentation-http.redacted_query_params": expected array of strings'
    );
    sinon.assert.calledWithMatch(
      warn.thirdCall,
      '@opentelemetry/instrumentation-http',
      'unhandled declarative configuration properties: ["instrumentation/development.general.http.client.known_methods"]'
    );
  });

  it('leaves unset fields at their constructor value', function () {
    const configProvider = createConfigProvider({
      'instrumentation/development': {
        js: {
          '@opentelemetry/instrumentation-http': {
            require_parent_for_incoming_spans: true,
          },
        },
      },
    });
    const config = makeInstrumentation(configProvider, {
      serverName: 'keep-me',
    }).getConfig();

    assert.strictEqual(config.requireParentforIncomingSpans, true);
    assert.strictEqual(config.serverName, 'keep-me');
  });

  it('keeps in-code header capture settings that declarative config does not set', function () {
    const configProvider = createConfigProvider({
      'instrumentation/development': {
        general: {
          http: { client: { request_captured_headers: ['from-yaml'] } },
        },
      },
    });
    const instrumentation = makeInstrumentation(configProvider, {
      headersToSpanAttributes: {
        client: { responseHeaders: ['in-code-client-resp'] },
        server: { requestHeaders: ['in-code-server-req'] },
      },
    });

    assert.deepStrictEqual(
      instrumentation.getConfig().headersToSpanAttributes,
      {
        client: {
          requestHeaders: ['from-yaml'],
          responseHeaders: ['in-code-client-resp'],
        },
        server: { requestHeaders: ['in-code-server-req'] },
      }
    );
  });
});
