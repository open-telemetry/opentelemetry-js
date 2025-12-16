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

import {
  diag,
  DiagLogger,
  metrics,
  Meter,
  MeterProvider,
  trace,
  Tracer,
  TracerProvider,
  Span,
} from '@opentelemetry/api';
import { Logger, LoggerProvider, logs } from '@opentelemetry/api-logs';
import * as shimmer from './shimmer';
import {
  InstrumentationModuleDefinition,
  Instrumentation,
  InstrumentationConfig,
  SpanCustomizationHook,
} from './types';

/**
 * Base abstract internal class for instrumenting node and web plugins
 */
export abstract class InstrumentationAbstract<
  ConfigType extends InstrumentationConfig = InstrumentationConfig,
> implements Instrumentation<ConfigType>
{
  protected _config: ConfigType = {} as ConfigType;

  private _tracer: Tracer;
  private _meter: Meter;
  private _logger: Logger;
  protected _diag: DiagLogger;
  public readonly instrumentationName: string;
  public readonly instrumentationVersion: string;

  constructor(
    instrumentationName: string,
    instrumentationVersion: string,
    config: ConfigType
  ) {
    this.instrumentationName = instrumentationName;
    this.instrumentationVersion = instrumentationVersion;

    this.setConfig(config);

    this._diag = diag.createComponentLogger({
      namespace: instrumentationName,
    });

    this._tracer = trace.getTracer(instrumentationName, instrumentationVersion);
    this._meter = metrics.getMeter(instrumentationName, instrumentationVersion);
    this._logger = logs.getLogger(instrumentationName, instrumentationVersion);
    this._updateMetricInstruments();
  }

  /* Api to wrap instrumented method */
  protected _wrap = shimmer.wrap;
  /* Api to unwrap instrumented methods */
  protected _unwrap = shimmer.unwrap;
  /* Api to mass wrap instrumented method */
  protected _massWrap = shimmer.massWrap;
  /* Api to mass unwrap instrumented methods */
  protected _massUnwrap = shimmer.massUnwrap;

  /* Returns meter */
  protected get meter(): Meter {
    return this._meter;
  }

  /**
   * Sets MeterProvider to this plugin
   * @param meterProvider
   */
  public setMeterProvider(meterProvider: MeterProvider): void {
    this._meter = meterProvider.getMeter(
      this.instrumentationName,
      this.instrumentationVersion
    );

    this._updateMetricInstruments();
  }

  /* Returns logger */
  protected get logger(): Logger {
    return this._logger;
  }

  /**
   * Sets LoggerProvider to this plugin
   * @param loggerProvider
   */
  public setLoggerProvider(loggerProvider: LoggerProvider): void {
    this._logger = loggerProvider.getLogger(
      this.instrumentationName,
      this.instrumentationVersion
    );
  }

  /**
   * @experimental
   *
   * Get module definitions defined by {@link init}.
   * This can be used for experimental compile-time instrumentation.
   *
   * @returns an array of {@link InstrumentationModuleDefinition}
   */
  public getModuleDefinitions(): InstrumentationModuleDefinition[] {
    const initResult = this.init() ?? [];
    if (!Array.isArray(initResult)) {
      return [initResult];
    }

    return initResult;
  }

  /**
   * Sets the new metric instruments with the current Meter.
   */
  protected _updateMetricInstruments(): void {
    return;
  }

  /* Returns InstrumentationConfig */
  public getConfig(): ConfigType {
    return this._config;
  }

  /**
   * Sets InstrumentationConfig to this plugin
   * @param config
   */
  public setConfig(config: ConfigType): void {
    // copy config first level properties to ensure they are immutable.
    // nested properties are not copied, thus are mutable from the outside.
    this._config = {
      enabled: true,
      ...config,
    };
  }

  /**
   * Sets TraceProvider to this plugin
   * @param tracerProvider
   */
  public setTracerProvider(tracerProvider: TracerProvider): void {
    this._tracer = tracerProvider.getTracer(
      this.instrumentationName,
      this.instrumentationVersion
    );
  }

  /* Returns tracer */
  protected get tracer(): Tracer {
    return this._tracer;
  }

  /* Enable plugin */
  public abstract enable(): void;

  /* Disable plugin */
  public abstract disable(): void;

  /**
   * Init method in which plugin should define _modules and patches for
   * methods.
   */
  protected abstract init():
    | InstrumentationModuleDefinition
    | InstrumentationModuleDefinition[]
    | void;

  /**
   * Execute span customization hook, if configured, and log any errors.
   * Any semantics of the trigger and info are defined by the specific instrumentation.
   * @param hookHandler The optional hook handler which the user has configured via instrumentation config
   * @param triggerName The name of the trigger for executing the hook for logging purposes
   * @param span The span to which the hook should be applied
   * @param info The info object to be passed to the hook, with useful data the hook may use
   */
  protected _runSpanCustomizationHook<SpanCustomizationInfoType>(
    hookHandler: SpanCustomizationHook<SpanCustomizationInfoType> | undefined,
    triggerName: string,
    span: Span,
    info: SpanCustomizationInfoType
  ) {
    if (!hookHandler) {
      return;
    }

    try {
      hookHandler(span, info);
    } catch (e) {
      this._diag.error(
        `Error running span customization hook due to exception in handler`,
        { triggerName },
        e
      );
    }
  }
}
