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
import { CompressionAlgorithm} from '../../src/platform/node/types';
import { configureCompression} from '../../src/platform/node/util';

describe('configureCompression', () => {
  const envSource = process.env;
  it('should return none for compression', () => {
    const compression = CompressionAlgorithm.NONE;
    assert.strictEqual(configureCompression(compression), CompressionAlgorithm.NONE);
  });
  it('should return gzip compression defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'gzip';
    assert.strictEqual(configureCompression(undefined),CompressionAlgorithm.GZIP);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION;
  });
  it('should return none for compression defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'none';
    assert.strictEqual(configureCompression(undefined),CompressionAlgorithm.NONE);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION;
  });
  it('should return none for compression when no compression is set', () => {
    assert.strictEqual(configureCompression(undefined),CompressionAlgorithm.NONE);
  });
});
