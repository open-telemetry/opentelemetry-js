/*!
 * Copyright 2019, OpenTelemetry Authors
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

import * as prom from 'prom-client';
import { Histogram, Distribution } from '@opentelemetry/metrics';

/**
 * Opentelemetry's metrics API match closely what is done inside `prom-client`
 * so to avoid having to compute data both inside otel and prom. We use this
 * wrapper that looks like a internal prom implementation but is actually just
 * using the Opentelemetry data.
 */

// Fake implementation of the prom Histogram that allows us to set its internal state
export class FakeHistogram extends prom.Histogram {
  // @ts-ignore
  // tslint:disable-next-line
  private upperBounds: number[] = [];
  // ref https://github.com/siimon/prom-client/blob/master/lib/histogram.js#L34
  // tslint:disable-next-line
  private hashMap: {
    [key: string]: {
      labels: prom.labelValues;
      bucketValues: { [key: number]: number };
      sum: number;
      count: number;
    };
  } = {};

  constructor(config: prom.HistogramConfiguration) {
    super(config);
  }

  setValues(histogram: Histogram, labels: prom.labelValues) {
    this.upperBounds = histogram.buckets.boundaries;
    console.log(histogram);
    // key inside the map are just hash of labels, don't need to set to a specific value
    this.hashMap['_hash_'] = {
      labels,
      bucketValues: histogram.buckets.counts.reduce((agg, value, idx) => {
        const boundary: number | undefined = histogram.buckets.boundaries[idx];
        if (boundary === undefined) {
          agg[-1] = value;
        } else {
          agg[boundary] = value;
        }
        return agg;
      }, {} as { [key: number]: number }),
      sum: histogram.sum,
      count: histogram.count,
    };
  }
}

// Fake implementation of the prom Summary that allows us to set its internal state
export class FakeSummary extends prom.Summary {
  // ref: https://github.com/siimon/prom-client/blob/master/lib/summary.js#L29
  // tslint:disable-next-line
  private hashMap: {
    [key: string]: {
      labels: prom.labelValues;
      td: {
        compress: () => void;
        percentile: (percentile: number) => undefined;
      };
      sum: number;
      count: number;
    };
  } = {};

  constructor(config: prom.SummaryConfiguration) {
    super(config);
  }

  setValues(distribution: Distribution, labels: prom.labelValues) {
    this.hashMap['_hash_'] = {
      labels,
      td: {
        compress: () => undefined,
        percentile: () => undefined,
      },
      sum: distribution.sum,
      count: distribution.count,
    };
  }
}
