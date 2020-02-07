/*!
 * Copyright 2020, OpenTelemetry Authors
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

import * as tracing from '@opentelemetry/tracing';
import * as assert from 'assert';

export class DummySpanExporter implements tracing.SpanExporter {
  export(spans: tracing.ReadableSpan[]) {}

  shutdown() {}
}

export function createButton(disabled?: boolean): HTMLElement {
  const button = document.createElement('button');
  button.setAttribute('id', 'testBtn');
  if (disabled) {
    button.setAttribute('disabled', 'disabled');
  }
  return button;
}

export function fakeInteraction(
  callback: Function = function() {},
  elem?: HTMLElement
) {
  const element: HTMLElement = elem || createButton();

  element.addEventListener('click', () => {
    callback();
  });

  element.click();
}

export function assertClickSpan(span: tracing.ReadableSpan, id = 'testBtn') {
  assert.equal(span.name, `event_click: //*[@id="${id}"]`);

  const attributes = span.attributes;
  assert.equal(attributes.component, 'user-interaction');
  assert.equal(attributes.event_type, 'click');
  assert.equal(attributes.target_element, 'BUTTON');
  assert.equal(attributes.target_xpath, `//*[@id="${id}"]`);
  assert.ok(attributes['http.url'] !== '');
  assert.ok(attributes['user_agent'] !== '');
}

export function getData(url: string, callbackAfterSend: Function) {
  return new Promise(async (resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.send();

    req.onload = resolve;
    req.onerror = reject;
    req.ontimeout = reject;

    callbackAfterSend();
  });
}
