/**
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

import { matchesAnyPattern, matchesPattern } from '../../src';

const urlIgnored = 'url should be ignored';
const urlNotIgnored = 'url should NOT be ignored';

const urlToTest = 'http://myaddress.com/somepath';

describe('BasePlugin - Utils', () => {
  describe('matchesPattern', () => {
    describe('when a pattern is a string', () => {
      describe('and an exact case insensitive match', () => {
        it('should return true', () => {
          assert.strictEqual(matchesPattern('http://url', 'http://URL'), true);
        });
      });
      describe('and not an exact case insensitive match', () => {
        it('should return false', () => {
          assert.strictEqual(
            matchesPattern('http://url', 'http://URL.com'),
            false
          );
        });
      });
    });
    describe('when a pattern is a regular expression', () => {
      describe('and a match', () => {
        it('should return true', () => {
          assert.strictEqual(matchesPattern('http://url', /url/), true);
        });
      });
      describe('and not a match', () => {
        it('should return false', () => {
          assert.strictEqual(matchesPattern('http://url', /noturl/), false);
        });
      });
    });
    describe('when a pattern is a function', () => {
      describe('that throws', () => {
        it('should return false', () => {
          assert.strictEqual(
            matchesPattern('http://url', () => {
              throw new Error();
            }),
            false
          );
        });
      });
      describe('that returns a false value', () => {
        it('should return false', () => {
          assert.strictEqual(
            matchesPattern('http://url', url => {
              return url === 'noturl';
            }),
            false
          );
        });
      });
      describe('that returns a true value', () => {
        it('should return true', () => {
          assert.strictEqual(
            matchesPattern('http://url', url => {
              return url === 'http://url';
            }),
            true
          );
        });
      });
    });
  });
  describe('matchesAnyPattern', () => {
    describe('when ignored urls are undefined', () => {
      it('should return false', () => {
        assert.strictEqual(matchesAnyPattern(urlToTest), false, urlNotIgnored);
      });
    });
    describe('when ignored urls are empty', () => {
      it('should return false', () => {
        assert.strictEqual(
          matchesAnyPattern(urlToTest, []),
          false,
          urlNotIgnored
        );
      });
    });
    describe('when ignored urls contain the url', () => {
      it('should return true', () => {
        assert.strictEqual(
          matchesAnyPattern(urlToTest, ['http://myaddress.com/somepath']),
          true,
          urlIgnored
        );
      });
    });
    describe('when ignored urls does not contain the url', () => {
      it('should return false', () => {
        assert.strictEqual(
          matchesAnyPattern(urlToTest, ['http://myaddress.com/some']),
          false,
          urlNotIgnored
        );
      });
    });
    describe('when ignored urls is part of url - REGEXP', () => {
      it('should return true', () => {
        assert.strictEqual(
          matchesAnyPattern(urlToTest, [/.+?myaddress\.com/]),
          true,
          urlIgnored
        );
      });
    });
    describe('when url is not part of ignored urls - REGEXP', () => {
      it('should return false', () => {
        assert.strictEqual(
          matchesAnyPattern(urlToTest, [/http:\/\/myaddress\.com\/somepath2/]),
          false,
          urlNotIgnored
        );
      });
    });
  });
});
