
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
  private _flushInterval: string;
  
  constructor(config: any) {
    this._url = config.agent_url || process.env.DD_TRACE_AGENT_URL || 'http://localhost:8126';
    this._logger = config.logger || new NoopLogger();
    this._service_name = config.service_name || process.env.DD_SERVICE || 'dd-service';
    this._env = config.env || process.env.DD_ENV;
    this._version = config.version || process.env.DD_VERSION;
    this._tags = config.tags || process.env.DD_TAGS;
    this._flushInterval = config.flushInterval || 1000;
    this._exporter = new AgentExporter({url: new URL(this._url), flushInterval: this._flushInterval}, new PrioritySampler())
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

    try {
      this._exporter.export(formattedDatadogSpans)
      return resultCallback(ExportResult.SUCCESS);
    } catch (error) {
      this._logger.debug(error)
      return resultCallback(ExportResult.FAILED_NOT_RETRYABLE)
    }
  }

  /** Stops the exporter. */
  shutdown(): void {
    if(this._exporter._scheduler !== undefined) {
      this._exporter._scheduler.stop()
    }
  }
}