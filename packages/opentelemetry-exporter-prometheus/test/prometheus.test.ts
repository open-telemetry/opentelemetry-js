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

import { ObserverResult } from '@opentelemetry/api';
import {
  CounterMetric,
  Meter,
  MeterProvider,
  ObserverMetric,
} from '@opentelemetry/metrics';
import * as assert from 'assert';
import * as http from 'http';
import { PrometheusExporter } from '../src';

describe('PrometheusExporter', () => {
  describe('constructor', () => {
    it('should construct an exporter', () => {
      const exporter = new PrometheusExporter();
      assert.ok(typeof exporter.startServer === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
    });

    it('should start the server if startServer is passed as an option', done => {
      const port = PrometheusExporter.DEFAULT_OPTIONS.port;
      const endpoint = PrometheusExporter.DEFAULT_OPTIONS.endpoint;
      const exporter = new PrometheusExporter(
        {
          startServer: true,
        },
        () => {
          const url = `http://localhost:${port}${endpoint}`;
          http.get(url, function(res: any) {
            assert.strictEqual(res.statusCode, 200);
            exporter.shutdown(() => {
              return done();
            });
          });
        }
      );
    });

    it('should not start the server by default', () => {
      const exporter = new PrometheusExporter();
      assert.ok(exporter['_server']!.listening === false);
    });
  });

  describe('server', () => {
    it('it should start on startServer() and call the callback', done => {
      const exporter = new PrometheusExporter({
        port: 9722,
      });
      exporter.startServer(() => {
        exporter.shutdown(() => {
          return done();
        });
      });
    });

    it('it should listen on the default port and default endpoint', done => {
      const port = PrometheusExporter.DEFAULT_OPTIONS.port;
      const endpoint = PrometheusExporter.DEFAULT_OPTIONS.endpoint;
      const exporter = new PrometheusExporter();

      exporter.startServer(() => {
        const url = `http://localhost:${port}${endpoint}`;
        http.get(url, function(res: any) {
          assert.strictEqual(res.statusCode, 200);
          exporter.shutdown(() => {
            return done();
          });
        });
      });
    });

    it('it should listen on a custom port and endpoint if provided', done => {
      const port = 9991;
      const endpoint = '/metric';

      const exporter = new PrometheusExporter({
        port,
        endpoint,
      });

      exporter.startServer(() => {
        const url = `http://localhost:${port}${endpoint}`;
        http.get(url, function(res: any) {
          assert.strictEqual(res.statusCode, 200);
          exporter.shutdown(() => {
            return done();
          });
        });
      });
    });

    it('it should not require endpoints to start with a slash', done => {
      const port = 9991;
      const endpoint = 'metric';

      const exporter = new PrometheusExporter({
        port,
        endpoint,
      });

      exporter.startServer(() => {
        const url = `http://localhost:${port}/metric`;
        http.get(url, function(res: any) {
          assert.strictEqual(res.statusCode, 200);
          exporter.shutdown(() => {
            const exporter2 = new PrometheusExporter({
              port,
              endpoint: `/${endpoint}`,
            });

            exporter2.startServer(() => {
              const url = `http://localhost:${port}/metric`;
              http.get(url, function(res: any) {
                assert.strictEqual(res.statusCode, 200);
                exporter2.stopServer(() => {
                  return done();
                });
              });
            });
          });
        });
      });
    });

    it('it should return a HTTP status 404 if the endpoint does not match', done => {
      const port = 9912;
      const endpoint = '/metrics';
      const exporter = new PrometheusExporter({
        port,
        endpoint,
      });
      exporter.startServer(() => {
        const url = `http://localhost:${port}/invalid`;

        http.get(url, function(res: any) {
          assert.strictEqual(res.statusCode, 404);
          exporter.shutdown(() => {
            return done();
          });
        });
      });
    });

    it('should call a provided callback regardless of if the server is running', done => {
      const exporter = new PrometheusExporter();
      exporter.shutdown(() => {
        return done();
      });
    });
  });

  describe('export', () => {
    let exporter: PrometheusExporter;
    let meter: Meter;

    beforeEach(done => {
      exporter = new PrometheusExporter();
      meter = new MeterProvider().getMeter('test-prometheus');
      exporter.startServer(done);
    });

    afterEach(done => {
      exporter.shutdown(done);
    });

    it('should export a count aggregation', done => {
      const counter = meter.createCounter('counter', {
        description: 'a test description',
        labelKeys: ['key1'],
      });

      const boundCounter = counter.bind(meter.labels({ key1: 'labelValue1' }));
      boundCounter.add(10);
      meter.collect();
      exporter.export(meter.getBatcher().checkPointSet(), () => {
        // This is to test the special case where counters are destroyed
        // and recreated in the exporter in order to get around prom-client's
        // aggregation and use ours.
        boundCounter.add(10);
        exporter.export(meter.getBatcher().checkPointSet(), () => {
          http
            .get('http://localhost:9464/metrics', res => {
              res.on('data', chunk => {
                const body = chunk.toString();
                const lines = body.split('\n');

                assert.strictEqual(
                  lines[0],
                  '# HELP counter a test description'
                );

                assert.deepStrictEqual(lines, [
                  '# HELP counter a test description',
                  '# TYPE counter counter',
                  'counter{key1="labelValue1"} 20',
                  '',
                ]);

                done();
              });
            })
            .on('error', errorHandler(done));
        });
      });
    });

    it('should export an observer aggregation', done => {
      function getCpuUsage() {
        return Math.random();
      }

      const observer = meter.createObserver('metric_observer', {
        description: 'a test description',
        labelKeys: ['pid'],
      }) as ObserverMetric;

      observer.setCallback((observerResult: ObserverResult) => {
        observerResult.observe(
          getCpuUsage,
          meter.labels({ pid: String(123), core: '1' })
        );
      });

      meter.collect();
      exporter.export(meter.getBatcher().checkPointSet(), () => {
        exporter.export(meter.getBatcher().checkPointSet(), () => {
          http
            .get('http://localhost:9464/metrics', res => {
              res.on('data', chunk => {
                const body = chunk.toString();
                const lines = body.split('\n');

                assert.strictEqual(
                  lines[0],
                  '# HELP metric_observer a test description'
                );

                assert.strictEqual(lines[1], '# TYPE metric_observer gauge');

                const line3 = lines[2].split(' ');
                assert.strictEqual(line3[0], 'metric_observer{pid="123"}');
                assert.ok(
                  parseFloat(line3[1]) >= 0 && parseFloat(line3[1]) <= 1
                );
                assert.ok(parseInt(line3[2], 10) <= new Date().getTime());

                done();
              });
            })
            .on('error', errorHandler(done));
        });
      });
    });

    it('should export multiple aggregations', done => {
      const counter = meter.createCounter('counter', {
        description: 'a test description',
        labelKeys: ['counterKey1'],
      }) as CounterMetric;

      counter.bind(meter.labels({ counterKey1: 'labelValue1' })).add(10);
      meter.collect();
      exporter.export(meter.getBatcher().checkPointSet(), () => {
        http
          .get('http://localhost:9464/metrics', res => {
            res.on('data', chunk => {
              const body = chunk.toString();
              const lines = body.split('\n');

              assert.deepStrictEqual(lines, [
                '# HELP counter a test description',
                '# TYPE counter counter',
                'counter{counterKey1="labelValue1"} 10',
                '',
              ]);

              done();
            });
          })
          .on('error', errorHandler(done));
      });
    });

    it('should export a comment if no metrics are registered', done => {
      exporter.export([], () => {
        http
          .get('http://localhost:9464/metrics', res => {
            res.on('data', chunk => {
              const body = chunk.toString();
              const lines = body.split('\n');

              assert.deepStrictEqual(lines, ['# no registered metrics']);

              done();
            });
          })
          .on('error', errorHandler(done));
      });
    });

    it('should add a description if missing', done => {
      const counter = meter.createCounter('counter');

      const boundCounter = counter.bind(meter.labels({ key1: 'labelValue1' }));
      boundCounter.add(10);
      meter.collect();
      exporter.export(meter.getBatcher().checkPointSet(), () => {
        http
          .get('http://localhost:9464/metrics', res => {
            res.on('data', chunk => {
              const body = chunk.toString();
              const lines = body.split('\n');

              assert.deepStrictEqual(lines, [
                '# HELP counter description missing',
                '# TYPE counter counter',
                'counter 10',
                '',
              ]);

              done();
            });
          })
          .on('error', errorHandler(done));
      });
    });

    it('should sanitize names', done => {
      const counter = meter.createCounter('counter.bad-name');
      const boundCounter = counter.bind(meter.labels({ key1: 'labelValue1' }));
      boundCounter.add(10);
      meter.collect();
      exporter.export(meter.getBatcher().checkPointSet(), () => {
        http
          .get('http://localhost:9464/metrics', res => {
            res.on('data', chunk => {
              const body = chunk.toString();
              const lines = body.split('\n');

              assert.deepStrictEqual(lines, [
                '# HELP counter_bad_name description missing',
                '# TYPE counter_bad_name counter',
                'counter_bad_name 10',
                '',
              ]);

              done();
            });
          })
          .on('error', errorHandler(done));
      });
    });

    it('should export a non-monotonic counter as a gauge', done => {
      const counter = meter.createCounter('counter', {
        description: 'a test description',
        monotonic: false,
        labelKeys: ['key1'],
      });

      counter.bind(meter.labels({ key1: 'labelValue1' })).add(20);
      meter.collect();
      exporter.export(meter.getBatcher().checkPointSet(), () => {
        http
          .get('http://localhost:9464/metrics', res => {
            res.on('data', chunk => {
              assert.deepStrictEqual(chunk.toString().split('\n'), [
                '# HELP counter a test description',
                '# TYPE counter gauge',
                'counter{key1="labelValue1"} 20',
                '',
              ]);

              done();
            });
          })
          .on('error', errorHandler(done));
      });
    });
  });

  describe('configuration', () => {
    let meter: Meter;
    let counter: CounterMetric;
    let exporter: PrometheusExporter | undefined;

    beforeEach(() => {
      meter = new MeterProvider().getMeter('test-prometheus');
      counter = meter.createCounter('counter') as CounterMetric;
      counter.bind(meter.labels({ key1: 'labelValue1' })).add(10);
    });

    afterEach(done => {
      if (exporter) {
        exporter.shutdown(done);
        exporter = undefined;
      } else {
        done();
      }
    });

    it('should use a configured name prefix', done => {
      exporter = new PrometheusExporter({
        prefix: 'test_prefix',
      });

      exporter.startServer(() => {
        meter.collect();
        exporter!.export(meter.getBatcher().checkPointSet(), () => {
          http
            .get('http://localhost:9464/metrics', res => {
              res.on('data', chunk => {
                const body = chunk.toString();
                const lines = body.split('\n');

                assert.deepStrictEqual(lines, [
                  '# HELP test_prefix_counter description missing',
                  '# TYPE test_prefix_counter counter',
                  'test_prefix_counter 10',
                  '',
                ]);

                done();
              });
            })
            .on('error', errorHandler(done));
        });
      });
    });

    it('should use a configured port', done => {
      exporter = new PrometheusExporter({
        port: 8080,
      });

      exporter.startServer(() => {
        meter.collect();
        exporter!.export(meter.getBatcher().checkPointSet(), () => {
          http
            .get('http://localhost:8080/metrics', res => {
              res.on('data', chunk => {
                const body = chunk.toString();
                const lines = body.split('\n');

                assert.deepStrictEqual(lines, [
                  '# HELP counter description missing',
                  '# TYPE counter counter',
                  'counter 10',
                  '',
                ]);

                done();
              });
            })
            .on('error', errorHandler(done));
        });
      });
    });

    it('should use a configured endpoint', done => {
      exporter = new PrometheusExporter({
        endpoint: '/test',
      });

      exporter.startServer(() => {
        meter.collect();
        exporter!.export(meter.getBatcher().checkPointSet(), () => {
          http
            .get('http://localhost:9464/test', res => {
              res.on('data', chunk => {
                const body = chunk.toString();
                const lines = body.split('\n');

                assert.deepStrictEqual(lines, [
                  '# HELP counter description missing',
                  '# TYPE counter counter',
                  'counter 10',
                  '',
                ]);

                done();
              });
            })
            .on('error', errorHandler(done));
        });
      });
    });
  });
});

function errorHandler(done: Mocha.Done): (err: Error) => void {
  return () => {
    assert.ok(false, 'error getting metrics');
    done();
  };
}
