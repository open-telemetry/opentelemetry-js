/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import {
  ComponentProviderRegistry,
  type SpanExporterComponentProvider,
  type LogRecordExporterComponentProvider,
  type ConfigProperties,
} from '../src/component-provider';
import { getBuiltinComponentProviders } from '../src/builtin-providers';
import {
  resolveSpanExporter,
  resolveLogRecordExporter,
  resolvePushMetricExporter,
} from '../src/utils';
import type { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import type { LogRecordExporter } from '@opentelemetry/sdk-logs';
import type { ExportResult } from '@opentelemetry/core';

/** Minimal no-op SpanExporter for test purposes. */
const noopSpanExporter: SpanExporter = {
  export(
    _spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    resultCallback({ code: 0 });
  },
  shutdown() {
    return Promise.resolve();
  },
};

/** Minimal no-op LogRecordExporter for test purposes. */
const noopLogExporter: LogRecordExporter = {
  export(_logs: any[], resultCallback: (result: ExportResult) => void) {
    resultCallback({ code: 0 });
  },
  shutdown() {
    return Promise.resolve();
  },
  forceFlush() {
    return Promise.resolve();
  },
};

describe('ComponentProviderRegistry', function () {
  it('should retrieve a SpanExporter provider registered via constructor', function () {
    const provider: SpanExporterComponentProvider = {
      name: 'test-exporter',
      createComponent: (_props: ConfigProperties) => noopSpanExporter,
    };
    const registry = new ComponentProviderRegistry({
      spanExporters: [provider],
    });
    assert.strictEqual(
      registry.getSpanExporterProvider('test-exporter'),
      provider
    );
  });

  it('should return undefined for unregistered SpanExporter provider', function () {
    const registry = new ComponentProviderRegistry({});
    assert.strictEqual(
      registry.getSpanExporterProvider('nonexistent'),
      undefined
    );
  });

  it('should throw on duplicate SpanExporter names', function () {
    const provider: SpanExporterComponentProvider = {
      name: 'dup',
      createComponent: () => noopSpanExporter,
    };
    assert.throws(
      () =>
        new ComponentProviderRegistry({ spanExporters: [provider, provider] }),
      /SpanExporterComponentProvider already registered for name="dup"/
    );
  });

  it('should allow the same name for different component kinds', function () {
    const spanProvider: SpanExporterComponentProvider = {
      name: 'otlp_http',
      createComponent: () => noopSpanExporter,
    };
    const logProvider: LogRecordExporterComponentProvider = {
      name: 'otlp_http',
      createComponent: () => noopLogExporter,
    };
    const registry = new ComponentProviderRegistry({
      spanExporters: [spanProvider],
      logRecordExporters: [logProvider],
    });
    assert.strictEqual(
      registry.getSpanExporterProvider('otlp_http'),
      spanProvider
    );
    assert.strictEqual(
      registry.getLogRecordExporterProvider('otlp_http'),
      logProvider
    );
  });
});

describe('getBuiltinComponentProviders', function () {
  it('should return all 9 built-in providers', function () {
    const registry = new ComponentProviderRegistry(
      getBuiltinComponentProviders()
    );

    assert.ok(registry.getSpanExporterProvider('otlp_http'));
    assert.ok(registry.getSpanExporterProvider('otlp_grpc'));
    assert.ok(registry.getSpanExporterProvider('console'));
    assert.ok(registry.getLogRecordExporterProvider('otlp_http'));
    assert.ok(registry.getLogRecordExporterProvider('otlp_grpc'));
    assert.ok(registry.getLogRecordExporterProvider('console'));
    assert.ok(registry.getPushMetricExporterProvider('otlp_http'));
    assert.ok(registry.getPushMetricExporterProvider('otlp_grpc'));
    assert.ok(registry.getPushMetricExporterProvider('console'));
  });
});

describe('resolveSpanExporter', function () {
  let registry: ComponentProviderRegistry;

  beforeEach(function () {
    registry = new ComponentProviderRegistry(getBuiltinComponentProviders());
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should resolve console exporter via registry', function () {
    const exporter = resolveSpanExporter({ console: {} }, registry);
    assert.ok(exporter);
    assert.strictEqual(exporter.constructor.name, 'ConsoleSpanExporter');
  });

  it('should resolve otlp_http via registry', function () {
    const exporter = resolveSpanExporter(
      { otlp_http: { encoding: 'protobuf' } },
      registry
    );
    assert.ok(exporter);
  });

  it('should resolve otlp_grpc via registry', function () {
    const exporter = resolveSpanExporter({ otlp_grpc: {} }, registry);
    assert.ok(exporter);
  });

  it('should warn for unknown exporter without registered provider', function () {
    const warnStub = sinon.stub(diag, 'warn');
    const result = resolveSpanExporter(
      { 'unknown-exporter': { foo: 'bar' } },
      registry
    );
    assert.strictEqual(result, undefined);
    assert.ok(
      warnStub.calledWith(
        sinon.match(/No SpanExporterComponentProvider registered/)
      )
    );
  });
});

describe('resolveLogRecordExporter', function () {
  let registry: ComponentProviderRegistry;

  beforeEach(function () {
    registry = new ComponentProviderRegistry(getBuiltinComponentProviders());
  });

  it('should resolve console exporter', function () {
    const exporter = resolveLogRecordExporter({ console: {} }, registry);
    assert.ok(exporter);
    assert.strictEqual(exporter.constructor.name, 'ConsoleLogRecordExporter');
  });

  it('should resolve otlp_http via registry', function () {
    const exporter = resolveLogRecordExporter(
      { otlp_http: { encoding: 'protobuf' } },
      registry
    );
    assert.ok(exporter);
  });
});

describe('resolvePushMetricExporter', function () {
  let registry: ComponentProviderRegistry;

  beforeEach(function () {
    registry = new ComponentProviderRegistry(getBuiltinComponentProviders());
  });

  it('should resolve console exporter', function () {
    const exporter = resolvePushMetricExporter({ console: {} }, registry);
    assert.ok(exporter);
    assert.strictEqual(exporter.constructor.name, 'ConsoleMetricExporter');
  });

  it('should resolve otlp_http via registry', function () {
    const exporter = resolvePushMetricExporter(
      { otlp_http: { encoding: 'protobuf' } },
      registry
    );
    assert.ok(exporter);
  });
});
