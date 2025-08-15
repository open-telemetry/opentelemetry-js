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
  getSharedConfigurationDefaults,
  mergeOtlpSharedConfigurationWithDefaults,
  OtlpSharedConfiguration,
} from './shared-configuration';
import { validateAndNormalizeHeaders } from '../util';

// NOTE: do not change these imports to be actual imports, otherwise they WILL break `@opentelemetry/instrumentation-http`
import type * as http from 'http';
import type * as https from 'https';

export type HttpAgentFactory =
  | ((protocol: string) => http.Agent)
  | ((protocol: string) => https.Agent)
  | ((protocol: string) => Promise<http.Agent>)
  | ((protocol: string) => Promise<https.Agent>);

export interface OtlpHttpConfiguration extends OtlpSharedConfiguration {
  url: string;
  headers: () => Record<string, string>;
  agentFactory: HttpAgentFactory;
}

function mergeHeaders(
  userProvidedHeaders: (() => Record<string, string>) | undefined | null,
  fallbackHeaders: (() => Record<string, string>) | undefined | null,
  defaultHeaders: () => Record<string, string>
): () => Record<string, string> {
  const requiredHeaders = {
    ...defaultHeaders(),
  };
  const headers = {};

  return () => {
    // add fallback ones first
    if (fallbackHeaders != null) {
      Object.assign(headers, fallbackHeaders());
    }

    // override with user-provided ones
    if (userProvidedHeaders != null) {
      Object.assign(headers, userProvidedHeaders());
    }

    // override required ones.
    return Object.assign(headers, requiredHeaders);
  };
}

function validateUserProvidedUrl(url: string | undefined): string | undefined {
  if (url == null) {
    return undefined;
  }
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error(
      `Configuration: Could not parse user-provided export URL: '${url}'`
    );
  }
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
export function mergeOtlpHttpConfigurationWithDefaults(
  userProvidedConfiguration: Partial<OtlpHttpConfiguration>,
  fallbackConfiguration: Partial<OtlpHttpConfiguration>,
  defaultConfiguration: OtlpHttpConfiguration
): OtlpHttpConfiguration {
  return {
    ...mergeOtlpSharedConfigurationWithDefaults(
      userProvidedConfiguration,
      fallbackConfiguration,
      defaultConfiguration
    ),
    headers: mergeHeaders(
      validateAndNormalizeHeaders(userProvidedConfiguration.headers),
      fallbackConfiguration.headers,
      defaultConfiguration.headers
    ),
    url:
      validateUserProvidedUrl(userProvidedConfiguration.url) ??
      fallbackConfiguration.url ??
      defaultConfiguration.url,
    agentFactory:
      userProvidedConfiguration.agentFactory ??
      fallbackConfiguration.agentFactory ??
      defaultConfiguration.agentFactory,
  };
}

export function getHttpConfigurationDefaults(
  requiredHeaders: Record<string, string>,
  signalResourcePath: string
): OtlpHttpConfiguration {
  return {
    ...getSharedConfigurationDefaults(),
    headers: () => requiredHeaders,
    url: 'http://localhost:4318/' + signalResourcePath,
    agentFactory: httpAgentFactoryFromOptions({ keepAlive: true }),
  };
}
