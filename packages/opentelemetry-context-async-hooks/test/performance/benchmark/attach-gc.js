/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

/*
 * GC-focused benchmark comparing two `attach`/`detach` token strategies for the
 * AsyncLocalStorage context manager on a hot path:
 *
 *   - `zero-alloc`       : attach() returns the previous Context cast as a Token
 *                          (no allocation); detach() calls enterWith(previous).
 *                          (feat/context-attach-detach-asl)
 *   - `native-withscope` : attach() delegates to AsyncLocalStorage.withScope(),
 *                          which allocates a native RunScope per call; the caller
 *                          restores via token.dispose().
 *                          (feat/context-attach-detach-asl-disposable, Node >= 25.9)
 *
 * The two strategies are replicated verbatim here over a shared AsyncLocalStorage
 * rather than imported from either branch, so the whole comparison lives in one
 * file.
 *
 * GC is measured via V8's `--trace-gc` output rather than perf_hooks: the measured
 * loop is fully synchronous and CPU-bound, and a PerformanceObserver 'gc' callback
 * never gets a chance to run (nor reliably retains buffered entries) across a
 * blocked event loop. Instead, each (variant, scenario) runs in its own freshly
 * started `node --expose-gc --trace-gc` child process; the worker brackets the
 * measured loop with MEASURE_START / MEASURE_END markers on stderr, and the driver
 * counts the GC trace lines that fall between those markers.
 *
 * Usage: `node attach-gc.js` (driver; self-spawns instrumented children).
 */

const fs = require('fs');
const { spawnSync } = require('child_process');
const { AsyncLocalStorage } = require('async_hooks');
const { performance } = require('perf_hooks');
const { createContextKey, ROOT_CONTEXT } = require('@opentelemetry/api');

// Fixed iteration counts (per scenario) so GC counts are comparable across variants.
const ITERATIONS = {
  single: 20_000_000,
  nested: 7_000_000,
};
const N_WARMUP = 200_000;

const VARIANTS = ['zero-alloc', 'native-withscope'];
const SCENARIOS = ['single', 'nested'];

const MEASURE_START = 'MEASURE_START';
const MEASURE_END = 'MEASURE_END';

// --- variant token strategies ------------------------------------------------

function makeVariant(name, als) {
  if (name === 'zero-alloc') {
    return {
      attach(context) {
        const previousContext = als.getStore() ?? ROOT_CONTEXT;
        als.enterWith(context);
        return previousContext;
      },
      detach(token) {
        als.enterWith(token);
      },
    };
  }
  if (name === 'native-withscope') {
    if (typeof als.withScope !== 'function') {
      throw new Error(
        'AsyncLocalStorage.withScope() is not available on this Node.js version'
      );
    }
    return {
      attach(context) {
        return als.withScope(context);
      },
      detach(token) {
        token.dispose();
      },
    };
  }
  throw new Error(`unknown variant: ${name}`);
}

// --- worker: measure one (variant, scenario) in this process -----------------

function runWorker(variantName, scenario) {
  if (typeof global.gc !== 'function') {
    throw new Error('worker must be run with --expose-gc');
  }

  const als = new AsyncLocalStorage();
  const { attach, detach } = makeVariant(variantName, als);

  const key = createContextKey('benchmark-key');
  const context1 = ROOT_CONTEXT.setValue(key, 'value1');
  const context2 = ROOT_CONTEXT.setValue(key, 'value2');
  const context3 = ROOT_CONTEXT.setValue(key, 'value3');

  const single = () => {
    const token = attach(context1);
    detach(token);
  };
  const nested = () => {
    const token1 = attach(context1);
    const token2 = attach(context2);
    const token3 = attach(context3);
    detach(token3);
    detach(token2);
    detach(token1);
  };
  const op = scenario === 'single' ? single : nested;
  const iterations = ITERATIONS[scenario];

  // Warm up so V8 JIT stabilizes before measuring.
  for (let i = 0; i < N_WARMUP; i++) {
    op();
  }

  // Clean baseline: run GC twice so the measured window starts from a settled heap.
  global.gc();
  global.gc();

  // Markers bracket the window the driver attributes GC trace lines to. V8's
  // --trace-gc output goes to stdout (fd 1), so the markers must too, and they
  // MUST be written synchronously (fs.writeSync) so they interleave in the
  // correct order with the synchronous trace output; an async-buffered
  // process.stdout.write() would flush after the loop, placing both markers
  // past every GC line and yielding a false zero.
  fs.writeSync(1, `${MEASURE_START}\n`);
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    op();
  }
  const wallMs = performance.now() - start;
  fs.writeSync(1, `${MEASURE_END}\n`);

  process.stdout.write(
    `RESULT ${JSON.stringify({
      variant: variantName,
      scenario,
      iterations,
      wallMs,
      opsPerSec: (iterations / wallMs) * 1000,
      node: process.version,
    })}\n`
  );
}

