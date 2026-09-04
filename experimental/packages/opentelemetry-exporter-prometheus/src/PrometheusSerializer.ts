/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes, AttributeValue } from '@opentelemetry/api';
import { diag } from '@opentelemetry/api';
import type {
  ResourceMetrics,
  ScopeMetrics,
  MetricData,
  DataPoint,
  Histogram,
} from '@opentelemetry/sdk-metrics';
import { DataPointType } from '@opentelemetry/sdk-metrics';
import type { InstrumentationScope } from '@opentelemetry/core';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import type { Resource } from '@opentelemetry/resources';
import {
  ATTR_OTEL_SCOPE_NAME,
  ATTR_OTEL_SCOPE_VERSION,
} from '@opentelemetry/semantic-conventions';

// This is currently listed as experimental.
const ATTR_OTEL_SCOPE_SCHEMA_URL = 'otel.scope.schema_url';

type PrometheusDataTypeLiteral =
  | 'counter'
  | 'gauge'
  | 'histogram'
  | 'summary'
  | 'untyped';

interface PrometheusMetadata {
  help: string;
  unit: string;
  type: PrometheusDataTypeLiteral;
  state: 'pending' | 'emitted' | 'dropped';
  helpValues: Set<string>;
  unitValues: Set<string>;
  typeValues: Set<PrometheusDataTypeLiteral>;
}

interface PrometheusMetadataCollection {
  metricNames: Map<MetricData, string>;
  metadataByName: Map<string, PrometheusMetadata>;
}

function createPrometheusMetadata(
  help: string,
  unit: string,
  type: PrometheusDataTypeLiteral
): PrometheusMetadata {
  return {
    help,
    unit,
    type,
    state: 'pending',
    helpValues: new Set(help ? [help] : []),
    unitValues: new Set(unit ? [unit] : []),
    typeValues: new Set([type]),
  };
}

function escapeString(str: string) {
  return str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
}

/**
 * String Attribute values are converted directly to Prometheus attribute values.
 * Non-string values are represented as JSON-encoded strings.
 *
 * `undefined` is converted to an empty string.
 */
