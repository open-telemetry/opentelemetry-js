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

import * as api from '@opentelemetry/api';
import {
  AttributeNames,
  BasePlugin,
  hrTime,
  isUrlIgnored,
  isWrapped,
  otperformance,
  urlMatches,
} from '@opentelemetry/core';
import {
  addSpanNetworkEvent,
  getResource,
  parseUrl,
  PerformanceTimingNames as PTN,
} from '@opentelemetry/web';
import * as shimmer from 'shimmer';
import { EventNames } from './enums/EventNames';
import {
  OpenFunction,
  PropagateTraceHeaderCorsUrls,
  SendFunction,
  XhrMem,
} from './types';
import { VERSION } from './version';

// how long to wait for observer to collect information about resources
// this is needed as event "load" is called before observer
// hard to say how long it should really wait, seems like 300ms is
// safe enough
const OBSERVER_WAIT_TIME_MS = 300;

/**
 * XMLHttpRequest config
 */
export interface XMLHttpRequestPluginConfig extends api.PluginConfig {
  // the number of timing resources is limited, after the limit
  // (chrome 250, safari 150) the information is not collected anymore
  // the only way to prevent that is to regularly clean the resources
  // whenever it is possible, this is needed only when PerformanceObserver
  // is not available
  clearTimingResources?: boolean;
  // urls which should include trace headers when origin doesn't match
  propagateTraceHeaderCorsUrls?: PropagateTraceHeaderCorsUrls;
}

/**
 * This class represents a XMLHttpRequest plugin for auto instrumentation
 */
export class XMLHttpRequestPlugin extends BasePlugin<XMLHttpRequest> {
  readonly component: string = 'xml-http-request';
  readonly version: string = VERSION;
  moduleName = this.component;

  private _tasksCount = 0;
  private _xhrMem = new WeakMap<XMLHttpRequest, XhrMem>();
  private _usedResources = new WeakSet<PerformanceResourceTiming>();

  constructor(protected _config: XMLHttpRequestPluginConfig = {}) {
    super('@opentelemetry/plugin-xml-http-request', VERSION);
  }

