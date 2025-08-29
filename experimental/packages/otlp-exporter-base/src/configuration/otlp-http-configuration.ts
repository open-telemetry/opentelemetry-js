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

export type HttpAgentFactory = (
  protocol: string
) => http.Agent | https.Agent | Promise<http.Agent> | Promise<https.Agent>;

export interface OtlpHttpConfiguration extends OtlpSharedConfiguration {
  url: string;
  headers: () => Record<string, string>;
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

  // If it looks like an absolute URL (contains ://), validate it strictly
  if (url.includes('://')) {
    try {
      new URL(url);
      return url;
    } catch {
      throw new Error(
        `Configuration: Could not parse user-provided export URL: '${url}'`
      );
    }
  }

  // For relative URLs, do basic validation
  // Allow paths that start with ./, ../, /, or are simple paths without problematic characters
  if (url.match(/^(\.\.?\/|\/|[a-zA-Z0-9._-]+)/)) {
    // Decode the URL to check for problematic characters that might be encoded
    let decodedUrl: string;
    try {
      decodedUrl = decodeURIComponent(url);
    } catch {
      // If decoding fails (malformed encoding), reject the URL
      throw new Error(
        `Configuration: Could not parse user-provided export URL: '${url}'`
      );
    }

    // Check for spaces in the decoded URL
    // Allow spaces only for URLs that start with ./, ../, or /
    const hasSpaces = /\s/.test(decodedUrl);
    const allowsSpaces =
      url.startsWith('./') || url.startsWith('../') || url.startsWith('/');

    if (hasSpaces && !allowsSpaces) {
      throw new Error(
        `Configuration: Could not parse user-provided export URL: '${url}'`
      );
    }

    // Additional check: ensure the decoded URL doesn't introduce path traversal beyond what was originally allowed
    // This prevents cases like "normal%2E%2E%2Fpath" which decodes to "normal../path"
    // Allow spaces in the pattern for URLs that start with ./, ../, or /
    const validPattern = allowsSpaces
      ? /^(\.\.?\/.*|\/.*|[a-zA-Z0-9._\s/-]+)$/
      : /^(\.\.?\/.*|\/.*|[a-zA-Z0-9._/-]+)$/;

    if (!decodedUrl.match(validPattern)) {
      throw new Error(
        `Configuration: Could not parse user-provided export URL: '${url}'`
      );
    }
    return url;
  }

  // If it doesn't match our relative URL patterns, reject it
  throw new Error(
    `Configuration: Could not parse user-provided export URL: '${url}'`
  );
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
