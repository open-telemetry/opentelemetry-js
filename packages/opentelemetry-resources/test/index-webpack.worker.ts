/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

{
  const testsContext = require.context('./', false, /test$/);
  testsContext.keys().forEach(testsContext);
}

{
  const testsContext = require.context('./detectors/browser', false, /test$/);
  testsContext.keys().forEach(testsContext);
}
