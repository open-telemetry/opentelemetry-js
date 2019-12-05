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

import {
  hrTimeToNanoseconds,
  otperformance as performance,
} from '@opentelemetry/core';
import * as core from '@opentelemetry/core';
import * as tracing from '@opentelemetry/tracing';
import { HrTime } from '@opentelemetry/types';

import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  addSpanNetworkEvent,
  getResource,
  PerformanceEntries,
  sameOriginOrUrlMatches,
} from '../src';
import { PerformanceTimingNames as PTN } from '../src/enums/PerformanceTimingNames';

function createHrTime(startTime: HrTime, addToStart: number): HrTime {
  let seconds = startTime[0];
  let nanos = startTime[1] + addToStart;
  if (nanos >= core.SECOND_TO_NANOSECONDS) {
    nanos = core.SECOND_TO_NANOSECONDS - nanos;
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
  const milion = 1000 * 1000; // used to convert nano to milli
  const defaultResource = {
    connectEnd: 0,
    connectStart: 0,
    decodedBodySize: 0,
    domainLookupEnd: 0,
    domainLookupStart: 0,
    encodedBodySize: 0,
    fetchStart: fetchStart / milion,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: '',
    redirectEnd: 0,
    redirectStart: 0,
    requestStart: 0,
    responseEnd: responseEnd / milion,
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

describe('utils', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('addSpanNetworkEvent', () => {
    describe('when entries contain the performance', () => {
      it('should add event to span', () => {
        const addEventSpy = sinon.spy();
        const span = ({
          addEvent: addEventSpy,
        } as unknown) as tracing.Span;
        const entries = {
          [PTN.FETCH_START]: 123,
        } as PerformanceEntries;

        assert.strictEqual(addEventSpy.callCount, 0);

        addSpanNetworkEvent(span, PTN.FETCH_START, entries);

        assert.strictEqual(addEventSpy.callCount, 1);
        const args = addEventSpy.args[0];

        assert.strictEqual(args[0], 'fetchStart');
        assert.strictEqual(args[1], 123);
      });
    });
    describe('when entry has time equal to 0', () => {
      it('should NOT add event to span', () => {
        const addEventSpy = sinon.spy();
        const span = ({
          addEvent: addEventSpy,
        } as unknown) as tracing.Span;
        const entries = {
          [PTN.FETCH_START]: 0,
        } as PerformanceEntries;

        assert.strictEqual(addEventSpy.callCount, 0);

        addSpanNetworkEvent(span, PTN.FETCH_START, entries);

        assert.strictEqual(addEventSpy.callCount, 0);
      });
    });
    describe('when entries does NOT contain the performance', () => {
      it('should NOT add event to span', () => {
        const addEventSpy = sinon.spy();
        const span = ({
          addEvent: addEventSpy,
        } as unknown) as tracing.Span;
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
  });
  describe('getResource', () => {
    const startTime = [0, 123123123] as HrTime;
    let spyHrTime: any;
    beforeEach(() => {
      const time = createHrTime(startTime, 500);
      sandbox.stub(performance, 'timeOrigin').value(0);
      sandbox
        .stub(performance, 'now')
        .callsFake(() => hrTimeToNanoseconds(time));

      spyHrTime = sinon.stub(core, 'hrTime').returns(time);
    });
    afterEach(() => {
      spyHrTime.restore();
    });

    describe('when resources are empty', () => {
      it('should return undefined', () => {
        const spanStartTime = createHrTime(startTime, 1);

        const span = ({
          startTime: spanStartTime,
          name: 'http://foo.com/bar.json',
        } as unknown) as tracing.Span;

        const resources: PerformanceResourceTiming[] = [];

        const resource = getResource(span, resources);
        assert.strictEqual(resource, undefined, 'resource should be undefined');
      });
    });

    describe('when resources has correct entry', () => {
      it('should return the closest one', () => {
        const spanStartTime = createHrTime(startTime, 1);

        const span = ({
          startTime: spanStartTime,
          name: 'http://foo.com/bar.json',
        } as unknown) as tracing.Span;

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

        const resource = getResource(span, resources);

        assert.deepStrictEqual(
          resource,
          resources[1],
          'resource should be defined'
        );
      });
      describe('But one resource has been already used', () => {
        it('should return the next closest', () => {
          const spanStartTime = createHrTime(startTime, 1);

          const span = ({
            startTime: spanStartTime,
            name: 'http://foo.com/bar.json',
          } as unknown) as tracing.Span;

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

          const ignoredResources: PerformanceResourceTiming[] = [resources[1]];
          const resource = getResource(span, resources, ignoredResources);

          assert.deepStrictEqual(
            resource,
            resources[2],
            'resource should be defined'
          );
        });
      });
    });

    describe('sameOriginOrUrlMatches', () => {
      it('should return true for the same url', () => {
        const url1 = 'http://foo.com/1';
        const url2 = 'http://foo.com/2';
        assert.strictEqual(
          sameOriginOrUrlMatches(url1, url2),
          true,
          'origins are not the same'
        );
      });

      it('should return true if url matches with RegExp', () => {
        const url1 = 'http://foo.com/1';
        const url2 = /foo\.com/;
        assert.strictEqual(
          sameOriginOrUrlMatches(url1, url2),
          true,
          'url does not match'
        );
      });

      it('should return false for different urls', () => {
        const url1 = 'http://foo.com/1';
        const url2 = 'http://foo.au/2';
        assert.strictEqual(
          sameOriginOrUrlMatches(url1, url2),
          false,
          'origins are not the same'
        );
      });

      it('should return false if url does NOT matches with RegExp', () => {
        const url1 = 'http://foo.com/1';
        const url2 = /foo\.cam/;
        assert.strictEqual(
          sameOriginOrUrlMatches(url1, url2),
          false,
          'url does not match'
        );
      });
    });
  });
});
