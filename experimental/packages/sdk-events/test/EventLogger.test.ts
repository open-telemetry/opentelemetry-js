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
import { EventLogger } from '../src';
import { TestLogger } from './utils';
import { SeverityNumber } from '@opentelemetry/api-logs';

describe('EventLogger', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      const eventLogger = new EventLogger(new TestLogger());
      assert.ok(eventLogger instanceof EventLogger);
    });
  });

  describe('emit', () => {
    it('should emit a logRecord instance', () => {
      const logger = new TestLogger();
      const eventLogger = new EventLogger(logger);
      const now = Date.now();

      const spy = sinon.spy(logger, 'emit');
      eventLogger.emit({
        name: 'event name',
        data: {
          a: 1,
          b: 2,
        },
        attributes: {
          c: 3,
          d: 4,
        },
        severityNumber: SeverityNumber.ERROR,
        timestamp: now,
      });

      assert.ok(
        spy.calledWith(
          sinon.match({
            attributes: {
              'event.name': 'event name',
              c: 3,
              d: 4,
            },
            body: {
              a: 1,
              b: 2,
            },
            severityNumber: SeverityNumber.ERROR,
            timestamp: now,
          })
        )
      );
    });

    it('should set defaults', () => {
      const logger = new TestLogger();
      const eventLogger = new EventLogger(logger);

      const spy = sinon.spy(logger, 'emit');
      eventLogger.emit({
        name: 'event name',
      });

      assert.ok(
        spy.calledWith(
          sinon.match({
            severityNumber: SeverityNumber.INFO,
          })
        ),
        'severityNumber should be set to INFO'
      );

      assert.ok(
        spy.calledWith(
          sinon.match((value: any) => {
            return value.timestamp !== undefined;
          })
        ),
        'timestamp should not be empty'
      );
    });
  });
});
