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

import { BasePlugin } from '@opentelemetry/core';
import { Span, SpanKind, SpanOptions } from '@opentelemetry/api';
import { LookupAddress } from 'dns';
import * as semver from 'semver';
import * as shimmer from 'shimmer';
import { AddressFamily } from './enums/AddressFamily';
import { AttributeNames } from './enums/AttributeNames';
import {
  Dns,
  DnsPluginConfig,
  LookupCallbackSignature,
  LookupFunction,
  LookupFunctionSignature,
  LookupPromiseSignature,
} from './types';
import * as utils from './utils';
import { VERSION } from './version';

/**
 * Dns instrumentation plugin for Opentelemetry
 */
export class DnsPlugin extends BasePlugin<Dns> {
  readonly component: string;
  protected _config!: DnsPluginConfig;

  constructor(readonly moduleName: string, readonly version: string) {
    super('@opentelemetry/plugin-dns', VERSION);
    // For now component is equal to moduleName but it can change in the future.
    this.component = this.moduleName;
    this._config = {};
  }

  /** Patches DNS functions. */
  protected patch() {
    this._logger.debug(
      'applying patch to %s@%s',
      this.moduleName,
      this.version
    );

    shimmer.wrap<{ lookup: LookupFunction }, 'lookup'>(
      this._moduleExports,
      'lookup',
      // tslint:disable-next-line:no-any
      this._getLookup() as any
    );

    // new promise methods in node >= 10.6.0
    // https://nodejs.org/docs/latest/api/dns.html#dns_dnspromises_lookup_hostname_options
    if (semver.gte(this.version, '10.6.0')) {
      shimmer.wrap(
        this._moduleExports.promises,
        'lookup',
        // tslint:disable-next-line:no-any
        this._getLookup() as any
      );
    }

    return this._moduleExports;
  }

  /** Unpatches all DNS patched function. */
  protected unpatch(): void {
    shimmer.unwrap(this._moduleExports, 'lookup');
    if (semver.gte(this.version, '10.6.0')) {
      shimmer.unwrap(this._moduleExports.promises, 'lookup');
    }
  }

  /**
   * Get the patched lookup function
   */
  private _getLookup() {
    return (original: (hostname: string, ...args: unknown[]) => void) => {
      return this._getPatchLookupFunction(original);
    };
  }

  /**
   * Creates spans for lookup operations, restoring spans' context if applied.
   */
  private _getPatchLookupFunction(
    original: (hostname: string, ...args: unknown[]) => void
  ) {
    this._logger.debug('patch lookup function');
    const plugin = this;
    return function patchedLookup(
      this: {},
      hostname: string,
      ...args: unknown[]
    ) {
      if (
        utils.isIgnored(hostname, plugin._config.ignoreHostnames, (e: Error) =>
          plugin._logger.error('caught ignoreHostname error: ', e)
        )
      ) {
        return original.apply(this, [hostname, ...args]);
      }

      const argsCount = args.length;
      plugin._logger.debug('wrap lookup callback function and starts span');
      const name = utils.getOperationName('lookup');
      const span = plugin._startDnsSpan(name, {
        attributes: {
          [AttributeNames.PEER_HOSTNAME]: hostname,
        },
      });

      const originalCallback = args[argsCount - 1];
      if (typeof originalCallback === 'function') {
        args[argsCount - 1] = plugin._wrapLookupCallback(
          originalCallback,
          args[argsCount - 2],
          span
        );
        return plugin._safeExecute(span, () =>
          // tslint:disable-next-line:no-any
          (original as LookupFunctionSignature).apply(this, [
            hostname,
            ...args,
          ] as any)
        );
      } else {
        const promise = plugin._safeExecute(span, () =>
          (original as LookupPromiseSignature).apply(this, [hostname, ...args])
        );
        promise.then(
          result => {
            utils.setLookupAttributes(span, result as LookupAddress);
            span.end();
          },
          (e: NodeJS.ErrnoException) => {
            utils.setError(e, span, plugin.version);
            span.end();
          }
        );

        return promise;
      }
    };
  }

  /**
   * Start a new span with default attributes and kind
   */
  private _startDnsSpan(name: string, options: Omit<SpanOptions, 'kind'>) {
    return this._tracer
      .startSpan(name, { ...options, kind: SpanKind.CLIENT })
      .setAttribute(AttributeNames.COMPONENT, this.component);
  }

  /**
   * Wrap lookup callback function
   */
  private _wrapLookupCallback(
    original: Function,
    options: unknown,
    span: Span
  ): LookupCallbackSignature {
    const plugin = this;
    return function wrappedLookupCallback(
      this: {},
      err: NodeJS.ErrnoException | null,
      address: string | LookupAddress[],
      family?: AddressFamily
    ): void {
      plugin._logger.debug('executing wrapped lookup callback function');

      if (err !== null) {
        utils.setError(err, span, plugin.version);
      } else {
        utils.setLookupAttributes(span, address, family);
      }

      span.end();
      plugin._logger.debug('executing original lookup callback function');
      return original.apply(this, arguments);
    };
  }

  /**
   * Safely handle "execute" callback
   */
  private _safeExecute<T extends (...args: unknown[]) => ReturnType<T>>(
    span: Span,
    execute: T
  ): ReturnType<T> {
    try {
      return execute();
    } catch (error) {
      utils.setError(error, span, this.version);
      span.end();
      throw error;
    }
  }
}
export const plugin = new DnsPlugin('dns', process.versions.node);
