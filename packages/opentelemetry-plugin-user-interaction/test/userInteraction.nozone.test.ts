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

// because of zone original timeout needs to be patched to be able to run
// code outside zone.js. This needs to be done before all
const originalSetTimeout = window.setTimeout;

import { context } from '@opentelemetry/api';
import { isWrapped, LogLevel } from '@opentelemetry/core';
import { XMLHttpRequestPlugin } from '@opentelemetry/plugin-xml-http-request';
import { ZoneScopeManager } from '@opentelemetry/scope-zone-peer-dep';
import * as tracing from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { UserInteractionPlugin } from '../src';
import {
  assertClickSpan,
  DummySpanExporter,
  fakeInteraction,
  getData,
} from './helper.test';

const FILE_URL =
  'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';

describe('UserInteractionPlugin', () => {
  describe('when zone.js is NOT available', () => {
    let scopeManager: ZoneScopeManager;
    let userInteractionPlugin: UserInteractionPlugin;
    let sandbox: sinon.SinonSandbox;
    let webTracerProvider: WebTracerProvider;
    let dummySpanExporter: DummySpanExporter;
    let exportSpy: sinon.SinonSpy;
    let requests: sinon.SinonFakeXMLHttpRequest[] = [];
    beforeEach(() => {
      scopeManager = new ZoneScopeManager().enable();
      context.initGlobalContextManager(scopeManager);
      sandbox = sinon.createSandbox();
      const fakeXhr = sandbox.useFakeXMLHttpRequest();
      fakeXhr.onCreate = function(xhr: sinon.SinonFakeXMLHttpRequest) {
        requests.push(xhr);
        setTimeout(() => {
          requests[requests.length - 1].respond(
            200,
            { 'Content-Type': 'application/json' },
            '{"foo":"bar"}'
          );
        });
      };

      sandbox.useFakeTimers();

      userInteractionPlugin = new UserInteractionPlugin();

      sinon
        .stub(userInteractionPlugin, 'getZoneWithPrototype')
        .callsFake(() => undefined);

      webTracerProvider = new WebTracerProvider({
        logLevel: LogLevel.ERROR,
        plugins: [userInteractionPlugin, new XMLHttpRequestPlugin()],
      });

      dummySpanExporter = new DummySpanExporter();
      exportSpy = sandbox.stub(dummySpanExporter, 'export');
      webTracerProvider.addSpanProcessor(
        new tracing.SimpleSpanProcessor(dummySpanExporter)
      );

      // this is needed as window is treated as scope and karma is adding
      // context which is then detected as spanContext
      (window as { context?: {} }).context = undefined;
    });
    afterEach(() => {
      requests = [];
      sandbox.restore();
      exportSpy.restore();
      scopeManager.disable();
    });

    it('should handle task without async operation', () => {
      fakeInteraction();
      assert.equal(exportSpy.args.length, 1, 'should export one span');
      const spanClick = exportSpy.args[0][0][0];
      assertClickSpan(spanClick);
    });

    it('should handle timeout', done => {
      fakeInteraction(() => {
        originalSetTimeout(() => {
          const spanClick: tracing.ReadableSpan = exportSpy.args[0][0][0];

          assert.equal(exportSpy.args.length, 1, 'should export one span');
          assertClickSpan(spanClick);
          done();
        });
      });
      sandbox.clock.tick(10);
    });

    it('should handle target without function getAttribute', done => {
      let callback: Function;
      const btn: any = {
        addEventListener: function(name: string, callbackF: Function) {
          callback = callbackF;
        },
        click: function() {
          callback();
        },
      };
      fakeInteraction(() => {
        originalSetTimeout(() => {
          assert.equal(exportSpy.args.length, 0, 'should NOT export any span');
          done();
        });
      }, btn);
      sandbox.clock.tick(10);
    });

    it('should not create span when element has attribute disabled', done => {
      let callback: Function;
      const btn: any = {
        addEventListener: function(name: string, callbackF: Function) {
          callback = callbackF;
        },
        click: function() {
          callback();
        },
        getAttribute: function() {},
        hasAttribute: function(name: string) {
          return name === 'disabled' ? true : false;
        },
      };
      fakeInteraction(() => {
        originalSetTimeout(() => {
          assert.equal(exportSpy.args.length, 0, 'should NOT export any span');
          done();
        });
      }, btn);
      sandbox.clock.tick(10);
    });

    it('should not create span when start span fails', done => {
      userInteractionPlugin['_tracer'].startSpan = function() {
        throw 'foo';
      };

      fakeInteraction(() => {
        originalSetTimeout(() => {
          assert.equal(exportSpy.args.length, 0, 'should NOT export any span');
          done();
        });
      });
      sandbox.clock.tick(10);
    });

    it('should handle task with navigation change', done => {
      fakeInteraction(() => {
        history.pushState(
          { test: 'testing' },
          '',
          `${location.pathname}#foo=bar1`
        );
        getData(FILE_URL, () => {
          sandbox.clock.tick(1000);
        }).then(() => {
          originalSetTimeout(() => {
            assert.equal(exportSpy.args.length, 2, 'should export 2 spans');

            const spanXhr: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const spanClick: tracing.ReadableSpan = exportSpy.args[1][0][0];
            assert.equal(
              spanXhr.parentSpanId,
              spanClick.spanContext.spanId,
              'xhr span has wrong parent'
            );
            assert.equal(
              spanClick.name,
              `Navigation: ${location.pathname}#foo=bar1`
            );

            const attributes = spanClick.attributes;
            assert.equal(attributes.component, 'user-interaction');
            assert.equal(attributes.event_type, 'click');
            assert.equal(attributes.target_element, 'BUTTON');
            assert.equal(attributes.target_xpath, `//*[@id="testBtn"]`);

            done();
          });
        });
      });
    });

    it('should handle task with timeout and async operation', done => {
      fakeInteraction(() => {
        getData(FILE_URL, () => {
          sandbox.clock.tick(1000);
        }).then(() => {
          originalSetTimeout(() => {
            assert.equal(exportSpy.args.length, 2, 'should export 2 spans');

            const spanXhr: tracing.ReadableSpan = exportSpy.args[0][0][0];
            const spanClick: tracing.ReadableSpan = exportSpy.args[1][0][0];
            assert.equal(
              spanXhr.parentSpanId,
              spanClick.spanContext.spanId,
              'xhr span has wrong parent'
            );
            assertClickSpan(spanClick);

            const attributes = spanXhr.attributes;
            assert.equal(attributes.component, 'xml-http-request');
            assert.equal(
              attributes['http.url'],
              'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json'
            );
            // all other attributes are checked in xhr anyway

            done();
          });
        });
      });
    });

    it('should handle 3 overlapping interactions', done => {
      const btn1 = document.createElement('button');
      btn1.setAttribute('id', 'btn1');
      const btn2 = document.createElement('button');
      btn2.setAttribute('id', 'btn2');
      const btn3 = document.createElement('button');
      btn3.setAttribute('id', 'btn3');
      fakeInteraction(() => {
        getData(FILE_URL, () => {
          sandbox.clock.tick(10);
        }).then(() => {});
      }, btn1);
      fakeInteraction(() => {
        getData(FILE_URL, () => {
          sandbox.clock.tick(10);
        }).then(() => {});
      }, btn2);
      fakeInteraction(() => {
        getData(FILE_URL, () => {
          sandbox.clock.tick(10);
        }).then(() => {});
      }, btn3);
      sandbox.clock.tick(1000);
      originalSetTimeout(() => {
        assert.equal(exportSpy.args.length, 6, 'should export 6 spans');

        const span1: tracing.ReadableSpan = exportSpy.args[0][0][0];
        const span2: tracing.ReadableSpan = exportSpy.args[1][0][0];
        const span3: tracing.ReadableSpan = exportSpy.args[2][0][0];
        const span4: tracing.ReadableSpan = exportSpy.args[3][0][0];
        const span5: tracing.ReadableSpan = exportSpy.args[4][0][0];
        const span6: tracing.ReadableSpan = exportSpy.args[5][0][0];

        assertClickSpan(span1, 'btn1');
        assertClickSpan(span2, 'btn2');
        assertClickSpan(span3, 'btn3');

        assert.strictEqual(
          span1.spanContext.spanId,
          span4.parentSpanId,
          'span4 has wrong parent'
        );
        assert.strictEqual(
          span2.spanContext.spanId,
          span5.parentSpanId,
          'span5 has wrong parent'
        );
        assert.strictEqual(
          span3.spanContext.spanId,
          span6.parentSpanId,
          'span6 has wrong parent'
        );

        done();
      });
    });

    it('should handle unpatch', () => {
      assert.strictEqual(
        isWrapped(HTMLElement.prototype.addEventListener),
        true,
        'addEventListener should be wrapped'
      );

      assert.strictEqual(
        isWrapped(history.replaceState),
        true,
        'replaceState should be wrapped'
      );
      assert.strictEqual(
        isWrapped(history.pushState),
        true,
        'pushState should be wrapped'
      );
      assert.strictEqual(
        isWrapped(history.back),
        true,
        'back should be wrapped'
      );
      assert.strictEqual(
        isWrapped(history.forward),
        true,
        'forward should be wrapped'
      );
      assert.strictEqual(isWrapped(history.go), true, 'go should be wrapped');

      userInteractionPlugin.disable();

      assert.strictEqual(
        isWrapped(HTMLElement.prototype.addEventListener),
        false,
        'addEventListener should be unwrapped'
      );

      assert.strictEqual(
        isWrapped(history.replaceState),
        false,
        'replaceState should be unwrapped'
      );
      assert.strictEqual(
        isWrapped(history.pushState),
        false,
        'pushState should be unwrapped'
      );
      assert.strictEqual(
        isWrapped(history.back),
        false,
        'back should be unwrapped'
      );
      assert.strictEqual(
        isWrapped(history.forward),
        false,
        'forward should be unwrapped'
      );
      assert.strictEqual(
        isWrapped(history.go),
        false,
        'go should be unwrapped'
      );
    });
  });
});
