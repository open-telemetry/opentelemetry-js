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

import * as assert from 'assert';
import { DatadogExporter } from '../src';
import { ExportResult } from '@opentelemetry/core';
import * as api from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/tracing';
import { Resource } from '@opentelemetry/resources';
import { AgentExporter } from '../src/types';
import * as nock from 'nock';

describe('DatadogExporter', () => {
  describe('constructor', () => {
    afterEach(() => {
      delete process.env.DD_TRACE_AGENT_URL;
      delete process.env.DD_SERVICE;
      delete process.env.DD_ENV;
      delete process.env.DD_VERSION;
    });

    it('should construct an exporter that contains a writerr', () => {
      const exporter = new DatadogExporter({ service_name: 'opentelemetry' });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
      const _exporter = exporter['_exporter'];

      assert.ok(_exporter._writer !== undefined);
      assert.strictEqual(exporter['_service_name'], 'opentelemetry');
      // assert.strictEqual(exporter._tags.length, 0);
    });

    it('should construct an exporter with default url, service_name, and flushInterval', () => {
      const exporter = new DatadogExporter({});
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');

      assert.strictEqual(exporter['_url'], 'http://localhost:8126');
      assert.strictEqual(exporter['_service_name'], 'dd-service');
      assert.strictEqual(exporter['_flushInterval'], 1000);
    });

    it('should set env version and tags if configured', () => {
      const exporter = new DatadogExporter({
        env: 'prod',
        version: 'v1.0',
        tags: 'testkey:testvalue',
      });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');

      assert.strictEqual(exporter['_env'], 'prod');
      assert.strictEqual(exporter['_version'], 'v1.0');
      assert.strictEqual(exporter['_tags'], 'testkey:testvalue');
    });

    it('should respect relevant env variables', () => {
      process.env.DD_TRACE_AGENT_URL = 'http://dd-agent:8125';
      process.env.DD_SERVICE = 'second-service';
      process.env.DD_ENV = 'staging';
      process.env.DD_VERSION = 'v2';
      process.env.DD_TAGS = 'alt_key:alt_value';

      const exporter = new DatadogExporter({});
      assert.strictEqual(exporter['_env'], 'staging');
      assert.strictEqual(exporter['_version'], 'v2');
      assert.strictEqual(exporter['_tags'], 'alt_key:alt_value');
      assert.strictEqual(exporter['_url'], 'http://dd-agent:8125');
      assert.strictEqual(exporter['_service_name'], 'second-service');
    });

    it('should prioritize host option over env variable', () => {
      process.env.DD_TRACE_AGENT_URL = 'http://dd-agent:8125';
      process.env.DD_SERVICE = 'second-service';
      process.env.DD_ENV = 'staging';
      process.env.DD_VERSION = 'v2';
      process.env.DD_TAGS = 'alt_key:alt_value';

      const exporter = new DatadogExporter({
        env: 'prod',
        version: 'v1',
        tags: 'main_key:main_value',
        service_name: 'first-service',
        agent_url: 'http://other-dd-agent:8126',
      });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');

      assert.strictEqual(exporter['_env'], 'prod');
      assert.strictEqual(exporter['_version'], 'v1');
      assert.strictEqual(exporter['_tags'], 'main_key:main_value');
      assert.strictEqual(exporter['_url'], 'http://other-dd-agent:8126');
      assert.strictEqual(exporter['_service_name'], 'first-service');
    });

    it('should construct an exporter with a flush interval', () => {
      const exporter = new DatadogExporter({
        service_name: 'opentelemetry',
        flushInterval: 2000,
      });

      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');

      assert.strictEqual(
        exporter['_exporter']['_scheduler']['_interval'],
        2000
      );
    });

    it('should construct an exporter without flushInterval', () => {
      const exporter = new DatadogExporter({
        service_name: 'opentelemetry',
      });

      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
      assert.strictEqual(
        exporter['_exporter']['_scheduler']['_interval'],
        1000
      );
    });
  });

  describe('export', () => {
    let exporter: typeof AgentExporter;

    before(() => {
      nock.disableNetConnect();
      exporter = new DatadogExporter({
        service_name: 'opentelemetry',
        flushInterval: 100,
      });
    });

    after(() => {
      nock.enableNetConnect();
      exporter.shutdown();
    });

    it('should skip send with empty list', done => {
      const scope = nock('http://localhost:8126')
        .put('/v0.4/traces')
        .reply(200);

      exporter.export([], (result: ExportResult) => {
        setTimeout(() => {
          assert.strictEqual(result, ExportResult.SUCCESS);
          assert(scope.isDone() === false);
          nock.cleanAll();
          done();
        }, 200);
      });
    });

    it('should send spans to Datadog backend and return with Success', done => {
      const scope = nock('http://localhost:8126')
        .put('/v0.4/traces')
        .reply(200);

      const spanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: api.TraceFlags.NONE,
      };
      const readableSpan: ReadableSpan = {
        name: 'my-span1',
        kind: api.SpanKind.CLIENT,
        spanContext,
        startTime: [1566156729, 709],
        endTime: [1566156731, 709],
        ended: true,
        status: {
          code: api.CanonicalCode.DATA_LOSS,
        },
        attributes: {},
        links: [],
        events: [],
        duration: [32, 800000000],
        resource: Resource.empty(),
        instrumentationLibrary: {
          name: 'default',
          version: '0.0.1',
        },
      };

      exporter.export([readableSpan], (result: ExportResult) => {
        setTimeout(() => {
          assert.strictEqual(result, ExportResult.SUCCESS);
          assert(scope.isDone());
          done();
        }, 200);
      });
    });

    it('should returrn Success even with a 4xx response', done => {
      const scope = nock('http://localhost:8126')
        .put('/v0.4/traces')
        .reply(400);

      const spanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: api.TraceFlags.NONE,
      };
      const readableSpan: ReadableSpan = {
        name: 'my-span1',
        kind: api.SpanKind.CLIENT,
        spanContext,
        startTime: [1566156729, 709],
        endTime: [1566156731, 709],
        ended: true,
        status: {
          code: api.CanonicalCode.DATA_LOSS,
        },
        attributes: {},
        links: [],
        events: [],
        duration: [32, 800000000],
        resource: Resource.empty(),
        instrumentationLibrary: {
          name: 'default',
          version: '0.0.1',
        },
      };

      exporter.export([readableSpan], (result: ExportResult) => {
        setTimeout(() => {
          assert.strictEqual(result, ExportResult.SUCCESS);
          assert(scope.isDone());
          done();
        }, 200);
      });
    });
  });
});
