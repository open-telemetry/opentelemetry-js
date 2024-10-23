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

import {
  hrTimeToNanoseconds,
  otperformance as performance,
} from '@opentelemetry/core';
import * as core from '@opentelemetry/core';
import * as tracing from '@opentelemetry/sdk-trace-base';
import { HrTime } from '@opentelemetry/api';

import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  addSpanNetworkEvent,
  addSpanNetworkEvents,
  getXHRBodyLength,
  getResource,
  normalizeUrl,
  parseUrl,
  PerformanceEntries,
  shouldPropagateTraceHeaders,
  URLLike,
  getFetchBodyLength,
} from '../src';
import { PerformanceTimingNames as PTN } from '../src/enums/PerformanceTimingNames';

const SECOND_TO_NANOSECONDS = 1e9;

function createHrTime(startTime: HrTime, addToStart: number): HrTime {
  let seconds = startTime[0];
  let nanos = startTime[1] + addToStart;
  if (nanos >= SECOND_TO_NANOSECONDS) {
    nanos = SECOND_TO_NANOSECONDS - nanos;
    seconds++;
  }
  return [seconds, nanos];
}

function createResource(
  resource = {},
  startTime: HrTime,
  addToStart: number
): PerformanceResourceTiming {
  const fetchStart = core.hrTimeToNanoseconds(startTime) + 1;
  const responseEnd = fetchStart + addToStart;
  const million = 1000 * 1000; // used to convert nano to milli
  const defaultResource = {
    connectEnd: 0,
    connectStart: 0,
    decodedBodySize: 0,
    domainLookupEnd: 0,
    domainLookupStart: 0,
    encodedBodySize: 0,
    fetchStart: fetchStart / million,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: '',
    redirectEnd: 0,
    redirectStart: 0,
    requestStart: 0,
    responseEnd: responseEnd / million,
    responseStart: 0,
    secureConnectionStart: 0,
    transferSize: 0,
    workerStart: 0,
    duration: 0,
    entryType: '',
    name: '',
    startTime: 0,
  };
  return Object.assign(
    {},
    defaultResource,
    resource
  ) as PerformanceResourceTiming;
}

const ENCODER = new TextEncoder();
function textToReadableStream(msg: string) {
  return new ReadableStream({
    start: controller => {
      controller.enqueue(ENCODER.encode(msg));
      controller.close();
    },
    cancel: controller => {
      controller.close();
    },
  });
}

