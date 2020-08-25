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

import {
  SUPPRESS_INSTRUMENTATION_KEY,
  suppressInstrumentation,
  unsuppressInstrumentation,
  isInstrumentationSuppressed,
} from '../../src/context/context';
import { Context } from '@opentelemetry/api';

describe('Context Helpers', () => {
  describe('suppressInstrumentation', () => {
    it('should set suppress to true', () => {
      const expectedValue = true;
      const context = suppressInstrumentation(Context.ROOT_CONTEXT);

      const value = context.getValue(SUPPRESS_INSTRUMENTATION_KEY);
      const boolValue = value as boolean;

      assert.equal(boolValue, expectedValue);
    });
  });

  describe('unsuppressInstrumentation', () => {
    it('should set suppress to false', () => {
      const expectedValue = false;
      const context = unsuppressInstrumentation(Context.ROOT_CONTEXT);

      const value = context.getValue(SUPPRESS_INSTRUMENTATION_KEY);
      const boolValue = value as boolean;

      assert.equal(boolValue, expectedValue);
    });
  });

  describe('isInstrumentationSuppressed', () => {
    it('should get value as bool', () => {
      const expectedValue = true;
      const context = Context.ROOT_CONTEXT.setValue(
        SUPPRESS_INSTRUMENTATION_KEY,
        expectedValue
      );

      const value = isInstrumentationSuppressed(context);

      assert.equal(value, expectedValue);
    });

    describe('when suppress instrumentation set to null', () => {
      const context = Context.ROOT_CONTEXT.setValue(
        SUPPRESS_INSTRUMENTATION_KEY,
        null
      );

      it('should return false', () => {
        const value = isInstrumentationSuppressed(context);

        assert.equal(value, false);
      });
    });

    describe('when suppress instrumentation set to undefined', () => {
      const context = Context.ROOT_CONTEXT.setValue(
        SUPPRESS_INSTRUMENTATION_KEY,
        undefined
      );

      it('should return false', () => {
        const value = isInstrumentationSuppressed(context);

        assert.equal(value, false);
      });
    });
  });
});
