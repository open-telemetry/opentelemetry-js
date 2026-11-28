/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpanKind, context } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import type { InstrumentationModuleDefinition } from '@opentelemetry/instrumentation';
import { isWrapped } from '@opentelemetry/instrumentation';
import type { ReadableSpan } from '@opentelemetry/sdk-trace';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import * as assert from 'assert';
import * as http from 'http';
import type * as https from 'https';
import type { AddressInfo } from 'net';
import { HttpInstrumentation } from '../../src/http';

const memoryExporter = new InMemorySpanExporter();

function listen(server: http.Server): Promise<void> {
  return new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
}

function close(server: http.Server): Promise<void> {
  return new Promise(resolve => server.close(() => resolve()));
}

function get(server: http.Server): Promise<void> {
  const { port } = server.address() as AddressInfo;
  return new Promise((resolve, reject) => {
    http
      .get({ host: '127.0.0.1', port, path: '/' }, response => {
        response.resume();
        response.on('end', resolve);
        response.on('error', reject);
      })
      .on('error', reject);
  });
}

function serverSpans(): ReadableSpan[] {
  return memoryExporter
    .getFinishedSpans()
    .filter(span => span.kind === SpanKind.SERVER);
}

const settle = () => new Promise(resolve => setTimeout(resolve, 50));

describe('http.Server.prototype.emit when https inherits it', () => {
  const instrumentation = new HttpInstrumentation({
    enabled: false,
    disableOutgoingRequestInstrumentation: true,
  });
  const definitions = (
    instrumentation as unknown as {
      _modules: InstrumentationModuleDefinition[];
    }
  )._modules;
  const httpDefinition = definitions.find(module => module.name === 'http');
  const httpsDefinition = definitions.find(module => module.name === 'https');
  const contextManager = new AsyncLocalStorageContextManager();

  before(() => {
    contextManager.enable();
    context.setGlobalContextManager(contextManager);
    instrumentation.setTracerProvider(
      new TracerProvider({
        spanProcessors: [new SimpleSpanProcessor({ exporter: memoryExporter })],
      })
    );
  });

  after(() => {
    contextManager.disable();
    context.disable();
  });

  beforeEach(() => {
    memoryExporter.reset();
  });

  it('keeps http.Server.prototype.emit wrapped and creates one SERVER span per server', async () => {
    assert.ok(httpDefinition?.patch);
    assert.ok(httpsDefinition?.patch);

    // A runtime shape where https servers reuse http.Server.prototype.emit.
    class InheritingServer extends http.Server {}
    const fakeHttps = { Server: InheritingServer } as unknown as typeof https;

    httpDefinition.patch!(http);
    try {
      httpsDefinition.patch!(fakeHttps);

      assert.strictEqual(
        isWrapped(http.Server.prototype.emit),
        true,
        'patching https must not unwrap http.Server.prototype.emit'
      );

      const httpServer = http.createServer((_request, response) => {
        response.end('ok');
      });
      await listen(httpServer);
      try {
        await get(httpServer);
        await settle();
        assert.strictEqual(serverSpans().length, 1);
      } finally {
        await close(httpServer);
      }

      memoryExporter.reset();

      const inheritingServer = new InheritingServer((_request, response) => {
        response.end('ok');
      });
      await listen(inheritingServer);
      try {
        await get(inheritingServer);
        await settle();
        assert.strictEqual(serverSpans().length, 1);
      } finally {
        await close(inheritingServer);
      }
    } finally {
      if (isWrapped(http.Server.prototype.emit)) {
        httpDefinition.unpatch!(http);
      }
      if (
        Object.prototype.hasOwnProperty.call(InheritingServer.prototype, 'emit')
      ) {
        httpsDefinition.unpatch!(fakeHttps);
      }
    }
  });
});
