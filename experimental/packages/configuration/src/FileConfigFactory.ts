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
  Propagator,
  ConfigurationModel,
  initializeDefaultConfiguration,
} from './models/configModel';
import { ConfigFactory } from './IConfigFactory';
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
import {
  LoggerProvider,
  LogRecordExporter,
  LogRecordProcessor,
} from './models/loggerProviderModel';
import { AttributeNameValue } from './models/resourceModel';
import {
  Aggregation,
  CardinalityLimits,
  ExemplarFilter,
  ExporterDefaultHistogramAggregation,
  ExporterTemporalityPreference,
  InstrumentType,
  MeterProvider,
  MetricProducer,
  MetricReader,
  PullMetricExporter,
  PushMetricExporter,
  View,
  ViewSelector,
  ViewStream,
} from './models/meterProviderModel';

export class FileConfigFactory implements ConfigFactory {
  private _config: ConfigurationModel;

  constructor() {
    this._config = initializeDefaultConfiguration();
    parseConfigFile(this._config);
  }

  getConfigModel(): ConfigurationModel {
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

export function parseConfigFile(config: ConfigurationModel) {
  const supportedFileVersions = ['1.0-rc.1', '1.0-rc.2'];
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
        const list = getStringListFromConfigFile(
          parsedContent['resource']?.['attributes_list']
        );
        if (
          list &&
          list.length > 0 &&
          parsedContent['resource']?.['attributes'] == null
        ) {
          config.resource.attributes = [];
          for (let i = 0; i < list.length; i++) {
            const element = list[i].split('=');
            config.resource.attributes.push({
              name: element[0],
              value: element[1],
              type: 'string',
            });
          }
        }
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

export function setResourceAttributes(
  config: ConfigurationModel,
  attributes: AttributeNameValue[]
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

export function setAttributeLimits(
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

export function setPropagator(
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

enum ProviderType {
  TRACER = 0,
  METER = 1,
  LOGGER = 2,
}

function parseConfigSpanOrLogRecordExporter(
  exporter: SpanExporter | LogRecordExporter,
  providerType: ProviderType
): SpanExporter | LogRecordExporter {
  const exporterType = Object.keys(exporter)[0];
  let parsedExporter: SpanExporter | LogRecordExporter = {};
  let e;
  let certFile;
  let clientCertFile;
  let clientKeyFile;
  let compression;
  let headers;
  let headersList;
  let insecure;
  let endpoint;

  switch (providerType) {
    case ProviderType.TRACER:
      endpoint = 'http://localhost:4318/v1/traces';
      parsedExporter = parsedExporter as SpanExporter;
      break;
    case ProviderType.LOGGER:
      endpoint = 'http://localhost:4318/v1/logs';
      parsedExporter = parsedExporter as LogRecordExporter;
      break;
  }

  switch (exporterType) {
    case 'otlp_http':
      e = exporter['otlp_http'];
      if (e) {
        parsedExporter = {
          otlp_http: {
            endpoint: getStringFromConfigFile(e['endpoint']) ?? endpoint,
            timeout: getNumberFromConfigFile(e['timeout']) ?? 10000,
            encoding:
              getStringFromConfigFile(e['encoding']) === 'json'
                ? OtlpHttpEncoding.JSON
                : OtlpHttpEncoding.Protobuf,
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
              getStringFromConfigFile(e['endpoint']) ?? 'http://localhost:4317',
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
        console: undefined,
      };
      break;

    case 'zipkin':
      e = (exporter as SpanExporter)['zipkin'];
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

export function setTracerProvider(
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
            const parsedExporter = parseConfigSpanOrLogRecordExporter(
              element['exporter'],
              ProviderType.TRACER
            );
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
                exporter: parsedExporter as SpanExporter,
              },
            };

            config.tracer_provider.processors.push(batchConfig);
          }
        } else if (processorType === 'simple') {
          const element = tracerProvider['processors'][i]['simple'];
          if (element) {
            const parsedExporter = parseConfigSpanOrLogRecordExporter(
              element['exporter'],
              ProviderType.TRACER
            );
            const simpleConfig: SpanProcessor = {
              simple: {
                exporter: parsedExporter as SpanExporter,
              },
            };

            config.tracer_provider.processors.push(simpleConfig);
          }
        }
      }
    }
  }
}

function getCardinalityLimits(limits?: CardinalityLimits): CardinalityLimits {
  if (limits == null) {
    limits = {};
  }
  const defaultLimit = getNumberFromConfigFile(limits['default']) ?? 2000;

  return {
    default: defaultLimit,
    counter: getNumberFromConfigFile(limits['counter']) ?? defaultLimit,
    gauge: getNumberFromConfigFile(limits['gauge']) ?? defaultLimit,
    histogram: getNumberFromConfigFile(limits['histogram']) ?? defaultLimit,
    observable_counter:
      getNumberFromConfigFile(limits['observable_counter']) ?? defaultLimit,
    observable_gauge:
      getNumberFromConfigFile(limits['observable_gauge']) ?? defaultLimit,
    observable_up_down_counter:
      getNumberFromConfigFile(limits['observable_up_down_counter']) ??
      defaultLimit,
    up_down_counter:
      getNumberFromConfigFile(limits['up_down_counter']) ?? defaultLimit,
  };
}

function getProducers(producers?: MetricProducer[]): MetricProducer[] {
  const parsedProducers: MetricProducer[] = [];
  if (producers) {
    for (let j = 0; j < producers.length; j++) {
      const producer = producers[j];
      if (Object.keys(producer)[0] === 'opencensus') {
        parsedProducers.push({ opencensus: undefined });
      }
      if (Object.keys(producer)[0] === 'prometheus') {
        parsedProducers.push({ prometheus: undefined });
      }
    }
  }

  return parsedProducers;
}

export function getTemporalityPreference(
  temporalityPreference?: ExporterTemporalityPreference
): ExporterTemporalityPreference {
  const temporalityPreferenceType = getStringFromConfigFile(
    temporalityPreference
  );
  switch (temporalityPreferenceType) {
    case 'cumulative':
      return ExporterTemporalityPreference.Cumulative;
    case 'delta':
      return ExporterTemporalityPreference.Delta;
    case 'low_memory':
      return ExporterTemporalityPreference.LowMemory;
    default:
      return ExporterTemporalityPreference.Cumulative;
  }
}

function getDefaultHistogramAggregation(
  defaultHistogramAggregation?: ExporterDefaultHistogramAggregation
): ExporterDefaultHistogramAggregation {
  const defaultHistogramAggregationType = getStringFromConfigFile(
    defaultHistogramAggregation
  );
  switch (defaultHistogramAggregationType) {
    case 'explicit_bucket_histogram':
      return ExporterDefaultHistogramAggregation.ExplicitBucketHistogram;
    case 'base2_exponential_bucket_histogram':
      return ExporterDefaultHistogramAggregation.Base2ExponentialBucketHistogram;
    default:
      return ExporterDefaultHistogramAggregation.ExplicitBucketHistogram;
  }
}

function parseMetricExporter(exporter: PushMetricExporter): PushMetricExporter {
  const exporterType = Object.keys(exporter)[0];
  let parsedExporter: PushMetricExporter = {};
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
              'http://localhost:4318/v1/metrics',
            timeout: getNumberFromConfigFile(e['timeout']) ?? 10000,
            encoding:
              getStringFromConfigFile(e['encoding']) === 'json'
                ? OtlpHttpEncoding.JSON
                : OtlpHttpEncoding.Protobuf,
            temporality_preference: getTemporalityPreference(
              e['temporality_preference']
            ),
            default_histogram_aggregation: getDefaultHistogramAggregation(
              e['default_histogram_aggregation']
            ),
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
              getStringFromConfigFile(e['endpoint']) ?? 'http://localhost:4317',
            timeout: getNumberFromConfigFile(e['timeout']) ?? 10000,
            temporality_preference: getTemporalityPreference(
              e['temporality_preference']
            ),
            default_histogram_aggregation: getDefaultHistogramAggregation(
              e['default_histogram_aggregation']
            ),
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
            temporality_preference: getTemporalityPreference(
              e['temporality_preference']
            ),
            default_histogram_aggregation: getDefaultHistogramAggregation(
              e['default_histogram_aggregation']
            ),
          },
        };
      }
      break;

