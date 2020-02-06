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

import * as shimmer from 'shimmer';
import { BasePlugin, hrTime, isWrapped } from '@opentelemetry/core';
import * as types from '@opentelemetry/api';
import { getElementXPath } from '@opentelemetry/web';
import {
  AsyncTask,
  RunTaskFunction,
  SpanData,
  WindowWithZone,
  ZoneTypeWithPrototype,
} from './types';
import { AttributeNames } from './enums/AttributeNames';
import { VERSION } from './version';

const ZONE_SCOPE_KEY = 'OT_ZONE_SCOPE';
const EVENT_CLICK_NAME = 'event_click:';
const EVENT_NAVIGATION_NAME = 'Navigation:';

/**
 * This class represents a UserInteraction plugin for auto instrumentation.
 * If zone.js is available then it patches the zone otherwise it patches
 * addEventListener of HTMLElement
 */
export class UserInteractionPlugin extends BasePlugin<unknown> {
  readonly component: string = 'user-interaction';
  readonly version = VERSION;
  moduleName = this.component;
  private _spansData = new WeakMap<types.Span, SpanData>();
  private _zonePatched = false;

  constructor() {
    super('@opentelemetry/plugin-user-interaction', VERSION);
  }

  /**
   * This will check if last task was timeout and will save the time to
   * fix the user interaction when nothing happens
   * This timeout comes from xhr plugin which is needed to collect information
   * about last xhr main request from observer
   * @param task
   * @param span
   */
  private _checkForTimeout(task: AsyncTask, span: types.Span) {
    const spanData = this._spansData.get(span);
    if (spanData) {
      if (task.source === 'setTimeout') {
        spanData.hrTimeLastTimeout = hrTime();
      } else if (
        task.source !== 'Promise.then' &&
        task.source !== 'setTimeout'
      ) {
        spanData.hrTimeLastTimeout = undefined;
      }
    }
  }

  /**
   * Creates a new span
   * @param element
   * @param eventName
   */
  private _createSpan(
    element: HTMLElement,
    eventName: string
  ): types.Span | undefined {
    if (!element.getAttribute) {
      return undefined;
    }
    if (element.hasAttribute('disabled')) {
      return undefined;
    }
    const xpath = getElementXPath(element, true);
    try {
      const span = this._tracer.startSpan(`${EVENT_CLICK_NAME} ${xpath}`, {
        attributes: {
          [AttributeNames.COMPONENT]: this.component,
          [AttributeNames.EVENT_TYPE]: eventName,
          [AttributeNames.TARGET_ELEMENT]: element.tagName,
          [AttributeNames.TARGET_XPATH]: xpath,
          [AttributeNames.HTTP_URL]: window.location.href,
          [AttributeNames.HTTP_USER_AGENT]: navigator.userAgent,
        },
        parent: this._tracer.getCurrentSpan(),
      });

      this._spansData.set(span, {
        taskCount: 0,
      });

      return span;
    } catch (e) {
      this._logger.error(this.component, e);
    }
    return undefined;
  }

  /**
   * Decrement number of tasks that left in zone,
   * This is needed to be able to end span when no more tasks left
   * @param span
   */
  private _decrementTask(span: types.Span) {
    const spanData = this._spansData.get(span);
    if (spanData) {
      spanData.taskCount--;
      if (spanData.taskCount === 0) {
        this._tryToEndSpan(span, spanData.hrTimeLastTimeout);
      }
    }
  }

  /**
   * It gets the element that has been clicked when zone tries to run a new task
   * @param task
   */
  private _getClickedElement(task: AsyncTask): HTMLElement | undefined {
    if (task.eventName === 'click') {
      return task.target;
    }
    return undefined;
  }

  /**
   * Increment number of tasks that are run within the same zone.
   *     This is needed to be able to end span when no more tasks left
   * @param span
   */
  private _incrementTask(span: types.Span) {
    const spanData = this._spansData.get(span);
    if (spanData) {
      spanData.taskCount++;
    }
  }

