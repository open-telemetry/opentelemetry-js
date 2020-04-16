/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { BasePlugin, hrTime } from '@opentelemetry/core';
import { Attributes } from '@opentelemetry/api';
import * as express from 'express';
import * as core from 'express-serve-static-core';
import * as shimmer from 'shimmer';
import {
  ExpressLayer,
  ExpressRouter,
  AttributeNames,
  PatchedRequest,
  Parameters,
  PathParams,
  _LAYERS_STORE_PROPERTY,
  ExpressPluginConfig,
  ExpressLayerType,
} from './types';
import { getLayerMetadata, storeLayerPath, isLayerIgnored } from './utils';
import { VERSION } from './version';

/**
 * This symbol is used to mark express layer as being already instrumented
 * since its possible to use a given layer multiple times (ex: middlewares)
 */
export const kLayerPatched: unique symbol = Symbol('express-layer-patched');

/** Express instrumentation plugin for OpenTelemetry */
export class ExpressPlugin extends BasePlugin<typeof express> {
  static readonly component = 'express';
  readonly supportedVersions = ['^4.0.0'];
  protected _config!: ExpressPluginConfig;

  constructor(readonly moduleName: string) {
    super('@opentelemetry/plugin-express', VERSION);
  }

  /**
   * Patches Express operations.
   */
  protected patch() {
    this._logger.debug('Patching Express');

    if (this._moduleExports === undefined || this._moduleExports === null) {
      return this._moduleExports;
    }
    const routerProto = (this._moduleExports
      .Router as unknown) as express.Router;

    this._logger.debug('patching express.Router.prototype.route');
    shimmer.wrap(routerProto, 'route', this._getRoutePatch.bind(this));

    this._logger.debug('patching express.Router.prototype.use');
    shimmer.wrap(routerProto, 'use', this._getRouterUsePatch.bind(this));

    this._logger.debug('patching express.Application.use');
    shimmer.wrap(
      this._moduleExports.application,
      'use',
      this._getAppUsePatch.bind(this)
    );

    return this._moduleExports;
  }

  /** Unpatches all Express patched functions. */
  unpatch(): void {
    const routerProto = (this._moduleExports
      .Router as unknown) as express.Router;
    shimmer.unwrap(routerProto, 'use');
    shimmer.unwrap(routerProto, 'route');
    shimmer.unwrap(this._moduleExports.application, 'use');
  }

  /**
   * Get the patch for Router.route function
   * @param original
   */
  private _getRoutePatch(original: (path: PathParams) => express.IRoute) {
    const plugin = this;
    return function route_trace(
      this: ExpressRouter,
      ...args: Parameters<typeof original>
    ) {
      const route = original.apply(this, args);
      const layer = this.stack[this.stack.length - 1] as ExpressLayer;
      plugin._applyPatch(
        layer,
        typeof args[0] === 'string' ? args[0] : undefined
      );
      return route;
    };
  }

  /**
   * Get the patch for Router.use function
   * @param original
   */
  private _getRouterUsePatch(
    original: express.IRouterHandler<express.Router> &
      express.IRouterMatcher<express.Router>
  ) {
    const plugin = this;
    return function use(
      this: express.Application,
      ...args: Parameters<typeof original>
    ) {
      const route = original.apply(this, args);
      const layer = this.stack[this.stack.length - 1] as ExpressLayer;
      plugin._applyPatch(
        layer,
        typeof args[0] === 'string' ? args[0] : undefined
      );
      return route;
      // tslint:disable-next-line:no-any
    } as any;
  }

  /**
   * Get the patch for Application.use function
   * @param original
   */
  private _getAppUsePatch(
    original: core.ApplicationRequestHandler<express.Application>
  ) {
    const plugin = this;
    return function use(
      this: { _router: ExpressRouter },
      ...args: Parameters<typeof original>
    ) {
      const route = original.apply(this, args);
      const layer = this._router.stack[this._router.stack.length - 1];
      plugin._applyPatch(
        layer,
        typeof args[0] === 'string' ? args[0] : undefined
      );
      return route;
      // tslint:disable-next-line:no-any
    } as any;
  }

  /** Patch each express layer to create span and propagate context */
  private _applyPatch(layer: ExpressLayer, layerPath?: string) {
    const plugin = this;
    if (layer[kLayerPatched] === true) return;
    layer[kLayerPatched] = true;
    this._logger.debug('patching express.Router.Layer.handle');
    shimmer.wrap(layer, 'handle', function(original: Function) {
      if (original.length === 4) return original;

      return function(
        this: ExpressLayer,
        req: PatchedRequest,
        res: express.Response,
        next: express.NextFunction
      ) {
        storeLayerPath(req, layerPath);
        const route = (req[_LAYERS_STORE_PROPERTY] as string[]).join('');
        const attributes: Attributes = {
          [AttributeNames.COMPONENT]: ExpressPlugin.component,
          [AttributeNames.HTTP_ROUTE]: route.length > 0 ? route : undefined,
        };
        const metadata = getLayerMetadata(layer, layerPath);
        const type = metadata.attributes[
          AttributeNames.EXPRESS_TYPE
        ] as ExpressLayerType;
        // verify against the config if the layer should be ignored
        if (isLayerIgnored(metadata.name, type, plugin._config)) {
          return original.apply(this, arguments);
        }
        const span = plugin._tracer.startSpan(metadata.name, {
          attributes: Object.assign(attributes, metadata.attributes),
        });
        const startTime = hrTime();
        let spanHasEnded: boolean = false;
        // If we found anything that isnt a middleware, there no point of measuring
        // stheir time ince they dont have callback.
        if (
          metadata.attributes[AttributeNames.EXPRESS_TYPE] !==
          ExpressLayerType.MIDDLEWARE
        ) {
          span.end(startTime);
          spanHasEnded = true;
        }
        // verify we have a callback
        const args = Array.from(arguments);
        const callbackIdx = args.findIndex(arg => typeof arg === 'function');
        if (callbackIdx >= 0) {
          arguments[callbackIdx] = function() {
            if (spanHasEnded === false) {
              span.end();
              spanHasEnded = true;
            }
            if (!(req.route && arguments[0] instanceof Error)) {
              (req[_LAYERS_STORE_PROPERTY] as string[]).pop();
            }
            const callback = args[callbackIdx] as Function;
            return plugin._tracer.bind(callback).apply(this, arguments);
          };
        }
        const result = original.apply(this, arguments);
        // If the callback is never called, we need to close the span.
        setImmediate(() => {
          if (spanHasEnded === false) {
            span.end(startTime);
          }
        }).unref();
        return result;
      };
    });
  }
}

export const plugin = new ExpressPlugin(ExpressPlugin.component);
