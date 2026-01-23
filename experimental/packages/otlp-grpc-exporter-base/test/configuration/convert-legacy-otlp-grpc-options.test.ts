/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
