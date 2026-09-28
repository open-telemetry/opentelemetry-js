/**
 * Tests for the @opentelemetry/api dependency range logic.
 *
 * Run with `npm run test:scripts`.
 */

import assert from 'assert';
import semver from 'semver';
import {
  alignApiRange,
  isValidApiRange,
  prereleaseClauseOf,
} from '../lib/api-range-utils.mjs';

describe('alignApiRange', function () {
  describe('normal API release', function () {
    // API at 1.10.0: bounded ranges move their upper bound to the next minor, caret ranges
    // are already wide enough, exact pins take the version verbatim.
    const cases = [
      ['>=1.0.0 <1.10.0', '>=1.0.0 <1.11.0'],
      ['>=1.9.0 <1.10.0', '>=1.9.0 <1.11.0'],
      ['>=1.0.0 <1.11.0', '>=1.0.0 <1.11.0'],
      ['^1.3.0', '^1.3.0'],
      ['^1.0.0', '^1.0.0'],
      ['1.9.1', '1.10.0'],
    ];

    for (const [before, expected] of cases) {
      it(`aligns "${before}" to "${expected}"`, function () {
        assert.strictEqual(alignApiRange(before, '1.10.0'), expected);
      });
    }
  });

  describe('pre-release API', function () {
    // API at 1.10.0-rc.0: the upper bound moves as if 1.10.0 had been released, and the
    // exact pre-release is appended so npm still links the workspace copy.
    const cases = [
      ['>=1.0.0 <1.10.0', '>=1.0.0 <1.11.0 || 1.10.0-rc.0'],
      ['>=1.9.0 <1.10.0', '>=1.9.0 <1.11.0 || 1.10.0-rc.0'],
      ['^1.3.0', '^1.3.0 || 1.10.0-rc.0'],
      ['^1.0.0', '^1.0.0 || 1.10.0-rc.0'],
      ['1.9.1', '1.10.0-rc.0'],
    ];

    for (const [before, expected] of cases) {
      it(`widens "${before}" to "${expected}"`, function () {
        assert.strictEqual(alignApiRange(before, '1.10.0-rc.0'), expected);
      });
    }

    it('does not compute the upper bound from the pre-release itself', function () {
      // semver.inc('1.10.0-rc.0', 'minor') is 1.10.0, which would leave the bound behind.
      assert.strictEqual(
        alignApiRange('>=1.0.0 <1.10.0', '1.10.0-rc.0'),
        '>=1.0.0 <1.11.0 || 1.10.0-rc.0'
      );
    });
  });

  describe('iterating a pre-release cycle', function () {
    const cases = [
      ['>=1.0.0 <1.11.0 || 1.10.0-rc.0', '>=1.0.0 <1.11.0 || 1.10.0-rc.1'],
      ['^1.3.0 || 1.10.0-rc.0', '^1.3.0 || 1.10.0-rc.1'],
      ['1.10.0-rc.0', '1.10.0-rc.1'],
    ];

    for (const [before, expected] of cases) {
      it(`rewrites "${before}" to "${expected}"`, function () {
        assert.strictEqual(alignApiRange(before, '1.10.0-rc.1'), expected);
      });
    }

    it('promotes a development stream to rc', function () {
      assert.strictEqual(
        alignApiRange('^1.3.0 || 1.10.0-development.7', '1.10.0-rc.0'),
        '^1.3.0 || 1.10.0-rc.0'
      );
    });
  });

  describe('finalizing a pre-release cycle', function () {
    // The appended clause is dropped, leaving exactly the range a release without a cycle
    // would have produced.
    const cases = [
      ['>=1.0.0 <1.11.0 || 1.10.0-rc.1', '>=1.0.0 <1.11.0'],
      ['^1.3.0 || 1.10.0-rc.1', '^1.3.0'],
      ['1.10.0-rc.1', '1.10.0'],
    ];

    for (const [before, expected] of cases) {
      it(`restores "${before}" to "${expected}"`, function () {
        assert.strictEqual(alignApiRange(before, '1.10.0'), expected);
      });
    }

    it('a cycle leaves no trace on the range', function () {
      const before = '>=1.4.0 <1.10.0';
      let range = before;
      for (const version of ['1.10.0-development.0', '1.10.0-development.1', '1.10.0-rc.0']) {
        range = alignApiRange(range, version);
      }
      assert.strictEqual(
        alignApiRange(range, '1.10.0'),
        alignApiRange(before, '1.10.0')
      );
    });
  });

  describe('the aligned range admits the API version it was aligned to', function () {
    // The whole point: npm must be able to resolve the local API from these ranges.
    const ranges = ['>=1.0.0 <1.10.0', '>=1.4.0 <1.10.0', '^1.3.0', '^1.0.0', '1.9.1'];
    const versions = ['1.10.0', '1.10.0-rc.0', '1.10.0-development.12', '1.9.2'];

    for (const range of ranges) {
      for (const version of versions) {
        it(`"${range}" aligned to ${version} satisfies ${version}`, function () {
          const aligned = alignApiRange(range, version);
          assert.ok(
            semver.satisfies(version, aligned),
            `${version} does not satisfy "${aligned}"`
          );
        });
      }
    }
  });

  it('is idempotent', function () {
    for (const range of ['>=1.0.0 <1.10.0', '^1.3.0', '1.9.1']) {
      for (const version of ['1.10.0', '1.10.0-rc.0']) {
        const once = alignApiRange(range, version);
        assert.strictEqual(alignApiRange(once, version), once);
      }
    }
  });

  it('rejects an unparseable API version', function () {
    assert.throws(() => alignApiRange('^1.3.0', 'not-a-version'), /Cannot parse/);
  });
});

