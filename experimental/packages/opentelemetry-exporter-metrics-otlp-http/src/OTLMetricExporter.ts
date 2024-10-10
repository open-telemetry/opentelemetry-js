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


// To implement default histogram aggregation for OTLP Metrics exporters in TypeScript, you can use the OpenTelemetry library.
// Below is a sample code snippet that demonstrates how to allow for either Explicit Bucket histogram aggregation or Exponential histogram aggregation based on an environment variable.

// ### Explanation:
// 1. *Environment Variable*: The OTLP_HISTOGRAM_AGGREGATION environment variable is set to either 'explicit' or 'exponential'.
// 2. *Histogram Aggregation Configuration*:
//    - For *Explicit Bucket*, boundaries are defined.
//    - For *Exponential*, a scale factor and bounds are defined.
// 3. *Metric Reader*: A PeriodicExportingMetricReader is set up to export metrics at a specified interval.
// 4. *Meter Provider*: The global meter provider is set to start collecting and exporting metrics.
// 5. *Histogram Metric Creation*: A histogram metric is created based on the chosen aggregation type, and sample values are recorded.

// ### Usage:
// - Change the value of process.env.OTLP_HISTOGRAM_AGGREGATION before running the code to select the desired histogram aggregation method.
// - Adjust the bucket boundaries and export interval according to your needs.


//Here’s how you can set it up:

import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OtlpHttpExporter } from '@opentelemetry/exporter-otlp-http';
import { Histogram, Meter } from '@opentelemetry/api';
import { HistogramAggregation } from '@opentelemetry/sdk-metrics';

// Set the environment variable for histogram aggregation
// Use 'explicit' for Explicit Bucket histogram or 'exponential' for Exponential histogram
process.env.OTLP_HISTOGRAM_AGGREGATION = 'explicit'; // or 'exponential'

// Function to configure histogram aggregation based on the environment variable
function configureHistogramAggregation(): HistogramAggregation {
    const histogramType = process.env.OTLP_HISTOGRAM_AGGREGATION || 'explicit';

    let histogramAggregation: HistogramAggregation;

    if (histogramType === 'explicit') {
        console.log("Configuring Explicit Bucket histogram aggregation...");
        histogramAggregation = {
            type: 'explicit',
            boundaries: [0, 10, 20, 30, 40, 50], // Define your explicit bucket boundaries
        };
    } else if (histogramType === 'exponential') {
        console.log("Configuring Exponential histogram aggregation...");
        histogramAggregation = {
            type: 'exponential',
            scale: 2.0, // Scale factor for buckets
            bounds: [1, 2, 5, 10, 20, 50, 100], // Define your exponential bounds
        };
    } else {
        console.log("Invalid histogram aggregation type specified. Defaulting to Explicit Bucket.");
        histogramAggregation = {
            type: 'explicit',
            boundaries: [0, 10, 20, 30, 40, 50],
        };
    }

    return histogramAggregation;
}

// Initialize the MeterProvider and configure the exporter
const meterProvider = new MeterProvider();
const otlpExporter = new OtlpHttpExporter({
    url: 'http://localhost:4318/v1/metrics' // Replace with your OTLP endpoint
});

// Create the metric reader with the chosen histogram aggregation
const metricReader = new PeriodicExportingMetricReader({
    exporter: otlpExporter,
    exportIntervalMillis: 5000, // Adjust export interval as needed
});

// Register the metric reader with the MeterProvider
meterProvider.addMetricReader(metricReader);

// Set the global meter provider
const meter = meterProvider.getMeter('example-meter');

// Call the function to get the histogram aggregation configuration
const histogramAggregation = configureHistogramAggregation();

// Create a histogram metric with the chosen aggregation
const histogram: Histogram = meter.createHistogram('example_histogram', {
    description: 'An example histogram',
    unit: '1',
    aggregation: histogramAggregation,
});

// Record some values in the histogram
histogram.record(5);
histogram.record(15);
histogram.record(25);