    case 'console':
      parsedExporter = {
        console: undefined,
      };
      break;
  }

  return parsedExporter;
}

export function setMeterProvider(
  config: ConfigurationModel,
  meterProvider: MeterProvider
): void {
  if (meterProvider) {
    if (config.meter_provider == null) {
      config.meter_provider = { readers: [] };
    }
    const exemplarFilter = getStringFromConfigFile(
      meterProvider['exemplar_filter']
    );
    if (exemplarFilter) {
      switch (exemplarFilter) {
        case 'trace_based':
          config.meter_provider.exemplar_filter = ExemplarFilter.TraceBased;
          break;
        case 'always_on':
          config.meter_provider.exemplar_filter = ExemplarFilter.AlwaysOn;
          break;
        case 'always_off':
          config.meter_provider.exemplar_filter = ExemplarFilter.AlwaysOff;
          break;
        default:
          config.meter_provider.exemplar_filter = ExemplarFilter.TraceBased;
          break;
      }
    }

    if (meterProvider['readers'] && meterProvider['readers'].length > 0) {
      config.meter_provider.readers = [];

      for (let i = 0; i < meterProvider['readers'].length; i++) {
        const readerType = Object.keys(meterProvider['readers'][i])[0];
        if (readerType === 'pull') {
          const element = meterProvider['readers'][i]['pull'];
          if (element) {
            const exporter: PullMetricExporter = {
              'prometheus/development': {
                host:
                  getStringFromConfigFile(
                    element['exporter']['prometheus/development']['host']
                  ) ?? 'localhost',
                port:
                  getNumberFromConfigFile(
                    element['exporter']['prometheus/development']['port']
                  ) ?? 9464,
                without_scope_info:
                  getBooleanFromConfigFile(
                    element['exporter']['prometheus/development'][
                      'without_scope_info'
                    ]
                  ) ?? false,
                with_resource_constant_labels: {
                  included:
                    getStringListFromConfigFile(
                      element['exporter']['prometheus/development'][
                        'with_resource_constant_labels'
                      ]['included']
                    ) ?? [],
                  excluded:
                    getStringListFromConfigFile(
                      element['exporter']['prometheus/development'][
                        'with_resource_constant_labels'
                      ]['excluded']
                    ) ?? [],
                },
              },
            };

            const pullReader: MetricReader = {
              pull: {
                exporter: exporter,
                cardinality_limits: getCardinalityLimits(
                  element['cardinality_limits']
                ),
              },
            };
            const p = getProducers(element['producers']);
            if (p.length > 0 && pullReader.pull) {
              pullReader.pull.producers = p;
            }
            config.meter_provider.readers.push(pullReader);
          }
        } else if (readerType === 'periodic') {
          const element = meterProvider['readers'][i]['periodic'];
          if (element) {
            const parsedExporter = parseMetricExporter(element['exporter']);

            const periodicReader: MetricReader = {
              periodic: {
                exporter: parsedExporter,
                cardinality_limits: getCardinalityLimits(
                  element['cardinality_limits']
                ),
                interval: getNumberFromConfigFile(element['interval']) ?? 60000,
                timeout: getNumberFromConfigFile(element['timeout']) ?? 30000,
              },
            };
            const p = getProducers(element['producers']);
            if (p.length > 0 && periodicReader.periodic) {
              periodicReader.periodic.producers = p;
            }
            config.meter_provider.readers.push(periodicReader);
          }
        }
      }
    }

    if (meterProvider['views'] && meterProvider['views'].length > 0) {
      config.meter_provider.views = [];
      for (let j = 0; j < meterProvider['views'].length; j++) {
        const element = meterProvider['views'][j];
        const view: View = {};
        if (element['selector']) {
          const selector: ViewSelector = {};
          const instrumentName = getStringFromConfigFile(
            element['selector']['instrument_name']
          );
          if (instrumentName) {
            selector.instrument_name = instrumentName;
          }

          const unit = getStringFromConfigFile(element['selector']['unit']);
          if (unit) {
            selector.unit = unit;
          }

          const meterName = getStringFromConfigFile(
            element['selector']['meter_name']
          );
          if (meterName) {
            selector.meter_name = meterName;
          }

          const meterVersion = getStringFromConfigFile(
            element['selector']['meter_version']
          );
          if (meterVersion) {
            selector.meter_version = meterVersion;
          }

          const meterSchemaUrl = getStringFromConfigFile(
            element['selector']['meter_schema_url']
          );
          if (meterSchemaUrl) {
            selector.meter_schema_url = meterSchemaUrl;
          }

          const instrumentType = getStringFromConfigFile(
            element['selector']['instrument_type']
          );
          if (instrumentType) {
            switch (instrumentType) {
              case 'counter':
                selector.instrument_type = InstrumentType.Counter;
                break;
              case 'gauge':
                selector.instrument_type = InstrumentType.Gauge;
                break;
              case 'histogram':
                selector.instrument_type = InstrumentType.Histogram;
                break;
              case 'observable_counter':
                selector.instrument_type = InstrumentType.ObservableCounter;
                break;
              case 'observable_gauge':
                selector.instrument_type = InstrumentType.ObservableGauge;
                break;
              case 'observable_up_down_counter':
                selector.instrument_type =
                  InstrumentType.ObservableUpDownCounter;
                break;
              case 'up_down_counter':
                selector.instrument_type = InstrumentType.UpDownCounter;
                break;
            }
          }

          if (Object.keys(selector).length > 0) {
            view.selector = selector;
          }
        }
        if (element['stream']) {
          const stream: ViewStream = {};
          const name = getStringFromConfigFile(element['stream']['name']);
          if (name) {
            stream.name = name;
          }

          const description = getStringFromConfigFile(
            element['stream']['description']
          );
          if (description) {
            stream.description = description;
          }

          const aggregationCardinalityLimit = getNumberFromConfigFile(
            element['stream']['aggregation_cardinality_limit']
          );
          if (aggregationCardinalityLimit) {
            stream.aggregation_cardinality_limit = aggregationCardinalityLimit;
          }

          if (element['stream']['attribute_keys']) {
            stream.attribute_keys = {
              included:
                getStringListFromConfigFile(
                  element['stream']['attribute_keys']['included']
                ) ?? [],
              excluded:
                getStringListFromConfigFile(
                  element['stream']['attribute_keys']['excluded']
                ) ?? [],
            };
          }
          const rawAgg = element['stream']['aggregation'];
          if (rawAgg) {
            const aggregation: Aggregation = {};
            if (rawAgg['default']) {
              aggregation.default = {};
            }
            if (rawAgg['drop']) {
              aggregation.drop = {};
            }
            if (rawAgg['last_value']) {
              aggregation.last_value = {};
            }
            if (rawAgg['sum']) {
              aggregation.sum = {};
            }
            if (rawAgg['explicit_bucket_histogram']) {
              aggregation.explicit_bucket_histogram = {
                boundaries: getNumberListFromConfigFile(
                  rawAgg['explicit_bucket_histogram']['boundaries']
                ) ?? [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000,
                ],
                record_min_max:
                  getBooleanFromConfigFile(
                    rawAgg['explicit_bucket_histogram']['record_min_max']
                  ) === false
                    ? false
                    : true,
              };
            }
            if (rawAgg['base2_exponential_bucket_histogram']) {
              aggregation.base2_exponential_bucket_histogram = {
                record_min_max:
                  getBooleanFromConfigFile(
                    rawAgg['base2_exponential_bucket_histogram'][
                      'record_min_max'
                    ]
                  ) === false
                    ? false
                    : true,
              };
              const maxScale = getNumberFromConfigFile(
                rawAgg['base2_exponential_bucket_histogram']['max_scale']
              );
              if (maxScale) {
                aggregation.base2_exponential_bucket_histogram.max_scale =
                  maxScale;
              }

              const maxSize = getNumberFromConfigFile(
                rawAgg['base2_exponential_bucket_histogram']['max_size']
              );
              if (maxSize) {
                aggregation.base2_exponential_bucket_histogram.max_size =
                  maxSize;
              }
            }
            stream.aggregation = aggregation;
          }
          if (Object.keys(stream).length > 0) {
            view.stream = stream;
          }
        }
        config.meter_provider.views.push(view);
      }
    }
  }
}

