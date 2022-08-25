import { OTLPProtoExporterBrowserBase } from '@opentelemetry/otlp-proto-exporter-base'
export const OTLPTraceExporter = () => {
  console.log('exporter-trace-otlp-proto')
  OTLPProtoExporterBrowserBase()
}
