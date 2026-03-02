/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { ExactPredicate, PatternPredicate } from '../../src/view/Predicate';

describe('PatternPredicate', () => {
  describe('asterisk match', () => {
    it('should match anything', () => {
      const predicate = new PatternPredicate('*');
      assert.ok(predicate.match('foo'));
      assert.ok(predicate.match(''));
    });

    it('should match trailing part', () => {
      const predicate = new PatternPredicate('foo*');
      assert.ok(predicate.match('foo'));
      assert.ok(predicate.match('foobar'));

      assert.ok(!predicate.match('_foo'));
      assert.ok(!predicate.match('bar'));
      assert.ok(!predicate.match(''));
    });

    it('should match leading part', () => {
      const predicate = new PatternPredicate('*bar');
      assert.ok(predicate.match('foobar'));
      assert.ok(predicate.match('bar'));

      assert.ok(!predicate.match('foo'));
      assert.ok(!predicate.match('bar_'));
      assert.ok(!predicate.match(''));
    });
  });

  describe('exact match', () => {
    it('should match exactly', () => {
      const predicate = new PatternPredicate('foobar');
      assert.ok(predicate.match('foobar'));

      assert.ok(!predicate.match('foo'));
      assert.ok(!predicate.match('_foobar_'));
      assert.ok(!predicate.match(''));
    });
  });

  describe('escapePattern', () => {
    it('should escape regexp elements', () => {
      assert.strictEqual(
        PatternPredicate.escapePattern('^$\\.+?()[]{}|'),
        '^\\^\\$\\\\\\.\\+\\?\\(\\)\\[\\]\\{\\}\\|$'
      );
      assert.strictEqual(PatternPredicate.escapePattern('*'), '^.*$');
      assert.strictEqual(PatternPredicate.escapePattern('foobar'), '^foobar$');
      assert.strictEqual(PatternPredicate.escapePattern('foo*'), '^foo.*$');
      assert.strictEqual(PatternPredicate.escapePattern('*bar'), '^.*bar$');
    });
  });
});

describe('ExactPredicate', () => {
  it('should match all', () => {
    const predicate = new ExactPredicate();
    assert.ok(predicate.match('foo'));
    assert.ok(predicate.match(''));
  });

  it('should exact match', () => {
    const predicate = new ExactPredicate('foobar');
    assert.ok(!predicate.match('foo'));
    assert.ok(!predicate.match('bar'));
    assert.ok(!predicate.match(''));

    assert.ok(predicate.match('foobar'));
  });
});
