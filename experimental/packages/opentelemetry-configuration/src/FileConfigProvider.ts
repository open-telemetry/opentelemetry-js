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

import { diagLogLevelFromString, getStringFromEnv } from '@opentelemetry/core';
import {
  AttributeLimits,
  ConfigAttributes,
  LoggerProvider,
  MeterProvider,
  Propagator,
  ConfigurationModel,
  initializeDefaultConfiguration,
} from './models/configModel';
import { ConfigProvider } from './IConfigProvider';
import * as fs from 'fs';
import * as yaml from 'yaml';
import {
  getBooleanFromConfigFile,
  getBooleanListFromConfigFile,
  getNumberFromConfigFile,
  getNumberListFromConfigFile,
  getStringFromConfigFile,
  getStringListFromConfigFile,
} from './utils';
import { NameStringValuePair, OtlpHttpEncoding } from './models/commonModel';
import {
  SpanExporter,
  SpanProcessor,
  TracerProvider,
} from './models/tracerProviderModel';

export class FileConfigProvider implements ConfigProvider {
  private _config: ConfigurationModel;

  constructor() {
    this._config = initializeDefaultConfiguration();
    parseConfigFile(this._config);
  }

  getInstrumentationConfig(): ConfigurationModel {
    return this._config;
  }
}

export function hasValidConfigFile(): boolean {
  const configFile = getStringFromEnv('OTEL_EXPERIMENTAL_CONFIG_FILE');
  if (configFile) {
    if (
      !(configFile.endsWith('.yaml') || configFile.endsWith('.yml')) ||
      !fs.existsSync(configFile)
    ) {
      throw new Error(
        `Config file ${configFile} set on OTEL_EXPERIMENTAL_CONFIG_FILE is not valid`
      );
    }
    return true;
  }
  return false;
}

function parseConfigFile(config: ConfigurationModel) {
  const supportedFileVersions = ['1.0-rc.1'];
  const configFile = getStringFromEnv('OTEL_EXPERIMENTAL_CONFIG_FILE') || '';
  const file = fs.readFileSync(configFile, 'utf8');
  const parsedContent = yaml.parse(file);

  if (
    parsedContent['file_format'] &&
    supportedFileVersions.includes(parsedContent['file_format'])
  ) {
    const disabled = getBooleanFromConfigFile(parsedContent['disabled']);
    if (disabled || disabled === false) {
      config.disabled = disabled;
    }

    const logLevel = getNumberFromConfigFile(
      diagLogLevelFromString(parsedContent['log_level'])
    );
    if (logLevel) {
      config.log_level = logLevel;
    }

    if (parsedContent['resource']) {
      if (config.resource == null) {
        config.resource = {};
      }
      const attrList = getStringFromConfigFile(
        parsedContent['resource']?.['attributes_list']
      );
      if (attrList) {
        config.resource.attributes_list = attrList;
      }

      const schemaUrl = getStringFromConfigFile(
        parsedContent['resource']?.['schema_url']
      );
      if (schemaUrl) {
        config.resource.schema_url = schemaUrl;
      }
    }

    setResourceAttributes(config, parsedContent['resource']?.['attributes']);
    setAttributeLimits(config, parsedContent['attribute_limits']);
    setPropagator(config, parsedContent['propagator']);
    setTracerProvider(config, parsedContent['tracer_provider']);
    setMeterProvider(config, parsedContent['meter_provider']);
    setLoggerProvider(config, parsedContent['logger_provider']);
  } else {
    throw new Error(
      `Unsupported File Format: ${parsedContent['file_format']}. It must be one of the following: ${supportedFileVersions}`
    );
  }
}

