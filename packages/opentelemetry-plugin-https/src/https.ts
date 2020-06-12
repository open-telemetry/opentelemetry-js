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

import { HttpPlugin, Func, HttpRequestArgs } from '@opentelemetry/plugin-http';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import * as semver from 'semver';
import * as shimmer from 'shimmer';
import * as utils from './utils';

/**
 * Https instrumentation plugin for Opentelemetry
 */
export class HttpsPlugin extends HttpPlugin {
  /** Constructs a new HttpsPlugin instance. */
  constructor(readonly version: string) {
    super('https', version);
  }

  /**
   * Patches HTTPS incoming and outcoming request functions.
   */
  protected patch() {
    this._logger.debug(
      'applying patch to %s@%s',
      this.moduleName,
      this.version
    );

    if (
      this._moduleExports &&
      this._moduleExports.Server &&
      this._moduleExports.Server.prototype
    ) {
      shimmer.wrap(
        this._moduleExports.Server.prototype,
        'emit',
        this._getPatchIncomingRequestFunction()
      );
    } else {
      this._logger.error(
        'Could not apply patch to %s.emit. Interface is not as expected.',
        this.moduleName
      );
    }

    shimmer.wrap(
      this._moduleExports,
      'request',
      this._getPatchHttpsOutgoingRequestFunction()
    );

    // In Node 8-12, http.get calls a private request method, therefore we patch it
    // here too.
    if (semver.satisfies(this.version, '>=8.0.0')) {
      shimmer.wrap(
        this._moduleExports,
        'get',
        this._getPatchHttpsOutgoingGetFunction(https.request)
      );
    }

    return this._moduleExports;
  }

  /** Patches HTTPS outgoing requests */
  private _getPatchHttpsOutgoingRequestFunction() {
    return (original: Func<http.ClientRequest>): Func<http.ClientRequest> => {
      const plugin = this;
      return function httpsOutgoingRequest(
        options: https.RequestOptions | string | URL,
        ...args: HttpRequestArgs
      ): http.ClientRequest {
        // Makes sure options will have default HTTPS parameters
        if (typeof options === 'object' && !(options instanceof URL)) {
          options = Object.assign({}, options);
          utils.setDefaultOptions(options as https.RequestOptions);
        }
        return plugin._getPatchOutgoingRequestFunction()(original)(
          options,
          ...args
        );
      };
    };
  }

  /** Patches HTTPS outgoing get requests */
  private _getPatchHttpsOutgoingGetFunction(
    clientRequest: (
      options: http.RequestOptions | string | URL,
      ...args: HttpRequestArgs
    ) => http.ClientRequest
  ) {
    return (original: Func<http.ClientRequest>): Func<http.ClientRequest> => {
      return function httpsOutgoingRequest(
        options: https.RequestOptions | string | URL,
        ...args: HttpRequestArgs
      ): http.ClientRequest {
        return plugin._getPatchOutgoingGetFunction(clientRequest)(original)(
          options,
          ...args
        );
      };
    };
  }

  /** Unpatches all HTTPS patched function. */
  protected unpatch(): void {
    if (
      this._moduleExports &&
      this._moduleExports.Server &&
      this._moduleExports.Server.prototype
    ) {
      shimmer.unwrap(this._moduleExports.Server.prototype, 'emit');
    }
    shimmer.unwrap(this._moduleExports, 'request');
    if (semver.satisfies(this.version, '>=8.0.0')) {
      shimmer.unwrap(this._moduleExports, 'get');
    }
  }
}

export const plugin = new HttpsPlugin(process.versions.node);
