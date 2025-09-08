#!/usr/bin/env node
/**
 * A script to generate a meaningful changelog entry for an update in
 * semantic conventions version.
 *
 * Usage:
 *    vi scripts/semconv/generate.sh  # Typically update SPEC_VERSION to latest.
 *    ./scripts/semconv/generate.sh   # Re-generate the semconv package exports.
 *    ./scripts/semconv/changelog-gen.js [aVer [bVer]]
 *
 * Include the text from this script in "semantic-conventions/CHANGELOG.md",
 * and perhaps also in the PR description.
 *
 * Arguments to the script:
 * - `aVer` is the base version of `@opentelemetry/semantic-conventions`
 *   published to npm to which to compare, e.g. "1.27.0". This defaults to the
 *   latest version published to npm.
 * - `bVer` is the version being compared against `aVer`. This defaults to
 *   "local", which uses the local build in "../../semantic-conventions" in this
 *   repo.
 *
 * Examples:
 *    ./scripts/semconv/changelog-gen.js  # compare the local build to the latest in npm
 *    ./scripts/semconv/changelog-gen.js 1.27.0 1.28.0  # compare two versions in npm
 */

const fs = require('fs');
const path = require('path');
const globSync = require('glob').sync;
const {execSync} = require('child_process');
const rimraf = require('rimraf');

const TOP = path.resolve(__dirname, '..', '..');
const TMP_DIR = path.join(__dirname, 'tmp-changelog-gen');

/**
 * Convert a string to an HTML anchor string, as Markdown does for headers.
 */
function slugify(s) {
  const slug = s.trim().replace(/ /g, '-').replace(/[^\w-]/g, '')
  return slug;
}

/**
 * Given some JS `src` (typically from OTel build/esnext/... output), return
 * whether the given export name `k` is marked `@deprecated`.
 *
 * Some of this parsing is shared with "contrib/scripts/gen-semconv-ts.js".
 *
 * @returns {boolean|string} `false` if not deprecated, a string deprecated
 *    message if deprecated and the message could be determined, otherwise
 *    `true` if marked deprecated.
 */
function isDeprecated(src, k) {
  const re = new RegExp(`^export const ${k} = .*;$`, 'm')
  const match = re.exec(src);
  if (!match) {
    throw new Error(`could not find the "${k}" export in semconv build/esnext/ source files`);
  }

  // Find a preceding block comment, if any.
  const WHITESPACE_CHARS = [' ', '\t', '\n', '\r'];
  let idx = match.index - 1;
  while (idx >=1 && WHITESPACE_CHARS.includes(src[idx])) {
    idx--;
  }
  if (src.slice(idx-1, idx+1) !== '*/') {
    // There is not a block comment preceding the export.
    return false;
  }
  idx -= 2;
  while (idx >= 0) {
    if (src[idx] === '/' && src[idx+1] === '*') {
      // Found the start of the block comment.
      const blockComment = src.slice(idx, match.index);
      if (!blockComment.includes('@deprecated')) {
        return false;
      }
      const deprecatedMsgMatch = /^\s*\*\s*@deprecated\s+(.*)$/m.exec(blockComment);
      if (deprecatedMsgMatch) {
        return deprecatedMsgMatch[1];
      } else {
        return true;
      }
    }
    idx--;
  }
  return false;
}

