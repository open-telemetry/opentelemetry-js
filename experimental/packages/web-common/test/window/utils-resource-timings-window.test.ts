/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import type { URLLike } from '../../src';
import { getElementXPath, normalizeUrl, parseUrl } from '../../src';

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
  <div id="body-id"><div></div></div>
</div>
`;

describe('utils-resource-timings', function () {
  afterEach(() => {
    sinon.restore();
  });

  describe('getElementXPath', function () {
    let root: HTMLElement;
    const find = (selector: string): HTMLElement => {
      const el = root.querySelector<HTMLElement>(selector);
      assert.ok(el, `fixture element not found: ${selector}`);
      return el;
    };
    before(() => {
      const container = document.createElement('div');
      container.innerHTML = fixture.trim();
      root = container.firstElementChild as HTMLElement;
      document.body.appendChild(root);
    });
    after(() => {
      root.remove();
    });

    it('should return correct path for element with id and optimise = true', function () {
      const element = getElementXPath(find('#btn22'), true);
      assert.strictEqual(element, '//*[@id="btn22"]');
      assert.strictEqual(find('#btn22'), getElementByXpath(element));
    });

    it('should use ancestor id when optimised recursively', function () {
      const inner = find('#body-id div');
      const element = getElementXPath(inner, true);
      assert.strictEqual(element, '//*[@id="body-id"]/div');
      assert.strictEqual(inner, getElementByXpath(element));
    });

    it(
      'should return correct path for element with id and surrounded by the' +
        ' same type',
      function () {
        const element = getElementXPath(find('#btn22'));
        assert.strictEqual(element, '//html/body/div/div[4]/div[5]/button[3]');
        assert.strictEqual(find('#btn22'), getElementByXpath(element));
      }
    );

    it(
      'should return correct path for element with id and surrounded by' +
        ' text nodes mixed with cnode',
      function () {
        const element = getElementXPath(find('#btn23'));
        assert.strictEqual(element, '//html/body/div/div[4]/div[6]/button');
        assert.strictEqual(find('#btn23'), getElementByXpath(element));
      }
    );

    it(
      'should return correct path for text node element surrounded by cdata' +
        ' nodes',
      function () {
        const text = find('#cdata');
        const textNode = document.createTextNode('foobar');
        text.appendChild(textNode);
        const element = getElementXPath(textNode);
        assert.strictEqual(element, '//html/body/div/div[4]/div[10]/text()[5]');
        assert.strictEqual(textNode, getElementByXpath(element));
      }
    );

    it('should return correct path when element is text node', function () {
      const text = find('#text');
      const textNode = document.createTextNode('foobar');
      text.appendChild(textNode);
      const element = getElementXPath(textNode);
      assert.strictEqual(element, '//html/body/div/div[4]/div[3]/text()[2]');
      assert.strictEqual(textNode, getElementByXpath(element));
    });

    it('should return correct path when element is comment node', function () {
      const comment = find('#comment');
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
