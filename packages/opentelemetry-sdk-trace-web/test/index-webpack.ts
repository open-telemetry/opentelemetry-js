/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

{
  const testsContext = require.context('./', false, /test$/);
  testsContext.keys().forEach(testsContext);
}

{
  const testsContext = require.context('./window', false, /test$/);
  testsContext.keys().forEach(testsContext);
}
