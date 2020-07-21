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
  setSuppressInstrumentation,
  getSuppressInstrumentation,
} from '../../src/context/context';
import { Context } from '@opentelemetry/api';


describe('Context Helpers', () => {
  describe('setSuppressInstrumentation', () => {
    it('should set suppress instrumentation value', () => {
      const expectedValue = true
      const context = setSuppressInstrumentation(Context.ROOT_CONTEXT, expectedValue)

      const value = context.getValue(SUPPRESS_INSTRUMENTATION_KEY)
      const boolValue = value as boolean

      assert.equal(boolValue, expectedValue)
    })
  })

  describe('getSuppressInstrumentation', () => {
    it('should get value as bool', () => {
      const expectedValue = false
      const context = Context.ROOT_CONTEXT.setValue(SUPPRESS_INSTRUMENTATION_KEY, expectedValue)

      const value = getSuppressInstrumentation(context)

      assert.equal(value, expectedValue)
    })

    it('should handle null values', () => {
      const expectedValue = null
      const context = Context.ROOT_CONTEXT.setValue(SUPPRESS_INSTRUMENTATION_KEY, expectedValue)

      const value = getSuppressInstrumentation(context)

      assert.equal(value, expectedValue)
    })

    it('should handle undefined values', () => {
      const expectedValue = undefined
      const context = Context.ROOT_CONTEXT.setValue(SUPPRESS_INSTRUMENTATION_KEY, expectedValue)

      const value = getSuppressInstrumentation(context)

      assert.equal(value, expectedValue)
    })
  })
})

