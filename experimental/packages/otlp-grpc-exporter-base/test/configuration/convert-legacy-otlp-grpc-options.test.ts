/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { convertLegacyOtlpGrpcOptions } from '../../src/configuration/convert-legacy-otlp-grpc-options';

describe('convertLegacyOtlpGrpcOptions', function () {
  describe('channelOptions', function () {
    it('passes channelOptions through to merged config', function () {
      const channelOptions = {
        'grpc.keepalive_time_ms': 10000,
        'grpc.max_reconnect_backoff_ms': 30000,
      };

      const result = convertLegacyOtlpGrpcOptions({ channelOptions }, 'TRACES');

      assert.deepStrictEqual(result.channelOptions, channelOptions);
    });

    it('channelOptions is undefined if not provided', function () {
      const result = convertLegacyOtlpGrpcOptions({}, 'TRACES');

      assert.strictEqual(result.channelOptions, undefined);
    });
  });
});