function summarizeChanges({prev, curr, prevSrc, currSrc}) {
  const prevNames = new Set(Object.keys(prev));
  const currNames = new Set(Object.keys(curr));
  const valChanged = (a, b) => {
    if (typeof a !== typeof b) {
      return true;
    } else if (typeof a === 'function') {
      return a.toString() !== b.toString();
    } else {
      return a !== b;
    }
  };

  // Determine changes.
  const changes = [];
  for (let k of Object.keys(curr)) {
    if (!prevNames.has(k)) {
      // 'ns' is the "namespace". The value here is wrong for "FEATURE_FLAG",
      // "GEN_AI", etc. But good enough for the usage below.
      const ns = /^(ATTR_|METRIC_|)?([^_]+)_/.exec(k)[2];
      changes.push({type: 'added', k, v: curr[k], ns});
    } else if (valChanged(curr[k], prev[k])) {
      changes.push({type: 'changed', k, v: curr[k], prevV: prev[k]});
    } else {
      const isPrevDeprecated = prevNames.has(k) && isDeprecated(prevSrc, k);
      const isCurrDeprecated = currNames.has(k) && isDeprecated(currSrc, k);
      if (!isPrevDeprecated && isCurrDeprecated) {
        changes.push({type: 'deprecated', k, v: curr[k], deprecatedResult: isCurrDeprecated});
      } else if (isPrevDeprecated && !isCurrDeprecated) {
        changes.push({type: 'undeprecated', k, v: curr[k]});
      }
    }
  }
  for (let k of Object.keys(prev)) {
    if (!currNames.has(k)) {
      changes.push({change: 'removed', k, prevV: prev[k]});
    }
  }

  // Create a set of summaries, one for each change type.
  let haveChanges = changes.length > 0;
  const summaryFromChangeType = {
    removed: [],
    changed: [],
    deprecated: [],
    undeprecated: [],
    added: [],
  }
  const execSummaryFromChangeType = {
    removed: null,
    changed: null,
    deprecated: null,
    undeprecated: null,
    added: null,
  };

  const removed = changes.filter(ch => ch.type === 'removed');
  let summary = summaryFromChangeType.removed;
  if (removed.length) {
    execSummaryFromChangeType.removed = `${removed.length} removed export${removed.length === 1 ? '' : 's'}`;
    if (summary.length) { summary.push(''); }
    let last;
    const longest = removed.reduce((acc, ch) => Math.max(acc, ch.k.length), 0);
    removed.forEach(ch => {
      if (last && ch.ns !== last.ns) { summary.push(''); }
      const cindent = ' '.repeat(longest - ch.k.length + 1);

      const prevVRepr = ch.prevV.includes('_VALUE_') ? JSON.stringify(ch.prevV) : ch.prevV;
      summary.push(`${ch.k}${cindent}// ${prevVRepr}`);

      last = ch;
    });
  }

  const changed = changes.filter(ch => ch.type === 'changed');
  summary = summaryFromChangeType.changed;
  if (changed.length) {
    execSummaryFromChangeType.changed = `${changed.length} exported value${changed.length === 1 ? '' : 's'} changed`;
    if (summary.length) { summary.push(''); }
    let last;
    const longest = changed.reduce((acc, ch) => Math.max(acc, ch.k.length), 0);
    changed.forEach(ch => {
      if (last && ch.ns !== last.ns) { summary.push(''); }
      const cindent = ' '.repeat(longest - ch.k.length + 1);

      const prevVRepr = ch.k.includes('_VALUE_') ? JSON.stringify(ch.prevV) : ch.prevV;
      const vRepr = ch.k.includes('_VALUE_') ? JSON.stringify(ch.v) : ch.v;
      summary.push(`${ch.k}${cindent}// ${prevVRepr} -> ${vRepr}`);

      last = ch;
    });
  }

  const deprecated = changes.filter(ch => ch.type === 'deprecated');
  summary = summaryFromChangeType.deprecated;
  if (deprecated.length) {
    execSummaryFromChangeType.deprecated = `${deprecated.length} newly deprecated export${deprecated.length === 1 ? '': 's'}`;
    if (summary.length) { summary.push(''); }
    let last;
    const longest = deprecated.reduce((acc, ch) => Math.max(acc, ch.k.length), 0);
    deprecated.forEach(ch => {
      if (last && ch.ns !== last.ns) { summary.push(''); }
      const cindent = ' '.repeat(longest - ch.k.length + 1);

      if (typeof ch.deprecatedResult === 'string') {
        summary.push(`${ch.k}${cindent}// ${ch.v}: ${ch.deprecatedResult}`);
      } else {
        summary.push(ch.k)
      }

      last = ch;
    });
  }

  const undeprecated = changes.filter(ch => ch.type === 'undeprecated');
  summary = summaryFromChangeType.undeprecated;
  if (undeprecated.length) {
    execSummaryFromChangeType.undeprecated = `${undeprecated.length} newly undeprecated export${undeprecated.length === 1 ? '': 's'}`;
    if (summary.length) { summary.push(''); }
    let last;
    const longest = undeprecated.reduce((acc, ch) => Math.max(acc, ch.k.length), 0);
    undeprecated.forEach(ch => {
      if (last && ch.ns !== last.ns) { summary.push(''); }
      const cindent = ' '.repeat(longest - ch.k.length + 1);

      summary.push(`${ch.k}${cindent}// ${ch.v}`);

      last = ch;
    });
  }

  const added = changes.filter(ch => ch.type === 'added');
  summary = summaryFromChangeType.added;
  if (added.length) {
    execSummaryFromChangeType.added = `${added.length} added export${added.length === 1 ? '': 's'}`;
    let last, lastAttr;
    const longest = added.reduce((acc, ch) => Math.max(acc, ch.k.length), 0);
    added.forEach(ch => {
      if (last && ch.ns !== last.ns) { summary.push(''); }
      let indent = '';
      if (lastAttr && ch.k.startsWith(lastAttr.k.slice('ATTR_'.length))) {
        indent = '  ';
      }
      const cindent = ' '.repeat(longest - ch.k.length + 1);

      const vRepr = ch.k.includes('_VALUE_') ? JSON.stringify(ch.v) : ch.v
      summary.push(`${indent}${ch.k}${cindent}// ${vRepr}`);

      last = ch;
      if (ch.k.startsWith('ATTR_')) {
        lastAttr = ch;
      }
    });
  }

  return {
    haveChanges,
    execSummaryFromChangeType,
    summaryFromChangeType
  };
}


