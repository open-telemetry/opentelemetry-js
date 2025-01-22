#!/usr/bin/env node
/**
 * A script to generate a meaningful changelog entry for an update in
 * semantic conventions version.
 *
 * Usage:
 *    vi scripts/semconv/generate.sh  # Typically update SPEC_VERSION to latest.
 *    ./scripts/semconv/generate.sh   # Re-generate the semconv package exports.
 *    ./scripts/semconv/changelog-gen.sh
 *
 * The last command (this script) will output a text block that can be used
 * in "semantic-conventions/CHANGELOG.md" (and also perhaps in the PR
 * desciption).
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
  const isNewlyDeprecated = (k) => {
    const isPrevDeprecated = prevNames.has(k) && isDeprecated(prevSrc, k);
    const isCurrDeprecated = currNames.has(k) && isDeprecated(currSrc, k);
    if (isPrevDeprecated && !isCurrDeprecated) {
      throw new Error(`semconv export '${k}' was *un*-deprecated in this release!? Wassup?`);
    }
    return (!isPrevDeprecated && isCurrDeprecated);
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
      const deprecatedResult = isNewlyDeprecated(k);
      if (deprecatedResult) {
        changes.push({type: 'deprecated', k, deprecatedResult});
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
    added: [],
  }
  const execSummaryFromChangeType = {
    removed: null,
    changed: null,
    deprecated: null,
    added: null,
  };

  const removed = changes.filter(ch => ch.type === 'removed');
  let summary = summaryFromChangeType.removed;
  if (removed.length) {
    execSummaryFromChangeType.removed = `${removed.length} removed exports`;
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
    execSummaryFromChangeType.changed = `${changed.length} exported values changed`;
    if (summary.length) { summary.push(''); }
    let last;
    const longest = changed.reduce((acc, ch) => Math.max(acc, ch.k.length), 0);
    changed.forEach(ch => {
      if (last && ch.ns !== last.ns) { summary.push(''); }
      const cindent = ' '.repeat(longest - ch.k.length + 1);

      const prevVRepr = ch.prevV.includes('_VALUE_') ? JSON.stringify(ch.prevV) : ch.prevV;
      const vRepr = ch.k.includes('_VALUE_') ? JSON.stringify(ch.v) : ch.v;
      summary.push(`${ch.k}${cindent}// ${prevVRepr} -> ${vRepr}`);

      last = ch;
    });
  }

  const deprecated = changes.filter(ch => ch.type === 'deprecated');
  summary = summaryFromChangeType.deprecated;
  if (deprecated.length) {
    execSummaryFromChangeType.deprecated = `${deprecated.length} newly deprecated exports`;
    if (summary.length) { summary.push(''); }
    let last;
    const longest = deprecated.reduce((acc, ch) => Math.max(acc, ch.k.length), 0);
    deprecated.forEach(ch => {
      if (last && ch.ns !== last.ns) { summary.push(''); }
      const cindent = ' '.repeat(longest - ch.k.length + 1);

      if (typeof ch.deprecatedResult === 'string') {
        summary.push(`${ch.k}${cindent}// ${ch.deprecatedResult}`);
      } else {
        summary.push(ch.k)
      }

      last = ch;
    });
  }

  const added = changes.filter(ch => ch.type === 'added');
  summary = summaryFromChangeType.added;
  if (added.length) {
    execSummaryFromChangeType.added = `${added.length} added exports`;
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


function semconvChangelogGen() {
  // Determine target spec ver.
  const generateShPath = path.join(__dirname, 'generate.sh');
  const specVerRe = /^SPEC_VERSION=(.*)$/m;
  const specVerMatch = specVerRe.exec(fs.readFileSync(generateShPath));
  if (!specVerMatch) {
    throw new Error(`could not determine current semconv SPEC_VERSION: ${specVerRe} did not match in ${generateShPath}`);
  }
  const specVer = specVerMatch[1].trim();
  console.log('Target Semantic Conventions ver is:', specVer);

  console.log(`Creating tmp working dir "${TMP_DIR}"`);
  rimraf.sync(TMP_DIR);
  fs.mkdirSync(TMP_DIR);

  const scDir = path.join(TOP, 'semantic-conventions');
  const pj = JSON.parse(fs.readFileSync(path.join(scDir, 'package.json')));
  const pkgInfo = JSON.parse(execSync(`npm info -j ${pj.name}`))
  console.log(`Previous published version for comparison is: ${pkgInfo.version}`);

  console.log(`Downloading and extracting @opentelemetry/semantic-conventions@${pkgInfo.version}`)
  execSync(`curl -sf -o - ${pkgInfo.dist.tarball} | tar xzf -`, { cwd: TMP_DIR });

  console.log(`Comparing exports to "${scDir}"`)
  const stableChInfo = summarizeChanges({
    // require('.../build/src/stable_*.js') from previous and current.
    prev: Object.assign(...globSync(path.join(TMP_DIR, 'package/build/src/stable_*.js')).map(require)),
    curr: Object.assign(...globSync(path.join(scDir, 'build/src/stable_*.js')).map(require)),
    // Load '.../build/esnext/stable_*.js' sources to use for parsing jsdoc comments.
    prevSrc: globSync(path.join(TMP_DIR, 'package/build/esnext/stable_*.js'))
      .map(f => fs.readFileSync(f, 'utf8'))
      .join('\n\n'),
    currSrc: globSync(path.join(scDir, 'build/esnext/stable_*.js'))
      .map(f => fs.readFileSync(f, 'utf8'))
      .join('\n\n'),
  });
  const unstableChInfo = summarizeChanges({
    prev: Object.assign(...globSync(path.join(TMP_DIR, 'package/build/src/experimental_*.js')).map(require)),
    curr: Object.assign(...globSync(path.join(scDir, 'build/src/experimental_*.js')).map(require)),
    prevSrc: globSync(path.join(TMP_DIR, 'package/build/esnext/experimental_*.js'))
      .map(f => fs.readFileSync(f, 'utf8'))
      .join('\n\n'),
    currSrc: globSync(path.join(scDir, 'build/esnext/experimental_*.js'))
      .map(f => fs.readFileSync(f, 'utf8'))
      .join('\n\n'),
  });

  // Render the "change info" into a Markdown summary for the changelog.
  const changeTypes = ['removed', 'changed', 'deprecated', 'added'];
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
* feat: update semantic conventions to ${specVer} [#NNNN]
  * Semantic Conventions ${specVer}:
    [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#${slugify(specVer)}) |
    [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * \`@opentelemetry/semantic-conventions\` (stable) changes: *${execSummaryFromChInfo(stableChInfo)}*
  * \`@opentelemetry/semantic-conventions/incubating\` (unstable) changes: *${execSummaryFromChInfo(unstableChInfo)}*
`];

  if (stableChInfo.haveChanges) {
    changelogEntry.push(`#### Stable changes in ${specVer}\n`);
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
    changelogEntry.push(`#### Unstable changes in ${specVer}\n`);
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
  const s = semconvChangelogGen();
  console.log('The following could be added to the top "Enhancement" section of "semantic-conventions/CHANGELOG.md":');
  console.log('\n- - -');
  console.log(s)
  console.log('- - -');
}

main();
