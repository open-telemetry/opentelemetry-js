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

import * as assert from 'assert';
import {
  randomSpanId,
  randomTraceId,
  idToHex,
  hexToId,
  idsEquals,
} from '../../src/platform';

describe('randomTraceId', () => {
  it('returns different 16 bytes Uint8Array', () => {
    const traceId = randomTraceId();
    assert.ok(traceId instanceof Uint8Array);
    assert.strictEqual(traceId.byteLength, 16);
  });
});

describe('randomSpanId', () => {
  it('returns different 8 bytes Uint8Array', () => {
    const spanId = randomSpanId();
    assert.ok(spanId instanceof Uint8Array);
    assert.strictEqual(spanId.byteLength, 8);
  });
});

describe('idToHex', () => {
  it('converts it to hex string', () => {
    assert.strictEqual(
      idToHex(new Uint8Array([0x01, 0xf8, 0xab, 0x56])),
      '01f8ab56'
    );
  });
});

describe('hexToId', () => {
  it('coverts hex encoded string to id', () => {
    assert.deepStrictEqual(
      hexToId('01f8ab56'),
      new Uint8Array([0x01, 0xf8, 0xab, 0x56])
    );
  });
});

describe('idsEquals', () => {
  it('returns if ids match', () => {
    assert.ok(
      idsEquals(
        new Uint8Array([0x11, 0x12, 0x13]),
        new Uint8Array([0x11, 0x12, 0x13])
      )
    );
    assert.ok(
      !idsEquals(
        new Uint8Array([0x11, 0x12, 0x13]),
        new Uint8Array([0x11, 0x12, 0x13, 0x14])
      )
    );
    assert.ok(
      !idsEquals(
        new Uint8Array([0x11, 0x12, 0x13, 0x14]),
        new Uint8Array([0x11, 0x12, 0x13])
      )
    );
    assert.ok(
      !idsEquals(
        new Uint8Array([0x11, 0x12, 0x13]),
        new Uint8Array([0x11, 0x12, 0x14])
      )
    );
  });
});
