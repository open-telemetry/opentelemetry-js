/*!
 * Copyright 2019, OpenTelemetry Authors
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

import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import { NoopLogger } from '@opentelemetry/core';
import { NodeTracerRegistry } from '@opentelemetry/node';
import { plugin, DnsPlugin } from '../../src/dns';
import * as dns from 'dns';

const memoryExporter = new InMemorySpanExporter();
const logger = new NoopLogger();
const registry = new NodeTracerRegistry({ logger });
registry.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

describe('DnsPlugin', () => {
  before(() => {
    plugin.enable(dns, registry, registry.logger);
  });

  after(() => {
    plugin.disable();
  });

  it('should return a plugin', () => {
    assert.ok(plugin instanceof DnsPlugin);
  });
});