function semconvChangelogGen(aVer=undefined, bVer=undefined) {

  console.log(`Creating tmp working dir "${TMP_DIR}"`);
  rimraf.sync(TMP_DIR);
  fs.mkdirSync(TMP_DIR);

  const localDir = path.join(TOP, 'semantic-conventions');
  const pj = JSON.parse(fs.readFileSync(path.join(localDir, 'package.json')));
  const pkgInfo = JSON.parse(execSync(`npm info -j ${pj.name}`))

  let aDir;
  if (!aVer) {
    aVer = pkgInfo.version; // By default compare to latest published version.
  }
  aDir = path.join(TMP_DIR, aVer, 'package');
  if (!fs.existsSync(aDir)) {
    console.log(`Downloading and extracting @opentelemetry/semantic-conventions@${aVer}`)
    const tarballUrl = `https://registry.npmjs.org/@opentelemetry/semantic-conventions/-/semantic-conventions-${aVer}.tgz`;
    fs.mkdirSync(path.dirname(aDir));
    const cwd = path.dirname(aDir);
    execSync(`curl -sf -o package.tgz ${tarballUrl}`, { cwd });
    execSync(`tar xzf package.tgz`, { cwd });
  }

  let bDir, bSemconvVer;
  if (!bVer) {
    bVer = 'local' // By default comparison target is the local build.
    bDir = localDir;

    // Determine target spec ver.
    const generateShPath = path.join(__dirname, 'generate.sh');
    const specVerRe = /^SPEC_VERSION=(.*)$/m;
    const specVerMatch = specVerRe.exec(fs.readFileSync(generateShPath));
    if (!specVerMatch) {
      throw new Error(`could not determine current semconv SPEC_VERSION: ${specVerRe} did not match in ${generateShPath}`);
    }
    bSemconvVer = specVerMatch[1].trim();
    console.log('Target Semantic Conventions ver is:', bSemconvVer);
  } else {
    bSemconvVer = 'v' + bVer;
    bDir = path.join(TMP_DIR, bVer, 'package');
    console.log(`Downloading and extracting @opentelemetry/semantic-conventions@${bVer}`)
    const tarballUrl = `https://registry.npmjs.org/@opentelemetry/semantic-conventions/-/semantic-conventions-${bVer}.tgz`;
    fs.mkdirSync(path.dirname(bDir));
    const cwd = path.dirname(bDir);
    execSync(`curl -sf -o package.tgz ${tarballUrl}`, { cwd });
    execSync(`tar xzf package.tgz`, { cwd });
  }

  console.log(`Comparing exports between versions ${aVer} and ${bVer}`)
  const stableChInfo = summarizeChanges({
    // require('.../build/src/stable_*.js') from previous and current.
    prev: Object.assign(...globSync(path.join(aDir, 'build/src/stable_*.js')).map(require)),
    curr: Object.assign(...globSync(path.join(bDir, 'build/src/stable_*.js')).map(require)),
    // Load '.../build/esnext/stable_*.js' sources to use for parsing jsdoc comments.
    prevSrc: globSync(path.join(aDir, 'build/esnext/stable_*.js'))
      .map(f => fs.readFileSync(f, 'utf8'))
      .join('\n\n'),
    currSrc: globSync(path.join(bDir, 'build/esnext/stable_*.js'))
      .map(f => fs.readFileSync(f, 'utf8'))
      .join('\n\n'),
  });
  const unstableChInfo = summarizeChanges({
    prev: Object.assign(...globSync(path.join(aDir, 'build/src/experimental_*.js')).map(require)),
    curr: Object.assign(...globSync(path.join(bDir, 'build/src/experimental_*.js')).map(require)),
    prevSrc: globSync(path.join(aDir, 'build/esnext/experimental_*.js'))
      .map(f => fs.readFileSync(f, 'utf8'))
      .join('\n\n'),
    currSrc: globSync(path.join(bDir, 'build/esnext/experimental_*.js'))
      .map(f => fs.readFileSync(f, 'utf8'))
      .join('\n\n'),
  });

  // Render the "change info" into a Markdown summary for the changelog.
  const changeTypes = ['removed', 'changed', 'deprecated', 'undeprecated', 'added'];
  let execSummaryFromChInfo = (chInfo) => {
    const parts = changeTypes
      .map(chType => chInfo.execSummaryFromChangeType[chType])
      .filter(s => typeof(s) === 'string');
    if (parts.length) {
      return parts.join(', ');
    } else {
      return 'none';
    }
  }
  const changelogEntry = [`
* feat: update semantic conventions to ${bSemconvVer} [#NNNN]
  * Semantic Conventions ${bSemconvVer}: [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#${slugify(bSemconvVer)}) | [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * \`@opentelemetry/semantic-conventions\` (stable) changes: *${execSummaryFromChInfo(stableChInfo)}*
  * \`@opentelemetry/semantic-conventions/incubating\` (unstable) changes: *${execSummaryFromChInfo(unstableChInfo)}*
`];

  if (stableChInfo.haveChanges) {
    changelogEntry.push(`#### Stable changes in ${bSemconvVer}\n`);
    for (let changeType of changeTypes) {
      const summary = stableChInfo.summaryFromChangeType[changeType];
      if (summary.length) {
        changelogEntry.push(`<details open>
<summary>${stableChInfo.execSummaryFromChangeType[changeType]}</summary>

\`\`\`js
${summary.join('\n')}
\`\`\`

</details>
`);
      }
    }
  }

  if (unstableChInfo.haveChanges) {
    changelogEntry.push(`#### Unstable changes in ${bSemconvVer}\n`);
    for (let changeType of changeTypes) {
      const summary = unstableChInfo.summaryFromChangeType[changeType];
      if (summary.length) {
        changelogEntry.push(`<details>
<summary>${unstableChInfo.execSummaryFromChangeType[changeType]}</summary>

\`\`\`js
${summary.join('\n')}
\`\`\`

</details>
`);
      }
    }
  }

  return changelogEntry.join('\n');
}

function main() {
  const [aVer, bVer] = process.argv.slice(2);
  const s = semconvChangelogGen(aVer, bVer);
  console.log('The following could be added to the top "Enhancement" section of "semantic-conventions/CHANGELOG.md":');
  console.log('\n- - -');
  console.log(s)
  console.log('- - -');
}

main();
