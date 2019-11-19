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
import * as utils from '../src/util';

describe('ZoneScopeManager utils', () => {
  describe('isListenerObject', () => {
    describe('when object contains "addEventListener" and "removeEventListener"', () => {
      it('should return true', () => {
        const obj = {
          addEventListener: function() {},
          removeEventListener: function() {},
        };
        assert.strictEqual(utils.isListenerObject(obj), true);
      });
    });
    describe('when object doesn\'t contain "addEventListener" and "removeEventListener"', () => {
      it('should return true', () => {
        const obj = {};
        assert.strictEqual(utils.isListenerObject(obj), false);
      });
    });
    describe('when object contains "addEventListener" only', () => {
      it('should return false', () => {
        const obj = {
          addEventListener: function() {},
        };
        assert.strictEqual(utils.isListenerObject(obj), false);
      });
    });
    describe('when object contains "removeEventListener" only', () => {
      it('should return false', () => {
        const obj = {
          removeEventListener: function() {},
        };
        assert.strictEqual(utils.isListenerObject(obj), false);
      });
    });
  });
});
