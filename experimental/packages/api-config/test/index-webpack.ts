/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
type ContextRequire = NodeRequire & {
  context(
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp
  ): __WebpackModuleApi.RequireContext;
};

// @types/node@8 is not augmented by @types/webpack-env, so type require.context explicitly.
const testsContext = (require as ContextRequire).context('.', true, /test$/);
testsContext.keys().forEach(testsContext);

const srcContext = (require as ContextRequire).context('.', true, /src$/);
srcContext.keys().forEach(srcContext);
