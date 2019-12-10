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
  isUrlIgnored,
  isWrapped,
  otperformance,
  urlMatches,
} from '@opentelemetry/core';
import * as tracing from '@opentelemetry/tracing';
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
  private _usedResources: { [key: string]: PerformanceResourceTiming[] } = {};

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
  private _addHeaders(xhr: XMLHttpRequest, span: types.Span) {
    let propagateTraceHeaderUrls =
      this._config.propagateTraceHeaderCorsUrls || [];
    if (
      typeof propagateTraceHeaderUrls === 'string' ||
      propagateTraceHeaderUrls instanceof RegExp
    ) {
      propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
    }

    const url = (span as tracing.Span).name;
    const spanUrl = parseUrl(url);
    let addHeaderOnDifferentOrigin = false;

    if (spanUrl.origin !== window.location.origin) {
      for (const propagateTraceHeaderUrl of propagateTraceHeaderUrls) {
        if (urlMatches(url, propagateTraceHeaderUrl)) {
          addHeaderOnDifferentOrigin = true;
          break;
        }
      }
      if (!addHeaderOnDifferentOrigin) {
        this._logger.warn('Cannot set headers on different origin');
        return;
      }
    }
    const headers: { [key: string]: unknown } = {};
    this._tracer
      .getHttpTextFormat()
      .inject(span.context(), Format.HTTP, headers);

    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, String(headers[key]));
    });
  }

  private _addChildSpan(
    span: tracing.Span,
    corsPreFlightRequest: PerformanceResourceTiming
  ): void {
    const childSpan = this._tracer.startSpan('CORS Preflight', {
      startTime: corsPreFlightRequest[PTN.FETCH_START],
      parent: span,
    }) as tracing.Span;
    this._addSpanNetworkEvents(childSpan, corsPreFlightRequest);
    childSpan.end(corsPreFlightRequest[PTN.RESPONSE_END]);
  }

  /**
   * Adds Network events to the span
   * @param span
   * @param resource
   * @private
   */
  private _addSpanNetworkEvents(
    span: tracing.Span,
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
      this._usedResources = {};
    }
  }

  /**
   * Finds appropriate resource and add network events to the span
   * @param span
   */
  private _findResourceAndAddNetworkEvents(
    span: tracing.Span,
    maybeCors: PerformanceResourceTiming[] = []
  ) {
    const resources: PerformanceResourceTiming[] = otperformance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    const resource = getResource(
      span,
      EventNames.METHOD_SEND,
      resources,
      this._usedResources[span.name],
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
  ): tracing.Span | undefined {
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
    }) as tracing.Span;

    currentSpan.addEvent(EventNames.METHOD_OPEN);

    this._xhrMem.set(xhr, {
      span: currentSpan,
    });

    this._cleanPreviousSpanInformation(xhr);

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
    const name = resource.name;
    if (!this._usedResources[name]) {
      this._usedResources[name] = [];
    }
    this._usedResources[name].push(resource);
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
        entries = resourcesCreatedInTheMiddle.entries.slice();
      }
      if (typeof callbackToRemoveEvents === 'function') {
        callbackToRemoveEvents();
      }
      const currentSpan = xhrMem.span;
      if (currentSpan) {
        plugin._findResourceAndAddNetworkEvents(currentSpan, entries);
        currentSpan.addEvent(eventName);

        const url = currentSpan.attributes[AttributeNames.HTTP_URL];
        if (typeof url === 'string') {
          const parsedUrl = parseUrl(url);

          currentSpan.setAttribute(AttributeNames.HTTP_STATUS_CODE, xhr.status);
          currentSpan.setAttribute(
            AttributeNames.HTTP_STATUS_TEXT,
            xhr.statusText
          );
          currentSpan.setAttribute(AttributeNames.HTTP_HOST, parsedUrl.host);
          currentSpan.setAttribute(
            AttributeNames.HTTP_SCHEME,
            parsedUrl.protocol.replace(':', '')
          );

          // @TODO do we want to collect this or it will be collected earlier once only or
          //    maybe when parent span is not available ?
          currentSpan.setAttribute(
            AttributeNames.HTTP_USER_AGENT,
            navigator.userAgent
          );
        }

        currentSpan.end();
        plugin._tasksCount--;
      }
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
        delete xhrMem.callbackToRemoveEvents;
      }
    }

    return (original: SendFunction): SendFunction => {
      return function patchSend(this: XMLHttpRequest, body?: SendBody): void {
        const xhrMem = plugin._xhrMem.get(this);
        if (!xhrMem) {
          return;
        }
        const currentSpan: types.Span = xhrMem.span;

        if (currentSpan) {
          plugin._tasksCount++;
          currentSpan.addEvent(EventNames.METHOD_SEND);
          const spanName = (currentSpan as tracing.Span).name;

          this.addEventListener('load', onLoad);
          this.addEventListener('error', onError);
          this.addEventListener('timeout', onTimeout);

          xhrMem.callbackToRemoveEvents = () => {
            unregister(this);
            if (xhrMem.resourcesCreatedInTheMiddle) {
              xhrMem.resourcesCreatedInTheMiddle.observer.disconnect();
              delete xhrMem.resourcesCreatedInTheMiddle;
            }
          };
          plugin._addHeaders(this, currentSpan);
          plugin._addPossibleCorsPreflightResourceObserver(this, spanName);
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
  }
}
