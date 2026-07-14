/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type { ConfigurationModel } from '@opentelemetry/configuration';
import type { SpanLimits } from '@opentelemetry/sdk-trace';
import { createSpanLimitsFromConfig } from '../src/create-from-config';

describe('create-from-config', () => {
  describe('createSpanLimitsFromConfig', () => {
    const corpus: {
      testName: string;
      config: ConfigurationModel;
      spanLimits: SpanLimits | undefined;
      only?: boolean;
    }[] = [
      {
        testName: 'empty',
        config: {},
        spanLimits: undefined,
      },
      {
        testName: 'just general limits',
        config: {
          attribute_limits: {
            attribute_count_limit: 1,
            attribute_value_length_limit: 2,
          },
        },
        spanLimits: {
          attributeCountLimit: 1,
          attributeValueLengthLimit: 2,
          eventCountLimit: undefined,
          attributePerEventCountLimit: undefined,
          linkCountLimit: undefined,
          attributePerLinkCountLimit: undefined,
        },
      },
      {
        testName: 'just span limits',
        config: {
          tracer_provider: {
            processors: [{ simple: { exporter: { console: null } } }],
            limits: {
              attribute_count_limit: 10,
              attribute_value_length_limit: 11,
              event_count_limit: 12,
              event_attribute_count_limit: 13,
              link_count_limit: 14,
              link_attribute_count_limit: 15,
            },
          },
        },
        spanLimits: {
          attributeCountLimit: 10,
          attributeValueLengthLimit: 11,
          eventCountLimit: 12,
          attributePerEventCountLimit: 13,
          linkCountLimit: 14,
          attributePerLinkCountLimit: 15,
        },
      },
      {
        testName: 'span limits beat general limits',
        config: {
          attribute_limits: {
            attribute_count_limit: 1,
            attribute_value_length_limit: 2,
          },
          tracer_provider: {
            processors: [{ simple: { exporter: { console: null } } }],
            limits: {
              attribute_count_limit: 10,
              event_count_limit: 12,
              event_attribute_count_limit: 13,
              link_count_limit: 14,
              link_attribute_count_limit: 15,
            },
          },
        },
        spanLimits: {
          attributeCountLimit: 10,
          attributeValueLengthLimit: 2,
          eventCountLimit: 12,
          attributePerEventCountLimit: 13,
          linkCountLimit: 14,
          attributePerLinkCountLimit: 15,
        },
      },
    ];

    for (const item of corpus) {
      (item.only ? it.only : it)(item.testName, function () {
        const spanLimits = createSpanLimitsFromConfig(
          item.config.tracer_provider?.limits,
          item.config.attribute_limits
        );
        assert.deepStrictEqual(spanLimits, item.spanLimits);
      });
    }
  });
});
