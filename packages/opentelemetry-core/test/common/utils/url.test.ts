/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import { isUrlIgnored } from '../../../src';

const urlIgnored = 'url should be ignored';
const urlNotIgnored = 'url should NOT be ignored';

const urlToTest = 'http://myaddress.com/somepath';

describe('Core - Utils - url', () => {
  describe('isUrlIgnored', () => {
    describe('when ignored urls are undefined', () => {
      it('should return false', () => {
        assert.strictEqual(isUrlIgnored(urlToTest), false, urlNotIgnored);
      });
    });
    describe('when ignored urls are empty', () => {
      it('should return false', () => {
        assert.strictEqual(isUrlIgnored(urlToTest, []), false, urlNotIgnored);
      });
    });
    describe('when ignored urls is the same as url', () => {
      it('should return true', () => {
        assert.strictEqual(
          isUrlIgnored(urlToTest, ['http://myaddress.com/somepath']),
          true,
          urlIgnored
        );
      });
    });
    describe('when url is part of ignored urls', () => {
      it('should return false', () => {
        assert.strictEqual(
          isUrlIgnored(urlToTest, ['http://myaddress.com/some']),
          false,
          urlNotIgnored
        );
      });
    });
    describe('when ignored urls is part of url - REGEXP', () => {
      it('should return true', () => {
        assert.strictEqual(
          isUrlIgnored(urlToTest, [/.+?myaddress\.com/]),
          true,
          urlIgnored
        );
      });
    });
    describe('when url is part of ignored urls - REGEXP', () => {
      it('should return false', () => {
        assert.strictEqual(
          isUrlIgnored(urlToTest, [/http:\/\/myaddress\.com\/somepath2/]),
          false,
          urlNotIgnored
        );
      });
    });
    describe('when regex has global flag', () => {
      it('should return true', () => {
        const ignoredUrls = [/myaddr/g];
        // Run test multiple times to ensure same result (git.io/JimS1)
        for (let i = 0; i < 3; i++) {
          assert.strictEqual(
            isUrlIgnored(urlToTest, ignoredUrls),
            true,
            urlIgnored
          );
        }
      });
    });
  });
});
