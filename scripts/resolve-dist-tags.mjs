#!/usr/bin/env node
/**
 * Resolve the npm dist-tags `lerna publish` should use, based on the branch the release is
 * published from. See scripts/lib/release-branch.mjs for the mapping.
 *
 * Environment Variables (Input):
 * - RELEASE_BASE_BRANCH: the branch being released, e.g. "main" or "v2.x" (required)
 * - DIST_TAG: "auto" (default) or "latest" - forces `latest` onto a maintenance branch
 *
 * Writes `dist_tag=<tag>` and `pre_dist_tag=<tag>` to stdout in the GitHub Actions step
 * output format, so that the caller can redirect it:
 *
 *     node scripts/resolve-dist-tags.mjs >> "$GITHUB_OUTPUT"
 *
 * Everything human-readable goes to stderr, so it shows up in the workflow log without
 * ending up in the step outputs. Exits non-zero for a branch we do not release from -
 * that is what stops the publish workflow from being dispatched from a feature branch.
 */

import { resolveDistTags } from './lib/release-branch.mjs';

const branch = process.env.RELEASE_BASE_BRANCH;
const override = process.env.DIST_TAG || 'auto';

let distTag, preDistTag;
try {
  ({ distTag, preDistTag } = resolveDistTags(branch, override));
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}

console.error(`Resolved npm dist-tags for branch "${branch}" (DIST_TAG="${override}"):`);
console.error(`  --dist-tag=${distTag}`);
console.error(`  --pre-dist-tag=${preDistTag}`);

// Worth saying out loud in the log the approver is looking at: as long as `main` publishes
// nothing but pre-releases, no release claims `latest` and it goes stale. See
// doc/contributing/releasing.md#maintenance-branches.
if (distTag !== 'latest') {
  console.error('');
  console.error(`Note: this release will NOT take the "latest" dist-tag - a plain \`npm install\` will not pick it up.`);
  console.error('If nothing else is publishing stable releases right now, re-run this workflow with');
  console.error('the "dist_tag" input set to "latest" instead.');
}

console.log(`dist_tag=${distTag}`);
console.log(`pre_dist_tag=${preDistTag}`);
