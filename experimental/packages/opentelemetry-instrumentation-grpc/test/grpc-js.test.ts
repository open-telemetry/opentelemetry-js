/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { runTestsWithSemconvStabilityLevels } from './helper';
import { GrpcInstrumentation } from '../src';

const instrumentation = new GrpcInstrumentation();
instrumentation.enable();
instrumentation.disable();

import '@grpc/grpc-js';

describe('#grpc-js', () => {
  runTestsWithSemconvStabilityLevels(instrumentation, 'grpc', 12346);
});