export function setLoggerProvider(
  config: ConfigurationModel,
  loggerProvider: LoggerProvider
): void {
  if (loggerProvider) {
    if (config.logger_provider == null) {
      config.logger_provider = { processors: [] };
    }
    // Limits
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

    // Processors
    if (loggerProvider['processors']) {
      if (loggerProvider['processors'].length > 0) {
        if (config.logger_provider == null) {
          config.logger_provider = { processors: [] };
        }
        config.logger_provider.processors = [];
        for (let i = 0; i < loggerProvider['processors'].length; i++) {
          const processorType = Object.keys(loggerProvider['processors'][i])[0];
          if (processorType === 'batch') {
            const element = loggerProvider['processors'][i]['batch'];
            if (element) {
              const parsedExporter = parseConfigSpanOrLogRecordExporter(
                element['exporter'],
                ProviderType.LOGGER
              );
              const batchConfig: LogRecordProcessor = {
                batch: {
                  schedule_delay:
                    getNumberFromConfigFile(element['schedule_delay']) ?? 1000,
                  export_timeout:
                    getNumberFromConfigFile(element['export_timeout']) ?? 30000,
                  max_queue_size:
                    getNumberFromConfigFile(element['max_queue_size']) ?? 2048,
                  max_export_batch_size:
                    getNumberFromConfigFile(element['max_export_batch_size']) ??
                    512,
                  exporter: parsedExporter as LogRecordExporter,
                },
              };

              config.logger_provider.processors.push(batchConfig);
            }
          } else if (processorType === 'simple') {
            const element = loggerProvider['processors'][i]['simple'];
            if (element) {
              const parsedExporter = parseConfigSpanOrLogRecordExporter(
                element['exporter'],
                ProviderType.LOGGER
              );
              const simpleConfig: LogRecordProcessor = {
                simple: {
                  exporter: parsedExporter,
                },
              };

              config.logger_provider.processors.push(simpleConfig);
            }
          }
        }
      }
    }

    // logger_configurator/development
    if (loggerProvider['logger_configurator/development']) {
      const defaultConfigDisabled = getBooleanFromConfigFile(
        loggerProvider['logger_configurator/development']['default_config']?.[
          'disabled'
        ]
      );
      if (defaultConfigDisabled || defaultConfigDisabled === false) {
        if (config.logger_provider == null) {
          config.logger_provider = { processors: [] };
        }
        config.logger_provider['logger_configurator/development'] = {
          default_config: {
            disabled: defaultConfigDisabled,
          },
        };
      }

      if (
        loggerProvider['logger_configurator/development'].loggers &&
        loggerProvider['logger_configurator/development'].loggers.length > 0
      ) {
        const loggers = [];
        for (
          let i = 0;
          i < loggerProvider['logger_configurator/development'].loggers.length;
          i++
        ) {
          const logger =
            loggerProvider['logger_configurator/development'].loggers[i];
          let disabled = false;
          if (logger['config']) {
            disabled =
              getBooleanFromConfigFile(logger['config']['disabled']) ?? false;
          }
          const name = getStringFromConfigFile(logger['name']);
          if (name) {
            loggers.push({
              name: name,
              config: {
                disabled: disabled,
              },
            });
          }
        }
        if (config.logger_provider == null) {
          config.logger_provider = { processors: [] };
        }
        if (config.logger_provider['logger_configurator/development'] == null) {
          config.logger_provider['logger_configurator/development'] = {};
        }
        config.logger_provider['logger_configurator/development'].loggers =
          loggers;
      }
    }
  }
}
