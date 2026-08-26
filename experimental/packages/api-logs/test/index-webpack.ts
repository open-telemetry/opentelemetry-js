/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
// @types/node@8 (kept for Node.js 8 backcompat) is not augmented by
// @types/webpack-env, so type require.context explicitly here.
const webpackRequire = require as NodeRequire & {
  context(
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp
  ): __WebpackModuleApi.RequireContext;
};

const testsContext = webpackRequire.context('.', true, /test$/);
testsContext.keys().forEach(testsContext);

const srcContext = webpackRequire.context('.', true, /src$/);
srcContext.keys().forEach(srcContext);
