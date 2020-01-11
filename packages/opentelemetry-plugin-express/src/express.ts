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

// mongodb.Server type is deprecated so every use trigger a lint error
/* tslint:disable:deprecation */

import { BasePlugin } from '@opentelemetry/core';
import { CanonicalCode, Span, Attributes } from '@opentelemetry/types';
import * as express from 'express';
import * as shimmer from 'shimmer';
import {
  ExpressLayer,
  ExpressRouter,
  AttributeNames,
  PatchedRequest,
} from './types';
import { VERSION } from './version';

export const kPatched: unique symbol = Symbol('express-layer-patched');

/** Express instrumentation plugin for OpenTelemetry */
export class ExpressPlugin extends BasePlugin<typeof express> {
  private readonly _COMPONENT = 'express';

  readonly supportedVersions = ['^4.0.0'];

  constructor(readonly moduleName: string) {
    super('@opentelemetry/plugin-express', VERSION);
  }

  /**
   * Patches Express operations.
   */
  protected patch() {
    this._logger.debug('Patching Express');

    if (this._moduleExports) {
      const routerProto = (this._moduleExports
        .Router as unknown) as express.Router;
      const plugin = this;

      this._logger.debug('patching express.Router.prototype.route');
      shimmer.wrap(routerProto, 'route', (original: Function) => {
        return function route_trace(
          this: ExpressRouter,
          arg: string | Function
        ) {
          const route = original.apply(this, arguments);
          const layer = this.stack[this.stack.length - 1] as ExpressLayer;
          plugin._applyPatch(layer, typeof arg === 'string' ? arg : undefined);
          return route;
          // tslint:disable-next-line:no-any
        } as any;
      });
      this._logger.debug('patching express.Router.prototype.use');
      shimmer.wrap(routerProto, 'use', (original: Function) => {
        return function use(this: express.Application, arg: string | Function) {
          const route = original.apply(this, arguments);
          const layer = this.stack[this.stack.length - 1] as ExpressLayer;
          plugin._applyPatch(layer, typeof arg === 'string' ? arg : undefined);
          return route;
          // tslint:disable-next-line:no-any
        } as any;
      });
      this._logger.debug('patching express.Application.use');
      shimmer.wrap(
        this._moduleExports.application,
        'use',
        (original: Function) => {
          return function use(
            this: { _router: ExpressRouter },
            arg: string | Function
          ) {
            const route = original.apply(this, arguments);
            const layer = this._router.stack[this._router.stack.length - 1];
            plugin._applyPatch(
              layer,
              typeof arg === 'string' ? arg : undefined
            );
            return route;
            // tslint:disable-next-line:no-any
          } as any;
        }
      );
    }

    return this._moduleExports;
  }

  /** Unpatches all MongoDB patched functions. */
  unpatch(): void {
    shimmer.unwrap(this._moduleExports.Router.prototype, 'use');
    shimmer.unwrap(this._moduleExports.Router.prototype, 'route');
    shimmer.unwrap(this._moduleExports.application, 'use');
  }

  /**
   * Store layers path in the request to be able to construct route later
   * @param request The request where
   * @param value the value to push into the array
   */
  private _storeLayerPath(request: PatchedRequest, value?: string) {
    if (Array.isArray(request.__ot_middlewares) === false) {
      Object.defineProperty(request, '__ot_middlewares', {
        enumerable: false,
        value: [],
      });
    }
    if (value === undefined) return;
    (request.__ot_middlewares as string[]).push(value);
  }

  /** Creates spans for Cursor operations */
  private _applyPatch(layer: ExpressLayer, layerPath?: string) {
    const plugin = this;
    if (layer[kPatched] === true) return;
    layer[kPatched] = true;
    this._logger.debug('patching express.Router.Layer.handle');
    shimmer.wrap(layer, 'handle', function(original: Function) {
      if (original.length === 4) return original;

      return function(
        this: ExpressLayer,
        req: PatchedRequest,
        res: express.Response,
        next: express.NextFunction
      ) {
        plugin._storeLayerPath(req, layerPath);
        const route = (req.__ot_middlewares as string[]).join('');
        const attributes: Attributes = {
          [AttributeNames.COMPONENT]: plugin._COMPONENT,
          [AttributeNames.HTTP_ROUTE]: route.length > 0 ? route : undefined,
        };
        let spanName = '';
        if (layer.name === 'router') {
          spanName = `express router - ${layerPath}`;
          attributes[AttributeNames.EXPRESS_NAME] = layerPath;
          attributes[AttributeNames.EXPRESS_TYPE] = 'router';
        } else if (layer.name === 'bound dispatch') {
          spanName = `express request handler`;
          attributes[AttributeNames.EXPRESS_TYPE] = 'request_handler';
        } else {
          spanName = `express middleware - ${layer.name}`;
          attributes[AttributeNames.EXPRESS_NAME] = layer.name;
          attributes[AttributeNames.EXPRESS_TYPE] = 'middleware';
        }
        const span = plugin._tracer.startSpan(spanName, {
          parent: plugin._tracer.getCurrentSpan(),
          attributes,
        });
        // if we cant create a span, abort
        if (span === null) return original.apply(this, arguments);
        // verify we have a callback
        let callbackIdx = Array.from(arguments).findIndex(
          arg => typeof arg === 'function'
        );
        let callbackHasBeenCalled = false;
        if (callbackIdx >= 0) {
          arguments[callbackIdx] = function() {
            callbackHasBeenCalled = true;
            if (!(req.route && arguments[0] instanceof Error)) {
              (req.__ot_middlewares as string[]).pop();
            }
            return plugin._patchEnd(span, plugin._tracer.bind(next))();
          };
        }
        const result = original.apply(this, arguments);
        // if the layer return a response, the callback will never
        // be called, so we need to manually close the span
        if (callbackHasBeenCalled === false) {
          span.end();
        }
        return result;
      };
    });
  }

  /**
   * Ends a created span.
   * @param span The created span to end.
   * @param resultHandler A callback function.
   */
  private _patchEnd(span: Span, resultHandler: Function): Function {
    return function patchedEnd(this: {}, ...args: unknown[]) {
      const error = args[0];
      if (error instanceof Error) {
        span.setStatus({
          code: CanonicalCode.INTERNAL,
          message: error.message,
        });
      } else {
        span.setStatus({
          code: CanonicalCode.OK,
        });
      }
      span.end();
      return resultHandler.apply(this, args);
    };
  }
}

export const plugin = new ExpressPlugin('express');
