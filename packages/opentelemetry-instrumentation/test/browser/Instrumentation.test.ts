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
import { InstrumentationConfig } from '../../src';
import {
  InstrumentationBase,
} from '../../src/platform/browser';

interface TestInstrumentationConfig extends InstrumentationConfig {
  isActive?: boolean;
}

class TestInstrumentationWithMissingLoad extends InstrumentationBase {
  constructor(config: TestInstrumentationConfig & InstrumentationConfig = {}) {
    super('test', '1.0.0', Object.assign({}, config));
  }

  override enable() {}

  override disable() {}
}

describe('BaseInstrumentation', () => {
  describe('constructor', () => {
    describe('when instrumentation does NOT call loadInstrumentation in  constructor', () => {
      it('should raise an error', done => {
        window.onerror = error => {
          assert.strictEqual(error, 'Uncaught You forgot to call loadInstrumentation in constructor');
          done();
        };
        new TestInstrumentationWithMissingLoad();
      });
    });
  });
});