  /**
   * This patches the addEventListener of HTMLElement to be able to
   * auto instrument the click events
   * This is done when zone is not available
   */
  private _patchElement() {
    const plugin = this;
    return (original: Function) => {
      return function addEventListenerPatched(
        this: HTMLElement,
        type: any,
        listener: any,
        useCapture: any
      ) {
        const patchedListener = (...args: any[]) => {
          const target = this;
          const span = plugin._createSpan(target, 'click');
          if (span) {
            return plugin._tracer.withSpan(span, () => {
              const result = listener.apply(target, args);
              // no zone so end span immediately
              span.end();
              return result;
            });
          } else {
            return listener.apply(target, args);
          }
        };
        return original.call(this, type, patchedListener, useCapture);
      };
    };
  }

  /**
   * Patches the history api
   */
  _patchHistoryApi() {
    this._unpatchHistoryApi();

    shimmer.wrap(history, 'replaceState', this._patchHistoryMethod());
    shimmer.wrap(history, 'pushState', this._patchHistoryMethod());
    shimmer.wrap(history, 'back', this._patchHistoryMethod());
    shimmer.wrap(history, 'forward', this._patchHistoryMethod());
    shimmer.wrap(history, 'go', this._patchHistoryMethod());
  }

  /**
   * Patches the certain history api method
   */
  _patchHistoryMethod() {
    const plugin = this;
    return (original: any) => {
      return function patchHistoryMethod(this: History, ...args: unknown[]) {
        const url = `${location.pathname}${location.hash}${location.search}`;
        const result = original.apply(this, args);
        const urlAfter = `${location.pathname}${location.hash}${location.search}`;
        if (url !== urlAfter) {
          plugin._updateInteractionName(urlAfter);
        }
        return result;
      };
    };
  }

  /**
   * unpatch the history api methods
   */
  _unpatchHistoryApi() {
    if (isWrapped(history.replaceState))
      shimmer.unwrap(history, 'replaceState');
    if (isWrapped(history.pushState)) shimmer.unwrap(history, 'pushState');
    if (isWrapped(history.back)) shimmer.unwrap(history, 'back');
    if (isWrapped(history.forward)) shimmer.unwrap(history, 'forward');
    if (isWrapped(history.go)) shimmer.unwrap(history, 'go');
  }

  /**
   * Updates interaction span name
   * @param url
   */
  _updateInteractionName(url: string) {
    const span: types.Span | undefined = this._tracer.getCurrentSpan();
    if (span && typeof span.updateName === 'function') {
      span.updateName(`${EVENT_NAVIGATION_NAME} ${url}`);
    }
  }

  /**
   * Patches zone cancel task - this is done to be able to correctly
   * decrement the number of remaining tasks
   */
  private _patchZoneCancelTask() {
    const plugin = this;
    return (original: any) => {
      return function patchCancelTask<T extends Task>(
        this: Zone,
        task: AsyncTask
      ) {
        const currentZone = Zone.current;
        const currentSpan = currentZone.get(ZONE_SCOPE_KEY);
        if (currentSpan && plugin._shouldCountTask(task, currentZone)) {
          plugin._decrementTask(currentSpan);
        }
        return original.call(this, task) as T;
      };
    };
  }

  /**
   * Patches zone schedule task - this is done to be able to correctly
   * increment the number of tasks running within current zone but also to
   * save time in case of timeout running from xhr plugin when waiting for
   * main request from PerformanceResourceTiming
   */
  private _patchZoneScheduleTask() {
    const plugin = this;
    return (original: any) => {
      return function patchScheduleTask<T extends Task>(
        this: Zone,
        task: AsyncTask
      ) {
        const currentZone = Zone.current;
        const currentSpan: types.Span = currentZone.get(ZONE_SCOPE_KEY);
        if (currentSpan && plugin._shouldCountTask(task, currentZone)) {
          plugin._incrementTask(currentSpan);
          plugin._checkForTimeout(task, currentSpan);
        }
        return original.call(this, task) as T;
      };
    };
  }

  /**
   * Patches zone run task - this is done to be able to create a span when
   * user interaction starts
   * @private
   */
  private _patchZoneRunTask() {
    const plugin = this;
    return (original: RunTaskFunction): RunTaskFunction => {
      return function patchRunTask(
        this: Zone,
        task: AsyncTask,
        applyThis?: any,
        applyArgs?: any
      ): Zone {
        const target: HTMLElement | undefined = plugin._getClickedElement(task);
        let span: types.Span | undefined;
        if (target) {
          span = plugin._createSpan(target, 'click');
          if (span) {
            plugin._incrementTask(span);
            try {
              return plugin._tracer.withSpan(span, () => {
                const currentZone = Zone.current;
                task._zone = currentZone;
                return original.call(currentZone, task, applyThis, applyArgs);
              });
            } finally {
              plugin._decrementTask(span);
            }
          }
        } else {
          span = this.get(ZONE_SCOPE_KEY);
        }

        try {
          return original.call(this, task, applyThis, applyArgs);
        } finally {
          if (span && plugin._shouldCountTask(task, Zone.current)) {
            plugin._decrementTask(span);
          }
        }
      };
    };
  }

