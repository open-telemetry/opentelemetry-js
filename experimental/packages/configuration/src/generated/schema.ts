/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable */
// AUTO-GENERATED — do not edit
// Generated from opentelemetry-configuration JSON schema
// Run `npm run generate:config` from the configuration package to regenerate

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const opentelemetryConfigurationSchema: any = {
  "$id": "https://opentelemetry.io/otelconfig/opentelemetry_configuration.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "OpenTelemetryConfiguration",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "file_format": {
      "type": "string",
      "description": "The file format version.\nRepresented as a string including the semver major, minor version numbers (and optionally the meta tag). For example: \"0.4\", \"1.0-rc.2\", \"1.0\" (after stable release).\nSee https://github.com/open-telemetry/opentelemetry-configuration/blob/main/VERSIONING.md for more details.\nThe yaml format is documented at https://github.com/open-telemetry/opentelemetry-configuration/tree/main/schema\nProperty is required and must be non-null.\n"
    },
    "disabled": {
      "type": [
        "boolean",
        "null"
      ],
      "description": "Configure if the SDK is disabled or not.\nIf omitted or null, false is used.\n"
    },
    "log_level": {
      "$ref": "#/$defs/SeverityNumber",
      "description": "Configure the log level of the internal logger used by the SDK.\nValues include:\n* debug: debug, severity number 5.\n* debug2: debug2, severity number 6.\n* debug3: debug3, severity number 7.\n* debug4: debug4, severity number 8.\n* error: error, severity number 17.\n* error2: error2, severity number 18.\n* error3: error3, severity number 19.\n* error4: error4, severity number 20.\n* fatal: fatal, severity number 21.\n* fatal2: fatal2, severity number 22.\n* fatal3: fatal3, severity number 23.\n* fatal4: fatal4, severity number 24.\n* info: info, severity number 9.\n* info2: info2, severity number 10.\n* info3: info3, severity number 11.\n* info4: info4, severity number 12.\n* trace: trace, severity number 1.\n* trace2: trace2, severity number 2.\n* trace3: trace3, severity number 3.\n* trace4: trace4, severity number 4.\n* warn: warn, severity number 13.\n* warn2: warn2, severity number 14.\n* warn3: warn3, severity number 15.\n* warn4: warn4, severity number 16.\nIf omitted, INFO is used.\n"
    },
    "attribute_limits": {
      "$ref": "#/$defs/AttributeLimits",
      "description": "Configure general attribute limits. See also tracer_provider.limits, logger_provider.limits.\nIf omitted, default values as described in AttributeLimits are used.\n"
    },
    "logger_provider": {
      "$ref": "#/$defs/LoggerProvider",
      "description": "Configure logger provider.\nIf omitted, a noop logger provider is used.\n"
    },
    "meter_provider": {
      "$ref": "#/$defs/MeterProvider",
      "description": "Configure meter provider.\nIf omitted, a noop meter provider is used.\n"
    },
    "propagator": {
      "$ref": "#/$defs/Propagator",
      "description": "Configure text map context propagators.\nIf omitted, a noop propagator is used.\n"
    },
    "tracer_provider": {
      "$ref": "#/$defs/TracerProvider",
      "description": "Configure tracer provider.\nIf omitted, a noop tracer provider is used.\n"
    },
    "resource": {
      "$ref": "#/$defs/Resource",
      "description": "Configure resource for all signals.\nIf omitted, the default resource is used.\n"
    },
    "instrumentation/development": {
      "$ref": "#/$defs/ExperimentalInstrumentation",
      "description": "Configure instrumentation.\nIf omitted, instrumentation defaults are used.\n"
    },
    "distribution": {
      "$ref": "#/$defs/Distribution",
      "description": "Defines configuration parameters specific to a particular OpenTelemetry distribution or vendor.\nThis section provides a standardized location for distribution-specific settings\nthat are not part of the OpenTelemetry configuration model.\nIt allows vendors to expose their own extensions and general configuration options.\nIf omitted, distribution defaults are used.\n"
    }
  },
  "required": [
    "file_format"
  ],
  "$defs": {
    "Aggregation": {
      "type": "object",
      "additionalProperties": false,
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "default": {
          "$ref": "#/$defs/DefaultAggregation",
          "description": "Configures the stream to use the instrument kind to select an aggregation and advisory parameters to influence aggregation configuration parameters. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#default-aggregation for details.\nIf omitted, ignore.\n"
        },
        "drop": {
          "$ref": "#/$defs/DropAggregation",
          "description": "Configures the stream to ignore/drop all instrument measurements. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#drop-aggregation for details.\nIf omitted, ignore.\n"
        },
        "explicit_bucket_histogram": {
          "$ref": "#/$defs/ExplicitBucketHistogramAggregation",
          "description": "Configures the stream to collect data for the histogram metric point using a set of explicit boundary values for histogram bucketing. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#explicit-bucket-histogram-aggregation for details\nIf omitted, ignore.\n"
        },
        "base2_exponential_bucket_histogram": {
          "$ref": "#/$defs/Base2ExponentialBucketHistogramAggregation",
          "description": "Configures the stream to collect data for the exponential histogram metric point, which uses a base-2 exponential formula to determine bucket boundaries and an integer scale parameter to control resolution. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#base2-exponential-bucket-histogram-aggregation for details.\nIf omitted, ignore.\n"
        },
        "last_value": {
          "$ref": "#/$defs/LastValueAggregation",
          "description": "Configures the stream to collect data using the last measurement. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#last-value-aggregation for details.\nIf omitted, ignore.\n"
        },
        "sum": {
          "$ref": "#/$defs/SumAggregation",
          "description": "Configures the stream to collect the arithmetic sum of measurement values. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#sum-aggregation for details.\nIf omitted, ignore.\n"
        }
      }
    },
    "AlwaysOffSampler": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "AlwaysOnSampler": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "AttributeLimits": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "attribute_value_length_limit": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max attribute value size. \nValue must be non-negative.\nIf omitted or null, there is no limit.\n"
        },
        "attribute_count_limit": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max attribute count. \nValue must be non-negative.\nIf omitted or null, 128 is used.\n"
        }
      }
    },
    "AttributeNameValue": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "name": {
          "type": "string",
          "description": "The attribute name.\nProperty is required and must be non-null.\n"
        },
        "value": {
          "oneOf": [
            {
              "type": "string"
            },
            {
              "type": "number"
            },
            {
              "type": "boolean"
            },
            {
              "type": "null"
            },
            {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            {
              "type": "array",
              "items": {
                "type": "boolean"
              }
            },
            {
              "type": "array",
              "items": {
                "type": "number"
              }
            }
          ],
          "description": "The attribute value.\nThe type of value must match .type.\nProperty is required and must be non-null.\n"
        },
        "type": {
          "$ref": "#/$defs/AttributeType",
          "description": "The attribute type.\nValues include:\n* bool: Boolean attribute value.\n* bool_array: Boolean array attribute value.\n* double: Double attribute value.\n* double_array: Double array attribute value.\n* int: Integer attribute value.\n* int_array: Integer array attribute value.\n* string: String attribute value.\n* string_array: String array attribute value.\nIf omitted, string is used.\n"
        }
      },
      "required": [
        "name",
        "value"
      ]
    },
    "AttributeType": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "string",
        "bool",
        "int",
        "double",
        "string_array",
        "bool_array",
        "int_array",
        "double_array"
      ]
    },
    "B3MultiPropagator": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "B3Propagator": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "BaggagePropagator": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "Base2ExponentialBucketHistogramAggregation": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "max_scale": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": -10,
          "maximum": 20,
          "description": "Configure the max scale factor.\nIf omitted or null, 20 is used.\n"
        },
        "max_size": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 2,
          "description": "Configure the maximum number of buckets in each of the positive and negative ranges, not counting the special zero bucket.\nIf omitted or null, 160 is used.\n"
        },
        "record_min_max": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Configure whether or not to record min and max.\nIf omitted or null, true is used.\n"
        }
      }
    },
    "BatchLogRecordProcessor": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "schedule_delay": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure delay interval (in milliseconds) between two consecutive exports. \nValue must be non-negative.\nIf omitted or null, 1000 is used.\n"
        },
        "export_timeout": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure maximum allowed time (in milliseconds) to export data. \nValue must be non-negative. A value of 0 indicates no limit (infinity).\nIf omitted or null, 30000 is used.\n"
        },
        "max_queue_size": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure maximum queue size. Value must be positive.\nIf omitted or null, 2048 is used.\n"
        },
        "max_export_batch_size": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure maximum batch size. Value must be positive.\nIf omitted or null, 512 is used.\n"
        },
        "exporter": {
          "$ref": "#/$defs/LogRecordExporter",
          "description": "Configure exporter.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "exporter"
      ]
    },
    "BatchSpanProcessor": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "schedule_delay": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure delay interval (in milliseconds) between two consecutive exports. \nValue must be non-negative.\nIf omitted or null, 5000 is used.\n"
        },
        "export_timeout": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure maximum allowed time (in milliseconds) to export data. \nValue must be non-negative. A value of 0 indicates no limit (infinity).\nIf omitted or null, 30000 is used.\n"
        },
        "max_queue_size": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure maximum queue size. Value must be positive.\nIf omitted or null, 2048 is used.\n"
        },
        "max_export_batch_size": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure maximum batch size. Value must be positive.\nIf omitted or null, 512 is used.\n"
        },
        "exporter": {
          "$ref": "#/$defs/SpanExporter",
          "description": "Configure exporter.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "exporter"
      ]
    },
    "CardinalityLimits": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "default": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure default cardinality limit for all instrument types.\nInstrument-specific cardinality limits take priority. \nIf omitted or null, 2000 is used.\n"
        },
        "counter": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure default cardinality limit for counter instruments.\nIf omitted or null, the value from .default is used.\n"
        },
        "gauge": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure default cardinality limit for gauge instruments.\nIf omitted or null, the value from .default is used.\n"
        },
        "histogram": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure default cardinality limit for histogram instruments.\nIf omitted or null, the value from .default is used.\n"
        },
        "observable_counter": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure default cardinality limit for observable_counter instruments.\nIf omitted or null, the value from .default is used.\n"
        },
        "observable_gauge": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure default cardinality limit for observable_gauge instruments.\nIf omitted or null, the value from .default is used.\n"
        },
        "observable_up_down_counter": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure default cardinality limit for observable_up_down_counter instruments.\nIf omitted or null, the value from .default is used.\n"
        },
        "up_down_counter": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure default cardinality limit for up_down_counter instruments.\nIf omitted or null, the value from .default is used.\n"
        }
      }
    },
    "ConsoleExporter": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "ConsoleMetricExporter": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "temporality_preference": {
          "$ref": "#/$defs/ExporterTemporalityPreference",
          "description": "Configure temporality preference.\nValues include:\n* cumulative: Use cumulative aggregation temporality for all instrument types.\n* delta: Use delta aggregation for all instrument types except up down counter and asynchronous up down counter.\n* low_memory: Use delta aggregation temporality for counter and histogram instrument types. Use cumulative aggregation temporality for all other instrument types.\nIf omitted, cumulative is used.\n"
        },
        "default_histogram_aggregation": {
          "$ref": "#/$defs/ExporterDefaultHistogramAggregation",
          "description": "Configure default histogram aggregation.\nValues include:\n* base2_exponential_bucket_histogram: Use base2 exponential histogram as the default aggregation for histogram instruments.\n* explicit_bucket_histogram: Use explicit bucket histogram as the default aggregation for histogram instruments.\nIf omitted, explicit_bucket_histogram is used.\n"
        }
      }
    },
    "DefaultAggregation": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "Distribution": {
      "type": "object",
      "additionalProperties": {
        "type": "object"
      },
      "minProperties": 1
    },
    "DropAggregation": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "ExemplarFilter": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "always_on",
        "always_off",
        "trace_based"
      ]
    },
    "ExperimentalComposableAlwaysOffSampler": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "ExperimentalComposableAlwaysOnSampler": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "ExperimentalComposableParentThresholdSampler": {
      "type": [
        "object"
      ],
      "additionalProperties": false,
      "properties": {
        "root": {
          "$ref": "#/$defs/ExperimentalComposableSampler",
          "description": "Sampler to use when there is no parent.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "root"
      ]
    },
    "ExperimentalComposableProbabilitySampler": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "ratio": {
          "type": [
            "number",
            "null"
          ],
          "minimum": 0,
          "maximum": 1,
          "description": "Configure ratio.\nIf omitted or null, 1.0 is used.\n"
        }
      }
    },
    "ExperimentalComposableRuleBasedSampler": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "rules": {
          "type": [
            "array",
            "null"
          ],
          "items": {
            "$ref": "#/$defs/ExperimentalComposableRuleBasedSamplerRule"
          },
          "description": "The rules for the sampler, matched in order. If no rules match, the span is not sampled.\nIf omitted or null, no span is sampled.\n"
        }
      }
    },
    "ExperimentalComposableRuleBasedSamplerRule": {
      "type": "object",
      "description": "A rule for ExperimentalComposableRuleBasedSampler. A rule can have multiple match conditions - the sampler will be applied if all match. \nIf no conditions are specified, the rule matches all spans that reach it.\n",
      "additionalProperties": false,
      "properties": {
        "attribute_values": {
          "$ref": "#/$defs/ExperimentalComposableRuleBasedSamplerRuleAttributeValues",
          "description": "Values to match against a single attribute. Non-string attributes are matched using their string representation:\nfor example, a value of \"404\" would match the http.response.status_code 404. For array attributes, if any\nitem matches, it is considered a match.\nIf omitted, ignore.\n"
        },
        "attribute_patterns": {
          "$ref": "#/$defs/ExperimentalComposableRuleBasedSamplerRuleAttributePatterns",
          "description": "Patterns to match against a single attribute. Non-string attributes are matched using their string representation:\nfor example, a pattern of \"4*\" would match any http.response.status_code in 400-499. For array attributes, if any\nitem matches, it is considered a match.\nIf omitted, ignore.\n"
        },
        "span_kinds": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/SpanKind"
          },
          "description": "The span kinds to match. If the span's kind matches any of these, it matches.\nValues include:\n* client: client, a client span.\n* consumer: consumer, a consumer span.\n* internal: internal, an internal span.\n* producer: producer, a producer span.\n* server: server, a server span.\nIf omitted, ignore.\n"
        },
        "parent": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ExperimentalSpanParent"
          },
          "description": "The parent span types to match.\nValues include:\n* local: local, a local parent.\n* none: none, no parent, i.e., the trace root.\n* remote: remote, a remote parent.\nIf omitted, ignore.\n"
        },
        "sampler": {
          "$ref": "#/$defs/ExperimentalComposableSampler",
          "description": "The sampler to use for matching spans.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "sampler"
      ]
    },
    "ExperimentalComposableRuleBasedSamplerRuleAttributePatterns": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "key": {
          "type": "string",
          "description": "The attribute key to match against.\nProperty is required and must be non-null.\n"
        },
        "included": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Configure list of value patterns to include.\nValues are evaluated to match as follows:\n * If the value exactly matches.\n * If the value matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.\nIf omitted, all values are included.\n"
        },
        "excluded": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Configure list of value patterns to exclude. Applies after .included (i.e. excluded has higher priority than included).\nValues are evaluated to match as follows:\n * If the value exactly matches.\n * If the value matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.\nIf omitted, .included attributes are included.\n"
        }
      },
      "required": [
        "key"
      ]
    },
    "ExperimentalComposableRuleBasedSamplerRuleAttributeValues": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "key": {
          "type": "string",
          "description": "The attribute key to match against.\nProperty is required and must be non-null.\n"
        },
        "values": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "The attribute values to match against. If the attribute's value matches any of these, it matches.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "key",
        "values"
      ]
    },
    "ExperimentalComposableSampler": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "always_off": {
          "$ref": "#/$defs/ExperimentalComposableAlwaysOffSampler",
          "description": "Configure sampler to be always_off.\nIf omitted, ignore.\n"
        },
        "always_on": {
          "$ref": "#/$defs/ExperimentalComposableAlwaysOnSampler",
          "description": "Configure sampler to be always_on.\nIf omitted, ignore.\n"
        },
        "parent_threshold": {
          "$ref": "#/$defs/ExperimentalComposableParentThresholdSampler",
          "description": "Configure sampler to be parent_threshold.\nIf omitted, ignore.\n"
        },
        "probability": {
          "$ref": "#/$defs/ExperimentalComposableProbabilitySampler",
          "description": "Configure sampler to be probability.\nIf omitted, ignore.\n"
        },
        "rule_based": {
          "$ref": "#/$defs/ExperimentalComposableRuleBasedSampler",
          "description": "Configure sampler to be rule_based.\nIf omitted, ignore.\n"
        }
      }
    },
    "ExperimentalContainerResourceDetector": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "ExperimentalGeneralInstrumentation": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "peer": {
          "$ref": "#/$defs/ExperimentalPeerInstrumentation",
          "description": "Configure instrumentations following the peer semantic conventions.\nSee peer semantic conventions: https://opentelemetry.io/docs/specs/semconv/attributes-registry/peer/\nIf omitted, defaults as described in ExperimentalPeerInstrumentation are used.\n"
        },
        "http": {
          "$ref": "#/$defs/ExperimentalHttpInstrumentation",
          "description": "Configure instrumentations following the http semantic conventions.\nSee http semantic conventions: https://opentelemetry.io/docs/specs/semconv/http/\nIf omitted, defaults as described in ExperimentalHttpInstrumentation are used.\n"
        }
      }
    },
    "ExperimentalHostResourceDetector": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "ExperimentalHttpClientInstrumentation": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "request_captured_headers": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Configure headers to capture for outbound http requests.\nIf omitted, no outbound request headers are captured.\n"
        },
        "response_captured_headers": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Configure headers to capture for inbound http responses.\nIf omitted, no inbound response headers are captured.\n"
        }
      }
    },
    "ExperimentalHttpInstrumentation": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "client": {
          "$ref": "#/$defs/ExperimentalHttpClientInstrumentation",
          "description": "Configure instrumentations following the http client semantic conventions.\nIf omitted, defaults as described in ExperimentalHttpClientInstrumentation are used.\n"
        },
        "server": {
          "$ref": "#/$defs/ExperimentalHttpServerInstrumentation",
          "description": "Configure instrumentations following the http server semantic conventions.\nIf omitted, defaults as described in ExperimentalHttpServerInstrumentation are used.\n"
        }
      }
    },
    "ExperimentalHttpServerInstrumentation": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "request_captured_headers": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Configure headers to capture for inbound http requests.\nIf omitted, no request headers are captured.\n"
        },
        "response_captured_headers": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Configure headers to capture for outbound http responses.\nIf omitted, no response headers are captures.\n"
        }
      }
    },
    "ExperimentalInstrumentation": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "general": {
          "$ref": "#/$defs/ExperimentalGeneralInstrumentation",
          "description": "Configure general SemConv options that may apply to multiple languages and instrumentations.\nInstrumenation may merge general config options with the language specific configuration at .instrumentation.<language>.\nIf omitted, default values as described in ExperimentalGeneralInstrumentation are used.\n"
        },
        "cpp": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure C++ language-specific instrumentation libraries.\nIf omitted, instrumentation defaults are used.\n"
        },
        "dotnet": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure .NET language-specific instrumentation libraries.\nEach entry's key identifies a particular instrumentation library. The corresponding value configures it.\nIf omitted, instrumentation defaults are used.\n"
        },
        "erlang": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure Erlang language-specific instrumentation libraries.\nEach entry's key identifies a particular instrumentation library. The corresponding value configures it.\nIf omitted, instrumentation defaults are used.\n"
        },
        "go": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure Go language-specific instrumentation libraries.\nEach entry's key identifies a particular instrumentation library. The corresponding value configures it.\nIf omitted, instrumentation defaults are used.\n"
        },
        "java": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure Java language-specific instrumentation libraries.\nEach entry's key identifies a particular instrumentation library. The corresponding value configures it.\nIf omitted, instrumentation defaults are used.\n"
        },
        "js": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure JavaScript language-specific instrumentation libraries.\nEach entry's key identifies a particular instrumentation library. The corresponding value configures it.\nIf omitted, instrumentation defaults are used.\n"
        },
        "php": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure PHP language-specific instrumentation libraries.\nEach entry's key identifies a particular instrumentation library. The corresponding value configures it.\nIf omitted, instrumentation defaults are used.\n"
        },
        "python": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure Python language-specific instrumentation libraries.\nEach entry's key identifies a particular instrumentation library. The corresponding value configures it.\nIf omitted, instrumentation defaults are used.\n"
        },
        "ruby": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure Ruby language-specific instrumentation libraries.\nEach entry's key identifies a particular instrumentation library. The corresponding value configures it.\nIf omitted, instrumentation defaults are used.\n"
        },
        "rust": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure Rust language-specific instrumentation libraries.\nEach entry's key identifies a particular instrumentation library. The corresponding value configures it.\nIf omitted, instrumentation defaults are used.\n"
        },
        "swift": {
          "$ref": "#/$defs/ExperimentalLanguageSpecificInstrumentation",
          "description": "Configure Swift language-specific instrumentation libraries.\nEach entry's key identifies a particular instrumentation library. The corresponding value configures it.\nIf omitted, instrumentation defaults are used.\n"
        }
      }
    },
    "ExperimentalJaegerRemoteSampler": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "endpoint": {
          "type": [
            "string"
          ],
          "description": "Configure the endpoint of the jaeger remote sampling service.\nProperty is required and must be non-null.\n"
        },
        "interval": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure the polling interval (in milliseconds) to fetch from the remote sampling service.\nIf omitted or null, 60000 is used.\n"
        },
        "initial_sampler": {
          "$ref": "#/$defs/Sampler",
          "description": "Configure the initial sampler used before first configuration is fetched.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "endpoint",
        "initial_sampler"
      ]
    },
    "ExperimentalLanguageSpecificInstrumentation": {
      "type": "object",
      "additionalProperties": {
        "type": "object"
      }
    },
    "ExperimentalLoggerConfig": {
      "type": [
        "object"
      ],
      "additionalProperties": false,
      "properties": {
        "disabled": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Configure if the logger is enabled or not.\nIf omitted or null, false is used.\n"
        },
        "minimum_severity": {
          "$ref": "#/$defs/SeverityNumber",
          "description": "Configure severity filtering.\nLog records with an non-zero (i.e. unspecified) severity number which is less than minimum_severity are not processed.\nValues include:\n* debug: debug, severity number 5.\n* debug2: debug2, severity number 6.\n* debug3: debug3, severity number 7.\n* debug4: debug4, severity number 8.\n* error: error, severity number 17.\n* error2: error2, severity number 18.\n* error3: error3, severity number 19.\n* error4: error4, severity number 20.\n* fatal: fatal, severity number 21.\n* fatal2: fatal2, severity number 22.\n* fatal3: fatal3, severity number 23.\n* fatal4: fatal4, severity number 24.\n* info: info, severity number 9.\n* info2: info2, severity number 10.\n* info3: info3, severity number 11.\n* info4: info4, severity number 12.\n* trace: trace, severity number 1.\n* trace2: trace2, severity number 2.\n* trace3: trace3, severity number 3.\n* trace4: trace4, severity number 4.\n* warn: warn, severity number 13.\n* warn2: warn2, severity number 14.\n* warn3: warn3, severity number 15.\n* warn4: warn4, severity number 16.\nIf omitted, severity filtering is not applied.\n"
        },
        "trace_based": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Configure trace based filtering.\nIf true, log records associated with unsampled trace contexts traces are not processed. If false, or if a log record is not associated with a trace context, trace based filtering is not applied.\nIf omitted or null, trace based filtering is not applied.\n"
        }
      }
    },
    "ExperimentalLoggerConfigurator": {
      "type": [
        "object"
      ],
      "additionalProperties": false,
      "properties": {
        "default_config": {
          "$ref": "#/$defs/ExperimentalLoggerConfig",
          "description": "Configure the default logger config used there is no matching entry in .logger_configurator/development.loggers.\nIf omitted, unmatched .loggers use default values as described in ExperimentalLoggerConfig.\n"
        },
        "loggers": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ExperimentalLoggerMatcherAndConfig"
          },
          "description": "Configure loggers.\nIf omitted, all loggers use .default_config.\n"
        }
      }
    },
    "ExperimentalLoggerMatcherAndConfig": {
      "type": [
        "object"
      ],
      "additionalProperties": false,
      "properties": {
        "name": {
          "type": [
            "string"
          ],
          "description": "Configure logger names to match, evaluated as follows:\n\n * If the logger name exactly matches.\n * If the logger name matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.\nProperty is required and must be non-null.\n"
        },
        "config": {
          "$ref": "#/$defs/ExperimentalLoggerConfig",
          "description": "The logger config.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "name",
        "config"
      ]
    },
    "ExperimentalMeterConfig": {
      "type": [
        "object"
      ],
      "additionalProperties": false,
      "properties": {
        "disabled": {
          "type": [
            "boolean"
          ],
          "description": "Configure if the meter is enabled or not.\nIf omitted, false is used.\n"
        }
      }
    },
    "ExperimentalMeterConfigurator": {
      "type": [
        "object"
      ],
      "additionalProperties": false,
      "properties": {
        "default_config": {
          "$ref": "#/$defs/ExperimentalMeterConfig",
          "description": "Configure the default meter config used there is no matching entry in .meter_configurator/development.meters.\nIf omitted, unmatched .meters use default values as described in ExperimentalMeterConfig.\n"
        },
        "meters": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ExperimentalMeterMatcherAndConfig"
          },
          "description": "Configure meters.\nIf omitted, all meters used .default_config.\n"
        }
      }
    },
    "ExperimentalMeterMatcherAndConfig": {
      "type": [
        "object"
      ],
      "additionalProperties": false,
      "properties": {
        "name": {
          "type": [
            "string"
          ],
          "description": "Configure meter names to match, evaluated as follows:\n\n * If the meter name exactly matches.\n * If the meter name matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.\nProperty is required and must be non-null.\n"
        },
        "config": {
          "$ref": "#/$defs/ExperimentalMeterConfig",
          "description": "The meter config.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "name",
        "config"
      ]
    },
    "ExperimentalOtlpFileExporter": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "output_stream": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure output stream. \nValues include stdout, or scheme+destination. For example: file:///path/to/file.jsonl.\nIf omitted or null, stdout is used.\n"
        }
      }
    },
    "ExperimentalOtlpFileMetricExporter": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "output_stream": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure output stream. \nValues include stdout, or scheme+destination. For example: file:///path/to/file.jsonl.\nIf omitted or null, stdout is used.\n"
        },
        "temporality_preference": {
          "$ref": "#/$defs/ExporterTemporalityPreference",
          "description": "Configure temporality preference.\nValues include:\n* cumulative: Use cumulative aggregation temporality for all instrument types.\n* delta: Use delta aggregation for all instrument types except up down counter and asynchronous up down counter.\n* low_memory: Use delta aggregation temporality for counter and histogram instrument types. Use cumulative aggregation temporality for all other instrument types.\nIf omitted, cumulative is used.\n"
        },
        "default_histogram_aggregation": {
          "$ref": "#/$defs/ExporterDefaultHistogramAggregation",
          "description": "Configure default histogram aggregation.\nValues include:\n* base2_exponential_bucket_histogram: Use base2 exponential histogram as the default aggregation for histogram instruments.\n* explicit_bucket_histogram: Use explicit bucket histogram as the default aggregation for histogram instruments.\nIf omitted, explicit_bucket_histogram is used.\n"
        }
      }
    },
    "ExperimentalPeerInstrumentation": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "service_mapping": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ExperimentalPeerServiceMapping"
          },
          "description": "Configure the service mapping for instrumentations following peer.service semantic conventions.\nSee peer.service semantic conventions: https://opentelemetry.io/docs/specs/semconv/general/attributes/#general-remote-service-attributes\nIf omitted, no peer service mappings are used.\n"
        }
      }
    },
    "ExperimentalPeerServiceMapping": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "peer": {
          "type": "string",
          "description": "The IP address to map.\nProperty is required and must be non-null.\n"
        },
        "service": {
          "type": "string",
          "description": "The logical name corresponding to the IP address of .peer.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "peer",
        "service"
      ]
    },
    "ExperimentalProbabilitySampler": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "ratio": {
          "type": [
            "number",
            "null"
          ],
          "minimum": 0,
          "maximum": 1,
          "description": "Configure ratio.\nIf omitted or null, 1.0 is used.\n"
        }
      }
    },
    "ExperimentalProcessResourceDetector": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "ExperimentalPrometheusMetricExporter": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "host": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure host.\nIf omitted or null, localhost is used.\n"
        },
        "port": {
          "type": [
            "integer",
            "null"
          ],
          "description": "Configure port.\nIf omitted or null, 9464 is used.\n"
        },
        "without_scope_info": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Configure Prometheus Exporter to produce metrics without a scope info metric.\nIf omitted or null, false is used.\n"
        },
        "without_target_info": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Configure Prometheus Exporter to produce metrics without a target info metric for the resource.\nIf omitted or null, false is used.\n"
        },
        "with_resource_constant_labels": {
          "$ref": "#/$defs/IncludeExclude",
          "description": "Configure Prometheus Exporter to add resource attributes as metrics attributes, where the resource attribute keys match the patterns.\nIf omitted, no resource attributes are added.\n"
        },
        "translation_strategy": {
          "$ref": "#/$defs/ExperimentalPrometheusTranslationStrategy",
          "description": "Configure how metric names are translated to Prometheus metric names.\nValues include:\n* no_translation: Special character escaping is disabled. Type and unit suffixes are disabled. Metric names are unaltered.\n* no_utf8_escaping_with_suffixes: Special character escaping is disabled. Type and unit suffixes are enabled.\n* underscore_escaping_with_suffixes: Special character escaping is enabled. Type and unit suffixes are enabled.\n* underscore_escaping_without_suffixes: Special character escaping is enabled. Type and unit suffixes are disabled. This represents classic Prometheus metric name compatibility.\nIf omitted, underscore_escaping_with_suffixes is used.\n"
        }
      }
    },
    "ExperimentalPrometheusTranslationStrategy": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "underscore_escaping_with_suffixes",
        "underscore_escaping_without_suffixes",
        "no_utf8_escaping_with_suffixes",
        "no_translation"
      ]
    },
    "ExperimentalResourceDetection": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "attributes": {
          "$ref": "#/$defs/IncludeExclude",
          "description": "Configure attributes provided by resource detectors.\nIf omitted, all attributes from resource detectors are added.\n"
        },
        "detectors": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ExperimentalResourceDetector"
          },
          "description": "Configure resource detectors.\nResource detector names are dependent on the SDK language ecosystem. Please consult documentation for each respective language. \nIf omitted, no resource detectors are enabled.\n"
        }
      }
    },
    "ExperimentalResourceDetector": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "container": {
          "$ref": "#/$defs/ExperimentalContainerResourceDetector",
          "description": "Enable the container resource detector, which populates container.* attributes.\nIf omitted, ignore.\n"
        },
        "host": {
          "$ref": "#/$defs/ExperimentalHostResourceDetector",
          "description": "Enable the host resource detector, which populates host.* and os.* attributes.\nIf omitted, ignore.\n"
        },
        "process": {
          "$ref": "#/$defs/ExperimentalProcessResourceDetector",
          "description": "Enable the process resource detector, which populates process.* attributes.\nIf omitted, ignore.\n"
        },
        "service": {
          "$ref": "#/$defs/ExperimentalServiceResourceDetector",
          "description": "Enable the service detector, which populates service.name based on the OTEL_SERVICE_NAME environment variable and service.instance.id.\nIf omitted, ignore.\n"
        }
      }
    },
    "ExperimentalServiceResourceDetector": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "ExperimentalSpanParent": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "none",
        "remote",
        "local"
      ]
    },
    "ExperimentalTracerConfig": {
      "type": [
        "object"
      ],
      "additionalProperties": false,
      "properties": {
        "disabled": {
          "type": [
            "boolean"
          ],
          "description": "Configure if the tracer is enabled or not.\nIf omitted, false is used.\n"
        }
      }
    },
    "ExperimentalTracerConfigurator": {
      "type": [
        "object"
      ],
      "additionalProperties": false,
      "properties": {
        "default_config": {
          "$ref": "#/$defs/ExperimentalTracerConfig",
          "description": "Configure the default tracer config used there is no matching entry in .tracer_configurator/development.tracers.\nIf omitted, unmatched .tracers use default values as described in ExperimentalTracerConfig.\n"
        },
        "tracers": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ExperimentalTracerMatcherAndConfig"
          },
          "description": "Configure tracers.\nIf omitted, all tracers use .default_config.\n"
        }
      }
    },
    "ExperimentalTracerMatcherAndConfig": {
      "type": [
        "object"
      ],
      "additionalProperties": false,
      "properties": {
        "name": {
          "type": [
            "string"
          ],
          "description": "Configure tracer names to match, evaluated as follows:\n\n * If the tracer name exactly matches.\n * If the tracer name matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.\nProperty is required and must be non-null.\n"
        },
        "config": {
          "$ref": "#/$defs/ExperimentalTracerConfig",
          "description": "The tracer config.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "name",
        "config"
      ]
    },
    "ExplicitBucketHistogramAggregation": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "boundaries": {
          "type": "array",
          "items": {
            "type": "number"
          },
          "description": "Configure bucket boundaries.\nIf omitted, [0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000] is used.\n"
        },
        "record_min_max": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Configure record min and max.\nIf omitted or null, true is used.\n"
        }
      }
    },
    "ExporterDefaultHistogramAggregation": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "explicit_bucket_histogram",
        "base2_exponential_bucket_histogram"
      ]
    },
    "ExporterTemporalityPreference": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "cumulative",
        "delta",
        "low_memory"
      ]
    },
    "GrpcTls": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "ca_file": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure certificate used to verify a server's TLS credentials. \nAbsolute path to certificate file in PEM format.\nIf omitted or null, system default certificate verification is used for secure connections.\n"
        },
        "key_file": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure mTLS private client key. \nAbsolute path to client key file in PEM format. If set, .client_certificate must also be set.\nIf omitted or null, mTLS is not used.\n"
        },
        "cert_file": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure mTLS client certificate. \nAbsolute path to client certificate file in PEM format. If set, .client_key must also be set.\nIf omitted or null, mTLS is not used.\n"
        },
        "insecure": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Configure client transport security for the exporter's connection. \nOnly applicable when .endpoint is provided without http or https scheme. Implementations may choose to ignore .insecure.\nIf omitted or null, false is used.\n"
        }
      }
    },
    "HttpTls": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "ca_file": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure certificate used to verify a server's TLS credentials. \nAbsolute path to certificate file in PEM format.\nIf omitted or null, system default certificate verification is used for secure connections.\n"
        },
        "key_file": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure mTLS private client key. \nAbsolute path to client key file in PEM format. If set, .client_certificate must also be set.\nIf omitted or null, mTLS is not used.\n"
        },
        "cert_file": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure mTLS client certificate. \nAbsolute path to client certificate file in PEM format. If set, .client_key must also be set.\nIf omitted or null, mTLS is not used.\n"
        }
      }
    },
    "IncludeExclude": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "included": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Configure list of value patterns to include.\nValues are evaluated to match as follows:\n * If the value exactly matches.\n * If the value matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.\nIf omitted, all values are included.\n"
        },
        "excluded": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Configure list of value patterns to exclude. Applies after .included (i.e. excluded has higher priority than included).\nValues are evaluated to match as follows:\n * If the value exactly matches.\n * If the value matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.\nIf omitted, .included attributes are included.\n"
        }
      }
    },
    "InstrumentType": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "counter",
        "gauge",
        "histogram",
        "observable_counter",
        "observable_gauge",
        "observable_up_down_counter",
        "up_down_counter"
      ]
    },
    "JaegerPropagator": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "LastValueAggregation": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "LoggerProvider": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "processors": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/LogRecordProcessor"
          },
          "description": "Configure log record processors.\nProperty is required and must be non-null.\n"
        },
        "limits": {
          "$ref": "#/$defs/LogRecordLimits",
          "description": "Configure log record limits. See also attribute_limits.\nIf omitted, default values as described in LogRecordLimits are used.\n"
        },
        "logger_configurator/development": {
          "$ref": "#/$defs/ExperimentalLoggerConfigurator",
          "description": "Configure loggers.\nIf omitted, all loggers use default values as described in ExperimentalLoggerConfig.\n"
        }
      },
      "required": [
        "processors"
      ]
    },
    "LogRecordExporter": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "otlp_http": {
          "$ref": "#/$defs/OtlpHttpExporter",
          "description": "Configure exporter to be OTLP with HTTP transport.\nIf omitted, ignore.\n"
        },
        "otlp_grpc": {
          "$ref": "#/$defs/OtlpGrpcExporter",
          "description": "Configure exporter to be OTLP with gRPC transport.\nIf omitted, ignore.\n"
        },
        "otlp_file/development": {
          "$ref": "#/$defs/ExperimentalOtlpFileExporter",
          "description": "Configure exporter to be OTLP with file transport.\nIf omitted, ignore.\n"
        },
        "console": {
          "$ref": "#/$defs/ConsoleExporter",
          "description": "Configure exporter to be console.\nIf omitted, ignore.\n"
        }
      }
    },
    "LogRecordLimits": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "attribute_value_length_limit": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max attribute value size. Overrides .attribute_limits.attribute_value_length_limit. \nValue must be non-negative.\nIf omitted or null, there is no limit.\n"
        },
        "attribute_count_limit": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max attribute count. Overrides .attribute_limits.attribute_count_limit. \nValue must be non-negative.\nIf omitted or null, 128 is used.\n"
        }
      }
    },
    "LogRecordProcessor": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "batch": {
          "$ref": "#/$defs/BatchLogRecordProcessor",
          "description": "Configure a batch log record processor.\nIf omitted, ignore.\n"
        },
        "simple": {
          "$ref": "#/$defs/SimpleLogRecordProcessor",
          "description": "Configure a simple log record processor.\nIf omitted, ignore.\n"
        }
      }
    },
    "MeterProvider": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "readers": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/MetricReader"
          },
          "description": "Configure metric readers.\nProperty is required and must be non-null.\n"
        },
        "views": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/View"
          },
          "description": "Configure views. \nEach view has a selector which determines the instrument(s) it applies to, and a configuration for the resulting stream(s).\nIf omitted, no views are registered.\n"
        },
        "exemplar_filter": {
          "$ref": "#/$defs/ExemplarFilter",
          "description": "Configure the exemplar filter. \nValues include:\n* always_off: ExemplarFilter which makes no measurements eligible for being an Exemplar.\n* always_on: ExemplarFilter which makes all measurements eligible for being an Exemplar.\n* trace_based: ExemplarFilter which makes measurements recorded in the context of a sampled parent span eligible for being an Exemplar.\nIf omitted, trace_based is used.\n"
        },
        "meter_configurator/development": {
          "$ref": "#/$defs/ExperimentalMeterConfigurator",
          "description": "Configure meters.\nIf omitted, all meters use default values as described in ExperimentalMeterConfig.\n"
        }
      },
      "required": [
        "readers"
      ]
    },
    "MetricProducer": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "opencensus": {
          "$ref": "#/$defs/OpenCensusMetricProducer",
          "description": "Configure metric producer to be opencensus.\nIf omitted, ignore.\n"
        }
      }
    },
    "MetricReader": {
      "type": "object",
      "additionalProperties": false,
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "periodic": {
          "$ref": "#/$defs/PeriodicMetricReader",
          "description": "Configure a periodic metric reader.\nIf omitted, ignore.\n"
        },
        "pull": {
          "$ref": "#/$defs/PullMetricReader",
          "description": "Configure a pull based metric reader.\nIf omitted, ignore.\n"
        }
      }
    },
    "NameStringValuePair": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "name": {
          "type": "string",
          "description": "The name of the pair.\nProperty is required and must be non-null.\n"
        },
        "value": {
          "type": [
            "string",
            "null"
          ],
          "description": "The value of the pair.\nProperty must be present, but if null the behavior is dependent on usage context.\n"
        }
      },
      "required": [
        "name",
        "value"
      ]
    },
    "OpenCensusMetricProducer": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "OpenTracingPropagator": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "OtlpGrpcExporter": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "endpoint": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure endpoint.\nIf omitted or null, http://localhost:4317 is used.\n"
        },
        "tls": {
          "$ref": "#/$defs/GrpcTls",
          "description": "Configure TLS settings for the exporter.\nIf omitted, system default TLS settings are used.\n"
        },
        "headers": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/NameStringValuePair"
          },
          "description": "Configure headers. Entries have higher priority than entries from .headers_list.\nIf an entry's .value is null, the entry is ignored.\nIf omitted, no headers are added.\n"
        },
        "headers_list": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure headers. Entries have lower priority than entries from .headers.\nThe value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options for details.\nIf omitted or null, no headers are added.\n"
        },
        "compression": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure compression.\nKnown values include: gzip, none. Implementations may support other compression algorithms.\nIf omitted or null, none is used.\n"
        },
        "timeout": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max time (in milliseconds) to wait for each export.\nValue must be non-negative. A value of 0 indicates no limit (infinity).\nIf omitted or null, 10000 is used.\n"
        }
      }
    },
    "OtlpGrpcMetricExporter": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "endpoint": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure endpoint.\nIf omitted or null, http://localhost:4317 is used.\n"
        },
        "tls": {
          "$ref": "#/$defs/GrpcTls",
          "description": "Configure TLS settings for the exporter.\nIf omitted, system default TLS settings are used.\n"
        },
        "headers": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/NameStringValuePair"
          },
          "description": "Configure headers. Entries have higher priority than entries from .headers_list.\nIf an entry's .value is null, the entry is ignored.\nIf omitted, no headers are added.\n"
        },
        "headers_list": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure headers. Entries have lower priority than entries from .headers.\nThe value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options for details.\nIf omitted or null, no headers are added.\n"
        },
        "compression": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure compression.\nKnown values include: gzip, none. Implementations may support other compression algorithms.\nIf omitted or null, none is used.\n"
        },
        "timeout": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max time (in milliseconds) to wait for each export.\nValue must be non-negative. A value of 0 indicates no limit (infinity).\nIf omitted or null, 10000 is used.\n"
        },
        "temporality_preference": {
          "$ref": "#/$defs/ExporterTemporalityPreference",
          "description": "Configure temporality preference.\nValues include:\n* cumulative: Use cumulative aggregation temporality for all instrument types.\n* delta: Use delta aggregation for all instrument types except up down counter and asynchronous up down counter.\n* low_memory: Use delta aggregation temporality for counter and histogram instrument types. Use cumulative aggregation temporality for all other instrument types.\nIf omitted, cumulative is used.\n"
        },
        "default_histogram_aggregation": {
          "$ref": "#/$defs/ExporterDefaultHistogramAggregation",
          "description": "Configure default histogram aggregation.\nValues include:\n* base2_exponential_bucket_histogram: Use base2 exponential histogram as the default aggregation for histogram instruments.\n* explicit_bucket_histogram: Use explicit bucket histogram as the default aggregation for histogram instruments.\nIf omitted, explicit_bucket_histogram is used.\n"
        }
      }
    },
    "OtlpHttpEncoding": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "protobuf",
        "json"
      ]
    },
    "OtlpHttpExporter": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "endpoint": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure endpoint, including the signal specific path.\nIf omitted or null, the http://localhost:4318/v1/{signal} (where signal is 'traces', 'logs', or 'metrics') is used.\n"
        },
        "tls": {
          "$ref": "#/$defs/HttpTls",
          "description": "Configure TLS settings for the exporter.\nIf omitted, system default TLS settings are used.\n"
        },
        "headers": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/NameStringValuePair"
          },
          "description": "Configure headers. Entries have higher priority than entries from .headers_list.\nIf an entry's .value is null, the entry is ignored.\nIf omitted, no headers are added.\n"
        },
        "headers_list": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure headers. Entries have lower priority than entries from .headers.\nThe value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options for details.\nIf omitted or null, no headers are added.\n"
        },
        "compression": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure compression.\nKnown values include: gzip, none. Implementations may support other compression algorithms.\nIf omitted or null, none is used.\n"
        },
        "timeout": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max time (in milliseconds) to wait for each export.\nValue must be non-negative. A value of 0 indicates no limit (infinity).\nIf omitted or null, 10000 is used.\n"
        },
        "encoding": {
          "$ref": "#/$defs/OtlpHttpEncoding",
          "description": "Configure the encoding used for messages. \nImplementations may not support json.\nValues include:\n* json: Protobuf JSON encoding.\n* protobuf: Protobuf binary encoding.\nIf omitted, protobuf is used.\n"
        }
      }
    },
    "OtlpHttpMetricExporter": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "endpoint": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure endpoint.\nIf omitted or null, http://localhost:4318/v1/metrics is used.\n"
        },
        "tls": {
          "$ref": "#/$defs/HttpTls",
          "description": "Configure TLS settings for the exporter.\nIf omitted, system default TLS settings are used.\n"
        },
        "headers": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/NameStringValuePair"
          },
          "description": "Configure headers. Entries have higher priority than entries from .headers_list.\nIf an entry's .value is null, the entry is ignored.\nIf omitted, no headers are added.\n"
        },
        "headers_list": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure headers. Entries have lower priority than entries from .headers.\nThe value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options for details.\nIf omitted or null, no headers are added.\n"
        },
        "compression": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure compression.\nKnown values include: gzip, none. Implementations may support other compression algorithms.\nIf omitted or null, none is used.\n"
        },
        "timeout": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max time (in milliseconds) to wait for each export.\nValue must be non-negative. A value of 0 indicates no limit (infinity).\nIf omitted or null, 10000 is used.\n"
        },
        "encoding": {
          "$ref": "#/$defs/OtlpHttpEncoding",
          "description": "Configure the encoding used for messages. \nImplementations may not support json.\nValues include:\n* json: Protobuf JSON encoding.\n* protobuf: Protobuf binary encoding.\nIf omitted, protobuf is used.\n"
        },
        "temporality_preference": {
          "$ref": "#/$defs/ExporterTemporalityPreference",
          "description": "Configure temporality preference.\nValues include:\n* cumulative: Use cumulative aggregation temporality for all instrument types.\n* delta: Use delta aggregation for all instrument types except up down counter and asynchronous up down counter.\n* low_memory: Use delta aggregation temporality for counter and histogram instrument types. Use cumulative aggregation temporality for all other instrument types.\nIf omitted, cumulative is used.\n"
        },
        "default_histogram_aggregation": {
          "$ref": "#/$defs/ExporterDefaultHistogramAggregation",
          "description": "Configure default histogram aggregation.\nValues include:\n* base2_exponential_bucket_histogram: Use base2 exponential histogram as the default aggregation for histogram instruments.\n* explicit_bucket_histogram: Use explicit bucket histogram as the default aggregation for histogram instruments.\nIf omitted, explicit_bucket_histogram is used.\n"
        }
      }
    },
    "ParentBasedSampler": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "root": {
          "$ref": "#/$defs/Sampler",
          "description": "Configure root sampler.\nIf omitted, always_on is used.\n"
        },
        "remote_parent_sampled": {
          "$ref": "#/$defs/Sampler",
          "description": "Configure remote_parent_sampled sampler.\nIf omitted, always_on is used.\n"
        },
        "remote_parent_not_sampled": {
          "$ref": "#/$defs/Sampler",
          "description": "Configure remote_parent_not_sampled sampler.\nIf omitted, always_off is used.\n"
        },
        "local_parent_sampled": {
          "$ref": "#/$defs/Sampler",
          "description": "Configure local_parent_sampled sampler.\nIf omitted, always_on is used.\n"
        },
        "local_parent_not_sampled": {
          "$ref": "#/$defs/Sampler",
          "description": "Configure local_parent_not_sampled sampler.\nIf omitted, always_off is used.\n"
        }
      }
    },
    "PeriodicMetricReader": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "interval": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure delay interval (in milliseconds) between start of two consecutive exports. \nValue must be non-negative.\nIf omitted or null, 60000 is used.\n"
        },
        "timeout": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure maximum allowed time (in milliseconds) to export data. \nValue must be non-negative. A value of 0 indicates no limit (infinity).\nIf omitted or null, 30000 is used.\n"
        },
        "exporter": {
          "$ref": "#/$defs/PushMetricExporter",
          "description": "Configure exporter.\nProperty is required and must be non-null.\n"
        },
        "producers": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/MetricProducer"
          },
          "description": "Configure metric producers.\nIf omitted, no metric producers are added.\n"
        },
        "cardinality_limits": {
          "$ref": "#/$defs/CardinalityLimits",
          "description": "Configure cardinality limits.\nIf omitted, default values as described in CardinalityLimits are used.\n"
        }
      },
      "required": [
        "exporter"
      ]
    },
    "Propagator": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "composite": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/TextMapPropagator"
          },
          "description": "Configure the propagators in the composite text map propagator. Entries from .composite_list are appended to the list here with duplicates filtered out.\nBuilt-in propagator keys include: tracecontext, baggage, b3, b3multi, jaeger, ottrace. Known third party keys include: xray. \nIf omitted, and .composite_list is omitted or null, a noop propagator is used.\n"
        },
        "composite_list": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure the propagators in the composite text map propagator. Entries are appended to .composite with duplicates filtered out.\nThe value is a comma separated list of propagator identifiers matching the format of OTEL_PROPAGATORS. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/configuration/sdk-environment-variables.md#general-sdk-configuration for details.\nBuilt-in propagator identifiers include: tracecontext, baggage, b3, b3multi, jaeger, ottrace. Known third party identifiers include: xray. \nIf omitted or null, and .composite is omitted or null, a noop propagator is used.\n"
        }
      }
    },
    "PullMetricExporter": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "prometheus/development": {
          "$ref": "#/$defs/ExperimentalPrometheusMetricExporter",
          "description": "Configure exporter to be prometheus.\nIf omitted, ignore.\n"
        }
      }
    },
    "PullMetricReader": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "exporter": {
          "$ref": "#/$defs/PullMetricExporter",
          "description": "Configure exporter.\nProperty is required and must be non-null.\n"
        },
        "producers": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/MetricProducer"
          },
          "description": "Configure metric producers.\nIf omitted, no metric producers are added.\n"
        },
        "cardinality_limits": {
          "$ref": "#/$defs/CardinalityLimits",
          "description": "Configure cardinality limits.\nIf omitted, default values as described in CardinalityLimits are used.\n"
        }
      },
      "required": [
        "exporter"
      ]
    },
    "PushMetricExporter": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "otlp_http": {
          "$ref": "#/$defs/OtlpHttpMetricExporter",
          "description": "Configure exporter to be OTLP with HTTP transport.\nIf omitted, ignore.\n"
        },
        "otlp_grpc": {
          "$ref": "#/$defs/OtlpGrpcMetricExporter",
          "description": "Configure exporter to be OTLP with gRPC transport.\nIf omitted, ignore.\n"
        },
        "otlp_file/development": {
          "$ref": "#/$defs/ExperimentalOtlpFileMetricExporter",
          "description": "Configure exporter to be OTLP with file transport.\nIf omitted, ignore.\n"
        },
        "console": {
          "$ref": "#/$defs/ConsoleMetricExporter",
          "description": "Configure exporter to be console.\nIf omitted, ignore.\n"
        }
      }
    },
    "Resource": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "attributes": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/AttributeNameValue"
          },
          "description": "Configure resource attributes. Entries have higher priority than entries from .resource.attributes_list.\nIf omitted, no resource attributes are added.\n"
        },
        "detection/development": {
          "$ref": "#/$defs/ExperimentalResourceDetection",
          "description": "Configure resource detection.\nIf omitted, resource detection is disabled.\n"
        },
        "schema_url": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure resource schema URL.\nIf omitted or null, no schema URL is used.\n"
        },
        "attributes_list": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure resource attributes. Entries have lower priority than entries from .resource.attributes.\nThe value is a list of comma separated key-value pairs matching the format of OTEL_RESOURCE_ATTRIBUTES. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/configuration/sdk-environment-variables.md#general-sdk-configuration for details.\nIf omitted or null, no resource attributes are added.\n"
        }
      }
    },
    "Sampler": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "always_off": {
          "$ref": "#/$defs/AlwaysOffSampler",
          "description": "Configure sampler to be always_off.\nIf omitted, ignore.\n"
        },
        "always_on": {
          "$ref": "#/$defs/AlwaysOnSampler",
          "description": "Configure sampler to be always_on.\nIf omitted, ignore.\n"
        },
        "composite/development": {
          "$ref": "#/$defs/ExperimentalComposableSampler",
          "description": "Configure sampler to be composite.\nIf omitted, ignore.\n"
        },
        "jaeger_remote/development": {
          "$ref": "#/$defs/ExperimentalJaegerRemoteSampler",
          "description": "Configure sampler to be jaeger_remote.\nIf omitted, ignore.\n"
        },
        "parent_based": {
          "$ref": "#/$defs/ParentBasedSampler",
          "description": "Configure sampler to be parent_based.\nIf omitted, ignore.\n"
        },
        "probability/development": {
          "$ref": "#/$defs/ExperimentalProbabilitySampler",
          "description": "Configure sampler to be probability.\nIf omitted, ignore.\n"
        },
        "trace_id_ratio_based": {
          "$ref": "#/$defs/TraceIdRatioBasedSampler",
          "description": "Configure sampler to be trace_id_ratio_based.\nIf omitted, ignore.\n"
        }
      }
    },
    "SeverityNumber": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "trace",
        "trace2",
        "trace3",
        "trace4",
        "debug",
        "debug2",
        "debug3",
        "debug4",
        "info",
        "info2",
        "info3",
        "info4",
        "warn",
        "warn2",
        "warn3",
        "warn4",
        "error",
        "error2",
        "error3",
        "error4",
        "fatal",
        "fatal2",
        "fatal3",
        "fatal4"
      ]
    },
    "SimpleLogRecordProcessor": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "exporter": {
          "$ref": "#/$defs/LogRecordExporter",
          "description": "Configure exporter.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "exporter"
      ]
    },
    "SimpleSpanProcessor": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "exporter": {
          "$ref": "#/$defs/SpanExporter",
          "description": "Configure exporter.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "exporter"
      ]
    },
    "SpanExporter": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "otlp_http": {
          "$ref": "#/$defs/OtlpHttpExporter",
          "description": "Configure exporter to be OTLP with HTTP transport.\nIf omitted, ignore.\n"
        },
        "otlp_grpc": {
          "$ref": "#/$defs/OtlpGrpcExporter",
          "description": "Configure exporter to be OTLP with gRPC transport.\nIf omitted, ignore.\n"
        },
        "otlp_file/development": {
          "$ref": "#/$defs/ExperimentalOtlpFileExporter",
          "description": "Configure exporter to be OTLP with file transport.\nIf omitted, ignore.\n"
        },
        "console": {
          "$ref": "#/$defs/ConsoleExporter",
          "description": "Configure exporter to be console.\nIf omitted, ignore.\n"
        }
      }
    },
    "SpanKind": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "internal",
        "server",
        "client",
        "producer",
        "consumer"
      ]
    },
    "SpanLimits": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "attribute_value_length_limit": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max attribute value size. Overrides .attribute_limits.attribute_value_length_limit. \nValue must be non-negative.\nIf omitted or null, there is no limit.\n"
        },
        "attribute_count_limit": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max attribute count. Overrides .attribute_limits.attribute_count_limit. \nValue must be non-negative.\nIf omitted or null, 128 is used.\n"
        },
        "event_count_limit": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max span event count. \nValue must be non-negative.\nIf omitted or null, 128 is used.\n"
        },
        "link_count_limit": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max span link count. \nValue must be non-negative.\nIf omitted or null, 128 is used.\n"
        },
        "event_attribute_count_limit": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max attributes per span event. \nValue must be non-negative.\nIf omitted or null, 128 is used.\n"
        },
        "link_attribute_count_limit": {
          "type": [
            "integer",
            "null"
          ],
          "minimum": 0,
          "description": "Configure max attributes per span link. \nValue must be non-negative.\nIf omitted or null, 128 is used.\n"
        }
      }
    },
    "SpanProcessor": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "batch": {
          "$ref": "#/$defs/BatchSpanProcessor",
          "description": "Configure a batch span processor.\nIf omitted, ignore.\n"
        },
        "simple": {
          "$ref": "#/$defs/SimpleSpanProcessor",
          "description": "Configure a simple span processor.\nIf omitted, ignore.\n"
        }
      }
    },
    "SumAggregation": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "TextMapPropagator": {
      "type": "object",
      "additionalProperties": {
        "type": [
          "object",
          "null"
        ]
      },
      "minProperties": 1,
      "maxProperties": 1,
      "properties": {
        "tracecontext": {
          "$ref": "#/$defs/TraceContextPropagator",
          "description": "Include the w3c trace context propagator.\nIf omitted, ignore.\n"
        },
        "baggage": {
          "$ref": "#/$defs/BaggagePropagator",
          "description": "Include the w3c baggage propagator.\nIf omitted, ignore.\n"
        },
        "b3": {
          "$ref": "#/$defs/B3Propagator",
          "description": "Include the zipkin b3 propagator.\nIf omitted, ignore.\n"
        },
        "b3multi": {
          "$ref": "#/$defs/B3MultiPropagator",
          "description": "Include the zipkin b3 multi propagator.\nIf omitted, ignore.\n"
        },
        "jaeger": {
          "$ref": "#/$defs/JaegerPropagator",
          "description": "Include the jaeger propagator.\nIf omitted, ignore.\n"
        },
        "ottrace": {
          "$ref": "#/$defs/OpenTracingPropagator",
          "description": "Include the opentracing propagator.\nIf omitted, ignore.\n"
        }
      }
    },
    "TraceContextPropagator": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false
    },
    "TraceIdRatioBasedSampler": {
      "type": [
        "object",
        "null"
      ],
      "additionalProperties": false,
      "properties": {
        "ratio": {
          "type": [
            "number",
            "null"
          ],
          "minimum": 0,
          "maximum": 1,
          "description": "Configure trace_id_ratio.\nIf omitted or null, 1.0 is used.\n"
        }
      }
    },
    "TracerProvider": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "processors": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/SpanProcessor"
          },
          "description": "Configure span processors.\nProperty is required and must be non-null.\n"
        },
        "limits": {
          "$ref": "#/$defs/SpanLimits",
          "description": "Configure span limits. See also attribute_limits.\nIf omitted, default values as described in SpanLimits are used.\n"
        },
        "sampler": {
          "$ref": "#/$defs/Sampler",
          "description": "Configure the sampler.\nIf omitted, parent based sampler with a root of always_on is used.\n"
        },
        "tracer_configurator/development": {
          "$ref": "#/$defs/ExperimentalTracerConfigurator",
          "description": "Configure tracers.\nIf omitted, all tracers use default values as described in ExperimentalTracerConfig.\n"
        }
      },
      "required": [
        "processors"
      ]
    },
    "View": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "selector": {
          "$ref": "#/$defs/ViewSelector",
          "description": "Configure view selector. \nSelection criteria is additive as described in https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#instrument-selection-criteria.\nProperty is required and must be non-null.\n"
        },
        "stream": {
          "$ref": "#/$defs/ViewStream",
          "description": "Configure view stream.\nProperty is required and must be non-null.\n"
        }
      },
      "required": [
        "selector",
        "stream"
      ]
    },
    "ViewSelector": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "instrument_name": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure instrument name selection criteria.\nIf omitted or null, all instrument names match.\n"
        },
        "instrument_type": {
          "$ref": "#/$defs/InstrumentType",
          "description": "Configure instrument type selection criteria.\nValues include:\n* counter: Synchronous counter instruments.\n* gauge: Synchronous gauge instruments.\n* histogram: Synchronous histogram instruments.\n* observable_counter: Asynchronous counter instruments.\n* observable_gauge: Asynchronous gauge instruments.\n* observable_up_down_counter: Asynchronous up down counter instruments.\n* up_down_counter: Synchronous up down counter instruments.\nIf omitted, all instrument types match.\n"
        },
        "unit": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure the instrument unit selection criteria.\nIf omitted or null, all instrument units match.\n"
        },
        "meter_name": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure meter name selection criteria.\nIf omitted or null, all meter names match.\n"
        },
        "meter_version": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure meter version selection criteria.\nIf omitted or null, all meter versions match.\n"
        },
        "meter_schema_url": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure meter schema url selection criteria.\nIf omitted or null, all meter schema URLs match.\n"
        }
      }
    },
    "ViewStream": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "name": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure metric name of the resulting stream(s).\nIf omitted or null, the instrument's original name is used.\n"
        },
        "description": {
          "type": [
            "string",
            "null"
          ],
          "description": "Configure metric description of the resulting stream(s).\nIf omitted or null, the instrument's origin description is used.\n"
        },
        "aggregation": {
          "$ref": "#/$defs/Aggregation",
          "description": "Configure aggregation of the resulting stream(s). \nIf omitted, default is used.\n"
        },
        "aggregation_cardinality_limit": {
          "type": [
            "integer",
            "null"
          ],
          "exclusiveMinimum": 0,
          "description": "Configure the aggregation cardinality limit.\nIf omitted or null, the metric reader's default cardinality limit is used.\n"
        },
        "attribute_keys": {
          "$ref": "#/$defs/IncludeExclude",
          "description": "Configure attribute keys retained in the resulting stream(s).\nIf omitted, all attribute keys are retained.\n"
        }
      }
    }
  }
};
