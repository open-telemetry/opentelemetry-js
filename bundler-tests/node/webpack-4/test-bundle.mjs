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
