/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
const testsContext = require.context('../browser', true, /test$/);
testsContext.keys().forEach(testsContext);

const srcContext = require.context('.', true, /src$/);
srcContext.keys().forEach(srcContext);
