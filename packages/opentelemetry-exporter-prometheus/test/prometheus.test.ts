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
import * as chai from 'chai';
import * as http from 'http';
import chaiHttp = require('chai-http');

chai.use(chaiHttp);

import { PrometheusExporter } from '../src';
import { ConsoleLogger } from '@opentelemetry/core';

describe('PrometheusExporter', () => {
  describe('constructor', () => {
    it('should construct an exporter', () => {
      const exporter = new PrometheusExporter();
      assert.ok(typeof exporter.startServer === 'function');
      assert.ok(typeof exporter.stopServer === 'function');
    });

    it('should start the server if startServer is passed as an option', (done) => {
      const port = PrometheusExporter.DEFAULT_OPTIONS.port;
      const endpoint = PrometheusExporter.DEFAULT_OPTIONS.endpoint;
      const exporter = new PrometheusExporter({
        startServer: true,
      }, () => {
        const url = `http://localhost:${port}${endpoint}`;
        http.get(url, function (res: any) {
          assert.equal(res.statusCode, 200);
          exporter.stopServer(() => {
            return done();
          });
        });
      });
    });

  });

  describe('server', () => {
    it('it should start on startServer() and call the callback', (done) => {
      const exporter = new PrometheusExporter({
        port: 9722,
      });
      exporter.startServer(() => {
        exporter.stopServer(() => {
          return done();
        });
      });
    });

    it('it should listen on the default port and default endpoint', (done) => {
      const port = PrometheusExporter.DEFAULT_OPTIONS.port;
      const endpoint = PrometheusExporter.DEFAULT_OPTIONS.endpoint;
      const exporter = new PrometheusExporter();

      exporter.startServer(() => {
        const url = `http://localhost:${port}${endpoint}`;
        http.get(url, function (res: any) {
          assert.equal(res.statusCode, 200);
          exporter.stopServer(() => {
            return done();
          });
        });
      });
    });

    it('it should listen on a custom port and endpoint if provided', (done) => {
      const port = 9991;
      const endpoint = '/metric';

      const exporter = new PrometheusExporter({
        port,
        endpoint,
      });

      exporter.startServer(() => {
        const url = `http://localhost:${port}${endpoint}`;
        http.get(url, function (res: any) {
          assert.equal(res.statusCode, 200);
          exporter.stopServer(() => {
            return done();
          });
        });
      });
    });

    it('it should lnormalize an endpoint that doesn\'t start with a slash', (done) => {
      const port = 9991;
      const endpoint = 'metric';

      const exporter = new PrometheusExporter({
        port,
        endpoint,
      });

      exporter.startServer(() => {
        const url = `http://localhost:${port}/${endpoint}`;
        http.get(url, function (res: any) {
          assert.equal(res.statusCode, 200);
          exporter.stopServer(() => {
            return done();
          });
        });
      });
    });

    it('it should return a HTTP status 404 if the endpoint does not match', (done) => {
      const port = 9912;
      const endpoint = '/metricss';
      const exporter = new PrometheusExporter({
        port,
        endpoint,
      });
      exporter.startServer(() => {
        const url =
          `http://localhost:${port}/metrics`;

        http.get(url, function (res: any) {
          assert.equal(res.statusCode, 404);
          exporter.stopServer(() => {
            return done();
          });
        });
      });
    });

    it('should call a provided callback regardless of if the server is running', (done) => {
      const exporter = new PrometheusExporter();
      exporter.stopServer(() => {
        return done();
      });
    });
  });
});

