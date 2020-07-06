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

import * as api from '@opentelemetry/api';
import { ConsoleLogger } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { DEFAULT_CONFIG, MeterConfig } from '../../types';
import { NoopExporter } from '../NoopExporter';
import { UngroupedBatcher } from '../Batcher';
import { Controller } from './Controller';

/**
 * A {@link Controller} implements {@link MeterProvider} interface but do
 * nothing other than waiting incoming pull request of metrics.
 *
 * The PullController can be installed as the global Meter provider.
 */
export class PullController extends Controller implements api.MeterProvider {
  constructor(_config: MeterConfig = DEFAULT_CONFIG) {
    super(
      _config.batcher ?? new UngroupedBatcher(),
      _config.exporter ?? new NoopExporter(),
      _config.logger ?? new ConsoleLogger(_config.logLevel),
      _config.resource ?? Resource.createTelemetrySDKResource()
    );
  }
}
