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
import { EventEmitter } from 'events';
import { bindEmitter } from '../../src/patch';
import {
  context,
  ContextManager,
  getSpanContext,
  ROOT_CONTEXT,
  setSpan,
} from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { NodeTracerProvider } from '@opentelemetry/node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';

const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

const TEST_EVENT = 'custom';

describe('EventEmitter binding', () => {
  let emitter: EventEmitter;
  let contextManager: ContextManager;

  beforeEach(() => {
    emitter = new EventEmitter();
    contextManager = new AsyncHooksContextManager().enable();
    context.setGlobalContextManager(contextManager);
  });

  it('binds correct context for registered listeners', () => {
    const span = provider.getTracer('test').startSpan('myspan');
    const boundContext = setSpan(ROOT_CONTEXT, span);

    bindEmitter(emitter, ev => {
      assert.strictEqual(ev, TEST_EVENT);
      return boundContext;
    });

    const handledEvents: string[] = [];

    const check = (event: string) => () => {
      assert.deepStrictEqual(getSpanContext(context.active()), span.context());
      handledEvents.push(event);
    };

    assert.notDeepStrictEqual(getSpanContext(context.active()), span.context());
    emitter.on(TEST_EVENT, check('on'));
    emitter.addListener(TEST_EVENT, check('addListener'));
    emitter.once(TEST_EVENT, check('once'));
    emitter.prependListener(TEST_EVENT, check('prependListener'));
    emitter.prependOnceListener(TEST_EVENT, check('prependOnceListener'));

    emitter.emit(TEST_EVENT);

    assert.deepStrictEqual(handledEvents, [
      'prependOnceListener',
      'prependListener',
      'on',
      'addListener',
      'once',
    ]);
  });

  it('is possible to remove a listener', () => {
    bindEmitter(emitter, () => context.active());

    const listener = () => assert.fail('listener should not be called');

    emitter.removeListener(TEST_EVENT, listener);
    emitter.on(TEST_EVENT, listener);
    emitter.removeListener(TEST_EVENT, listener);
    emitter.emit(TEST_EVENT);
  });

  it('is possible to remove all listeners', () => {
    bindEmitter(emitter, () => context.active());

    const listener = () => assert.fail('listener should not be called');

    emitter.on(TEST_EVENT, listener);
    emitter.once(TEST_EVENT, listener);
    emitter.addListener(TEST_EVENT, listener);
    emitter.prependListener(TEST_EVENT, listener);
    emitter.prependOnceListener(TEST_EVENT, listener);

    emitter.removeAllListeners(TEST_EVENT);

    emitter.emit(TEST_EVENT);
  });
});
