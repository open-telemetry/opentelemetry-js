/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  DiagLogger,
  Meter,
  MeterProvider,
  Tracer,
  TracerProvider,
  Span,
} from '@opentelemetry/api';
import { diag, metrics, trace } from '@opentelemetry/api';
import type { Logger, LoggerProvider } from '@opentelemetry/api-logs';
import { logs } from '@opentelemetry/api-logs';
import type { DeclarativeConfigProperties } from './declarativeConfigProperties';
import { declarativeConfigProperties } from './declarativeConfigProperties';
import * as shimmer from './shimmer';
import type {
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
   * @experimental This feature is in development as per the OpenTelemetry specification.
   *
   * Apply a declarative config block to this instrumentation. Calls
   * {@link readDeclarativeConfig} to turn the block into config fields, drops the
   * undefined ones so unset keys keep their constructor default, then merges what
   * remains over the current config.
   *
   * @param block the instrumentation's own `instrumentation/development` block
   * @param general the shared `general` block
   */
  public applyDeclarativeConfig(
    block: Record<string, unknown>,
    general: Record<string, unknown> = {}
  ): void {
    const own = declarativeConfigProperties(block);
    let partial: Partial<ConfigType>;
    try {
      partial = this.readDeclarativeConfig(
        own,
        declarativeConfigProperties(general)
      );
    } catch (e) {
      this._diag.error('error reading declarative config', e);
      return;
    }
    const unread = own.unreadKeys();
    if (unread.length > 0) {
      // Distinguish "no reader for this instrumentation" from "the reader does
      // not recognize these keys", since they call for different user action.
      this._diag.warn(
        this._hasDeclarativeConfigReader()
          ? `ignoring unrecognized declarative config keys: ${unread.join(', ')}`
          : `declarative config not supported by this instrumentation (except "enabled"); these keys had no effect: ${unread.join(', ')}`
      );
    }
    const defined: Partial<ConfigType> = {};
    for (const key of Object.keys(partial) as (keyof ConfigType)[]) {
      if (partial[key] !== undefined) {
        defined[key] = partial[key];
      }
    }
    this.setConfig({ ...this.getConfig(), ...defined });
  }

  /**
   * @experimental This feature is in development as per the OpenTelemetry specification.
   *
   * Map a declarative config block to a partial config. Override this per
   * instrumentation to read keys from `own` and `general` and return the fields
   * to apply. The caller warns about own-block keys no getter read, so a reader
   * only reads what it supports.
   *
   * @param own typed accessor over the instrumentation's own config block
   * @param general typed accessor over the shared `general` block
   * @returns the config fields to apply; undefined values keep the default
   */
  protected readDeclarativeConfig(
    own: DeclarativeConfigProperties,
    _general: DeclarativeConfigProperties
  ): Partial<ConfigType> {
    return { enabled: own.getBoolean('enabled') } as Partial<ConfigType>;
  }

  // True when a subclass overrides readDeclarativeConfig (it has a reader).
  private _hasDeclarativeConfigReader(): boolean {
    return (
      this.readDeclarativeConfig !==
      InstrumentationAbstract.prototype.readDeclarativeConfig
    );
  }

  /**
   * Sets TracerProvider to this plugin
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
        'Error running span customization hook due to exception in handler',
        { triggerName },
        e
      );
    }
  }
}