describe('utils', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('addSpanNetworkEvents', () => {
    it('should add all network events to span', () => {
      const addEventSpy = sinon.spy();
      const setAttributeSpy = sinon.spy();
      const span = {
        addEvent: addEventSpy,
        setAttribute: setAttributeSpy,
      } as unknown as tracing.Span;
      const entries = {
        [PTN.FETCH_START]: 123,
        [PTN.DOMAIN_LOOKUP_START]: 123,
        [PTN.DOMAIN_LOOKUP_END]: 123,
        [PTN.CONNECT_START]: 123,
        [PTN.SECURE_CONNECTION_START]: 123,
        [PTN.CONNECT_END]: 123,
        [PTN.REQUEST_START]: 123,
        [PTN.RESPONSE_START]: 123,
        [PTN.RESPONSE_END]: 123,
        [PTN.DECODED_BODY_SIZE]: 123,
        [PTN.ENCODED_BODY_SIZE]: 61,
      } as PerformanceEntries;

      assert.strictEqual(addEventSpy.callCount, 0);

      addSpanNetworkEvents(span, entries);
      assert.strictEqual(setAttributeSpy.callCount, 2);
      //secure connect start should not be added to non-https resource
      assert.strictEqual(addEventSpy.callCount, 8);
      //secure connect start should be added to an https resource
      addEventSpy.resetHistory();
      addSpanNetworkEvents(span, {
        ...entries,
        name: 'https://foo',
      } as PerformanceResourceTiming);
      assert.strictEqual(addEventSpy.callCount, 9);
    });
    it('should only include encoded size when content encoding is being used', () => {
      const addEventSpy = sinon.spy();
      const setAttributeSpy = sinon.spy();
      const span = {
        addEvent: addEventSpy,
        setAttribute: setAttributeSpy,
      } as unknown as tracing.Span;
      const entries = {
        [PTN.DECODED_BODY_SIZE]: 123,
        [PTN.ENCODED_BODY_SIZE]: 123,
      } as PerformanceEntries;

      assert.strictEqual(setAttributeSpy.callCount, 0);

      addSpanNetworkEvents(span, entries);

      assert.strictEqual(addEventSpy.callCount, 0);
      assert.strictEqual(setAttributeSpy.callCount, 1);
    });
  });
  describe('addSpanNetworkEvent', () => {
    [0, -2, 123].forEach(value => {
      describe(`when entry is ${value}`, () => {
        it('should add event to span', () => {
          const addEventSpy = sinon.spy();
          const span = {
            addEvent: addEventSpy,
          } as unknown as tracing.Span;
          const entries = {
            [PTN.FETCH_START]: value,
          } as PerformanceEntries;

          assert.strictEqual(addEventSpy.callCount, 0);

          addSpanNetworkEvent(span, PTN.FETCH_START, entries);

          assert.strictEqual(addEventSpy.callCount, 1);
          const args = addEventSpy.args[0];

          assert.strictEqual(args[0], 'fetchStart');
          assert.strictEqual(args[1], value);
        });
      });
    });
    describe('when entry is not numeric', () => {
      it('should NOT add event to span', () => {
        const addEventSpy = sinon.spy();
        const span = {
          addEvent: addEventSpy,
        } as unknown as tracing.Span;
        const entries = {
          [PTN.FETCH_START]: 'non-numeric',
        } as unknown;

        assert.strictEqual(addEventSpy.callCount, 0);

        addSpanNetworkEvent(
          span,
          PTN.FETCH_START,
          entries as PerformanceEntries
        );

        assert.strictEqual(addEventSpy.callCount, 0);
      });
    });
    describe('when entries does NOT contain the performance', () => {
      it('should NOT add event to span', () => {
        const addEventSpy = sinon.spy();
        const span = {
          addEvent: addEventSpy,
        } as unknown as tracing.Span;
        const entries = {
          [PTN.FETCH_START]: 123,
        } as PerformanceEntries;

        assert.strictEqual(addEventSpy.callCount, 0);

        addSpanNetworkEvent(span, 'foo', entries);

        assert.strictEqual(
          addEventSpy.callCount,
          0,
          'should not call addEvent'
        );
      });
    });
    describe('when entries contain invalid performance timing', () => {
      it('should only add events with time greater that or equal to reference value to span', () => {
        const addEventSpy = sinon.spy();
        const span = {
          addEvent: addEventSpy,
        } as unknown as tracing.Span;
        const entries = {
          [PTN.FETCH_START]: 123, // default reference time
          [PTN.CONNECT_START]: 0,
          [PTN.REQUEST_START]: 140,
        } as PerformanceEntries;

        assert.strictEqual(addEventSpy.callCount, 0);

        addSpanNetworkEvent(span, PTN.CONNECT_START, entries);

        assert.strictEqual(
          addEventSpy.callCount,
          0,
          'should not call addEvent'
        );

        addSpanNetworkEvent(span, PTN.REQUEST_START, entries);

        assert.strictEqual(
          addEventSpy.callCount,
          1,
          'should call addEvent for valid value'
        );
      });
    });

    describe('when entries contain invalid performance timing and a reference event', () => {
      it('should only add events with time greater that or equal to reference value to span', () => {
        const addEventSpy = sinon.spy();
        const span = {
          addEvent: addEventSpy,
        } as unknown as tracing.Span;
        const entries = {
          [PTN.FETCH_START]: 120,
          [PTN.CONNECT_START]: 120, // this is used as reference time here
          [PTN.REQUEST_START]: 10,
        } as PerformanceEntries;

        assert.strictEqual(addEventSpy.callCount, 0);

        addSpanNetworkEvent(
          span,
          PTN.REQUEST_START,
          entries,
          PTN.CONNECT_START
        );

        assert.strictEqual(
          addEventSpy.callCount,
          0,
          'should not call addEvent'
        );

        addSpanNetworkEvent(span, PTN.FETCH_START, entries, PTN.CONNECT_START);

        assert.strictEqual(
          addEventSpy.callCount,
          1,
          'should call addEvent for valid value'
        );

        addEventSpy.resetHistory();
        addSpanNetworkEvent(span, PTN.CONNECT_START, entries, 'foo'); // invalid reference , not adding event to span
        assert.strictEqual(
          addEventSpy.callCount,
          0,
          'should not call addEvent for invalid reference(non-existent)'
        );
      });
    });
  });

  describe('getResource', () => {
    const startTime = [0, 123123123] as HrTime;
    beforeEach(() => {
      const time = createHrTime(startTime, 500);
      sinon.stub(performance, 'timeOrigin').value(0);
      sinon.stub(performance, 'now').callsFake(() => hrTimeToNanoseconds(time));
    });

    describe('when resources are empty', () => {
      it('should return undefined', () => {
        const spanStartTime = createHrTime(startTime, 1);
        const spanEndTime = createHrTime(startTime, 100);
        const spanUrl = 'http://foo.com/bar.json';
        const resources: PerformanceResourceTiming[] = [];

        const resource = getResource(
          spanUrl,
          spanStartTime,
          spanEndTime,
          resources
        );

        assert.deepStrictEqual(
          resource.mainRequest,
          undefined,
          'main request should be undefined'
        );
      });
    });

    describe('when resources has correct entry', () => {
      it('should return the closest one', () => {
        const spanStartTime = createHrTime(startTime, 1);
        const spanEndTime = createHrTime(startTime, 402);
        const spanUrl = 'http://foo.com/bar.json';
        const resources: PerformanceResourceTiming[] = [];

        // this one started earlier
        resources.push(
          createResource(
            {
              name: 'http://foo.com/bar.json',
            },
            createHrTime(startTime, -1),
            100
          )
        );

        // this one is correct
        resources.push(
          createResource(
            {
              name: 'http://foo.com/bar.json',
            },
            createHrTime(startTime, 1),
            400
          )
        );

        // this one finished after span
        resources.push(
          createResource(
            {
              name: 'http://foo.com/bar.json',
            },
            createHrTime(startTime, 1),
            1000
          )
        );

        const resource = getResource(
          spanUrl,
          spanStartTime,
          spanEndTime,
          resources
        );

        assert.deepStrictEqual(
          resource.mainRequest,
          resources[1],
          'main request should be defined'
        );
      });
      describe('But one resource has been already used', () => {
        it('should return the next closest', () => {
          const spanStartTime = createHrTime(startTime, 1);
          const spanEndTime = createHrTime(startTime, 402);
          const spanUrl = 'http://foo.com/bar.json';
          const resources: PerformanceResourceTiming[] = [];

          // this one started earlier
          resources.push(
            createResource(
              {
                name: 'http://foo.com/bar.json',
              },
              createHrTime(startTime, -1),
              100
            )
          );

          // this one is correct but ignored
          resources.push(
            createResource(
              {
                name: 'http://foo.com/bar.json',
              },
              createHrTime(startTime, 1),
              400
            )
          );

          // this one is also correct
          resources.push(
            createResource(
              {
                name: 'http://foo.com/bar.json',
              },
              createHrTime(startTime, 1),
              300
            )
          );

          // this one finished after span
          resources.push(
            createResource(
              {
                name: 'http://foo.com/bar.json',
              },
              createHrTime(startTime, 1),
              1000
            )
          );

          const ignoredResources = new WeakSet<PerformanceResourceTiming>();
          ignoredResources.add(resources[1]);
          const resource = getResource(
            spanUrl,
            spanStartTime,
            spanEndTime,
            resources,
            ignoredResources
          );

          assert.deepStrictEqual(
            resource.mainRequest,
            resources[2],
            'main request should be defined'
          );
        });
      });
    });

    describe('when there are multiple resources from CorsPreflight requests', () => {
      it('should return main request and cors preflight request', () => {
        const spanStartTime = createHrTime(startTime, 1);
        const spanEndTime = createHrTime(startTime, 182);
        const spanUrl = 'http://foo.com/bar.json';
        const resources: PerformanceResourceTiming[] = [];

        // this one started earlier
        resources.push(
          createResource(
            {
              name: 'http://foo.com/bar.json',
            },
            createHrTime(startTime, 1),
            10
          )
        );

        // this one is correct
        resources.push(
          createResource(
            {
              name: 'http://foo.com/bar.json',
            },
            createHrTime(startTime, 1),
            11
          )
        );

        // this one finished after span
        resources.push(
          createResource(
            {
              name: 'http://foo.com/bar.json',
            },
            createHrTime(startTime, 50),
            100
          )
        );

        // this one finished after span
        resources.push(
          createResource(
            {
              name: 'http://foo.com/bar.json',
            },
            createHrTime(startTime, 50),
            130
          )
        );

        const resource = getResource(
          spanUrl,
          spanStartTime,
          spanEndTime,
          resources,
          undefined
        );

        assert.deepStrictEqual(
          resource.corsPreFlightRequest,
          resources[0],
          'cors preflight request should be defined'
        );

        assert.deepStrictEqual(
          resource.mainRequest,
          resources[3],
          'main request should be defined'
        );
      });
    });
  });

  describe('shouldPropagateTraceHeaders', () => {
    it('should propagate trace when url is the same as origin', () => {
      const result = shouldPropagateTraceHeaders(
        `${globalThis.location.origin}/foo/bar`
      );
      assert.strictEqual(result, true);
    });
    it('should propagate trace when url match', () => {
      const result = shouldPropagateTraceHeaders(
        'http://foo.com',
        'http://foo.com'
      );
      assert.strictEqual(result, true);
    });
    it('should propagate trace when url match regexp', () => {
      const result = shouldPropagateTraceHeaders('http://foo.com', /foo.+/);
      assert.strictEqual(result, true);
    });
    it('should propagate trace when url match array of string', () => {
      const result = shouldPropagateTraceHeaders('http://foo.com', [
        'http://foo.com',
      ]);
      assert.strictEqual(result, true);
    });
    it('should propagate trace when url match array of regexp', () => {
      const result = shouldPropagateTraceHeaders('http://foo.com', [/foo.+/]);
      assert.strictEqual(result, true);
    });
    it("should NOT propagate trace when url doesn't match", () => {
      const result = shouldPropagateTraceHeaders('http://foo.com');
      assert.strictEqual(result, false);
    });
  });

  describe('parseUrl', () => {
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
    it('should parse url', () => {
      const url = parseUrl('https://opentelemetry.io/foo');
      urlFields.forEach(field => {
        assert.strictEqual(typeof url[field], 'string');
      });
    });

    it('should parse relative url', () => {
      const url = parseUrl('/foo');
      urlFields.forEach(field => {
        assert.strictEqual(typeof url[field], 'string');
      });
    });
  });

  describe('normalizeUrl', () => {
    it('should normalize url', () => {
      const url = normalizeUrl('https://opentelemetry.io/你好');
      assert.strictEqual(url, 'https://opentelemetry.io/%E4%BD%A0%E5%A5%BD');
    });

    it('should normalize relative url', () => {
      const url = normalizeUrl('/你好');
      const urlObj = new URL(url);
      assert.strictEqual(urlObj.pathname, '/%E4%BD%A0%E5%A5%BD');
    });
  });

  describe('getXHRBodyLength', () => {
    it('should compute body length for Document payload', () => {
      // webworkers don't have DOMParser
      if (typeof DOMParser === 'undefined') {
        assert.ok(true);
        return;
      }
      const doc = new DOMParser().parseFromString(
        '<html><head><head/><body><p>hello world</p></body>',
        'text/html'
      );

      const length = getXHRBodyLength(doc);
      assert.ok(length !== undefined, 'body length is undefined');
      assert.ok(length, 'body length is 0');
    });
    it('should compute body length for Blob payload', () => {
      const blob = new Blob(['hello world'], {
        type: 'text/plain',
      });

      assert.strictEqual(getXHRBodyLength(blob), 11);
    });
    it('should compute body length for ArrayBuffer/ArrayBufferView payload', () => {
      const arrayBuffer = new Uint8Array([1, 2, 3]).buffer;

      assert.strictEqual(getXHRBodyLength(arrayBuffer), 3);
      assert.strictEqual(getXHRBodyLength(new ArrayBuffer(8)), 8);
      assert.strictEqual(getXHRBodyLength(new ArrayBuffer(8).slice(0, 2)), 2);
      assert.strictEqual(getXHRBodyLength(new ArrayBuffer(0)), 0);
    });
    it('should compute body length for FormData payload', () => {
      const formData = new FormData();
      formData.append('key1', 'true');
      formData.append('key2', 'hello world');

      assert.strictEqual(getXHRBodyLength(formData), 23);
      assert.strictEqual(getXHRBodyLength(new FormData()), 0);
    });
    it('should compute body length for FormData payload with a file', () => {
      const formData = new FormData();
      const f = new File(
        ['hello world hello world hello world'],
        'test_file.txt'
      );
      formData.append('file', f);

      // length should be:
      // 4 for the key of the file in the form data
      // 35 for the file contents
      assert.strictEqual(getXHRBodyLength(formData), 39);
    });
    it('should compute body length for URLSearchParams payload', () => {
      const search = new URLSearchParams({
        key1: 'true',
        key2: 'hello world',
      });

      assert.strictEqual(getXHRBodyLength(search), 26);
      assert.strictEqual(getXHRBodyLength(new URLSearchParams()), 0);
    });
    it('should compute body length for string payload', () => {
      const jsonString = JSON.stringify({
        key1: 'true',
        key2: 'hello world',
      });
      assert.strictEqual(getXHRBodyLength(jsonString), 36);
      assert.strictEqual(getXHRBodyLength('hello world'), 11);
      assert.strictEqual(getXHRBodyLength('π'), 2); // one character, 2 bytes
      assert.strictEqual(getXHRBodyLength('🔥🔪😭'), 12); // each emoji is 4 bytes
      assert.strictEqual(getXHRBodyLength('مرحبا بالعالم'), 25); // hello world in Arabic is 25 bytes
      assert.strictEqual(getXHRBodyLength(''), 0);
    });
  });

  describe('getFetchBodyLength', () => {
    it('should read the body of the second param when the first param is string', async () => {
      const jsonString = JSON.stringify({
        key1: 'true',
        key2: 'hello world',
      });
      const length = await getFetchBodyLength('https://example.com', {
        body: jsonString,
      });
      assert.strictEqual(length, 36);
    });

    it('should handle undefined body', async () => {
      const length = await getFetchBodyLength('https://example.com', {});
      assert.strictEqual(length, undefined);
    });

    it('should handle unicode body', async () => {
      const length = await getFetchBodyLength('https://example.com', {
        body: 'π🔥🔪😭',
      });
      assert.strictEqual(length, 14); // pi is 2 bytes, each emoji is 4
    });

    it('should (non-destructively) read the body stream of the second param when the first param is string', async () => {
      const jsonString = JSON.stringify({
        key1: 'true',
        key2: 'hello world',
      });
      const requestParams = { body: textToReadableStream(jsonString) };
      const lengthPromise = getFetchBodyLength(
        'https://example.com',
        requestParams
      );

      // if we try to await lengthPromise here, we get a timeout

      let lengthResolved = false;
      lengthPromise.finally(() => (lengthResolved = true));

      // length doesn't get read yet
      assert.strictEqual(lengthResolved, false);

      // the body is still readable
      assert.strictEqual(requestParams.body.locked, false);

      // AND the body is still correct
      const { value } = await requestParams.body.getReader().read();
      const decoder = new TextDecoder();
      assert.strictEqual(decoder.decode(value), jsonString);

      // AND now length got read, and we got the correct length
      const length = await lengthPromise;
      assert.strictEqual(lengthResolved, true);
      assert.strictEqual(length, 36);
    });

    it('should (non-destructively) read the unicode body stream of the second param when the first param is string', async () => {
      const bodyString = 'π🔥🔪😭';
      const requestParams = { body: textToReadableStream(bodyString) };
      const lengthPromise = getFetchBodyLength(
        'https://example.com',
        requestParams
      );

      // if we try to await lengthPromise here, we get a timeout

      let lengthResolved = false;
      lengthPromise.finally(() => (lengthResolved = true));

      // length doesn't get read yet
      assert.strictEqual(lengthResolved, false);

      // the body is still readable
      assert.strictEqual(requestParams.body.locked, false);

      // AND the body is still correct
      const { value } = await requestParams.body.getReader().read();
      const decoder = new TextDecoder();
      assert.strictEqual(decoder.decode(value), bodyString);

      // AND now length got read, and we got the correct length
      const length = await lengthPromise;
      assert.strictEqual(lengthResolved, true);
      assert.strictEqual(length, 14);
    });

    it('should handle readablestream objects without a pipeThrough method', async () => {
      const jsonString = JSON.stringify({
        key1: 'true',
        key2: 'hello world',
      });
      const stream = textToReadableStream(jsonString);

      // @ts-expect-error intentionally remove the .tee() method to mimic older environments where this method isn't available
      stream.pipeThrough = undefined;

      const requestParams = { body: stream };
      const length = await getFetchBodyLength(
        'https://example.com',
        requestParams
      );

      // we got the correct length
      assert.strictEqual(length, undefined);

      // AND the body is still readable
      assert.strictEqual(requestParams.body.locked, false);

      // AND the body is still correct
      const { value } = await requestParams.body.getReader().read();
      const decoder = new TextDecoder();
      assert.strictEqual(decoder.decode(value), jsonString);
    });

    it('should read the body of the first param when recieving a request', async () => {
      const bodyContent = JSON.stringify({
        key1: 'true',
        key2: 'hello world',
      });
      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          foo: 'bar',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: bodyContent,
      });

      const length = await getFetchBodyLength(req);

      // we got the correct length
      assert.strictEqual(length, 36);

      // AND the body is still readable and correct
      const body = await req.text();
      assert.strictEqual(body, bodyContent);
    });

    it('should read the body of the first param when recieving a request with urlparams body', async () => {
      const body = new URLSearchParams();
      body.append('hello', 'world');

      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          foo: 'bar',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body,
      });

      const length = await getFetchBodyLength(req);

      // we got the correct length
      assert.strictEqual(length, 11);

      // AND the body is still readable and correct
      const requestBody = await req.text();
      assert.strictEqual(requestBody, 'hello=world');
    });
  });
});
