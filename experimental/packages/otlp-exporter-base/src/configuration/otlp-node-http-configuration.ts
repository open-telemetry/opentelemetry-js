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

export type HttpAgentFactory = (
  protocol: string,
  url?: string
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

function hasProxyForProtocol(protocol: string): boolean {
  if (protocol === 'http:') {
    return Boolean(process.env.http_proxy || process.env.HTTP_PROXY);
  }
  if (protocol === 'https:') {
    return Boolean(process.env.https_proxy || process.env.HTTPS_PROXY);
  }
  return false;
}

export function httpAgentFactoryFromOptions(
  options: http.AgentOptions | https.AgentOptions
): HttpAgentFactory {
  return async (protocol, url) => {
    const isInsecure = protocol === 'http:';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- these props should not be used in HTTP agent options
    const { ca, cert, key, ...insecureOptions } = options as https.AgentOptions;
    const agentOptions = isInsecure ? insecureOptions : options;

    if (url !== undefined && hasProxyForProtocol(protocol)) {
      const { getProxyForUrl } = await import('proxy-from-env');
      const proxyUrl = getProxyForUrl(url);

      if (proxyUrl !== '') {
        const proxy = new URL(proxyUrl);
        const isInsecureProxy = proxy.protocol === 'http:';
        if (!isInsecureProxy && proxy.protocol !== 'https:') {
          throw new Error(`Unsupported proxy protocol: ${proxy.protocol}`);
        }

        if (isInsecure) {
          const { HttpProxyAgent } = await import('http-proxy-agent');
          const proxyAgent = isInsecureProxy
            ? new HttpProxyAgent<'http:'>(proxy, agentOptions)
            : new HttpProxyAgent<'https:'>(proxy, agentOptions);
          Object.assign(proxyAgent.options, agentOptions);
          return proxyAgent;
        }

        const { HttpsProxyAgent } = await import('https-proxy-agent');
        const proxyAgent = isInsecureProxy
          ? new HttpsProxyAgent<'http:'>(proxy, agentOptions)
          : new HttpsProxyAgent<'https:'>(proxy, agentOptions);
        Object.assign(proxyAgent.options, agentOptions);
        return proxyAgent;
      }
    }

    if (isInsecure) {
      const { Agent } = await import('http');
      return new Agent(agentOptions);
    }

    const { Agent } = await import('https');
    return new Agent(agentOptions);
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
