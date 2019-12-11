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
  BasePlugin,
  hrTime,
  isUrlIgnored,
  isWrapped,
  otperformance,
  urlMatches,
} from '@opentelemetry/core';
import * as types from '@opentelemetry/types';
import {
  addSpanNetworkEvent,
  getResource,
  parseUrl,
  PerformanceTimingNames as PTN,
} from '@opentelemetry/web';
import * as shimmer from 'shimmer';
import { AttributeNames } from './enums/AttributeNames';
import { EventNames } from './enums/EventNames';
import { Format } from './enums/Format';
import {
  OpenFunction,
  PropagateTraceHeaderCorsUrls,
  SendBody,
  SendFunction,
  XhrMem,
} from './types';

/**
 * XMLHttpRequest config
 */
export interface XMLHttpRequestPluginConfig extends types.PluginConfig {
  // urls which should include trace headers when origin doesn't match
  propagateTraceHeaderCorsUrls?: PropagateTraceHeaderCorsUrls;
}

/**
 * This class represents a XMLHttpRequest plugin for auto instrumentation
 */
export class XMLHttpRequestPlugin extends BasePlugin<XMLHttpRequest> {
  readonly component: string = 'xml-http-request';
  // @TODO align this with all packages #600
  readonly version: string = '0.3.0';
  moduleName = this.component;

  protected _config!: XMLHttpRequestPluginConfig;

  private _tasksCount = 0;
  private _xhrMem = new WeakMap<XMLHttpRequest, XhrMem>();
  private _usedResources = new WeakSet<PerformanceResourceTiming>();

  constructor(config: XMLHttpRequestPluginConfig = {}) {
    super();
    this._config = config;
  }

