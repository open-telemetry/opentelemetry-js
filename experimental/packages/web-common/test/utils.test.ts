/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  createSessionLogRecordProcessor,
  createSessionSpanProcessor,
  createDefaultSessionIdGenerator,
  createLocalStorageSessionStore,
} from '../src/utils';
import { SessionSpanProcessor } from '../src/SessionSpanProcessor';
import { SessionLogRecordProcessor } from '../src/SessionLogRecordProcessor';
import { SessionIdGenerator } from '../src/types/SessionIdGenerator';
import { SessionStore } from '../src/types/SessionStore';

describe('createSessionSpanProcessor', function () {
  it('returns an instance of a SessionSpanProcessor', function () {
    const processor = createSessionSpanProcessor({
      getSessionId() {
        return '1234';
      },
    });
    assert.ok(processor as SessionSpanProcessor);
  });
});

describe('createSessionLogRecordProcessor', function () {
  it('returns an instance of a SessionLogRecordProcessor', function () {
    const processor = createSessionLogRecordProcessor({
      getSessionId() {
        return '1234';
      },
    });
    assert.ok(processor as SessionLogRecordProcessor);
  });
});

describe('createDefaultSessionIdGenerator', function () {
  it('returns an instance of a SessionIdGenerator', function () {
    const generator = createDefaultSessionIdGenerator();
    assert.ok(generator as SessionIdGenerator);

    const sessionId = generator.generateSessionId();
    assert.ok(sessionId);
    assert.ok(typeof sessionId === 'string');
    assert.ok(sessionId.length > 0);
  });
});

describe('createLocalStorageSessionStore', function () {
  it('returns an instance of a SessionStore', function () {
    const store = createLocalStorageSessionStore();
    assert.ok(store as SessionStore);

    assert.ok(typeof store.save === 'function');
    assert.ok(typeof store.get === 'function');
  });
});