  /**
   * Decides if task should be counted.
   * @param task
   * @param currentZone
   * @private
   */
  private _shouldCountTask(task: AsyncTask, currentZone: Zone): boolean {
    if (task._zone) {
      currentZone = task._zone;
    }
    if (!currentZone || !task.data || task.data.isPeriodic) {
      return false;
    }
    const currentSpan = currentZone.get(ZONE_SCOPE_KEY);
    if (!currentSpan) {
      return false;
    }
    if (!this._spansData.get(currentSpan)) {
      return false;
    }
    return task.type === 'macroTask' || task.type === 'microTask';
  }

  /**
   * Will try to end span when such span still exists.
   * @param span
   * @param endTime
   * @private
   */
  private _tryToEndSpan(span: types.Span, endTime?: types.HrTime) {
    if (span) {
      const spanData = this._spansData.get(span);
      if (spanData) {
        span.end(endTime);
        this._spansData.delete(span);
      }
    }
  }

  /**
   * implements patch function
   */
  protected patch() {
    const ZoneWithPrototype = this.getZoneWithPrototype();
    this._logger.debug(
      'applying patch to',
      this.moduleName,
      this.version,
      'zone:',
      !!ZoneWithPrototype
    );
    if (ZoneWithPrototype) {
      if (isWrapped(ZoneWithPrototype.prototype.runTask)) {
        shimmer.unwrap(ZoneWithPrototype.prototype, 'runTask');
        this._logger.debug('removing previous patch from method runTask');
      }
      if (isWrapped(ZoneWithPrototype.prototype.scheduleTask)) {
        shimmer.unwrap(ZoneWithPrototype.prototype, 'scheduleTask');
        this._logger.debug('removing previous patch from method scheduleTask');
      }
      if (isWrapped(ZoneWithPrototype.prototype.cancelTask)) {
        shimmer.unwrap(ZoneWithPrototype.prototype, 'cancelTask');
        this._logger.debug('removing previous patch from method cancelTask');
      }

      this._zonePatched = true;
      shimmer.wrap(
        ZoneWithPrototype.prototype,
        'runTask',
        this._patchZoneRunTask()
      );
      shimmer.wrap(
        ZoneWithPrototype.prototype,
        'scheduleTask',
        this._patchZoneScheduleTask()
      );
      shimmer.wrap(
        ZoneWithPrototype.prototype,
        'cancelTask',
        this._patchZoneCancelTask()
      );
    } else {
      this._zonePatched = false;
      if (isWrapped(HTMLElement.prototype.addEventListener)) {
        shimmer.unwrap(HTMLElement.prototype, 'addEventListener');
        this._logger.debug(
          'removing previous patch from method addEventListener'
        );
      }
      shimmer.wrap(
        HTMLElement.prototype,
        'addEventListener',
        this._patchElement()
      );
    }

    this._patchHistoryApi();
    return this._moduleExports;
  }

  /**
   * implements unpatch function
   */
  protected unpatch() {
    const ZoneWithPrototype = this.getZoneWithPrototype();
    this._logger.debug(
      'removing patch from',
      this.moduleName,
      this.version,
      'zone:',
      !!ZoneWithPrototype
    );
    if (ZoneWithPrototype && this._zonePatched) {
      shimmer.unwrap(ZoneWithPrototype.prototype, 'runTask');
      shimmer.unwrap(ZoneWithPrototype.prototype, 'scheduleTask');
      shimmer.unwrap(ZoneWithPrototype.prototype, 'cancelTask');
    } else {
      shimmer.unwrap(HTMLElement.prototype, 'addEventListener');
    }
    this._unpatchHistoryApi();
  }

  /**
   * returns Zone
   */
  getZoneWithPrototype(): ZoneTypeWithPrototype | undefined {
    const _window: WindowWithZone = (window as unknown) as WindowWithZone;
    return _window.Zone;
  }
}
