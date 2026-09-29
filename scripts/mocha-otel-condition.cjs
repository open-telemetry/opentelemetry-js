/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Adds the otel condition to imports from the tested package's src, as karma.webpack.js
// does. A global --conditions=otel would also resolve dependencies to their src.
const { registerHooks } = require('module');
const path = require('path');
const { pathToFileURL } = require('url');

const srcURL = pathToFileURL(path.join(process.cwd(), 'src') + path.sep).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.startsWith(srcURL)) {
      const conditions = ['otel', ...context.conditions];
      return nextResolve(specifier, {
        ...context,
        // Node 22.15 passes require() conditions as an internal SafeSet (not instanceof
        // Set) and calls .has() on them.
        conditions:
          typeof context.conditions.has === 'function'
            ? new Set(conditions)
            : conditions,
      });
    }
    return nextResolve(specifier, context);
  },
});
