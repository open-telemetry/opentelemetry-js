/**
 * This extracts the latest (non-"Unreleased") notes from CHANGELOG.md files and saves them to `./.tmp/release-notes.md`.
 * Concatenates the output when multiple paths are passed as arguments.
 *
 * Usage (from project root):
 * - node scripts/extract-latest-release-notes.js [PATH TO CHANGELOG]...
 * Examples:
 * - node scripts/extract-latest-release-notes.js ./packages/CHANGELOG.md
 * - node scripts/extract-latest-release-notes.js ./semantic-conventions/CHANGELOG.md
 * - node scripts/extract-latest-release-notes.js ./experimental/CHANGELOG.md
 * - node scripts/extract-latest-release-notes.js ./api/CHANGELOG.md ./packages/CHANGELOG.md ./experimental/CHANGELOG.md
 */

const fs = require('fs');

function extractLatestChangelog(changelogPath) {
  const changelog = fs.readFileSync(changelogPath).toString();
  // Matches everything from the first entry at h2 ('##') followed by a space and a semver version
  // (including pre-releases like 3.0.0-development.0) until the next entry at h2 or the end of the
  // file (useful for first entry).
  // Thanks to https://stackoverflow.com/a/34958727 for the /Z emulation
  const firstReleaseNoteEntryExp = /^## \d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?\n.*?((?=^## )|$(?![\r\n]))/ms;

  const match = changelog.match(firstReleaseNoteEntryExp);
  if (match == null) {
    throw new Error(`Could not find a release entry in ${changelogPath}`);
  }

  return match[0];
};

fs.mkdirSync('./.tmp/', {
  recursive: true
});

const notesFile = './.tmp/release-notes.md';
const changelogFilePaths = process.argv.slice(2);
fs.writeFileSync(notesFile, changelogFilePaths.map(filePath => extractLatestChangelog(filePath)).join('\n'));
