/**
 * This extracts the latest (non-"Unreleased") notes from a CHANGELOG.md and saves them to `./.tmp/release-notes.md`
 *
 * Usage (from project root):
 * - node scripts/extract-latest-release-notes.js [PATH TO CHANGELOG]
 * Examples:
 * - node scripts/extract-latest-release-notes.js ./packages/CHANGELOG.md
 * - node scripts/extract-latest-release-notes.js ./experimental/CHANGELOG.md
 */

const fs = require('fs');

function extractLatestChangelog(changelogPath) {
  const changelog = fs.readFileSync(changelogPath).toString();
  // Matches everything from the first entry at h2 ('##') followed by a space and a non-prerelease semver version
  // until the next entry at h2.
  const firstReleaseNoteEntryExp = /^## \d+\.\d+\.\d\n.*?(?=^## )/ms;

  return changelog.match(firstReleaseNoteEntryExp)[0];
}

fs.mkdirSync('./.tmp/', {
  recursive: true
});

const notesFile = './.tmp/release-notes.md'
const changelogFilePaths = process.argv.slice(2);
fs.writeFileSync(notesFile, changelogFilePaths.map(filePath => extractLatestChangelog(filePath)).join('\n'));
