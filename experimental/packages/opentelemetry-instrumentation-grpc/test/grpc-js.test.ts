/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { runTests } from './helper';
import { GrpcInstrumentation } from '../src';

const instrumentation = new GrpcInstrumentation();
instrumentation.enable();
instrumentation.disable();

import '@grpc/grpc-js';

describe('#grpc-js', () => {
  runTests(instrumentation, 'grpc', 12346);
});
