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

import * as api from '@opentelemetry/api';
import { PullController } from '@opentelemetry/metrics';
import { PrometheusExporter } from '../prometheus';
import { ExporterConfig } from './types';

/**
 * Install Prometheus export pipeline to global metrics api.
 * @param exporterConfig Exporter configuration
 * @param callback Callback to be called after a server was started
 * @param controllerConfig Default meter configuration
 */
export function installExportPipeline(
  exporterConfig?: ExporterConfig,
  callback?: () => void,
  controllerConfig?: ConstructorParameters<typeof PullController>[0]
) {
  const exporter = new PrometheusExporter(exporterConfig, callback);
  const pullController = new PullController({ ...controllerConfig, exporter });
  exporter.setPullCallback(() => pullController.collect());
  api.metrics.setGlobalMeterProvider(pullController);
  return { exporter, controller: pullController };
}
