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

const changelog = fs.readFileSync(process.argv[2]).toString();
// Matches everything from the first entry at h2 ('##') followed by a space and a non-prerelease semver version
// until the next entry at h2.
const firstReleaseNoteEntryExp = /^## \d+\.\d+\.\d\n.*?(?=^## )/ms;

fs.mkdirSync('./.tmp/', {
  recursive: true
});

const notesFile = './.tmp/release-notes.md'
fs.writeFileSync(notesFile, changelog.match(firstReleaseNoteEntryExp)[0]);
