#!/usr/bin/env node
/**
 * Create or update the release PR for a release branch.
 *
 * Rebuilds the release branch's PR from scratch on every run: reset a head branch to the
 * tip of the release branch, run `prepare_release` on it, force-push, then create the PR if
 * it does not exist yet and (re-)set its title and body. That is what makes it safe to
 * re-run after new commits land on the release branch.
 *
 * There is one head branch per release branch (see releasePrHeadBranch()), so a `v2.x`
 * release PR and a `main` release PR can be open at the same time without overwriting each
 * other.
 *
 * Environment Variables (Input):
 * - RELEASE_BASE_BRANCH: branch to release from, "main" or "v<major>.x". Defaults to the
 *   currently checked out branch.
 * - RELEASE_PR_REMOTE: git remote to pull from and push to. Defaults to "origin".
 * - RELEASE_PR_REPO: GitHub repository the PR is opened on. Defaults to the upstream repo;
 *   override it to dry-run the whole flow against a fork.
 * - GITHUB_TOKEN: used by `gh`.
 * - STABLE_SDK_RELEASE, EXPERIMENTAL_RELEASE, API_RELEASE, SEMCONV_RELEASE, PRERELEASE:
 *   passed through to scripts/prepare-release.mjs.
 */

import { execFileSync } from 'child_process';
import {
  parseReleaseBranch,
  releasePrHeadBranch,
  releasePrTitle,
  RELEASE_BRANCH_HINT
} from './lib/release-branch.mjs';

const DEFAULT_REPO = 'open-telemetry/opentelemetry-js';
const SUMMARY_FILE = './.tmp/release-summary.md';

function fail(...lines) {
  for (const line of lines) {
    console.error(line);
  }
  process.exit(1);
}

// execFileSync rather than execSync throughout: no shell, so branch names and PR titles are
// passed as argv and cannot be reinterpreted as shell syntax.
//
// Both helpers are fatal on failure. Every command inherits stderr, so it has already printed
// its own error - all that is added is which command it was, instead of Node dumping an
// ExecFileSyncException on top of it.
function exec(cmd, args, options) {
  try {
    return execFileSync(cmd, args, options);
  } catch (err) {
    if (err.status == null) {
      throw err;
    }
    fail('', `Error: \`${[cmd, ...args].join(' ')}\` failed with exit code ${err.status}.`);
  }
}

function run(cmd, args, { env } = {}) {
  exec(cmd, args, { stdio: 'inherit', env: env ?? process.env });
}

function capture(cmd, args) {
  return exec(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
}

function resolveBaseBranch() {
  let name = process.env.RELEASE_BASE_BRANCH;

  if (!name) {
    name = capture('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  }

  if (parseReleaseBranch(name) == null) {
    fail(`Error: cannot release from branch "${name}".`, RELEASE_BRANCH_HINT);
  }

  return name;
}

function main() {
  const base = resolveBaseBranch();
  const head = releasePrHeadBranch(base);
  const title = releasePrTitle(base);
  const remote = process.env.RELEASE_PR_REMOTE || 'origin';
  const repo = process.env.RELEASE_PR_REPO || DEFAULT_REPO;

  console.log('Release PR configuration:');
  console.log(`  base branch: ${base}`);
  console.log(`  head branch: ${head}`);
  console.log(`  remote:      ${remote}`);
  console.log(`  repository:  ${repo}`);

  // Fail before touching anything if the remote is not there.
  console.log(`\nChecking remote "${remote}"...`);
  run('git', ['remote', 'get-url', remote]);

  // Reset the head branch straight onto the freshly fetched base, in one step.
  //
  // The obvious `checkout <base> && pull && checkout -b <head>` does not survive this
  // environment: `actions/checkout` clones a single ref at depth 1, so any base other than
  // the dispatched ref does not exist locally; `pull` on a diverged base silently produces
  // a merge commit that then gets force-pushed into the release PR; and `branch -D <head>`
  // fails outright when <head> happens to be the current branch. Fetching and using
  // FETCH_HEAD with `checkout -B` has none of those failure modes and needs no cleanup.
  console.log(`\nResetting ${head} onto ${remote}/${base}...`);
  run('git', ['fetch', '--no-tags', remote, base]);
  run('git', ['checkout', '-B', head, 'FETCH_HEAD']);

  console.log('\nPreparing the release...');
  run('npm', ['run', 'prepare_release'], {
    env: { ...process.env, RELEASE_BASE_BRANCH: base },
  });

  console.log('\nCommitting and pushing...');
  run('git', ['commit', '-am', 'chore: prepare release']);
  run('git', ['push', '--set-upstream', '--force', remote, head]);

  // Look the PR up rather than running `gh pr create || true` and then addressing the PR by
  // branch name. Both halves of that pattern are traps: `|| true` also swallows auth and
  // rate-limit failures, and `gh pr edit <branch>` falls back to a *closed or merged* PR
  // when there is no open one - so a failed create would silently rewrite the body of the
  // previous release PR and still exit 0. `--jq '.[0].number'` yields an empty string when
  // nothing matches.
  const findPr = () =>
    capture('gh', [
      'pr', 'list', '--repo', repo, '--base', base, '--head', head,
      '--state', 'open', '--json', 'number', '--jq', '.[0].number',
    ]);

  let number = findPr();
  if (number) {
    console.log(`\nRelease PR #${number} is already open, updating it...`);
  } else {
    console.log('\nCreating the release PR...');
    // `--head` tells `gh` the branch is already pushed, so it does not offer to fork or push.
    // Without `--base` the PR would target the repository's default branch - which for a
    // maintenance branch means a PR against `main` containing the whole older line.
    run('gh', [
      'pr', 'create', '--repo', repo, '--base', base, '--head', head,
      '--title', title, '--body', '',
    ]);
    number = findPr();
    if (!number) {
      fail('Error: created the release PR but could not find it again.');
    }
  }

  // Title as well as body, so that a re-run also fixes up a PR created by an older version
  // of this script.
  run('gh', [
    'pr', 'edit', number, '--repo', repo, '--title', title, '--body-file', SUMMARY_FILE,
  ]);

  console.log(`\n✓ Release PR #${number} (${base} <- ${head}) is up to date.`);
}

main();
