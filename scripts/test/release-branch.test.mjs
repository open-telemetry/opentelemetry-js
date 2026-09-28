/**
 * Tests for the release branch classification and everything derived from it.
 *
 * Run with `npm run test:scripts`.
 */

import assert from 'assert';
import semver from 'semver';
import {
  parseReleaseBranch,
  requireReleaseBranch,
  resolveDistTags,
  releasePrHeadBranch,
  releasePrTitle,
} from '../lib/release-branch.mjs';

describe('parseReleaseBranch', function () {
  it('recognizes the development branch', function () {
    assert.deepStrictEqual(parseReleaseBranch('main'), { kind: 'main' });
  });

  const maintenance = [
    ['v2.x', 2],
    ['v0.x', 0],
    ['v10.x', 10],
  ];

  for (const [name, major] of maintenance) {
    it(`recognizes ${name} as a maintenance branch for ${major}.x`, function () {
      assert.deepStrictEqual(parseReleaseBranch(name), { kind: 'maintenance', major });
    });
  }

  const rejected = [
    'next',
    'otelbot/prepare-next-version',
    'otelbot/prepare-next-version-v2.x',
    'main2',
    // Unprefixed: matches none of the "release branches" ruleset's `refs/heads/v[0-9]*.*`,
    // so a branch by this name would be completely unprotected.
    '2.x',
    'v2.y',
    'v2.x.1',
    // `v1.10`-style branches exist upstream but are not a release line we cut from.
    'v2.10',
    'v2.',
    'vx',
    // A detached HEAD reports this - it must not be mistaken for a release branch.
    'HEAD',
    '',
    undefined,
    null,
    // `\d+` would accept this and report major 2, from a branch that does not exist.
    'v02.x',
  ];

  for (const name of rejected) {
    it(`rejects ${JSON.stringify(name)}`, function () {
      assert.strictEqual(parseReleaseBranch(name), null);
      assert.throws(() => requireReleaseBranch(name), /Not a release branch/);
    });
  }
});

describe('resolveDistTags', function () {
  const cases = [
    ['main', 'auto', 'latest', 'canary'],
    ['main', 'latest', 'latest', 'canary'],
    ['v2.x', 'auto', 'latest-2', 'canary-2'],
    // `latest` can be handed to a maintenance branch on purpose, for when the next major
    // takes long enough that nothing else is claiming the tag.
    ['v2.x', 'latest', 'latest', 'canary-2'],
    ['v10.x', 'auto', 'latest-10', 'canary-10'],
  ];

  for (const [branch, override, distTag, preDistTag] of cases) {
    it(`resolves ${branch} with override "${override}" to ${distTag} / ${preDistTag}`, function () {
      assert.deepStrictEqual(resolveDistTags(branch, override), { distTag, preDistTag });
    });
  }

  it('defaults the override to "auto"', function () {
    assert.deepStrictEqual(resolveDistTags('v2.x'), {
      distTag: 'latest-2',
      preDistTag: 'canary-2',
    });
  });

  it('never gives a maintenance branch main\'s pre-dist-tag', function () {
    // A `2.11.0-rc.0` published from `v2.x` must not point `canary` away from main's
    // pre-release stream, even though prepare-release.mjs rejects it upstream.
    for (const override of ['auto', 'latest']) {
      assert.notStrictEqual(resolveDistTags('v2.x', override).preDistTag, 'canary');
    }
  });

  // This is the reason the tags are `latest-2`/`canary-2` and not `2.x`/`v2.x`: npm refuses
  // a tag name that is a valid semver range ("Tag name must not be a valid SemVer range"),
  // and `pkg@2.x` would be resolved as a range rather than read the tag. lerna publishes
  // through libnpmpublish, which does *not* validate the tag name, so a range-shaped tag
  // would be written to the registry and then be unaddressable and unremovable.
  it('never resolves to a tag that is a valid semver range', function () {
    for (const branch of ['main', 'v0.x', 'v2.x', 'v10.x']) {
      for (const override of ['auto', 'latest']) {
        const { distTag, preDistTag } = resolveDistTags(branch, override);
        assert.strictEqual(semver.validRange(distTag), null, `dist-tag "${distTag}" is a semver range`);
        assert.strictEqual(semver.validRange(preDistTag), null, `pre-dist-tag "${preDistTag}" is a semver range`);
      }
    }
  });

  it('rejects a branch we do not release from', function () {
    assert.throws(() => resolveDistTags('feature/foo', 'auto'), /Not a release branch/);
  });

  it('rejects an unknown override', function () {
    assert.throws(() => resolveDistTags('main', 'canary'), /Not a valid dist-tag override/);
    assert.throws(() => resolveDistTags('main', ''), /Not a valid dist-tag override/);
  });
});

describe('releasePrHeadBranch', function () {
  it('keeps the historical name for main', function () {
    assert.strictEqual(releasePrHeadBranch('main'), 'otelbot/prepare-next-version');
  });

  it('scopes the head branch to the maintenance branch', function () {
    // One head branch per release branch, so that a v2.x release PR and a main release PR
    // can be open at the same time.
    assert.strictEqual(releasePrHeadBranch('v2.x'), 'otelbot/prepare-next-version-v2.x');
    assert.notStrictEqual(releasePrHeadBranch('v2.x'), releasePrHeadBranch('main'));
  });

  it('rejects a branch we do not release from', function () {
    assert.throws(() => releasePrHeadBranch('next'), /Not a release branch/);
  });
});

describe('releasePrTitle', function () {
  it('names the branch for maintenance releases', function () {
    assert.strictEqual(releasePrTitle('main'), 'chore: prepare next release');
    assert.strictEqual(releasePrTitle('v2.x'), 'chore: prepare next v2.x release');
  });
});
