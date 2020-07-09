import {
    Logger,
    TracerProvider,
    MeterProvider,
    NoopTracerProvider,
    NoopMeterProvider
} from '@opentelemetry/api';
import { ConsoleLogger, LogLevel } from '@opentelemetry/core';
import { NodePluginEnablerConfig } from './config';
import { DEFAULT_INSTRUMENTATION_PLUGINS } from './config';
import { PluginLoader, Plugins } from './instrumentation/PluginLoader';

export class NodePluginEnabler {
    readonly logger: Logger;
    readonly meterProvider: MeterProvider;
    readonly tracerProvider: TracerProvider;
    private readonly _pluginLoader: PluginLoader;


    constructor(config: NodePluginEnablerConfig){
        this.logger =
      config.logger ?? new ConsoleLogger(config.logLevel ?? LogLevel.INFO);
    this.tracerProvider = config.tracerProvider ?? new NoopTracerProvider();
    this.meterProvider = config.meterProvider ?? new NoopMeterProvider();

    this._pluginLoader = new PluginLoader(this.tracerProvider, this.meterProvider, this.logger);

    config.plugins
      ? this._pluginLoader.load(
          this._mergePlugins(DEFAULT_INSTRUMENTATION_PLUGINS, config.plugins)
        )
      : this._pluginLoader.load(DEFAULT_INSTRUMENTATION_PLUGINS);
    }

    stop() {
        this._pluginLoader.unload();
    }

    /**
   * Two layer merge.
   * First, for user supplied config of plugin(s) that are loaded by default,
   * merge the user supplied and default configs of said plugin(s).
   * Then merge the results with the default plugins.
   * @returns 2-layer deep merge of default and user supplied plugins.
   */
    private _mergePlugins(
        defaultPlugins: Plugins,
        userSuppliedPlugins: Plugins
      ): Plugins {
        const mergedUserSuppliedPlugins: Plugins = {};
    
        for (const pluginName in userSuppliedPlugins) {
          mergedUserSuppliedPlugins[pluginName] = {
            // Any user-supplied non-default plugin should be enabled by default
            ...(DEFAULT_INSTRUMENTATION_PLUGINS[pluginName] || { enabled: true }),
            ...userSuppliedPlugins[pluginName],
          };
        }
    
        const mergedPlugins: Plugins = {
          ...defaultPlugins,
          ...mergedUserSuppliedPlugins,
        };
    
        return mergedPlugins;
      }
}