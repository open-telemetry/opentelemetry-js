/**
 * Version bump math for the release scripts.
 *
 * The bump itself is `semver.inc()`, but a bare `inc()` has several ways of quietly
 * producing a version nobody asked for once pre-releases are in play. The guards in
 * `nextVersion()` turn each of those into a hard error:
 *
 *   inc('3.0.0-development.0', 'premajor', 'development')   -> 4.0.0-development.0    escalates a whole major
 *   inc('3.0.0-development.3', 'prerelease', 'development') -> 3.0.0-development.4    ignores a 'minor' selection
 *   inc('2.10.1-rc.2', 'minor')                             -> 2.11.0                 abandons the pending 2.10.1
 *   inc('0.222.0-rc.2', 'prerelease', 'development')        -> 0.222.0-development.0  lower than the current version
 */

import semver from 'semver';

/**
 * Which release line an in-flight pre-release belongs to. `3.0.0-development.0` is a
 * pre-release *of a major*, `0.222.0-rc.1` is a pre-release *of a minor*, and
 * `2.10.1-rc.0` is a pre-release *of a patch*.
 *
 * @param {import('semver').SemVer} parsed
 * @returns {'patch' | 'minor' | 'major'}
 */
function releaseLineOf(parsed) {
  if (parsed.patch !== 0) return 'patch';
  if (parsed.minor !== 0) return 'minor';
  return 'major';
}

/**
 * Compute the next version.
 *
 * @param {string} current Current version, e.g. `2.10.0` or `3.0.0-development.1`.
 * @param {'patch'|'minor'|'major'} kind Release type selected by the maintainer.
 * @param {string|null} preid Pre-release identifier (`development`, `rc`), or null/'' for a normal release.
 * @returns {string} The next version.
 * @throws {Error} If the requested bump would produce a surprising or invalid version.
 */
export function nextVersion(current, kind, preid) {
  const parsed = semver.parse(current);
  if (parsed == null) {
    throw new Error(`Not a valid version: "${current}"`);
  }

  const base = `${parsed.major}.${parsed.minor}.${parsed.patch}`;
  const inFlight = parsed.prerelease.length > 0;
  const line = releaseLineOf(parsed);

  if (!preid) {
    const next = semver.inc(current, kind);
    if (next == null) {
      throw new Error(`Could not apply a "${kind}" bump to "${current}"`);
    }

    // Finalizing a pre-release: semver.inc() drops the pre-release in place (and keeps
    // the base version) only when `kind` matches the line the pre-release is on. With a
    // mismatch it moves to a whole different version, silently abandoning the release
    // that is currently in flight.
    if (inFlight && next !== base) {
      throw new Error(
        `Selecting "${kind}" while ${current} is in flight would produce ${next}, ` +
          `skipping the pending ${base} release. Select "${line}" instead.`
      );
    }

    return next;
  }

  // Starting a new pre-release line from a stable version.
  if (!inFlight) {
    const next = semver.inc(current, `pre${kind}`, preid);
    if (next == null) {
      throw new Error(`Could not apply a "pre${kind}" bump to "${current}"`);
    }
    return next;
  }

  // Continuing an existing pre-release. `semver.inc(v, 'prerelease')` ignores `kind`
  // entirely, so reject a mismatch rather than silently bumping the wrong thing.
  if (line !== kind) {
    throw new Error(
      `Cannot apply a "${kind}" bump: ${current} is an in-flight "${line}" ` +
        `pre-release for ${base}. Finalize ${base} first, or select "${line}".`
    );
  }

  const next = semver.inc(current, 'prerelease', preid);
  if (next == null) {
    throw new Error(`Could not apply a "prerelease" bump to "${current}"`);
  }

  // Pre-release identifiers are compared as strings, so going "backwards"
  // (rc -> development) produces a version lower than the current one.
  if (semver.lte(next, current)) {
    throw new Error(
      `Refusing to bump ${current} to ${next}: that is not an increase. ` +
        `Pre-release identifiers only move forward (development < rc).`
    );
  }

  return next;
}
