
import * as api from '@opentelemetry/api';
import { ExportResult, NoopLogger } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing';
import { translateToDatadog } from './transform';
import { AgentExporter, PrioritySampler } from './types';


/**
 * Format and sends span information to Datadog Exporter.
 */
export class DatadogExporter implements SpanExporter {
  private readonly _logger: api.Logger;
  private readonly _exporter: typeof AgentExporter;
  private _service_name: string;
  private _env: string;
  private _version: string;
  private _tags: string;
  private _url: string;
  
  constructor(config: any) {
    this._url = 'http://localhost:8126' || config.agent_url || process.env.DD_TRACE_AGENT_URL;
    this._logger = config.logger || new NoopLogger();
    this._service_name = config.service_name || process.env.DD_SERVICE || 'dd-service';
    this._env = config.env || process.env.DD_ENV;
    this._version = config.version || process.env.DD_VERSION;
    this._tags = config.tags || process.env.DD_TAGS;

    // datadog.init({plugins: false, debug: true})

    console.log(this._url)
    // const url = this._url
    // const flushInterval = 1000
    const hostname = 'localhost'
    const port = 8126
    this._exporter = new AgentExporter({hostname, port}, new PrioritySampler())
  }

  /**
   * Called to export sampled {@link ReadableSpan}s.
   * @param spans the list of sampled Spans to be exported.
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    if (spans.length === 0) {
      return resultCallback(ExportResult.SUCCESS);
    }

    const formattedDatadogSpans = translateToDatadog(spans,
      this._service_name,
      this._env,
      this._version,
      this._tags)

    // const formattedSpans = datadogSpans.map(format)
    this._logger.debug('exporting dd spans')
    // console.log(formattedSpans)
    // formattedSpans.forEach( (x: any) => {
    //   console.log(x.parent_id.toString())
    // })
    const response = this._exporter.export(formattedDatadogSpans)
    console.log('response ', response)
  }

  /** Stops the exporter. */
  shutdown(): void {}
}