function setResourceAttributes(
  config: ConfigurationModel,
  attributes: ConfigAttributes[]
) {
  if (attributes) {
    if (config.resource == null) {
      config.resource = {};
    }
    config.resource.attributes = [];
    for (let i = 0; i < attributes.length; i++) {
      const att = attributes[i];
      let value = att['value'];
      switch (att['type']) {
        case 'bool':
          value = getBooleanFromConfigFile(value);
          break;
        case 'bool_array':
          value = getBooleanListFromConfigFile(value);
          break;
        case 'int':
        case 'double':
          value = getNumberFromConfigFile(value);
          break;
        case 'int_array':
        case 'double_array':
          value = getNumberListFromConfigFile(value);
          break;
        case 'string_array':
          value = getStringListFromConfigFile(value);
          break;
        default:
          value = getStringFromConfigFile(value);
          break;
      }

      config.resource.attributes.push({
        name: getStringFromConfigFile(att['name']) ?? '',
        value: value,
        type: att['type'] ?? 'string',
      });
    }
  }
}

function setAttributeLimits(
  config: ConfigurationModel,
  attrLimits: AttributeLimits
) {
  if (attrLimits) {
    if (config.attribute_limits == null) {
      config.attribute_limits = {
        attribute_count_limit: 128,
      };
    }
    const lengthLimit = getNumberFromConfigFile(
      attrLimits['attribute_value_length_limit']
    );
    if (lengthLimit) {
      config.attribute_limits.attribute_value_length_limit = lengthLimit;
    }
    const countLimit = getNumberFromConfigFile(
      attrLimits['attribute_count_limit']
    );
    if (countLimit) {
      config.attribute_limits.attribute_count_limit = countLimit;
    }
  }
}

function setPropagator(
  config: ConfigurationModel,
  propagator: Propagator
): void {
  if (propagator && propagator.composite) {
    const auxList = [];
    const composite = [];
    for (let i = 0; i < propagator.composite.length; i++) {
      const key = Object.keys(propagator.composite[i])[0];
      auxList.push(key);
      composite.push({ [key]: null });
    }
    const compositeList = getStringListFromConfigFile(
      propagator['composite_list']
    );
    if (compositeList) {
      for (let i = 0; i < compositeList.length; i++) {
        if (!auxList.includes(compositeList[i])) {
          composite.push({ [compositeList[i]]: null });
        }
      }
    }
    if (composite.length > 0) {
      if (config.propagator == null) {
        config.propagator = {};
      }
      config.propagator.composite = composite;
    }

    const compositeListString = getStringFromConfigFile(
      propagator['composite_list']
    );
    if (compositeListString) {
      if (config.propagator == null) {
        config.propagator = {};
      }
      config.propagator.composite_list = compositeListString;
    }
  }
}

function getConfigHeaders(
  h?: NameStringValuePair[]
): NameStringValuePair[] | null {
  if (h) {
    const headers: NameStringValuePair[] = [];
    for (let i = 0; i < h.length; i++) {
      const element = h[i];
      headers.push({
        name: element['name'],
        value: element['value'],
      });
    }
    if (headers.length > 0) {
      return headers;
    }
  }
  return null;
}

