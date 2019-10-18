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
import { NodeTracer } from '@opentelemetry/node';
import { plugin } from '../../src/dns';
import * as dns from 'dns';
import * as utils from '../utils/utils';
import { assertSpan } from '../utils/assertSpan';
import { CanonicalCode } from '@opentelemetry/types';

const memoryExporter = new InMemorySpanExporter();
const logger = new NoopLogger();
const tracer = new NodeTracer({ logger });
tracer.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

describe('dns.lookup()', () => {
  before(function(done) {
    // mandatory
    if (process.env.CI) {
      plugin.enable(dns, tracer, tracer.logger);
      done();
      return;
    }

    utils.checkInternet(isConnected => {
      if (!isConnected) {
        this.skip();
        // don't disturbe people
      }
      done();
    });
    plugin.enable(dns, tracer, tracer.logger);
  });

  afterEach(() => {
    memoryExporter.reset();
  });

  after(() => {
    plugin.disable();
  });

  describe('with family param', () => {
    [4, 6].forEach(ipversion => {
      it(`should export a valid span with "family" arg to ${ipversion}`, done => {
        const hostname = 'google.com';
        dns.lookup(hostname, ipversion, (err, address, family) => {
          assert.strictEqual(err, null);
          assert.ok(address);
          assert.ok(family);

          const spans = memoryExporter.getFinishedSpans();
          const [span] = spans;
          assert.strictEqual(spans.length, 1);
          assertSpan(span, { addresses: [{ address, family }], hostname });
          done();
        });
      });
    });
  });

  describe('with no options param', () => {
    it('should export a valid span', done => {
      const hostname = 'google.com';
      dns.lookup(hostname, (err, address, family) => {
        assert.strictEqual(err, null);
        assert.ok(address);
        assert.ok(family);

        const spans = memoryExporter.getFinishedSpans();
        const [span] = spans;
        assert.strictEqual(spans.length, 1);
        assertSpan(span, { addresses: [{ address, family }], hostname });
        done();
      });
    });

    it('should export a valid span with error NOT_FOUND', done => {
      const hostname = 'ᚕ';
      dns.lookup(hostname, (err, address, family) => {
        assert.ok(err);

        const spans = memoryExporter.getFinishedSpans();
        const [span] = spans;

        assert.strictEqual(spans.length, 1);
        assertSpan(span, {
          addresses: [{ address, family }],
          hostname,
          forceStatus: {
            code: CanonicalCode.NOT_FOUND,
            message: err!.message,
          },
        });
        done();
      });
    });

    it('should export a valid span with error INVALID_ARGUMENT when "family" param is equal to -1', () => {
      const hostname = 'google.com';
      try {
        dns.lookup(hostname, -1, () => {});
        assert.fail();
      } catch (error) {
        const spans = memoryExporter.getFinishedSpans();
        const [span] = spans;
        assert.strictEqual(spans.length, 1);
        assertSpan(span, {
          addresses: [],
          hostname,
          forceStatus: {
            code: process.versions.node.startsWith('8')
              ? CanonicalCode.UNKNOWN
              : CanonicalCode.INVALID_ARGUMENT,
            message: error!.message,
          },
        });
      }
    });

    it('should export a valid span with error INVALID_ARGUMENT when "hostname" param is a number', () => {
      const hostname = 1234;
      try {
        // tslint:disable-next-line:no-any
        dns.lookup(hostname as any, 4, () => {});
        assert.fail();
      } catch (error) {
        const spans = memoryExporter.getFinishedSpans();
        const [span] = spans;
        assert.strictEqual(spans.length, 1);
        assertSpan(span, {
          addresses: [],
          // tslint:disable-next-line:no-any
          hostname: hostname as any,
          forceStatus: {
            code: process.versions.node.startsWith('8')
              ? CanonicalCode.UNKNOWN
              : CanonicalCode.INVALID_ARGUMENT,
            message: error!.message,
          },
        });
      }
    });
  });
  describe('with options param', () => {
    [4, 6].forEach(family => {
      it(`should export a valid span with "family" to ${family}`, done => {
        const hostname = 'google.com';
        dns.lookup(hostname, { family }, (err, address, family) => {
          assert.strictEqual(err, null);
          assert.ok(address);
          assert.ok(family);

          const spans = memoryExporter.getFinishedSpans();
          const [span] = spans;
          assert.strictEqual(spans.length, 1);

          assertSpan(span, { addresses: [{ address, family }], hostname });
          done();
        });
      });

      it(`should export a valid span when setting "verbatim" property to true and "family" to ${family}`, done => {
        const hostname = 'google.com';
        dns.lookup(
          hostname,
          { family, verbatim: true },
          (err, address, family) => {
            assert.strictEqual(err, null);
            assert.ok(address);
            assert.ok(family);

            const spans = memoryExporter.getFinishedSpans();
            const [span] = spans;
            assert.strictEqual(spans.length, 1);

            assertSpan(span, { addresses: [{ address, family }], hostname });
            done();
          }
        );
      });
    });

    it('should export a valid span when setting "all" property to true', done => {
      const hostname = 'montreal.ca';
      dns.lookup(
        hostname,
        { all: true },
        (err: NodeJS.ErrnoException | null, addresses: dns.LookupAddress[]) => {
          assert.strictEqual(err, null);
          assert.ok(addresses instanceof Array);

          const spans = memoryExporter.getFinishedSpans();
          const [span] = spans;
          assert.strictEqual(spans.length, 1);
          assertSpan(span, { addresses, hostname });
          done();
        }
      );
    });
  });
});