function escapeAttributeValue(str: AttributeValue = '') {
  if (typeof str !== 'string') {
    str = JSON.stringify(str);
  }
  return escapeString(str).replace(/"/g, '\\"');
}

const invalidCharacterRegex = /[^a-z0-9_]/gi;
const multipleUnderscoreRegex = /_{2,}/g;

/**
 * Ensures metric names are valid Prometheus metric names by removing
 * characters allowed by OpenTelemetry but disallowed by Prometheus.
 *
 * https://prometheus.io/docs/concepts/data_model/#metric-names-and-attributes
 *
 * 1. Names must match `[a-zA-Z_:][a-zA-Z0-9_:]*`
 *
 * 2. Colons are reserved for user defined recording rules.
 * They should not be used by exporters or direct instrumentation.
 *
 * OpenTelemetry metric names are already validated in the Meter when they are created,
 * and they match the format `[a-zA-Z][a-zA-Z0-9_.\-]*` which is very close to a valid
 * prometheus metric name, so we only need to strip characters valid in OpenTelemetry
 * but not valid in prometheus and replace them with '_'.
 *
 * @param name name to be sanitized
 */
function sanitizePrometheusMetricName(name: string): string {
  // replace all invalid characters with '_'
  return name
    .replace(invalidCharacterRegex, '_')
    .replace(multipleUnderscoreRegex, '_');
}

/**
 * @private
 *
 * Helper method which assists in enforcing the naming conventions for metric
 * names in Prometheus
 * @param name the name of the metric
 * @param type the kind of metric
 * @returns string
 */
function enforcePrometheusNamingConvention(
  name: string,
  data: MetricData
): string {
  // Prometheus requires that metrics of the Counter kind have "_total" suffix
  if (
    !name.endsWith('_total') &&
    data.dataPointType === DataPointType.SUM &&
    data.isMonotonic
  ) {
    name = name + '_total';
  }

  return name;
}

function valueString(value: number) {
  if (value === Infinity) {
    return '+Inf';
  } else if (value === -Infinity) {
    return '-Inf';
  } else {
    // Handle finite numbers and NaN.
    return `${value}`;
  }
}

function toPrometheusType(metricData: MetricData): PrometheusDataTypeLiteral {
  switch (metricData.dataPointType) {
    case DataPointType.SUM:
      if (metricData.isMonotonic) {
        return 'counter';
      }
      return 'gauge';
    case DataPointType.GAUGE:
      return 'gauge';
    case DataPointType.HISTOGRAM:
      return 'histogram';
    default:
      return 'untyped';
  }
}

function stringify(
  metricName: string,
  attributes: Attributes,
  value: number,
  timestamp?: number,
  additionalAttributes?: Attributes
) {
  let hasAttribute = false;
  let attributesStr = '';

  for (const [key, val] of Object.entries(attributes)) {
    const sanitizedAttributeName = sanitizePrometheusMetricName(key);
    hasAttribute = true;
    attributesStr += `${
      attributesStr.length > 0 ? ',' : ''
    }${sanitizedAttributeName}="${escapeAttributeValue(val)}"`;
  }
  if (additionalAttributes) {
    for (const [key, val] of Object.entries(additionalAttributes)) {
      const sanitizedAttributeName = sanitizePrometheusMetricName(key);
      hasAttribute = true;
      attributesStr += `${
        attributesStr.length > 0 ? ',' : ''
      }${sanitizedAttributeName}="${escapeAttributeValue(val)}"`;
    }
  }

  if (hasAttribute) {
    metricName += `{${attributesStr}}`;
  }

  return `${metricName} ${valueString(value)}${
    timestamp !== undefined ? ' ' + String(timestamp) : ''
  }\n`;
}

const NO_REGISTERED_METRICS = '# no registered metrics';

export class PrometheusSerializer {
  private _prefix: string | undefined;
  private _appendTimestamp: boolean;
  private _additionalAttributes: Attributes | undefined;
  private _withResourceConstantLabels: RegExp | undefined;
  private _withoutScopeInfo: boolean | undefined;
  private _withoutTargetInfo: boolean | undefined;
  private _activeMetadataConflicts = new Set<string>();

  constructor(
    prefix?: string,
    appendTimestamp = false,
    withResourceConstantLabels?: RegExp,
    withoutTargetInfo?: boolean,
    withoutScopeInfo?: boolean
  ) {
    if (prefix) {
      this._prefix = prefix + '_';
    }
    this._appendTimestamp = appendTimestamp;
    this._withResourceConstantLabels = withResourceConstantLabels;
    this._withoutScopeInfo = !!withoutScopeInfo;
    this._withoutTargetInfo = !!withoutTargetInfo;
  }

  serialize(resourceMetrics: ResourceMetrics): string {
    let str = '';
    const metadata = this._collectMetadata(resourceMetrics);

    this._additionalAttributes = this._filterResourceConstantLabels(
      resourceMetrics.resource.attributes,
      this._withResourceConstantLabels
    );

    const resource = this._serializeResource(
      resourceMetrics.resource,
      metadata.metadataByName
    );

    for (const scopeMetrics of resourceMetrics.scopeMetrics) {
      str += this._serializeScopeMetrics(scopeMetrics, metadata);
    }

    if (str === '') {
      str += NO_REGISTERED_METRICS;
    }

    return resource + str;
  }

  private _filterResourceConstantLabels(
    attributes: Attributes,
    pattern: RegExp | undefined
  ) {
    if (pattern) {
      const filteredAttributes: Attributes = {};
      for (const [key, value] of Object.entries(attributes)) {
        if (key.match(pattern)) {
          filteredAttributes[key] = value;
        }
      }
      return filteredAttributes;
    }
    return;
  }

  private _serializeScopeMetrics(
    scopeMetrics: ScopeMetrics,
    metadata?: PrometheusMetadataCollection
  ) {
    let str = '';
    for (const metric of scopeMetrics.metrics) {
      if (metadata && !metadata.metricNames.has(metric)) {
        continue;
      }
      const metricStr = this._serializeMetricData(
        metric,
        scopeMetrics.scope,
        metadata?.metricNames.get(metric),
        metadata?.metadataByName
      );

      if (metricStr) {
        str += metricStr + '\n';
      }
    }
    return str;
  }

  private _collectMetadata(
    resourceMetrics: ResourceMetrics
  ): PrometheusMetadataCollection {
    // A TYPE conflict requires dropping the entire family, so all metadata must
    // be resolved before any samples are serialized.
    const metricNames = new Map<MetricData, string>();
    const metadataByName = new Map<string, PrometheusMetadata>();

    if (!this._withoutTargetInfo) {
      metadataByName.set(
        'target_info',
        createPrometheusMetadata('Target metadata', '', 'gauge')
      );
    }

    for (const scope of resourceMetrics.scopeMetrics) {
      for (const metric of scope.metrics) {
        const name = this._getPrometheusMetricName(metric);
        if (name === undefined) {
          continue;
        }

        metricNames.set(metric, name);
        const currentMetadata = createPrometheusMetadata(
          metric.descriptor.description,
          metric.descriptor.unit,
          toPrometheusType(metric)
        );
        const previousMetadata = metadataByName.get(name);

        if (previousMetadata === undefined) {
          metadataByName.set(name, currentMetadata);
          continue;
        }

        previousMetadata.typeValues.add(currentMetadata.type);
        if (previousMetadata.typeValues.size > 1) {
          previousMetadata.state = 'dropped';
          continue;
        }

        if (currentMetadata.help) {
          previousMetadata.helpValues.add(currentMetadata.help);
          if (!previousMetadata.help) {
            previousMetadata.help = currentMetadata.help;
          }
        }

        if (currentMetadata.unit) {
          previousMetadata.unitValues.add(currentMetadata.unit);
          if (!previousMetadata.unit) {
            previousMetadata.unit = currentMetadata.unit;
          }
        }
      }
    }

    this._warnAboutMetadataConflicts(metadataByName);
    return { metricNames, metadataByName };
  }

  private _warnAboutMetadataConflicts(
    metadataByName: Map<string, PrometheusMetadata>
  ) {
    const activeConflicts = new Set<string>();
    const warn = (
      kind: 'HELP' | 'UNIT' | 'TYPE',
      name: string,
      values: Set<string>,
      selected?: string
    ) => {
      const sortedValues = [...values].sort();
      const key = JSON.stringify([kind, name, selected, sortedValues]);
      activeConflicts.add(key);
      if (this._activeMetadataConflicts.has(key)) {
        return;
      }

      const formattedValues = sortedValues
        .map(value => JSON.stringify(value))
        .join(', ');
      if (kind === 'TYPE') {
        diag.warn(
          `Conflicting ${kind} comments for metric "${name}": ${formattedValues}; dropping the metric.`
        );
      } else {
        diag.warn(
          `Conflicting ${kind} comments for metric "${name}": ${formattedValues}; exporting ${JSON.stringify(
            selected
          )}.`
        );
      }
    };

    for (const [name, metadata] of metadataByName) {
      if (metadata.typeValues.size > 1) {
        warn('TYPE', name, metadata.typeValues);
        continue;
      }
      if (metadata.helpValues.size > 1) {
        warn('HELP', name, metadata.helpValues, metadata.help);
      }
      if (metadata.unitValues.size > 1) {
        warn('UNIT', name, metadata.unitValues, metadata.unit);
      }
    }

    this._activeMetadataConflicts = activeConflicts;
  }

  private _serializeMetricData(
    metricData: MetricData,
    scope: InstrumentationScope,
    normalizedName?: string,
    metadataByName?: Map<string, PrometheusMetadata>
  ) {
    const name = normalizedName ?? this._getPrometheusMetricName(metricData);
    if (name === undefined) {
      return '';
    }

    const currentMetadata =
      metadataByName?.get(name) ??
      createPrometheusMetadata(
        metricData.descriptor.description,
        metricData.descriptor.unit,
        toPrometheusType(metricData)
      );
    if (currentMetadata.state === 'dropped') {
      return '';
    }
    const writeMetadata = currentMetadata.state === 'pending';
    currentMetadata.state = 'emitted';

    const help = `# HELP ${name} ${escapeString(
      currentMetadata.help || 'description missing'
    )}`;
    const unit = currentMetadata.unit
      ? `\n# UNIT ${name} ${escapeString(currentMetadata.unit)}`
      : '';
    const type = `# TYPE ${name} ${currentMetadata.type}`;
    const dataPointType = metricData.dataPointType;
    let additionalAttributes: Attributes | undefined;

    if (this._withoutScopeInfo) {
      additionalAttributes = this._additionalAttributes;
    } else {
      const scopeInfo: Attributes = { [ATTR_OTEL_SCOPE_NAME]: scope.name };

      if (scope.schemaUrl) {
        scopeInfo[ATTR_OTEL_SCOPE_SCHEMA_URL] = scope.schemaUrl;
      }

      if (scope.version) {
        scopeInfo[ATTR_OTEL_SCOPE_VERSION] = scope.version;
      }

      additionalAttributes = Object.assign(
        scopeInfo,
        this._additionalAttributes
      );
    }

    let results = '';
    switch (dataPointType) {
      case DataPointType.SUM:
      case DataPointType.GAUGE: {
        results = metricData.dataPoints
          .map(it =>
            this._serializeSingularDataPoint(
              name,
              metricData,
              it,
              additionalAttributes
            )
          )
          .join('');
        break;
      }
      case DataPointType.HISTOGRAM: {
        results = metricData.dataPoints
          .map(it =>
            this._serializeHistogramDataPoint(
              name,
              metricData,
              it,
              additionalAttributes
            )
          )
          .join('');
        break;
      }
      default: {
        diag.error(
          `Unrecognizable DataPointType: ${dataPointType} for metric "${name}"`
        );
      }
    }

    return `${writeMetadata ? `${help}${unit}\n${type}\n` : ''}${results}`.trim();
  }

  private _getPrometheusMetricName(metricData: MetricData) {
    let name = sanitizePrometheusMetricName(
      escapeString(metricData.descriptor.name)
    );
    if (this._prefix) {
      name = `${this._prefix}${name}`;
    }

    if (name === '') {
      diag.error(
        `Normalization for metric "${metricData.descriptor.name}" resulted in empty name`
      );
      return undefined;
    } else if (name === '_') {
      diag.error(
        `Normalization for metric "${metricData.descriptor.name}" resulted in an invalid name: "_"`
      );
      return undefined;
    } else if (name[0] >= '0' && name[0] <= '9') {
      name = `_${name}`;
    }

    return enforcePrometheusNamingConvention(name, metricData);
  }

  private _serializeSingularDataPoint(
    name: string,
    data: MetricData,
    dataPoint: DataPoint<number>,
    additionalAttributes: Attributes | undefined
  ): string {
    let results = '';

    const { value, attributes } = dataPoint;
    const timestamp = hrTimeToMilliseconds(dataPoint.endTime);
    results += stringify(
      name,
      attributes,
      value,
      this._appendTimestamp ? timestamp : undefined,
      additionalAttributes
    );
    return results;
  }

  private _serializeHistogramDataPoint(
    name: string,
    data: MetricData,
    dataPoint: DataPoint<Histogram>,
    additionalAttributes: Attributes | undefined
  ): string {
    let results = '';

    const attributes = dataPoint.attributes;
    const histogram = dataPoint.value;
    const timestamp = hrTimeToMilliseconds(dataPoint.endTime);
    /** Histogram["bucket"] is not typed with `number` */
    for (const key of ['count', 'sum'] as ('count' | 'sum')[]) {
      const value = histogram[key];
      if (value != null)
        results += stringify(
          name + '_' + key,
          attributes,
          value,
          this._appendTimestamp ? timestamp : undefined,
          additionalAttributes
        );
    }

    let cumulativeSum = 0;
    const countEntries = histogram.buckets.counts.entries();
    let infiniteBoundaryDefined = false;
    for (const [idx, val] of countEntries) {
      cumulativeSum += val;
      const upperBound = histogram.buckets.boundaries[idx];
      /** HistogramAggregator is producing different boundary output -
       * in one case not including infinity values, in other -
       * full, e.g. [0, 100] and [0, 100, Infinity]
       * we should consider that in export, if Infinity is defined, use it
       * as boundary
       */
      if (upperBound === undefined && infiniteBoundaryDefined) {
        break;
      }
      if (upperBound === Infinity) {
        infiniteBoundaryDefined = true;
      }
      results += stringify(
        name + '_bucket',
        attributes,
        cumulativeSum,
        this._appendTimestamp ? timestamp : undefined,
        Object.assign({}, additionalAttributes, {
          le:
            upperBound === undefined || upperBound === Infinity
              ? '+Inf'
              : String(upperBound),
        })
      );
    }

    return results;
  }

  protected _serializeResource(
    resource: Resource,
    metadataByName?: Map<string, PrometheusMetadata>
  ): string {
    if (this._withoutTargetInfo === true) {
      return '';
    }

    const name = 'target_info';
    const metadata =
      metadataByName?.get(name) ??
      createPrometheusMetadata('Target metadata', '', 'gauge');
    if (metadata.state === 'dropped') {
      return '';
    }

    const writeMetadata = metadata.state === 'pending';
    metadata.state = 'emitted';
    const help = `# HELP ${name} ${escapeString(metadata.help)}`;
    const unit = metadata.unit
      ? `\n# UNIT ${name} ${escapeString(metadata.unit)}`
      : '';
    const type = `# TYPE ${name} ${metadata.type}`;

    const results = stringify(name, resource.attributes, 1).trim();
    return `${writeMetadata ? `${help}${unit}\n${type}\n` : ''}${results}\n`;
  }
}
