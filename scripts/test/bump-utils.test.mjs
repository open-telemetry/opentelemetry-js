/**
 * Tests for the release version bump math.
 *
 * Run with `npm run test:scripts`.
 */

import assert from 'assert';
import { nextVersion } from '../lib/bump-utils.mjs';

describe('nextVersion', function () {
  describe('normal releases', function () {
    const cases = [
      ['2.10.0', 'patch', '2.10.1'],
      ['2.10.0', 'minor', '2.11.0'],
      ['2.10.0', 'major', '3.0.0'],
      ['0.221.0', 'minor', '0.222.0'],
    ];

    for (const [current, kind, expected] of cases) {
      it(`bumps ${current} by ${kind} to ${expected}`, function () {
        assert.strictEqual(nextVersion(current, kind, null), expected);
      });
    }
  });

  describe('starting a pre-release line', function () {
    const cases = [
      ['2.10.0', 'major', 'development', '3.0.0-development.0'],
      ['2.10.0', 'minor', 'development', '2.11.0-development.0'],
      ['2.10.0', 'patch', 'rc', '2.10.1-rc.0'],
      // Experimental packages never take a major bump, see experimentalEquivalentOf().
      ['0.221.0', 'minor', 'development', '0.222.0-development.0'],
    ];

    for (const [current, kind, preid, expected] of cases) {
      it(`bumps ${current} by ${kind}/${preid} to ${expected}`, function () {
        assert.strictEqual(nextVersion(current, kind, preid), expected);
      });
    }
  });

  describe('iterating and promoting a pre-release', function () {
    it('increments only the counter for the same identifier', function () {
      // Note these stay on 3.0.0. A naive `semver.inc(v, 'pre' + kind, preid)` would
      // escalate an in-flight major pre-release to 4.0.0-development.0 instead.
      assert.strictEqual(
        nextVersion('3.0.0-development.0', 'major', 'development'),
        '3.0.0-development.1'
      );
      assert.strictEqual(nextVersion('3.0.0-rc.0', 'major', 'rc'), '3.0.0-rc.1');
    });

    it('resets the counter when promoting development to rc', function () {
      assert.strictEqual(nextVersion('3.0.0-development.30', 'major', 'rc'), '3.0.0-rc.0');
    });
  });

  describe('finalizing a pre-release', function () {
    // semver.inc() drops the pre-release in place rather than incrementing, as long as
    // the release type matches the line the pre-release is on.
    const cases = [
      ['3.0.0-rc.2', 'major', '3.0.0'],
      ['2.11.0-development.0', 'minor', '2.11.0'],
      ['2.10.1-rc.0', 'patch', '2.10.1'],
      ['0.222.0-rc.2', 'minor', '0.222.0'],
    ];

    for (const [current, kind, expected] of cases) {
      it(`finalizes ${current} to ${expected}`, function () {
        assert.strictEqual(nextVersion(current, kind, null), expected);
      });
    }
  });

  describe('rejects bumps that would silently produce a surprising version', function () {
    it('rejects a release type that does not match the in-flight pre-release line', function () {
      // Would otherwise give 3.0.0-development.4, silently ignoring the 'minor' selection.
      assert.throws(
        () => nextVersion('3.0.0-development.3', 'minor', 'development'),
        /in-flight "major" pre-release for 3\.0\.0/
      );
    });

    it('rejects finalizing in a way that abandons the pending release', function () {
      // Would otherwise give 2.11.0, skipping the pending 2.10.1 entirely.
      assert.throws(
        () => nextVersion('2.10.1-rc.2', 'minor', null),
        /skipping the pending 2\.10\.1 release/
      );
    });

    it('rejects going from rc back to development', function () {
      // npm compares identifiers as strings, so development sorts before rc: this
      // would produce 3.0.0-development.0, lower than the current version.
      assert.throws(
        () => nextVersion('3.0.0-rc.2', 'major', 'development'),
        /not an increase/
      );
      assert.throws(
        () => nextVersion('0.222.0-rc.2', 'minor', 'development'),
        /not an increase/
      );
    });

    it('rejects an unparseable current version', function () {
      assert.throws(() => nextVersion('not-a-version', 'minor', null), /Not a valid version/);
    });
  });
});
