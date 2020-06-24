/*!
 * Copyright 2020, OpenTelemetry Authors
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

import * as api from '@opentelemetry/api';
import * as assert from 'assert';
import { installExportPipeline, PrometheusExporter } from '../../src';
import { get } from '../request-util';
import { mockedTimeMS } from '../sandbox';
import { PullController } from '@opentelemetry/metrics';

describe('Prometheus Export Pipeline', () => {
  let exporter: PrometheusExporter;

  afterEach(done => {
    exporter?.shutdown(done);
  });

  it('should install to global metrics api', async () => {
    let controller: PullController;
    await new Promise(resolve => {
      ({ exporter, controller } = installExportPipeline(
        { startServer: true },
        resolve
      ));
    });

    assert.strictEqual(api.metrics.getMeterProvider(), controller!);

    const counter = api.metrics.getMeter('test').createCounter('counter', {
      description: 'a test description',
    });
    const boundCounter = counter.bind({ key1: 'labelValue1' });
    boundCounter.add(10);

    const res = await get('http://localhost:9464/metrics');
    assert.strictEqual(res.statusCode, 200);
    assert(res.body != null);
    const lines = res.body!.split('\n');

    assert.strictEqual(lines[0], '# HELP counter a test description');

    assert.deepStrictEqual(lines, [
      '# HELP counter a test description',
      '# TYPE counter counter',
      `counter{key1="labelValue1"} 10 ${mockedTimeMS}`,
      '',
    ]);
  });
});