// --- driver: spawn one instrumented child per (variant, scenario) ------------

function parseGcBetweenMarkers(stderr) {
  const gc = { minor: 0, major: 0, pauseMs: 0 };
  let measuring = false;
  for (const line of stderr.split('\n')) {
    if (line.includes(MEASURE_START)) {
      measuring = true;
      continue;
    }
    if (line.includes(MEASURE_END)) {
      measuring = false;
      continue;
    }
    if (!measuring) continue;

    const isMinor = /Scavenge|Minor Mark/.test(line);
    const isMajor = !isMinor && /Mark-Compact|Mark-sweep|Full/.test(line);
    if (!isMinor && !isMajor) continue;

    // "... MB, 0.24 / 0.00 ms (average mu = ...)" -> first number is the pause.
    const m = line.match(/([\d.]+)\s*\/\s*[\d.]+\s*ms/);
    if (m) gc.pauseMs += parseFloat(m[1]);
    if (isMinor) gc.minor++;
    else gc.major++;
  }
  return gc;
}

function runDriver() {
  const rows = [];
  for (const variant of VARIANTS) {
    for (const scenario of SCENARIOS) {
      process.stderr.write(`running ${variant} / ${scenario} ...\n`);
      const child = spawnSync(
        process.execPath,
        ['--expose-gc', '--trace-gc', __filename, variant, scenario],
        { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
      );
      if (child.status !== 0) {
        process.stderr.write(child.stderr || '');
        throw new Error(
          `${variant}/${scenario} exited with status ${child.status}`
        );
      }
      const resultLine = child.stdout
        .split('\n')
        .find(l => l.startsWith('RESULT '));
      if (!resultLine) {
        process.stderr.write(child.stdout || '');
        throw new Error(`${variant}/${scenario} produced no RESULT`);
      }
      const timing = JSON.parse(resultLine.slice('RESULT '.length));
      // --trace-gc and the markers are both on stdout; parse GC lines there.
      const gc = parseGcBetweenMarkers(child.stdout);
      const gcCount = gc.minor + gc.major;
      rows.push({
        ...timing,
        ...gc,
        gcPausePct: (gc.pauseMs / timing.wallMs) * 100,
        avgPauseMs: gcCount > 0 ? gc.pauseMs / gcCount : 0,
      });
    }
  }
  printComparison(rows);
}

function printComparison(rows) {
  const node = rows[0] && rows[0].node;
  console.log(`\nGC comparison for attach/detach (${node})`);
  console.log(
    `single: ${ITERATIONS.single.toLocaleString()} iters, ` +
      `nested: ${ITERATIONS.nested.toLocaleString()} iters\n`
  );

  const cols = [
    ['variant', r => r.variant, 18],
    ['ops/sec', r => Math.round(r.opsPerSec).toLocaleString(), 14],
    ['minor GC', r => String(r.minor), 10],
    ['major GC', r => String(r.major), 10],
    ['GC pause ms', r => r.pauseMs.toFixed(1), 13],
    ['GC pause %', r => r.gcPausePct.toFixed(2), 12],
    ['avg pause ms', r => r.avgPauseMs.toFixed(3), 13],
  ];

  for (const scenario of SCENARIOS) {
    console.log(`── ${scenario} ──`);
    console.log(cols.map(([h, , w]) => h.padEnd(w)).join(''));
    for (const row of rows.filter(r => r.scenario === scenario)) {
      console.log(cols.map(([, fn, w]) => fn(row).padEnd(w)).join(''));
    }
    console.log('');
  }
}

// --- entrypoint ---------------------------------------------------------------

const [variantArg, scenarioArg] = process.argv.slice(2);
if (variantArg) {
  runWorker(variantArg, scenarioArg || 'single');
} else {
  runDriver();
}
