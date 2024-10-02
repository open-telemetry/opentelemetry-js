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

import { OTLPExporterNodeBase } from '../../src/platform/node/OTLPExporterNodeBase';
import { ISerializer } from '@opentelemetry/otlp-transformer';

class Exporter extends OTLPExporterNodeBase<object, object> {}

const noopSerializer: ISerializer<object, object> = {
  serializeRequest(request: object): Uint8Array | undefined {
    return new Uint8Array();
  },
  deserializeResponse(data: Uint8Array): object {
    return {};
  },
};

describe('force flush', () => {
  it('forceFlush should flush spans and return', async () => {
    const exporter = new Exporter({}, noopSerializer, {}, 'TEST', 'v1/test');
    await exporter.forceFlush();
  });
});