  /**
   * Adds custom headers to XMLHttpRequest
   * @param xhr
   * @param span
   * @private
   */
  private _addHeaders(xhr: XMLHttpRequest, span: types.Span, spanUrl: string) {
    if (!this._shouldPropagateTraceHeaders(spanUrl)) {
      return;
    }
    const headers: { [key: string]: unknown } = {};
    this._tracer
      .getHttpTextFormat()
      .inject(span.context(), Format.HTTP, headers);

    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, String(headers[key]));
    });
  }

  /**
   * checks if trace headers shoudl be propagated
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
      this._logger.warn('Cannot set headers on different origin');
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
    span: types.Span,
    corsPreFlightRequest: PerformanceResourceTiming
  ): void {
    const childSpan = this._tracer.startSpan('CORS Preflight', {
      startTime: corsPreFlightRequest[PTN.FETCH_START],
      parent: span,
    }) as types.Span;
    this._addSpanNetworkEvents(childSpan, corsPreFlightRequest);
    childSpan.end(corsPreFlightRequest[PTN.RESPONSE_END]);
  }

  /**
   * Add attributes when span is going to end
   * @param span
   * @param xhr
   * @param spanUrl
   * @private
   */
  _addFinalSpanAttributes(
    span: types.Span,
    xhr: XMLHttpRequest,
    spanUrl?: string
  ) {
    if (typeof spanUrl === 'string') {
      const parsedUrl = parseUrl(spanUrl);

      span.setAttribute(AttributeNames.HTTP_STATUS_CODE, xhr.status);
      span.setAttribute(AttributeNames.HTTP_STATUS_TEXT, xhr.statusText);
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
    span: types.Span,
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
   * between "send" and "end"
   * @param xhr
   * @param spanName
   * @private
   */
  private _addPossibleCorsPreflightResourceObserver(
    xhr: XMLHttpRequest,
    spanName: string
  ) {
    const xhrMem = this._xhrMem.get(xhr);
    if (!xhrMem) {
      return;
    }
    xhrMem.resourcesCreatedInTheMiddle = {
      observer: new PerformanceObserver(list => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        entries.forEach(entry => {
          if (
            entry.initiatorType === 'xmlhttprequest' &&
            entry.name === spanName
          ) {
            if (xhrMem.resourcesCreatedInTheMiddle) {
              xhrMem.resourcesCreatedInTheMiddle.entries.push(entry);
            }
          }
        });
      }),
      entries: [],
    };
    xhrMem.resourcesCreatedInTheMiddle.observer.observe({
      entryTypes: ['resource'],
    });
  }

  /**
   * clear all resources assigned with spans
   * @private
   */
  private _clearResources() {
    if (this._tasksCount === 0) {
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
    span: types.Span,
    spanUrl?: string,
    startTime?: types.HrTime,
    maybeCors: PerformanceResourceTiming[] = []
  ): void {
    if (!spanUrl || !startTime) {
      return;
    }

    const resources: PerformanceResourceTiming[] = otperformance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    const resource = getResource(
      spanUrl,
      startTime,
      resources,
      this._usedResources,
      maybeCors
    );

    if (resource.mainRequest) {
      const mainRequest = resource.mainRequest;
      this._markResourceAsUsed(mainRequest);

      const corsPreFlightRequest = resource.corsPreFlightRequest;
      if (corsPreFlightRequest) {
        this._addChildSpan(span, corsPreFlightRequest);
        this._markResourceAsUsed(mainRequest);
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
  ): types.Span | undefined {
    if (isUrlIgnored(url, this._config.ignoreUrls)) {
      this._logger.debug('ignoring span as url matches ignored url');
      return;
    }

    const currentSpan = this._tracer.startSpan(url, {
      parent: this._tracer.getCurrentSpan(),
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
      return function patchOpen(
        this: XMLHttpRequest,
        method: string,
        url: string,
        async?: boolean,
        user?: string | null,
        pass?: string | null
      ): void {
        plugin._createSpan(this, url, method);

        return original.call(this, method, url, true, user, pass);
      };
    };
  }

  /**
   * Patches the method send
   * @private
   */
  protected _patchSend() {
    const plugin = this;

    function endSpan(xhr: XMLHttpRequest, eventName: string) {
      const xhrMem = plugin._xhrMem.get(xhr);
      if (!xhrMem) {
        return;
      }
      const callbackToRemoveEvents = xhrMem.callbackToRemoveEvents;

      let resourcesCreatedInTheMiddle = xhrMem.resourcesCreatedInTheMiddle;
      let entries;
      if (resourcesCreatedInTheMiddle) {
        entries = resourcesCreatedInTheMiddle.entries;
      }
      if (typeof callbackToRemoveEvents === 'function') {
        callbackToRemoveEvents();
      }

      const { span, spanUrl, sendStartTime } = xhrMem;

      if (span) {
        plugin._findResourceAndAddNetworkEvents(
          span,
          spanUrl,
          sendStartTime,
          entries
        );
        span.addEvent(eventName);
        plugin._addFinalSpanAttributes(span, xhr, spanUrl);
        span.end();
        plugin._tasksCount--;
      }

      plugin._xhrMem.delete(xhr);
      plugin._clearResources();
    }

    function onError(this: XMLHttpRequest) {
      endSpan(this, EventNames.EVENT_ERROR);
    }

    function onTimeout(this: XMLHttpRequest) {
      endSpan(this, EventNames.EVENT_TIMEOUT);
    }

    function onLoad(this: XMLHttpRequest) {
      if (this.status < 299) {
        endSpan(this, EventNames.EVENT_LOAD);
      } else {
        endSpan(this, EventNames.EVENT_ERROR);
      }
    }

    function unregister(xhr: XMLHttpRequest) {
      xhr.removeEventListener('load', onLoad);
      xhr.removeEventListener('error', onError);
      xhr.removeEventListener('timeout', onTimeout);
      const xhrMem = plugin._xhrMem.get(xhr);
      if (xhrMem) {
        xhrMem.callbackToRemoveEvents = undefined;
      }
    }

    return (original: SendFunction): SendFunction => {
      return function patchSend(this: XMLHttpRequest, body?: SendBody): void {
        const xhrMem = plugin._xhrMem.get(this);
        if (!xhrMem) {
          return;
        }
        const currentSpan = xhrMem.span;
        const spanUrl = xhrMem.spanUrl;

        if (currentSpan && spanUrl) {
          plugin._tasksCount++;
          xhrMem.sendStartTime = hrTime();
          currentSpan.addEvent(EventNames.METHOD_SEND);

          this.addEventListener('load', onLoad);
          this.addEventListener('error', onError);
          this.addEventListener('timeout', onTimeout);

          xhrMem.callbackToRemoveEvents = () => {
            unregister(this);
            if (xhrMem.resourcesCreatedInTheMiddle) {
              xhrMem.resourcesCreatedInTheMiddle.observer.disconnect();
              xhrMem.resourcesCreatedInTheMiddle = undefined;
            }
          };
          plugin._addHeaders(this, currentSpan, spanUrl);
          plugin._addPossibleCorsPreflightResourceObserver(this, spanUrl);
        }
        return original.call(this, body);
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
