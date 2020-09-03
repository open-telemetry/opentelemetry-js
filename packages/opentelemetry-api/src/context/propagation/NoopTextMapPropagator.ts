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

import { Context } from '@opentelemetry/context-base';
import { TextMapPropagator } from './TextMapPropagator';

/**
 * No-op implementations of {@link TextMapPropagator}.
 */
export class NoopTextMapPropagator implements TextMapPropagator {
  /** Noop inject function does nothing */
  inject(context: Context, carrier: unknown, setter: Function): void {}
  /** Noop extract function does nothing and returns the input context */
  extract(context: Context, carrier: unknown, getter: Function): Context {
    return context;
  }
}

export const NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator();
