/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { LocalStorageSessionStore } from '../src/LocalStorageSessionStore';
import { Session } from '../src/types/Session';

describe('LocalStorageSessionStore', () => {
  let store: LocalStorageSessionStore;
  let getItemStub: sinon.SinonStub;
  let setItemStub: sinon.SinonStub;

  beforeEach(() => {
    store = new LocalStorageSessionStore();
    getItemStub = sinon.stub(localStorage, 'getItem');
    setItemStub = sinon.stub(localStorage, 'setItem');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('calls localStorage.setItem on save', async () => {
    const session: Session = { id: 'id', startTimestamp: Date.now() };
    await store.save(session);
    assert.strictEqual(setItemStub.calledOnce, true);
  });

  it('calls localStorage.getItem on get', async () => {
    await store.get();
    assert.strictEqual(getItemStub.calledOnce, true);
  });

  it('saves and retrieves the same session', async () => {
    const session: Session = {
      id: 'integration-id',
      startTimestamp: 1234567890,
    };
    const storage: { [key: string]: string } = {};

    setItemStub.callsFake((key: string, value: string) => {
      storage[key] = value;
    });
    getItemStub.callsFake((key: string) => storage[key] ?? null);

    await store.save(session);
    const retrieved = await store.get();

    assert.deepStrictEqual(retrieved, session);
  });
});