function parseConfigExporter(exporter: SpanExporter): SpanExporter {
  const exporterType = Object.keys(exporter)[0];
  let parsedExporter: SpanExporter = {};
  let e;
  let certFile;
  let clientCertFile;
  let clientKeyFile;
  let compression;
  let headers;
  let headersList;
  let insecure;
  switch (exporterType) {
    case 'otlp_http':
      e = exporter['otlp_http'];
      if (e) {
        parsedExporter = {
          otlp_http: {
            endpoint:
              getStringFromConfigFile(e['endpoint']) ??
              'http://localhost:4318/v1/traces',
            timeout: getNumberFromConfigFile(e['timeout']) ?? 10000,
            encoding:
              getStringFromConfigFile(e['encoding']) === 'json'
                ? OtlpHttpEncoding.json
                : OtlpHttpEncoding.protobuf,
          },
        };

        certFile = getStringFromConfigFile(e['certificate_file']);
        if (certFile && parsedExporter.otlp_http) {
          parsedExporter.otlp_http.certificate_file = certFile;
        }
        clientCertFile = getStringFromConfigFile(e['client_certificate_file']);
        if (clientCertFile && parsedExporter.otlp_http) {
          parsedExporter.otlp_http.client_certificate_file = clientCertFile;
        }
        clientKeyFile = getStringFromConfigFile(e['client_key_file']);
        if (clientKeyFile && parsedExporter.otlp_http) {
          parsedExporter.otlp_http.client_key_file = clientKeyFile;
        }
        compression = getStringFromConfigFile(e['compression']);
        if (compression && parsedExporter.otlp_http) {
          parsedExporter.otlp_http.compression = compression;
        }
        headersList = getStringFromConfigFile(e['headers_list']);
        if (headersList && parsedExporter.otlp_http) {
          parsedExporter.otlp_http.headers_list = headersList;
        }
        headers = getConfigHeaders(e['headers']);
        if (headers && parsedExporter.otlp_http) {
          parsedExporter.otlp_http.headers = headers;
        }
      }
      break;

    case 'otlp_grpc':
      e = exporter['otlp_grpc'];
      if (e) {
        parsedExporter = {
          otlp_grpc: {
            endpoint:
              getStringFromConfigFile(e['endpoint']) ??
              'http://localhost:4318/v1/traces',
            timeout: getNumberFromConfigFile(e['timeout']) ?? 10000,
          },
        };

        certFile = getStringFromConfigFile(e['certificate_file']);
        if (certFile && parsedExporter.otlp_grpc) {
          parsedExporter.otlp_grpc.certificate_file = certFile;
        }
        clientCertFile = getStringFromConfigFile(e['client_certificate_file']);
        if (clientCertFile && parsedExporter.otlp_grpc) {
          parsedExporter.otlp_grpc.client_certificate_file = clientCertFile;
        }
        clientKeyFile = getStringFromConfigFile(e['client_key_file']);
        if (clientKeyFile && parsedExporter.otlp_grpc) {
          parsedExporter.otlp_grpc.client_key_file = clientKeyFile;
        }
        compression = getStringFromConfigFile(e['compression']);
        if (compression && parsedExporter.otlp_grpc) {
          parsedExporter.otlp_grpc.compression = compression;
        }
        headersList = getStringFromConfigFile(e['headers_list']);
        if (headersList && parsedExporter.otlp_grpc) {
          parsedExporter.otlp_grpc.headers_list = headersList;
        }
        headers = getConfigHeaders(e['headers']);
        if (headers && parsedExporter.otlp_grpc) {
          parsedExporter.otlp_grpc.headers = headers;
        }
        insecure = getBooleanFromConfigFile(e['insecure']);
        if ((insecure || insecure === false) && parsedExporter.otlp_grpc) {
          parsedExporter.otlp_grpc.insecure = insecure;
        }
      }
      break;

    case 'otlp_file/development':
      e = exporter['otlp_file/development'];
      if (e) {
        parsedExporter = {
          'otlp_file/development': {
            output_stream:
              getStringFromConfigFile(e['output_stream']) ?? 'stdout',
          },
        };
      }
      break;

    case 'console':
      parsedExporter = {
        console: {},
      };
      break;

    case 'zipkin':
      e = exporter['zipkin'];
      if (e) {
        parsedExporter = {
          zipkin: {
            endpoint:
              getStringFromConfigFile(e['endpoint']) ??
              'http://localhost:9411/api/v2/spans',
            timeout: getNumberFromConfigFile(e['timeout']) ?? 10000,
          },
        };
      }
      break;
  }

  return parsedExporter;
}

