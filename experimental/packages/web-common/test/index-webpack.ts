/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

{
  const testsContext = require.context('./', true, /test$/);
  testsContext.keys().forEach(testsContext);
}