  /**
   * Adds custom headers to XMLHttpRequest
   * @param xhr
   * @param span
   * @private
   */
  private _addHeaders(xhr: XMLHttpRequest, spanUrl: string) {
    if (!this._shouldPropagateTraceHeaders(spanUrl)) {
      return;
    }
    const headers: { [key: string]: unknown } = {};
    api.propagation.inject(headers);
    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, String(headers[key]));
    });
  }

  /**
   * checks if trace headers should be propagated
   * @param spanUrl
   * @private
   */
  _shouldPropagateTraceHeaders(spanUrl: string) {
    let propagateTraceHeaderUrls =
      this._config.propagateTraceHeaderCorsUrls || [];
    if (
      typeof propagateTraceHeaderUrls === 'string' ||
      propagateTraceHeaderUrls instanceof RegExp
    ) {
      propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
    }
    const parsedSpanUrl = parseUrl(spanUrl);

    if (parsedSpanUrl.origin === window.location.origin) {
      return true;
    } else {
      for (const propagateTraceHeaderUrl of propagateTraceHeaderUrls) {
        if (urlMatches(spanUrl, propagateTraceHeaderUrl)) {
          return true;
        }
      }
      return false;
    }
  }

  /**
   * Add cors pre flight child span
   * @param span
   * @param corsPreFlightRequest
   * @private
   */
  private _addChildSpan(
    span: api.Span,
    corsPreFlightRequest: PerformanceResourceTiming
  ): void {
    this._tracer.withSpan(span, () => {
      const childSpan = this._tracer.startSpan('CORS Preflight', {
        startTime: corsPreFlightRequest[PTN.FETCH_START],
      });
      this._addSpanNetworkEvents(childSpan, corsPreFlightRequest);
      childSpan.end(corsPreFlightRequest[PTN.RESPONSE_END]);
    });
  }

  /**
   * Add attributes when span is going to end
   * @param span
   * @param xhr
   * @param spanUrl
   * @private
   */
  _addFinalSpanAttributes(span: api.Span, xhrMem: XhrMem, spanUrl?: string) {
    if (typeof spanUrl === 'string') {
      const parsedUrl = parseUrl(spanUrl);

      span.setAttribute(AttributeNames.HTTP_STATUS_CODE, xhrMem.status);
      span.setAttribute(AttributeNames.HTTP_STATUS_TEXT, xhrMem.statusText);
      span.setAttribute(AttributeNames.HTTP_HOST, parsedUrl.host);
      span.setAttribute(
        AttributeNames.HTTP_SCHEME,
        parsedUrl.protocol.replace(':', '')
      );

      // @TODO do we want to collect this or it will be collected earlier once only or
      //    maybe when parent span is not available ?
      span.setAttribute(AttributeNames.HTTP_USER_AGENT, navigator.userAgent);
    }
  }

  /**
   * Adds Network events to the span
   * @param span
   * @param resource
   * @private
   */
  private _addSpanNetworkEvents(
    span: api.Span,
    resource: PerformanceResourceTiming
  ) {
    addSpanNetworkEvent(span, PTN.FETCH_START, resource);
    addSpanNetworkEvent(span, PTN.DOMAIN_LOOKUP_START, resource);
    addSpanNetworkEvent(span, PTN.DOMAIN_LOOKUP_END, resource);
    addSpanNetworkEvent(span, PTN.CONNECT_START, resource);
    addSpanNetworkEvent(span, PTN.SECURE_CONNECTION_START, resource);
    addSpanNetworkEvent(span, PTN.CONNECT_END, resource);
    addSpanNetworkEvent(span, PTN.REQUEST_START, resource);
    addSpanNetworkEvent(span, PTN.RESPONSE_START, resource);
    addSpanNetworkEvent(span, PTN.RESPONSE_END, resource);
  }

  /**
   * will collect information about all resources created
   * between "send" and "end" with additional waiting for main resource
   * @param xhr
   * @param spanUrl
   * @private
   */
  private _addResourceObserver(xhr: XMLHttpRequest, spanUrl: string) {
    const xhrMem = this._xhrMem.get(xhr);
    if (!xhrMem || typeof window.PerformanceObserver === 'undefined') {
      return;
    }
    xhrMem.createdResources = {
      observer: new PerformanceObserver(list => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        entries.forEach(entry => {
          if (
            entry.initiatorType === 'xmlhttprequest' &&
            entry.name === spanUrl
          ) {
            if (xhrMem.createdResources) {
              xhrMem.createdResources.entries.push(entry);
            }
          }
        });
      }),
      entries: [],
    };
    xhrMem.createdResources.observer.observe({
      entryTypes: ['resource'],
    });
  }

  /**
   * Clears the resource timings and all resources assigned with spans
   *     when {@link XMLHttpRequestPluginConfig.clearTimingResources} is
   *     set to true (default false)
   * @private
   */
  private _clearResources() {
    if (this._tasksCount === 0 && this._config.clearTimingResources) {
      ((otperformance as unknown) as Performance).clearResourceTimings();
      this._xhrMem = new WeakMap<XMLHttpRequest, XhrMem>();
      this._usedResources = new WeakSet<PerformanceResourceTiming>();
    }
  }

  /**
   * Finds appropriate resource and add network events to the span
   * @param span
   */
  private _findResourceAndAddNetworkEvents(
    xhrMem: XhrMem,
    span: api.Span,
    spanUrl?: string,
    startTime?: api.HrTime,
    endTime?: api.HrTime
  ): void {
    if (!spanUrl || !startTime || !endTime || !xhrMem.createdResources) {
      return;
    }

    let resources: PerformanceResourceTiming[] =
      xhrMem.createdResources.entries;

    if (!resources || !resources.length) {
      // fallback - either Observer is not available or it took longer
      // then OBSERVER_WAIT_TIME_MS and observer didn't collect enough
      // information
      resources = otperformance.getEntriesByType(
        // ts thinks this is the perf_hooks module, but it is the browser performance api
        'resource' as any
      ) as PerformanceResourceTiming[];
    }

    const resource = getResource(
      spanUrl,
      startTime,
      endTime,
      resources,
      this._usedResources
    );

    if (resource.mainRequest) {
      const mainRequest = resource.mainRequest;
      this._markResourceAsUsed(mainRequest);

      const corsPreFlightRequest = resource.corsPreFlightRequest;
      if (corsPreFlightRequest) {
        this._addChildSpan(span, corsPreFlightRequest);
        this._markResourceAsUsed(corsPreFlightRequest);
      }
      this._addSpanNetworkEvents(span, mainRequest);
    }
  }

  /**
   * Removes the previous information about span.
   * This might happened when the same xhr is used again.
   * @param xhr
   * @private
   */
  private _cleanPreviousSpanInformation(xhr: XMLHttpRequest) {
    const xhrMem = this._xhrMem.get(xhr);
    if (xhrMem) {
      const callbackToRemoveEvents = xhrMem.callbackToRemoveEvents;
      if (callbackToRemoveEvents) {
        callbackToRemoveEvents();
      }
      this._xhrMem.delete(xhr);
    }
  }

  /**
   * Creates a new span when method "open" is called
   * @param xhr
   * @param url
   * @param method
   * @private
   */
  private _createSpan(
    xhr: XMLHttpRequest,
    url: string,
    method: string
  ): api.Span | undefined {
    if (isUrlIgnored(url, this._config.ignoreUrls)) {
      this._logger.debug('ignoring span as url matches ignored url');
      return;
    }

    const currentSpan = this._tracer.startSpan(url, {
      kind: api.SpanKind.CLIENT,
      attributes: {
        [AttributeNames.COMPONENT]: this.component,
        [AttributeNames.HTTP_METHOD]: method,
        [AttributeNames.HTTP_URL]: url,
      },
    });

    currentSpan.addEvent(EventNames.METHOD_OPEN);

    this._cleanPreviousSpanInformation(xhr);

    this._xhrMem.set(xhr, {
      span: currentSpan,
      spanUrl: url,
    });

    return currentSpan;
  }

  /**
   * Marks certain [resource]{@link PerformanceResourceTiming} when information
   * from this is used to add events to span.
   * This is done to avoid reusing the same resource again for next span
   * @param resource
   * @private
   */
  private _markResourceAsUsed(resource: PerformanceResourceTiming) {
    this._usedResources.add(resource);
  }

  /**
   * Patches the method open
   * @private
   */
  protected _patchOpen() {
    return (original: OpenFunction): OpenFunction => {
      const plugin = this;
      return function patchOpen(this: XMLHttpRequest, ...args): void {
        const method: string = args[0];
        const url: string = args[1];
        plugin._createSpan(this, url, method);

        return original.apply(this, args);
      };
    };
  }

  /**
   * Patches the method send
   * @private
   */
  protected _patchSend() {
    const plugin = this;

    function endSpanTimeout(
      eventName: string,
      xhrMem: XhrMem,
      endTime: api.HrTime
    ) {
      const callbackToRemoveEvents = xhrMem.callbackToRemoveEvents;

      if (typeof callbackToRemoveEvents === 'function') {
        callbackToRemoveEvents();
      }

      const { span, spanUrl, sendStartTime } = xhrMem;

      if (span) {
        plugin._findResourceAndAddNetworkEvents(
          xhrMem,
          span,
          spanUrl,
          sendStartTime,
          endTime
        );
        span.addEvent(eventName, endTime);
        plugin._addFinalSpanAttributes(span, xhrMem, spanUrl);
        span.end(endTime);
        plugin._tasksCount--;
      }
      plugin._clearResources();
    }

    function endSpan(eventName: string, xhr: XMLHttpRequest) {
      const xhrMem = plugin._xhrMem.get(xhr);
      if (!xhrMem) {
        return;
      }
      xhrMem.status = xhr.status;
      xhrMem.statusText = xhr.statusText;
      plugin._xhrMem.delete(xhr);
      const endTime = hrTime();

      // the timeout is needed as observer doesn't have yet information
      // when event "load" is called. Also the time may differ depends on
      // browser and speed of computer
      setTimeout(() => {
        endSpanTimeout(eventName, xhrMem, endTime);
      }, OBSERVER_WAIT_TIME_MS);
    }

    function onError(this: XMLHttpRequest) {
      endSpan(EventNames.EVENT_ERROR, this);
    }

    function onAbort(this: XMLHttpRequest) {
      endSpan(EventNames.EVENT_ABORT, this);
    }

    function onTimeout(this: XMLHttpRequest) {
      endSpan(EventNames.EVENT_TIMEOUT, this);
    }

    function onLoad(this: XMLHttpRequest) {
      if (this.status < 299) {
        endSpan(EventNames.EVENT_LOAD, this);
      } else {
        endSpan(EventNames.EVENT_ERROR, this);
      }
    }

    function unregister(xhr: XMLHttpRequest) {
      xhr.removeEventListener('abort', onAbort);
      xhr.removeEventListener('error', onError);
      xhr.removeEventListener('load', onLoad);
      xhr.removeEventListener('timeout', onTimeout);
      const xhrMem = plugin._xhrMem.get(xhr);
      if (xhrMem) {
        xhrMem.callbackToRemoveEvents = undefined;
      }
    }

    return (original: SendFunction): SendFunction => {
      return function patchSend(this: XMLHttpRequest, ...args): void {
        const xhrMem = plugin._xhrMem.get(this);
        if (!xhrMem) {
          return original.apply(this, args);
        }
        const currentSpan = xhrMem.span;
        const spanUrl = xhrMem.spanUrl;

        if (currentSpan && spanUrl) {
          plugin._tracer.withSpan(currentSpan, () => {
            plugin._tasksCount++;
            xhrMem.sendStartTime = hrTime();
            currentSpan.addEvent(EventNames.METHOD_SEND);

            this.addEventListener('abort', onAbort);
            this.addEventListener('error', onError);
            this.addEventListener('load', onLoad);
            this.addEventListener('timeout', onTimeout);

            xhrMem.callbackToRemoveEvents = () => {
              unregister(this);
              if (xhrMem.createdResources) {
                xhrMem.createdResources.observer.disconnect();
              }
            };
            plugin._addHeaders(this, spanUrl);
            plugin._addResourceObserver(this, spanUrl);
          });
        }
        return original.apply(this, args);
      };
    };
  }

  /**
   * implements patch function
   */
  protected patch() {
    this._logger.debug('applying patch to', this.moduleName, this.version);

    if (isWrapped(XMLHttpRequest.prototype.open)) {
      shimmer.unwrap(XMLHttpRequest.prototype, 'open');
      this._logger.debug('removing previous patch from method open');
    }

    if (isWrapped(XMLHttpRequest.prototype.send)) {
      shimmer.unwrap(XMLHttpRequest.prototype, 'send');
      this._logger.debug('removing previous patch from method send');
    }

    shimmer.wrap(XMLHttpRequest.prototype, 'open', this._patchOpen());
    shimmer.wrap(XMLHttpRequest.prototype, 'send', this._patchSend());

    return this._moduleExports;
  }

  /**
   * implements unpatch function
   */
  protected unpatch() {
    this._logger.debug('removing patch from', this.moduleName, this.version);

    shimmer.unwrap(XMLHttpRequest.prototype, 'open');
    shimmer.unwrap(XMLHttpRequest.prototype, 'send');

    this._tasksCount = 0;
    this._xhrMem = new WeakMap<XMLHttpRequest, XhrMem>();
    this._usedResources = new WeakSet<PerformanceResourceTiming>();
  }
}
