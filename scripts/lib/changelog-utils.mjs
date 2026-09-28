/**
 * Changelog rotation for the release scripts.
 *
 * Releasing turns the `## Unreleased` section into a `## <version>` section and starts a fresh,
 * empty `## Unreleased`. With pre-releases in play that is not quite enough: every iteration of a
 * cycle mints its own section, so `## 3.0.0` would end up holding nothing but the entries that
 * landed after the last release candidate, and the changelog would carry a stack of
 * `## 3.0.0-development.N` / `## 3.0.0-rc.N` sections nobody reads once 3.0.0 is out.
 *
 * Finalizing therefore *collapses* those sections into the release they were leading up to - see
 * `rotateChangelog()`. Their per-pre-release notes are still in the git history and in the
 * GitHub pre-releases that were published from them.
 */

import semver from 'semver';

/**
 * The subsections a release section is made of, in the order they are rendered. Also the skeleton
 * of a freshly rotated `## Unreleased` - contributors fill in the one their change belongs to.
 */
export const CHANGELOG_SUBSECTIONS = [
  ':boom: Breaking Changes',
  ':rocket: Features',
  ':bug: Bug Fixes',
  ':books: Documentation',
  ':house: Internal',
];

const EMPTY_UNRELEASED_SECTION =
  '## Unreleased\n\n' +
  CHANGELOG_SUBSECTIONS.map(heading => `### ${heading}\n\n`).join('');

// The negative lookahead keeps the levels apart: without it `^## ` also matches the first three
// characters of a `### ` heading, and `^### ` those of a `#### ` one.
const H2 = /^##(?!#) (.*)$/gm;
const H3 = /^###(?!#) (.*)$/gm;

/**
 * Split a document at headings of one level.
 *
 * `body` is the verbatim slice between two headings, so bullets, sub-bullets, links, HTML comments
 * and blank lines all survive a split/render round-trip untouched.
 *
 * @param {string} text
 * @param {RegExp} headingRe One of H2/H3 - must be sticky-free and `g`-flagged.
 * @returns {{ preamble: string, sections: Array<{ heading: string, body: string }> }}
 *   `preamble` is everything before the first heading (the whole text if there is none).
 */
function splitByHeading(text, headingRe) {
  const matches = [...text.matchAll(headingRe)];

  return {
    preamble: matches.length > 0 ? text.slice(0, matches[0].index) : text,
    sections: matches.map((match, i) => ({
      heading: match[1].trim(),
      body: text.slice(
        match.index + match[0].length,
        i + 1 < matches.length ? matches[i + 1].index : text.length
      ),
    })),
  };
}

/** The `major.minor.patch` of a version, without any pre-release suffix. */
function baseVersionOf(parsed) {
  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

/**
 * Merge several release section bodies into one set of rendered subsections.
 *
 * Entries are concatenated in the order the bodies are passed in, which is why the caller passes
 * them oldest-first: within `### :rocket: Features`, the reader then sees the same order in which
 * the entries were written.
 *
 * @param {string[]} bodies
 * @returns {string} Rendered subsections, each block terminated by a blank line, or '' if all
 *   bodies were empty.
 */
function mergeBodies(bodies) {
  const entriesByHeading = new Map();

  for (const body of bodies) {
    for (const { heading, body: entries } of splitByHeading(body, H3).sections) {
      const trimmed = entries.trim();
      // Subsections nobody filled in are dropped rather than carried over empty.
      if (trimmed === '') continue;

      if (!entriesByHeading.has(heading)) {
        entriesByHeading.set(heading, []);
      }
      entriesByHeading.get(heading).push(trimmed);
    }
  }

  // Known subsections in their canonical order, then anything hand-written, in the order it first
  // appeared - an unrecognized heading is a maintainer's deliberate addition, not something to
  // silently drop.
  const headings = [
    ...CHANGELOG_SUBSECTIONS.filter(heading => entriesByHeading.has(heading)),
    ...[...entriesByHeading.keys()].filter(
      heading => !CHANGELOG_SUBSECTIONS.includes(heading)
    ),
  ];

  return headings
    .map(heading => `### ${heading}\n\n${entriesByHeading.get(heading).join('\n')}\n\n`)
    .join('');
}

/**
 * Rotate `## Unreleased` into `## <version>` and start a fresh, empty `## Unreleased`.
 *
 * When `version` is a normal release, the pre-release sections of the same base version directly
 * below `## Unreleased` are collapsed into the new section: their headings go away and their
 * entries are merged per subsection, oldest pre-release first, `Unreleased` last. That makes
 * `## 3.0.0` the changelog for the whole cycle, which is also what
 * `scripts/extract-latest-release-notes.js` turns into the GitHub release notes.
 *
 * Pre-release versions absorb nothing: while a cycle is in flight, each iteration's section
 * describes what changed since the previous one.
 *
 * @param {string} changelogText Contents of a CHANGELOG.md.
 * @param {string} version The version being released, e.g. `3.0.0` or `3.0.0-rc.0`.
 * @returns {{ changelog: string, absorbed: string[] }} `absorbed` lists the collapsed pre-release
 *   versions in the order they appeared in the file (newest first), and is empty when nothing was
 *   collapsed.
 * @throws {Error} If `version` is not a valid version, or the changelog has no `## Unreleased`.
 */
export function rotateChangelog(changelogText, version) {
  const parsedVersion = semver.parse(version);
  if (parsedVersion == null) {
    throw new Error(`Not a valid version: "${version}"`);
  }

  // Prune subsections that were left empty. Applied to the whole file, as it always has been.
  const text = changelogText.replace(/^###.*\n*(?=^##)/gm, '');

  const { preamble, sections } = splitByHeading(text, H2);
  const unreleasedIndex = sections.findIndex(section => section.heading === 'Unreleased');
  if (unreleasedIndex === -1) {
    throw new Error('Could not find an "## Unreleased" section');
  }

  const absorbed = [];
  if (parsedVersion.prerelease.length === 0) {
    const base = baseVersionOf(parsedVersion);

    for (const section of sections.slice(unreleasedIndex + 1)) {
      const parsed = semver.parse(section.heading);
      // Stop at the first section that is not a pre-release of the version being finalized: an
      // earlier normal release, a pre-release of some other version, or a non-version heading.
      if (parsed == null || parsed.prerelease.length === 0 || baseVersionOf(parsed) !== base) {
        break;
      }
      absorbed.push(section);
    }
  }

  // The file lists sections newest first, so reverse to get chronological order, and append the
  // still-unreleased entries as the most recent ones.
  const bodies = [...absorbed]
    .reverse()
    .map(section => section.body)
    .concat(sections[unreleasedIndex].body);

  const retained = sections.slice(unreleasedIndex + 1 + absorbed.length);

  const changelog =
    preamble +
    EMPTY_UNRELEASED_SECTION +
    `## ${version}\n\n` +
    mergeBodies(bodies) +
    // `body` already starts with the newline that ended the heading line.
    retained.map(section => `## ${section.heading}${section.body}`).join('');

  return {
    changelog: retained.length > 0 ? changelog : changelog.replace(/\n+$/, '\n'),
    absorbed: absorbed.map(section => section.heading),
  };
}
