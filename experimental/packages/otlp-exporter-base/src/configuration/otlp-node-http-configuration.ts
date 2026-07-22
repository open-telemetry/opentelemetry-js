/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { OtlpHttpConfiguration } from './otlp-http-configuration';
import {
  getHttpConfigurationDefaults,
  mergeOtlpHttpConfigurationWithDefaults,
} from './otlp-http-configuration';

// NOTE: do not change these imports to be actual imports, otherwise they WILL break `@opentelemetry/instrumentation-http`
import type * as http from 'http';
import type * as https from 'https';

type AgentOptionsWithProxyEnv = (http.AgentOptions | https.AgentOptions) & {
  proxyEnv?: NodeJS.ProcessEnv;
};

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
  /**
   * User agent header string to be appended to the exporter's value as a prefix.
   * Availablie since v1.49.0 of the spec.
   * Ref: https://opentelemetry.io/docs/specs/otel/protocol/exporter/#user-agent
   */
  userAgent?: string;
}

function getEnvProxyAgentOptions():
  | { proxyEnv: NodeJS.ProcessEnv }
  | undefined {
  if (
    !process.env.HTTP_PROXY &&
    !process.env.http_proxy &&
    !process.env.HTTPS_PROXY &&
    !process.env.https_proxy
  ) {
    return undefined;
  }

  return {
    proxyEnv: {
      HTTP_PROXY: process.env.HTTP_PROXY,
      HTTPS_PROXY: process.env.HTTPS_PROXY,
      NO_PROXY: process.env.NO_PROXY,
      http_proxy: process.env.http_proxy,
      https_proxy: process.env.https_proxy,
      no_proxy: process.env.no_proxy,
    },
  };
}

export function httpAgentFactoryFromOptions(
  options: AgentOptionsWithProxyEnv
): HttpAgentFactory {
  return async protocol => {
    const isInsecure = protocol === 'http:';
    const module = isInsecure ? import('http') : import('https');
    const { Agent } = await module;
    const envProxyAgentOptions = getEnvProxyAgentOptions();

    if (isInsecure) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- these props should not be used in agent options
      const { ca, cert, key, ...insecureOptions } =
        options as https.AgentOptions;
      return new Agent({
        ...envProxyAgentOptions,
        ...insecureOptions,
      } as http.AgentOptions);
    }
    return new Agent({
      ...envProxyAgentOptions,
      ...options,
    } as https.AgentOptions);
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
    userAgent: userProvidedConfiguration.userAgent,
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