describe('isValidApiRange', function () {
  const accepted = [
    ['>=1.0.0 <1.11.0', false],
    ['^1.3.0', false],
    ['>=1.0.0 <1.11.0 || 1.10.0-rc.0', false],
    ['^1.3.0 || 1.10.0-development.4', false],
    ['1.9.1', true],
    ['1.10.0-rc.0', true],
  ];

  for (const [range, allowExact] of accepted) {
    it(`accepts "${range}"${allowExact ? ' as a devDependency' : ''}`, function () {
      assert.strictEqual(isValidApiRange(range, { allowExact }), true);
    });
  }

  const rejected = [
    ['1.9.1', false, 'an exact peer dependency'],
    ['~1.3.0', true, 'a tilde range'],
    ['>=1.3.0', true, 'an unbounded lower bound'],
    ['*', true, 'a wildcard'],
    ['^1.3.0 || ^2.0.0', true, 'a second stable major'],
    ['^1.3.0 || >=1.10.0-0 <1.11.0', true, 'a range as the appended clause'],
    ['^1.3.0 || 1.10.0-rc.0 || 1.11.0-rc.0', true, 'more than one clause'],
    ['1.9.1 || 1.10.0-rc.0', true, 'a clause appended to an exact pin'],
  ];

  for (const [range, allowExact, why] of rejected) {
    it(`rejects "${range}" (${why})`, function () {
      assert.strictEqual(isValidApiRange(range, { allowExact }), false);
    });
  }

  it('accepts everything alignApiRange produces', function () {
    const ranges = ['>=1.0.0 <1.10.0', '>=1.4.0 <1.10.0', '^1.3.0', '^1.0.0'];
    for (const range of ranges) {
      for (const version of ['1.10.0', '1.10.0-rc.0', '1.10.0-development.3']) {
        const aligned = alignApiRange(range, version);
        assert.ok(
          isValidApiRange(aligned, { allowExact: false }),
          `peer range "${aligned}" rejected`
        );
        assert.ok(
          isValidApiRange(aligned, { allowExact: true }),
          `dev range "${aligned}" rejected`
        );
      }
    }
  });
});

describe('prereleaseClauseOf', function () {
  const cases = [
    ['^1.3.0', null],
    ['>=1.0.0 <1.11.0', null],
    ['1.9.1', null],
    ['1.10.0-rc.0', '1.10.0-rc.0'],
    ['^1.3.0 || 1.10.0-rc.0', '1.10.0-rc.0'],
    ['>=1.0.0 <1.11.0 || 1.10.0-development.4', '1.10.0-development.4'],
  ];

  for (const [range, expected] of cases) {
    it(`reports ${expected} for "${range}"`, function () {
      assert.strictEqual(prereleaseClauseOf(range), expected);
    });
  }

  it('finds the clause in everything alignApiRange produces for a pre-release', function () {
    for (const range of ['>=1.0.0 <1.10.0', '^1.3.0', '1.9.1']) {
      assert.strictEqual(
        prereleaseClauseOf(alignApiRange(range, '1.10.0-rc.0')),
        '1.10.0-rc.0'
      );
    }
  });
});
