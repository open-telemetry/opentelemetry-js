/**
 * Which release line a branch represents, and everything that follows from it.
 *
 * Releases are cut from two kinds of branch:
 *
 *   main   the current development line - takes the `latest` npm dist-tag, and is the
 *          only branch that may cut pre-releases or a `major` bump.
 *   v<N>.x a maintenance branch for an older major (e.g. `v2.x` while `main` builds 3.0).
 *          Must *not* take `latest` by default, or a maintenance release would move
 *          `latest` backwards over the newer line.
 *
 * This module is the single source of truth for that distinction - `prepare-release.mjs`
 * uses it to reject bumps that do not belong on the branch, `resolve-dist-tags.mjs` uses
 * it to pick the npm dist-tags, and `create-or-update-release-pr.mjs` uses it to keep one
 * release PR per branch.
 *
 * Deliberately dependency-free (no `semver`, no `glob`) so that it can run in a workflow
 * step before `npm ci`.
 */

/** The development branch. */
export const MAIN_BRANCH = 'main';

/**
 * Maintenance branches are named after the major they maintain, with a `v` prefix. The
 * prefix is not cosmetic: the repository's "release branches" ruleset targets
 * `refs/heads/v[0-9]*.*`, so a branch named `2.x` would get none of its protections
 * (no forced PR, force-pushable, deletable). `v1.x` and `v1.10` already follow this.
 *
 * The alternation rather than `\d+` is intentional: `\d+` also accepts `v02.x`, which
 * would then pass the major checks in prepare-release.mjs from a branch that does not exist.
 */
const MAINTENANCE_BRANCH_RE = /^v(0|[1-9]\d*)\.x$/;

/** Head branch of the release PR opened against `main`. Unchanged for historical reasons. */
const RELEASE_PR_HEAD_BRANCH = 'otelbot/prepare-next-version';

/** Shown whenever a branch is rejected, so the error is actionable on its own. */
export const RELEASE_BRANCH_HINT =
  `Releases can only be cut from "${MAIN_BRANCH}" or from a maintenance branch named "v<major>.x" (e.g. "v2.x").`;

/**
 * @typedef {{ kind: 'main' } | { kind: 'maintenance', major: number }} ReleaseBranch
 */

/**
 * Classify a branch name.
 *
 * @param {string | undefined | null} name Branch name, e.g. `main` or `v2.x`.
 * @returns {ReleaseBranch | null} null if the branch is not a release branch.
 */
export function parseReleaseBranch(name) {
  if (name === MAIN_BRANCH) {
    return { kind: 'main' };
  }

  const match = typeof name === 'string' ? MAINTENANCE_BRANCH_RE.exec(name) : null;
  if (match == null) {
    return null;
  }

  return { kind: 'maintenance', major: Number(match[1]) };
}

/**
 * Same as parseReleaseBranch(), but throws instead of returning null.
 *
 * @param {string | undefined | null} name
 * @returns {ReleaseBranch}
 */
export function requireReleaseBranch(name) {
  const branch = parseReleaseBranch(name);
  if (branch == null) {
    throw new Error(`Not a release branch: "${name}". ${RELEASE_BRANCH_HINT}`);
  }
  return branch;
}

/** Valid values for the dist-tag override. */
export const DIST_TAG_OVERRIDES = ['auto', 'latest'];

/**
 * Pick the npm dist-tags to publish with.
 *
 * | branch | override | dist-tag | pre-dist-tag |
 * | ---    | ---      | ---      | ---          |
 * | main   | auto     | latest   | canary       |
 * | v2.x   | auto     | latest-2 | canary-2     |
 * | v2.x   | latest   | latest   | canary-2     |
 *
 * The maintenance tags are keyed on the major rather than the branch name, following the
 * convention express uses (`latest` / `latest-4`). Two constraints rule out the obvious
 * `2.x`: npm rejects a tag name that is a valid semver range ("Tag name must not be a
 * valid SemVer range"), and `semver.validRange('2.x')` is `>=2.0.0 <3.0.0-0` - so
 * `npm install pkg@2.x` would resolve as a *range* and never read the tag at all.
 * `v2.x` is a valid range too. See the matching test in scripts/test/release-branch.test.mjs.
 *
 * `lerna publish` applies `--pre-dist-tag` per package, but only to packages whose version
 * is a pre-release, so both tags are always passed. The pre-dist-tag is scoped to the major
 * even though prepare-release.mjs rejects pre-releases on a maintenance branch: it is the
 * publish workflow, not the release PR, that decides what actually reaches npm, and a
 * `2.11.0-rc.0` that somehow got that far must not point `canary` away from main's
 * pre-release stream.
 *
 * `latest` can be handed to a maintenance branch on purpose: while `main` publishes nothing
 * but pre-releases (which go to the pre-dist-tag), no release claims `latest` and it goes
 * stale, so during a long pre-release cycle it is better held by the maintenance line.
 *
 * @param {string | undefined | null} branchName
 * @param {string} [override] One of DIST_TAG_OVERRIDES. Defaults to 'auto'.
 * @returns {{ distTag: string, preDistTag: string }}
 */
export function resolveDistTags(branchName, override = 'auto') {
  const branch = requireReleaseBranch(branchName);

  if (!DIST_TAG_OVERRIDES.includes(override)) {
    throw new Error(
      `Not a valid dist-tag override: "${override}". Must be one of: ${DIST_TAG_OVERRIDES.join(', ')}`
    );
  }

  if (branch.kind === 'main') {
    return { distTag: 'latest', preDistTag: 'canary' };
  }

  return {
    distTag: override === 'latest' ? 'latest' : `latest-${branch.major}`,
    preDistTag: `canary-${branch.major}`,
  };
}

/**
 * Head branch for the release PR against the given release branch. One head branch per
 * release branch, so a maintenance release PR never overwrites the one for `main`.
 *
 * @param {string | undefined | null} branchName
 * @returns {string}
 */
export function releasePrHeadBranch(branchName) {
  const branch = requireReleaseBranch(branchName);
  return branch.kind === 'main'
    ? RELEASE_PR_HEAD_BRANCH
    : `${RELEASE_PR_HEAD_BRANCH}-${branchName}`;  // e.g. otelbot/prepare-next-version-v2.x
}

/**
 * Title for the release PR. Names the branch for maintenance releases, so that two open
 * release PRs are told apart at a glance.
 *
 * @param {string | undefined | null} branchName
 * @returns {string}
 */
export function releasePrTitle(branchName) {
  const branch = requireReleaseBranch(branchName);
  return branch.kind === 'main'
    ? 'chore: prepare next release'
    : `chore: prepare next ${branchName} release`;
}
