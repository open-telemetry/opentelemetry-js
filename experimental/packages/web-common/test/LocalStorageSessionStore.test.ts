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
