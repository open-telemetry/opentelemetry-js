/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const testsContext = require.context('./', false, /test$/);
testsContext.keys().forEach(testsContext);
