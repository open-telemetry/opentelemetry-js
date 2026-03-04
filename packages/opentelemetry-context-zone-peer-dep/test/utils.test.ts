/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as utils from '../src/util';

describe('ZoneContextManager utils', () => {
  describe('isListenerObject', () => {
    describe('when object contains "addEventListener" and "removeEventListener"', () => {
      it('should return true', () => {
        const obj = {
          addEventListener: function () {},
          removeEventListener: function () {},
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
          addEventListener: function () {},
        };
        assert.strictEqual(utils.isListenerObject(obj), false);
      });
    });
    describe('when object contains "removeEventListener" only', () => {
      it('should return false', () => {
        const obj = {
          removeEventListener: function () {},
        };
        assert.strictEqual(utils.isListenerObject(obj), false);
      });
    });
  });
});
