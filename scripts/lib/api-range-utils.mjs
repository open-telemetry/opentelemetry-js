/**
 * Dependency range logic for `@opentelemetry/api`.
 *
 * Every package depends on the API through a range (`^1.3.0`, `>=1.0.0 <1.10.0`) rather than
 * an exact pin, so that a single API copy can be shared across the tree. `alignApiRange()`
 * keeps those ranges in step with the version in `api/package.json` (align-api-deps.mjs),
 * and `isValidApiRange()` is the CI guard that rejects any shape the alignment does not
 * produce on its own (peer-api-check.mjs).
 *
 * Pre-releases are the awkward case: a pre-release version does not satisfy an ordinary
 * range, e.g. `semver.satisfies('1.10.0-rc.0', '^1.3.0') === false`, so during an API
 * pre-release cycle npm would resolve the API from the registry instead of linking the
 * workspace copy. The alignment therefore appends the exact pre-release version as an extra
 * comparator set - `^1.3.0 || 1.10.0-rc.0` - for as long as the API is a pre-release. That
 * clause is rewritten on each iteration and stripped again when the cycle is finalized, so
 * the range a normal release ships with is exactly what it would have been without the
 * cycle. See doc/contributing/releasing.md.
 */

import semver from 'semver';

// An exact version, with or without a pre-release tag: `1.9.1`, `1.10.0-rc.0`.
const EXACT_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

// An exact *pre-release* version. This is the only shape allowed as the appended clause.
const EXACT_PRERELEASE_RE = /^\d+\.\d+\.\d+-[0-9A-Za-z.-]+$/;

// A bounded range, whose upper bound the alignment moves: `>=1.0.0 <1.10.0`.
const BOUNDED_RANGE_RE = /^>=\d+\.\d+\.\d+ <(\d+\.\d+\.\d+)$/;

// A caret range: `^1.3.0`. Left as-is by the alignment - it already admits later minors.
const CARET_RANGE_RE = /^\^\d+\.\d+\.\d+$/;

/**
 * Split a range into its `||`-separated comparator sets.
 *
 * @param {string} range
 * @returns {string[]}
 */
function splitSets(range) {
  return range.split('||').map(set => set.trim());
}

/**
 * Decompose an API version into the parts the alignment needs.
 *
 * The next minor is computed from the *base* version rather than from `apiVersion` itself,
 * because `semver.inc()` treats a pre-release as a candidate for the version it precedes:
 * `parse('1.10.0-rc.0').inc('minor')` is `1.10.0`, not `1.11.0`. Aligning against the base
 * is also what makes the cycle a no-op overall - a range widened for `1.10.0-rc.0` and one
 * aligned to a final `1.10.0` differ only by the appended clause.
 *
 * @param {string} apiVersion Version from `api/package.json`.
 */
function describeApiVersion(apiVersion) {
  const parsed = semver.parse(apiVersion);
  if (parsed == null) {
    throw new Error(`Cannot parse @opentelemetry/api version "${apiVersion}"`);
  }

  const base = `${parsed.major}.${parsed.minor}.${parsed.patch}`;
  return {
    prerelease: parsed.prerelease.length > 0,
    nextMinor: semver.parse(base).inc('minor').version,
  };
}

/**
 * Align a single `@opentelemetry/api` dependency range with the local API version.
 *
 * - exact pins take the API version verbatim, pre-release tag included
 * - a `>=A.B.C <X.Y.Z` range has its upper bound moved to the API's next minor
 * - a caret range is left alone
 * - while the API is a pre-release, ranges additionally carry `|| <apiVersion>`
 *
 * The function is idempotent, and inverse to itself across a pre-release cycle: running it
 * with a final version removes a clause left by a previous pre-release run.
 *
 * @param {string} value Current range, e.g. `^1.3.0` or `>=1.0.0 <1.10.0 || 1.10.0-rc.0`.
 * @param {string} apiVersion Version from `api/package.json`.
 * @returns {string} The aligned range.
 */
export function alignApiRange(value, apiVersion) {
  const api = describeApiVersion(apiVersion);

  // Drop any clause a previous pre-release run appended, so the rest of the pipeline only
  // ever sees the "normal" range. Dropping it unconditionally is what makes finalizing a
  // cycle restore the plain range.
  const sets = splitSets(value).filter(set => !EXACT_PRERELEASE_RE.test(set));
  let aligned = sets.join(' || ');

  if (EXACT_RE.test(aligned)) {
    // An exact pin has nothing to widen - the API version itself is the whole range.
    return apiVersion;
  }

  if (aligned === '') {
    // The value was nothing but a pre-release clause. Should not happen, but returning the
    // API version keeps the result a valid range rather than an empty string.
    return apiVersion;
  }

  if (BOUNDED_RANGE_RE.test(aligned)) {
    aligned = aligned.replace(/<\d+\.\d+\.\d+$/, `<${api.nextMinor}`);
  }

  return api.prerelease ? `${aligned} || ${apiVersion}` : aligned;
}

/**
 * Validate the shape of an `@opentelemetry/api` dependency range.
 *
 * Anchored to the shapes `alignApiRange()` produces, so that a hand-written range which the
 * alignment would not maintain (`~1.3.0`, `>=1.3.0`, `|| ^2.0.0`) is rejected rather than
 * silently drifting out of step on the next API release.
 *
 * @param {string} range
 * @param {{ allowExact: boolean }} options `allowExact` for devDependencies, which are
 *   pinned in most experimental packages; a peerDependency must stay a range.
 * @returns {boolean}
 */
export function isValidApiRange(range, { allowExact }) {
  const sets = splitSets(range);
  if (sets.length > 2) return false;

  const [head, clause] = sets;

  // A second set is only ever the pre-release clause appended by the alignment.
  if (clause !== undefined && !EXACT_PRERELEASE_RE.test(clause)) return false;

  if (BOUNDED_RANGE_RE.test(head) || CARET_RANGE_RE.test(head)) return true;

  // The alignment only appends a clause to a range, never to an exact pin - a pin already
  // carries the pre-release version itself.
  return allowExact && clause === undefined && EXACT_RE.test(head);
}

/**
 * The exact pre-release version a range carries, if any.
 *
 * That is either the whole range (an exact devDependency pin during a cycle) or the clause
 * `alignApiRange()` appended to it. Returns null for an ordinary range.
 *
 * @param {string} range
 * @returns {string|null}
 */
export function prereleaseClauseOf(range) {
  return splitSets(range).find(set => EXACT_PRERELEASE_RE.test(set)) ?? null;
}

/**
 * Human-readable description of the accepted shapes, for error messages.
 *
 * @param {{ allowExact: boolean }} options
 * @returns {string}
 */
export function describeApiRangeShapes({ allowExact }) {
  const shapes = ["'>=A.B.C <X.Y.Z'", "'^A.B.C'"];
  if (allowExact) shapes.push("'A.B.C'");
  return `${shapes.join(', ')}, each optionally followed by '|| A.B.C-<prerelease>'`;
}
