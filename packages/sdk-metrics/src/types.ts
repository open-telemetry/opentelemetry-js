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
import { Context, MetricAttributes } from '@opentelemetry/api';

export type CommonReaderOptions = {
  timeoutMillis?: number;
};

export type CollectionOptions = CommonReaderOptions;

export type ShutdownOptions = CommonReaderOptions;

export type ForceFlushOptions = CommonReaderOptions;

/**
 * @experimental
 *
 * This is intentionally not using the API's type as it's only available from @opentelemetry/api 1.9.0 and up.
 * In SDK 2.0 we'll be able to bump the minimum API version and remove this workaround.
 */
export interface Gauge<
  AttributesTypes extends MetricAttributes = MetricAttributes,
> {
  /**
   * Records a measurement. Value of the measurement must not be negative.
   */
  record(value: number, attributes?: AttributesTypes, context?: Context): void;
}
