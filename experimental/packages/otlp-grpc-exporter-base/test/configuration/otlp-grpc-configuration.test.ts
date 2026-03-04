/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import {
  getOtlpGrpcDefaultConfiguration,
  mergeOtlpGrpcConfigurationWithDefaults,
} from '../../src/configuration/otlp-grpc-configuration';
import {
  createEmptyMetadata,
  createInsecureCredentials,
  createSslCredentials,
} from '../../src/grpc-exporter-transport';
import * as fs from 'fs';

describe('mergeOtlpGrpcConfigurationWithDefaults', function () {
  describe('metadata', function () {
    it('merges metadata instead of overriding', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        {
          metadata: () => {
            const metadata = createEmptyMetadata();
            metadata.set('foo', 'foo-user');
            metadata.set('baz', 'baz-user');
            return metadata;
          },
        },
        {
          metadata: () => {
            const metadata = createEmptyMetadata();
            metadata.set('foo', 'foo-fallback');
            metadata.set('bar', 'bar-fallback');
            return metadata;
          },
        },
        getOtlpGrpcDefaultConfiguration()
      );

      // assert
      assert.deepStrictEqual(config.metadata().getMap(), {
        foo: 'foo-user', // does not use fallback if the user has set something
        bar: 'bar-fallback', // uses fallback if there is no value set
        baz: 'baz-user', // does not drop user-set metadata if there is no fallback for it
      });
      assert.equal(config.userAgent, undefined);
    });

    it('sets userAgent options if user provided it', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        {
          userAgent: 'user-provided-user-agent/1.2.3',
        },
        {},
        getOtlpGrpcDefaultConfiguration()
      );

      assert.equal(config.userAgent, 'user-provided-user-agent/1.2.3');
    });
  });

  describe('url', function () {
    it('uses user-provided url over fallback', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        { url: 'http://user-provided.example.test:8000' },
        { url: 'http://fallback.example.test:8001' },
        getOtlpGrpcDefaultConfiguration()
      );

      assert.deepStrictEqual(config.url, 'user-provided.example.test:8000');
    });

    it('should trim user-provided url', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        { url: '  http://user-provided.example.test:8000  ' },
        { url: 'http://fallback.example.test:8001' },
        getOtlpGrpcDefaultConfiguration()
      );

      assert.deepStrictEqual(config.url, 'user-provided.example.test:8000');
    });

    it('uses fallback url over default', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        {},
        { url: 'http://fallback.example.test:8001' },
        getOtlpGrpcDefaultConfiguration()
      );

      assert.deepStrictEqual(config.url, 'fallback.example.test:8001');
    });

    it('should trim fallback url', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        {},
        { url: '  http://fallback.example.test:8001  ' },
        getOtlpGrpcDefaultConfiguration()
      );

      assert.deepStrictEqual(config.url, 'fallback.example.test:8001');
    });

    it('should use default if nothing is provided', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        {},
        {},
        getOtlpGrpcDefaultConfiguration()
      );

      // assert
      assert.deepStrictEqual(config.url, 'localhost:4317');
    });
  });

  describe('credentials', function () {
    it('uses user-provided credentials over fallback', function () {
      // arrange
      const userProvidedCredentials = createSslCredentials(
        Buffer.from(fs.readFileSync('./test/certs/ca.crt')),
        Buffer.from(fs.readFileSync('./test/certs/client.key')),
        Buffer.from(fs.readFileSync('./test/certs/client.crt'))
      );

      const fallbackCredentials = createInsecureCredentials();

      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        {
          credentials: () => {
            return userProvidedCredentials;
          },
        },
        {
          credentials: _url => {
            return () => fallbackCredentials;
          },
        },
        getOtlpGrpcDefaultConfiguration()
      );

      assert.deepStrictEqual(config.credentials(), userProvidedCredentials);
    });

    it('uses fallback credentials over default', function () {
      // arrange
      const fallbackCredentials = createSslCredentials(
        Buffer.from(fs.readFileSync('./test/certs/ca.crt')),
        Buffer.from(fs.readFileSync('./test/certs/client.key')),
        Buffer.from(fs.readFileSync('./test/certs/client.crt'))
      );

      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        {},
        {
          credentials: _url => {
            return () => fallbackCredentials;
          },
        },
        getOtlpGrpcDefaultConfiguration()
      );

      assert.deepStrictEqual(config.credentials(), fallbackCredentials);
    });

    it('uses default (insecure) if nothing is provided', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        {},
        {},
        getOtlpGrpcDefaultConfiguration()
      );

      // assert
      assert.deepStrictEqual(config.credentials(), createInsecureCredentials());
    });

    it('uses default (secure) if https url is user-provided', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        { url: 'https://user-provided.example.test:8000' },
        {},
        getOtlpGrpcDefaultConfiguration()
      );

      // assert
      assert.deepStrictEqual(config.credentials(), createSslCredentials());
    });

    it('uses default (insecure) if http url is user-provided', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        { url: 'http://user-provided.example.test:8000' },
        {},
        getOtlpGrpcDefaultConfiguration()
      );

      // assert
      assert.deepStrictEqual(config.credentials(), createInsecureCredentials());
    });

    it('uses default (secure) if no protocol is provided', function () {
      // act
      const config = mergeOtlpGrpcConfigurationWithDefaults(
        { url: 'user-provided.example.test:8000' },
        {},
        getOtlpGrpcDefaultConfiguration()
      );

      // assert
      assert.deepStrictEqual(config.credentials(), createSslCredentials());
    });
  });
});
