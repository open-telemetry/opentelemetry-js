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
} from '@opentelemetry/otlp-exporter-base';
import {
  createEmptyMetadata,
  createInsecureCredentials,
  createSslCredentials,
} from '../grpc-exporter-transport';
import { VERSION } from '../version';
import { URL } from 'url';
import { diag } from '@opentelemetry/api';

// NOTE: do not change this to be an actual import, doing so will break `@opentelemetry/instrumentation-grpc`
import type { ChannelCredentials, Metadata } from '@grpc/grpc-js';

export interface OtlpGrpcConfiguration extends OtlpSharedConfiguration {
  url: string;
  metadata: () => Metadata;
  credentials: () => ChannelCredentials;
  userAgent: string;
}

/**
 * Unresolved configuration where parts of the config may depend on other config options being resolved first.
 */
export interface UnresolvedOtlpGrpcConfiguration
  extends OtlpSharedConfiguration {
  url: string;
  metadata: () => Metadata;
  /**
   * Credentials are based on the final resolved URL
   */
  credentials: (url: string) => () => ChannelCredentials;
  userAgent: string;
}

export function validateAndNormalizeUrl(url: string): string {
  url = url.trim();
  const hasProtocol = url.match(/^([\w]{1,8}):\/\//);
  if (!hasProtocol) {
    url = `https://${url}`;
  }
  const target = new URL(url);
  if (target.protocol === 'unix:') {
    return url;
  }
  if (target.pathname && target.pathname !== '/') {
    diag.warn(
      'URL path should not be set when using grpc, the path part of the URL will be ignored.'
    );
  }
  if (target.protocol !== '' && !target.protocol?.match(/^(http)s?:$/)) {
    diag.warn('URL protocol should be http(s)://. Using http://.');
  }
  return target.host;
}

function overrideMetadataEntriesIfNotPresent(
  metadata: Metadata,
  additionalMetadata: Metadata
): void {
  for (const [key, value] of Object.entries(additionalMetadata.getMap())) {
    // only override with env var data if the key has no values.
    // not using Metadata.merge() as it will keep both values.
    if (metadata.get(key).length < 1) {
      metadata.set(key, value);
    }
  }
}

export function mergeOtlpGrpcConfigurationWithDefaults(
  userProvidedConfiguration: Partial<OtlpGrpcConfiguration>,
  fallbackConfiguration: Partial<UnresolvedOtlpGrpcConfiguration>,
  defaultConfiguration: UnresolvedOtlpGrpcConfiguration
): OtlpGrpcConfiguration {
  const rawUrl =
    userProvidedConfiguration.url ??
    fallbackConfiguration.url ??
    defaultConfiguration.url;

  let userAgent = defaultConfiguration.userAgent;
  if (userProvidedConfiguration.userAgent) {
    userAgent = `${userProvidedConfiguration.userAgent} ${userAgent}`;
  }

  return {
    ...mergeOtlpSharedConfigurationWithDefaults(
      userProvidedConfiguration,
      fallbackConfiguration,
      defaultConfiguration
    ),
    metadata: () => {
      const metadata = defaultConfiguration.metadata();
      overrideMetadataEntriesIfNotPresent(
        metadata,
        // clone to ensure we don't modify what the user gave us in case they hold on to the returned reference
        userProvidedConfiguration.metadata?.().clone() ?? createEmptyMetadata()
      );
      overrideMetadataEntriesIfNotPresent(
        metadata,
        fallbackConfiguration.metadata?.() ?? createEmptyMetadata()
      );
      return metadata;
    },
    url: validateAndNormalizeUrl(rawUrl),
    credentials:
      userProvidedConfiguration.credentials ??
      fallbackConfiguration.credentials?.(rawUrl) ??
      defaultConfiguration.credentials(rawUrl),
    userAgent,
  };
}

export function getOtlpGrpcDefaultConfiguration(): UnresolvedOtlpGrpcConfiguration {
  return {
    ...getSharedConfigurationDefaults(),
    metadata: () => createEmptyMetadata(),
    url: 'http://localhost:4317',
    credentials: (url: string) => {
      if (url.startsWith('http://')) {
        return () => createInsecureCredentials();
      } else {
        return () => createSslCredentials();
      }
    },
    userAgent: `OTel-OTLP-Exporter-JavaScript/${VERSION}`,
  };
}
