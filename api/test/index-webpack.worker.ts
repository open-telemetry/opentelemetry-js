/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
{
  // @types/node@8 (kept for Node.js 8 backcompat) is not augmented by
  // @types/webpack-env, so type require.context explicitly here.
  const testsContext = (
    require as NodeRequire & {
      context(
        directory: string,
        useSubdirectories?: boolean
      ): __WebpackModuleApi.RequireContext;
    }
  ).context('./common', true);
  testsContext.keys().forEach(testsContext);
}
