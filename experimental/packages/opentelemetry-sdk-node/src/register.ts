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
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// import { OTLPTraceExporter as OTLP_GRPC_TraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
// import { OTLPTraceExporter as OTLP_HTTP_TraceExporter } from '@opentelemetry/exporter-trace-otlp-http';


import { diag, DiagConsoleLogger } from '@opentelemetry/api';
import { getEnv } from '@opentelemetry/core';
import { NodeSDK, tracing } from './index';


// copied from https://github.com/open-telemetry/opentelemetry-js/issues/2873
// todo: move this to @opentelemetry/sdk-node
function buildTraceExporterFromEnv() : tracing.SpanExporter | undefined {
    const exporterName = getEnv().OTEL_TRACES_EXPORTER; 
    switch(exporterName) {
        case 'none':
            return
        case 'otlp':
            /* OTEL_EXPORTER_OTLP_PROTOCOL is not yet supported
            if(getEnv().OTEL_EXPORTER_OTLP_PROTOCOL === 'grpc') {
                return new OTLP_GRPC_TraceExporter({
                    url: getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || getEnv().OTEL_EXPORTER_OTLP_ENDPOINT,
                    headers: // something something getEnv().OTEL_EXPORTER_OTLP_HEADERS 
                })
            }*/
            /*return new OTLP_HTTP_TraceExporter({
                url: getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || getEnv().OTEL_EXPORTER_OTLP_ENDPOINT,
                headers: {}// something something getEnv().OTEL_EXPORTER_OTLP_HEADERS 
            })*/
            return
        case 'console':
        case 'logger':
            return new tracing.ConsoleSpanExporter()
        default:
            diag.error( 
                `Exporter "${exporterName}" is unavailable.` 
              ); 
            return
    }
}


const sdk = new NodeSDK({
    autoDetectResources: true,
    instrumentations: [],
    traceExporter: buildTraceExporterFromEnv()
});

sdk.start();

diag.setLogger(new DiagConsoleLogger(), getEnv().OTEL_LOG_LEVEL);