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
import {
  getElementXPath,
  normalizeUrl,
  parseUrl,
  URLLike,
} from '../../src/utils';

const fixture = `
<div>
  <div></div>
  <div></div>
  <div></div>
  <div>
    <div></div>
    <div>
    </div>
    <div id="text">lorep ipsum</div>
    <div></div>
    <div class="btn2">
      foo
      <button></button>
      <button></button>
      <button id="btn22"></button>
      <button></button>
      bar
    </div>
    <div>
      aaaaaaaaa
      <![CDATA[ /*Some code with < & and what not */ ]]>
      <button id="btn23"></button>
      bbb
    </div>
    <div></div>
    <div id="comment"></div>
    <div></div>
    <div id="cdata">
      <![CDATA[ /*Some code with < & and what not */ ]]>
      <![CDATA[ /*Some code with < & and what not */ ]]>
      <![CDATA[ /*Some code with < & and what not */ ]]>
      bar
    </div>
    <div></div>
  </div>
  <div></div>
</div>
`;

describe('utils', function () {
  afterEach(() => {
    sinon.restore();
  });

  describe('getElementXPath', function () {
    let $fixture: any;
    let child: any;
    before(() => {
      $fixture = $(fixture);
      const body = document.querySelector('body');
      if (body) {
        body.appendChild($fixture[0]);
        child = body.lastChild;
      }
    });
    after(() => {
      child.parentNode.removeChild(child);
    });

    it('should return correct path for element with id and optimise = true', function () {
      const element = getElementXPath($fixture.find('#btn22')[0], true);
      assert.strictEqual(element, '//*[@id="btn22"]');
      assert.strictEqual(
        $fixture.find('#btn22')[0],
        getElementByXpath(element)
      );
    });

    it(
      'should return correct path for element with id and surrounded by the' +
        ' same type',
      function () {
        const element = getElementXPath($fixture.find('#btn22')[0]);
        assert.strictEqual(element, '//html/body/div/div[4]/div[5]/button[3]');
        assert.strictEqual(
          $fixture.find('#btn22')[0],
          getElementByXpath(element)
        );
      }
    );

    it(
      'should return correct path for element with id and surrounded by' +
        ' text nodes mixed with cnode',
      function () {
        const element = getElementXPath($fixture.find('#btn23')[0]);
        assert.strictEqual(element, '//html/body/div/div[4]/div[6]/button');
        assert.strictEqual(
          $fixture.find('#btn23')[0],
          getElementByXpath(element)
        );
      }
    );

    it(
      'should return correct path for text node element surrounded by cdata' +
        ' nodes',
      function () {
        const text = $fixture.find('#cdata')[0];
        const textNode = document.createTextNode('foobar');
        text.appendChild(textNode);
        const element = getElementXPath(textNode);
        assert.strictEqual(element, '//html/body/div/div[4]/div[10]/text()[5]');
        assert.strictEqual(textNode, getElementByXpath(element));
      }
    );

    it('should return correct path when element is text node', function () {
      const text = $fixture.find('#text')[0];
      const textNode = document.createTextNode('foobar');
      text.appendChild(textNode);
      const element = getElementXPath(textNode);
      assert.strictEqual(element, '//html/body/div/div[4]/div[3]/text()[2]');
      assert.strictEqual(textNode, getElementByXpath(element));
    });

    it('should return optimised path for child of element with id when optimised = true', function () {
      const element = getElementXPath(
        $fixture.find('#btn22')[0].parentNode.children[0],
        true
      );
      assert.ok(
        element.indexOf('@id') > 0,
        'expected optimised xpath to use @id shortcut for ancestor'
      );
    });

    it('should return correct path when element is comment node', function () {
      const comment = $fixture.find('#comment')[0];
      const node = document.createComment('foobar');
      comment.appendChild(node);
      const element = getElementXPath(node);
      assert.strictEqual(element, '//html/body/div/div[4]/div[8]/comment()');
      assert.strictEqual(node, getElementByXpath(element));
    });
  });

  describe('parseUrl', function () {
    const urlFields: Array<keyof URLLike> = [
      'hash',
      'host',
      'hostname',
      'href',
      'origin',
      'password',
      'pathname',
      'port',
      'protocol',
      'search',
      'username',
    ];
    it('should parse url with fallback', function () {
      sinon.stub(globalThis, 'URL').value(undefined);
      const url = parseUrl('https://opentelemetry.io/foo');
      urlFields.forEach(field => {
        assert.strictEqual(typeof url[field], 'string');
      });
    });

    it('should correctly parse relative url in presence of base tag', function () {
      sinon.stub(globalThis.document, 'baseURI').value('http://foobar.com');
      const url = parseUrl('foo/bar');
      assert.strictEqual(url.href, 'http://foobar.com/foo/bar');
    });
  });

  describe('normalizeUrl', function () {
    it('should parse url with fallback', function () {
      sinon.stub(globalThis, 'URL').value(undefined);
      const url = normalizeUrl('https://opentelemetry.io/你好');
      assert.strictEqual(url, 'https://opentelemetry.io/%E4%BD%A0%E5%A5%BD');
    });
  });
});

function getElementByXpath(path: string) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}
