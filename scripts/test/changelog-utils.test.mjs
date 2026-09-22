/**
 * Tests for changelog rotation.
 *
 * The test data lives in `fixtures/changelog/`: `<name>.md` is a changelog before releasing, and
 * `<name>.<version>.md` is what it has to look like after releasing `<version>`. Assertions
 * compare whole files, so a stray blank line is a test failure - the rotation writes the changelog
 * the whole project reads.
 *
 * Run with `npm run test:scripts`.
 */

import assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { rotateChangelog } from '../lib/changelog-utils.mjs';

const FIXTURE_DIR = path.join(import.meta.dirname, 'fixtures', 'changelog');

const fixture = name => fs.readFileSync(path.join(FIXTURE_DIR, `${name}.md`), 'utf8');

describe('rotateChangelog', function () {
  const cases = [
    {
      description: 'rotates "## Unreleased" into the new version and drops empty subsections',
      name: 'no-prereleases',
      version: '2.11.0',
      absorbed: [],
    },
    {
      description: 'merges every pre-release section into the final one, oldest entries first',
      name: 'prerelease-cycle',
      version: '3.0.0',
      absorbed: ['3.0.0-rc.0', '3.0.0-development.1', '3.0.0-development.0'],
    },
    {
      description: 'collapses nothing when the new version is itself a pre-release',
      name: 'prerelease-cycle',
      version: '3.0.0-rc.1',
      absorbed: [],
    },
    {
      description: 'keeps an unrecognized subsection, after the known ones',
      name: 'custom-subsection',
      version: '3.0.0',
      absorbed: ['3.0.0-rc.0'],
    },
    {
      description: 'drops an empty "## Unreleased" and empty pre-release sections',
      name: 'empty-sections',
      version: '3.0.0',
      absorbed: ['3.0.0-rc.0', '3.0.0-development.0'],
    },
    {
      description: 'writes an empty version section when there is nothing to release',
      name: 'nothing-to-release',
      version: '2.11.0',
      absorbed: [],
    },
  ];

  for (const { description, name, version, absorbed } of cases) {
    it(description, function () {
      const result = rotateChangelog(fixture(name), version);

      assert.strictEqual(result.changelog, fixture(`${name}.${version}`));
      assert.deepStrictEqual(result.absorbed, absorbed);
    });
  }

  // The rotation is a no-op for every release that does not finalize a pre-release cycle, which is
  // the vast majority of them - guard that it stays that way.
  it('matches the pre-aggregation output byte for byte when there is nothing to collapse', function () {
    const before = fixture('no-prereleases');
    const legacy = before
      .replace(new RegExp('^###.*\n*(?=^##)', 'gm'), '')
      .replace(
        RegExp('## Unreleased'),
        '## Unreleased\n\n' +
          '### :boom: Breaking Changes\n\n' +
          '### :rocket: Features\n\n' +
          '### :bug: Bug Fixes\n\n' +
          '### :books: Documentation\n\n' +
          '### :house: Internal\n\n' +
          '## 2.11.0'
      );

    assert.strictEqual(rotateChangelog(before, '2.11.0').changelog, legacy);
  });

  describe('the collapse boundary', function () {
    // Only the section headings matter here, so they are generated rather than fixtured: each
    // changelog is `## Unreleased`, then the given headings, then `## 1.0.0`.
    const changelogWith = (...headings) =>
      '# CHANGELOG\n\n' +
      '## Unreleased\n\n### :rocket: Features\n\n- feat: unreleased @someone\n\n' +
      headings
        .map(heading => `## ${heading}\n\n### :rocket: Features\n\n- feat: from ${heading} @someone\n\n`)
        .join('') +
      '## 1.0.0\n\n### :rocket: Features\n\n- feat: ancient @someone\n';

    const cases = [
      ['a normal release', ['2.11.0'], []],
      ['a pre-release of another version', ['2.11.0-rc.0'], []],
      ['a heading that is not a version', ['Some note'], []],
      [
        'a normal release below the pre-releases',
        ['3.0.0-rc.0', '2.10.1', '3.0.0-development.0'],
        ['3.0.0-rc.0'],
      ],
      [
        'a differently-based pre-release below the pre-releases',
        ['3.0.0-rc.0', '2.11.0-rc.0'],
        ['3.0.0-rc.0'],
      ],
    ];

    for (const [description, headings, absorbed] of cases) {
      it(`stops at ${description}`, function () {
        assert.deepStrictEqual(
          rotateChangelog(changelogWith(...headings), '3.0.0').absorbed,
          absorbed
        );
      });
    }
  });

  describe('errors', function () {
    it('rejects a changelog without an "## Unreleased" section', function () {
      assert.throws(
        () => rotateChangelog(fixture('no-unreleased'), '2.11.0'),
        /Could not find an "## Unreleased" section/
      );
    });

    it('rejects an invalid version', function () {
      assert.throws(
        () => rotateChangelog(fixture('no-prereleases'), 'not-a-version'),
        /Not a valid version/
      );
    });
  });
});