function setTracerProvider(
  config: ConfigurationModel,
  tracerProvider: TracerProvider
): void {
  if (tracerProvider) {
    if (config.tracer_provider == null) {
      config.tracer_provider = {
        processors: [],
      };
    }
    // Limits
    if (tracerProvider['limits']) {
      if (config.tracer_provider.limits == null) {
        config.tracer_provider.limits = {};
      }
      const attributeValueLengthLimit = getNumberFromConfigFile(
        tracerProvider['limits']['attribute_value_length_limit']
      );

      if (attributeValueLengthLimit) {
        config.tracer_provider.limits.attribute_value_length_limit =
          attributeValueLengthLimit;
      }

      const attributeCountLimit = getNumberFromConfigFile(
        tracerProvider['limits']['attribute_count_limit']
      );
      if (attributeCountLimit) {
        config.tracer_provider.limits.attribute_count_limit =
          attributeCountLimit;
      }

      const eventCountLimit = getNumberFromConfigFile(
        tracerProvider['limits']['event_count_limit']
      );
      if (eventCountLimit) {
        config.tracer_provider.limits.event_count_limit = eventCountLimit;
      }

      const linkCountLimit = getNumberFromConfigFile(
        tracerProvider['limits']['link_count_limit']
      );
      if (linkCountLimit) {
        config.tracer_provider.limits.link_count_limit = linkCountLimit;
      }

      const eventAttributeCountLimit = getNumberFromConfigFile(
        tracerProvider['limits']['event_attribute_count_limit']
      );
      if (eventAttributeCountLimit) {
        config.tracer_provider.limits.event_attribute_count_limit =
          eventAttributeCountLimit;
      }

      const linkAttributeCountLimit = getNumberFromConfigFile(
        tracerProvider['limits']['link_attribute_count_limit']
      );
      if (linkAttributeCountLimit) {
        config.tracer_provider.limits.link_attribute_count_limit =
          linkAttributeCountLimit;
      }
    }

    // Processors
    if (tracerProvider['processors']) {
      if (tracerProvider['processors'].length > 0) {
        config.tracer_provider.processors = [];
      }
      for (let i = 0; i < tracerProvider['processors'].length; i++) {
        const processorType = Object.keys(tracerProvider['processors'][i])[0];
        if (processorType === 'batch') {
          const element = tracerProvider['processors'][i]['batch'];
          if (element) {
            const parsedExporter = parseConfigExporter(element['exporter']);
            const batchConfig: SpanProcessor = {
              batch: {
                schedule_delay:
                  getNumberFromConfigFile(element['schedule_delay']) ?? 5000,
                export_timeout:
                  getNumberFromConfigFile(element['export_timeout']) ?? 30000,
                max_queue_size:
                  getNumberFromConfigFile(element['max_queue_size']) ?? 2048,
                max_export_batch_size:
                  getNumberFromConfigFile(element['max_export_batch_size']) ??
                  512,
                exporter: parsedExporter,
              },
            };

            config.tracer_provider.processors.push(batchConfig);
          }
        } else if (processorType === 'simple') {
          const element = tracerProvider['processors'][i]['simple'];
          if (element) {
            const parsedExporter = parseConfigExporter(element['exporter']);
            const simpleConfig: SpanProcessor = {
              simple: {
                exporter: parsedExporter,
              },
            };

            config.tracer_provider.processors.push(simpleConfig);
          }
        }
      }
    }
  }
}

function setMeterProvider(
  config: ConfigurationModel,
  meterProvider: MeterProvider
): void {
  if (meterProvider) {
    if (config.meter_provider == null) {
      config.meter_provider = {};
    }
    const exemplarFilter = getStringFromConfigFile(
      meterProvider['exemplar_filter']
    );
    if (
      exemplarFilter &&
      (exemplarFilter === 'trace_based' ||
        exemplarFilter === 'always_on' ||
        exemplarFilter === 'always_off')
    ) {
      config.meter_provider.exemplar_filter = exemplarFilter;
    }
  }
}

function setLoggerProvider(
  config: ConfigurationModel,
  loggerProvider: LoggerProvider
): void {
  if (loggerProvider) {
    if (config.logger_provider == null) {
      config.logger_provider = {};
    }
    if (loggerProvider['limits']) {
      const attributeValueLengthLimit = getNumberFromConfigFile(
        loggerProvider['limits']['attribute_value_length_limit']
      );
      const attributeCountLimit = getNumberFromConfigFile(
        loggerProvider['limits']['attribute_count_limit']
      );
      if (attributeValueLengthLimit || attributeCountLimit) {
        if (config.logger_provider.limits == null) {
          config.logger_provider.limits = { attribute_count_limit: 128 };
        }

        if (attributeValueLengthLimit) {
          config.logger_provider.limits.attribute_value_length_limit =
            attributeValueLengthLimit;
        }

        if (attributeCountLimit) {
          config.logger_provider.limits.attribute_count_limit =
            attributeCountLimit;
        }
      }
    }
  }
}
