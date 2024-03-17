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

import { JaegerRemoteSampler } from '../src';
import { AlwaysOnSampler } from '@opentelemetry/core';

describe('JaegerRemoteSampler', () => {
  describe('registerInstrumentations', () => {
    describe('InstrumentationBase', () => {
      let jaegerRemoteSampler: JaegerRemoteSampler;

      it('should enable disabled instrumentation', async () => {
        const jaegerRemoteSampler = new JaegerRemoteSampler({
          endpoint: 'http://localhost:5778',
          serviceName: 'foo',
          poolingInterval: 5000,
          initialSampler: new AlwaysOnSampler(),
        });
        await new Promise(res => setTimeout(res, 50000));
      });
    });
  });
});
