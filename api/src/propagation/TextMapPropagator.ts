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

import { Context } from '../context/types';

/**
 * Injects `Context` into and extracts it from carriers that travel
 * in-band across process boundaries. Encoding is expected to conform to the
 * HTTP Header Field semantics. Values are often encoded as RPC/HTTP request
 * headers.
 *
 * Propagation is usually implemented via library-specific request
 * interceptors, where the client-side injects values and the server-side
 * extracts them.
 *
 * @template Carrier **It is strongly recommended to set the `Carrier` type
 * parameter to `unknown`, as it is the only correct type here.**
 *
 * The carrier is the medium for communicating propagated data between the
 * client (injector) and server (extractor) side, such as HTTP headers. To
 * work with `TextMapPropagator`, the carrier type must semantically function
 * as an abstract map data structure, supporting string keys and values.
 *
 * This type parameter exists on the interface for historical reasons. While
 * it may be suggest that implementors have a choice over what type of carrier
 * medium it accepts, this is not true in practice.
 *
 * The propagator API is designed to be called by participating code around the
 * various transport layers (such as the `fetch` instrumentation on the browser
 * client, or integration with the HTTP server library on the backend), and it
 * is these callers that ultimately controls what carrier type your propagator
 * is called with.
 *
 * Therefore, a correct implementation of this interface must treat the carrier
 * as an opaque value, and only work with it using the provided getter/setter.
 *
 * @since 1.0.0
 */
// TODO: move this generic parameter into the methods in API 2.0 and remove
// the default to `any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TextMapPropagator<Carrier = any> {
  /**
   * Injects values from a given `Context` into a carrier.
   *
   * OpenTelemetry defines a common set of format values (TextMapPropagator),
   * and each has an expected `carrier` type.
   *
   * @param context the Context from which to extract values to transmit over
   *     the wire.
   * @param carrier the carrier of propagation fields, such as HTTP request
   *     headers.
   * @param setter a {@link TextMapSetter} guaranteed to work with the given
   *     carrier, implementors must use this to set values on the carrier.
   */
  inject(
    context: Context,
    carrier: Carrier,
    setter: TextMapSetter<Carrier>
  ): void;

  /**
   * Given a `Context` and a carrier, extract context values from a
   * carrier and return a new context, created from the old context, with the
   * extracted values.
   *
   * @param context the Context from which to extract values to transmit over
   *     the wire.
   * @param carrier the carrier of propagation fields, such as HTTP request
   *     headers.
   * @param getter a {@link TextMapGetter} guaranteed to work with the given
   *     carrier, implementors must use this to read values from the carrier.
   */
  extract(
    context: Context,
    carrier: Carrier,
    getter: TextMapGetter<Carrier>
  ): Context;

  /**
   * Return a list of all fields which may be used by the propagator.
   */
  fields(): string[];
}

/**
 * A setter is specified by the caller to define a specific method
 * to set key/value pairs on the carrier within a propagator
 *
 * @since 1.0.0
 */
// TODO: remove the default to `any` in API 2.0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TextMapSetter<Carrier = any> {
  /**
   * Callback used to set a key/value pair on an object.
   *
   * Should be called by the propagator each time a key/value pair
   * should be set, and should set that key/value pair on the propagator.
   *
   * @param carrier object or class which carries key/value pairs
   * @param key string key to modify
   * @param value value to be set to the key on the carrier
   */
  set(carrier: Carrier, key: string, value: string): void;
}

/**
 * A getter is specified by the caller to define a specific method
 * to get the value of a key from a carrier.
 *
 * @since 1.0.0
 */
// TODO: remove the default to `any` in API 2.0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TextMapGetter<Carrier = any> {
  /**
   * Get a list of all keys available on the carrier.
   *
   * @param carrier
   */
  keys(carrier: Carrier): string[];

  /**
   * Get the value of a specific key from the carrier.
   *
   * @param carrier
   * @param key
   */
  get(carrier: Carrier, key: string): undefined | string | string[];
}

/**
 * @since 1.0.0
 */
export const defaultTextMapGetter: TextMapGetter = {
  get(carrier, key) {
    if (carrier == null) {
      return undefined;
    }
    return carrier[key];
  },

  keys(carrier) {
    if (carrier == null) {
      return [];
    }
    return Object.keys(carrier);
  },
};

/**
 * @since 1.0.0
 */
export const defaultTextMapSetter: TextMapSetter = {
  set(carrier, key, value) {
    if (carrier == null) {
      return;
    }

    carrier[key] = value;
  },
};
