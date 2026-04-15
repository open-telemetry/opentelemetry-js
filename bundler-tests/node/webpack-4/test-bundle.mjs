/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import webpack from 'webpack';
import config from './webpack.config.mjs';

const compiler = webpack(config);

compiler.run((err, stats) => {
  if (compiler.close) compiler.close(() => {});

  if (err) {
    console.error(err);
    process.exit(1);
  }

  // Assert the known protobuf dynamic-require warning. This exit(0) is intentional:
  // the test passes while the bug exists and will break when it is fixed, signalling
  // that this block should be removed and warnings should be treated as errors again.
  if (stats.hasWarnings() && !stats.hasErrors()) {
    const expectedMsg =
      'Critical dependency: require function is used in a way in which dependencies cannot be statically extracted';
    if (stats.compilation.warnings.every(w => w.message === expectedMsg))
      process.exit(0);
  }

  if (stats.hasErrors()) {
    console.error(stats.compilation.errors.map(e => e.message).join('\n'));
    process.exit(1);
  }

  if (stats.hasWarnings()) {
    console.error(stats.compilation.warnings.map(w => w.message).join('\n'));
    process.exit(1);
  }

  console.log('webpack 4 build succeeded in Node');
});
