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
  getHttpConfigurationDefaults,
  mergeOtlpHttpConfigurationWithDefaults,
  OtlpHttpConfiguration,
} from './otlp-http-configuration';

// NOTE: do not change these imports to be actual imports, otherwise they WILL break `@opentelemetry/instrumentation-http`
import type * as http from 'http';
import type * as https from 'https';

export type HttpAgentFactory = (
  protocol: string
) => http.Agent | https.Agent | Promise<http.Agent> | Promise<https.Agent>;

export interface OtlpNodeHttpConfiguration extends OtlpHttpConfiguration {
  /**
   * Factory function for creating agents.
   *
   * @remarks
   * Prefer using {@link httpAgentFactoryFromOptions} over manually writing a factory function wherever possible.
   * If using a factory function (`HttpAgentFactory`), **do not import `http.Agent` or `https.Agent`
   * statically at the top of the file**.
   * Instead, use dynamic `import()` or `require()` to load the module. This ensures that the `http` or `https`
   * module is not loaded before `@opentelemetry/instrumentation-http` can instrument it.
   */
  agentFactory: HttpAgentFactory;
}

export function httpAgentFactoryFromOptions(
  options: http.AgentOptions | https.AgentOptions
): HttpAgentFactory {
  return async protocol => {
    const module = protocol === 'http:' ? import('http') : import('https');
    const { Agent } = await module;
    return new Agent(options);
  };
}

/**
 * @param userProvidedConfiguration  Configuration options provided by the user in code.
 * @param fallbackConfiguration Fallback to use when the {@link userProvidedConfiguration} does not specify an option.
 * @param defaultConfiguration The defaults as defined by the exporter specification
 */
export function mergeOtlpNodeHttpConfigurationWithDefaults(
  userProvidedConfiguration: Partial<OtlpNodeHttpConfiguration>,
  fallbackConfiguration: Partial<OtlpNodeHttpConfiguration>,
  defaultConfiguration: OtlpNodeHttpConfiguration
): OtlpNodeHttpConfiguration {
  return {
    ...mergeOtlpHttpConfigurationWithDefaults(
      userProvidedConfiguration,
      fallbackConfiguration,
      defaultConfiguration
    ),
    agentFactory:
      userProvidedConfiguration.agentFactory ??
      fallbackConfiguration.agentFactory ??
      defaultConfiguration.agentFactory,
  };
}

export function getNodeHttpConfigurationDefaults(
  requiredHeaders: Record<string, string>,
  signalResourcePath: string
): OtlpNodeHttpConfiguration {
  return {
    ...getHttpConfigurationDefaults(requiredHeaders, signalResourcePath),
    agentFactory: httpAgentFactoryFromOptions({ keepAlive: true }),
  };
}
