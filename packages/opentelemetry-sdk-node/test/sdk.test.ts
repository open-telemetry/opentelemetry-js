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

import * as nock from 'nock';
import { URL } from 'url';
import {
  context,
  metrics,
  NoopHttpTextPropagator,
  NoopMeterProvider,
  NoopTracerProvider,
  propagation,
  trace,
} from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { NoopContextManager } from '@opentelemetry/context-base';
import { CompositePropagator } from '@opentelemetry/core';
import { ConsoleMetricExporter, MeterProvider } from '@opentelemetry/metrics';
import { NodeTracerProvider } from '@opentelemetry/node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import { NodeSDK } from '../src';
import * as NodeConfig from '@opentelemetry/node/build/src/config';
import * as Sinon from 'sinon';
import { Resource } from '@opentelemetry/resources';
import { awsEc2Detector } from '@opentelemetry/resource-detector-aws';

import {
  assertServiceResource,
  assertCloudResource,
  assertHostResource,
} from '@opentelemetry/resources/test/util/resource-assertions';
import {
  BASE_PATH,
  HEADER_NAME,
  HEADER_VALUE,
  HOST_ADDRESS,
  SECONDARY_HOST_ADDRESS,
  resetIsAvailableCache,
} from 'gcp-metadata';
import { resetIsAvailableCache as otherResetIsAvailableCache } from '@opentelemetry/resource-detector-gcp/node_modules/gcp-metadata';

const HEADERS = {
  [HEADER_NAME.toLowerCase()]: HEADER_VALUE,
};
const INSTANCE_PATH = BASE_PATH + '/instance';
const INSTANCE_ID_PATH = BASE_PATH + '/instance/id';
const PROJECT_ID_PATH = BASE_PATH + '/project/project-id';
const ZONE_PATH = BASE_PATH + '/instance/zone';
const CLUSTER_NAME_PATH = BASE_PATH + '/instance/attributes/cluster-name';

const { origin: AWS_HOST, pathname: AWS_PATH } = new URL(
  awsEc2Detector.AWS_INSTANCE_IDENTITY_DOCUMENT_URI
);

const mockedAwsResponse = {
  instanceId: 'my-instance-id',
  instanceType: 'my-instance-type',
  accountId: 'my-account-id',
  region: 'my-region',
  availabilityZone: 'my-zone',
};

describe('Node SDK', () => {
  before(() => {
    // Disable attempted load of default plugins
    Sinon.replace(NodeConfig, 'DEFAULT_INSTRUMENTATION_PLUGINS', {});
  });

  beforeEach(() => {
    context.disable();
    trace.disable();
    propagation.disable();
    metrics.disable();
  });

  describe('Basic Registration', () => {
    it('should not register any unconfigured SDK components', async () => {
      const sdk = new NodeSDK({
        autoDetectResources: false,
      });

      await sdk.start();

      assert.ok(context['_getContextManager']() instanceof NoopContextManager);
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof NoopHttpTextPropagator
      );

      assert.ok(trace.getTracerProvider() instanceof NoopTracerProvider);
      assert.ok(metrics.getMeterProvider() instanceof NoopMeterProvider);
    });

    it('should register a tracer provider if an exporter is provided', async () => {
      const sdk = new NodeSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
      });

      await sdk.start();

      assert.ok(metrics.getMeterProvider() instanceof NoopMeterProvider);

      assert.ok(
        context['_getContextManager']() instanceof AsyncHooksContextManager
      );
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof CompositePropagator
      );
      assert.ok(trace.getTracerProvider() instanceof NodeTracerProvider);
    });

    it('should register a tracer provider if a span processor is provided', async () => {
      const exporter = new ConsoleSpanExporter();
      const spanProcessor = new SimpleSpanProcessor(exporter);

      const sdk = new NodeSDK({
        spanProcessor,
        autoDetectResources: false,
      });

      await sdk.start();

      assert.ok(metrics.getMeterProvider() instanceof NoopMeterProvider);

      assert.ok(
        context['_getContextManager']() instanceof AsyncHooksContextManager
      );
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof CompositePropagator
      );
      assert.ok(trace.getTracerProvider() instanceof NodeTracerProvider);
    });

    it('should register a meter provider if an exporter is provided', async () => {
      const exporter = new ConsoleMetricExporter();

      const sdk = new NodeSDK({
        metricExporter: exporter,
        autoDetectResources: false,
      });

      await sdk.start();

      assert.ok(context['_getContextManager']() instanceof NoopContextManager);
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof NoopHttpTextPropagator
      );

      assert.ok(trace.getTracerProvider() instanceof NoopTracerProvider);

      assert.ok(metrics.getMeterProvider() instanceof MeterProvider);
    });
  });

  describe('detectResources', async () => {
    const sdk = new NodeSDK({
      autoDetectResources: true,
    });

    beforeEach(() => {
      nock.disableNetConnect();
      process.env.OTEL_RESOURCE_LABELS =
        'service.instance.id=627cc493,service.name=my-service,service.namespace=default,service.version=0.0.1';
    });

    afterEach(() => {
      sdk['_resource'] = Resource.empty();
      resetIsAvailableCache();
      otherResetIsAvailableCache();
      nock.cleanAll();
      nock.enableNetConnect();
      delete process.env.OTEL_RESOURCE_LABELS;
    });

    describe('in GCP environment', () => {
      it('returns a merged resource', async () => {
        const gcpScope = nock(HOST_ADDRESS)
          .get(INSTANCE_PATH)
          .reply(200, {}, HEADERS)
          .get(INSTANCE_ID_PATH)
          .reply(200, () => 452003179927758, HEADERS)
          .get(PROJECT_ID_PATH)
          .reply(200, () => 'my-project-id', HEADERS)
          .get(ZONE_PATH)
          .reply(200, () => 'project/zone/my-zone', HEADERS)
          .get(CLUSTER_NAME_PATH)
          .reply(404);
        const gcpSecondaryScope = nock(SECONDARY_HOST_ADDRESS)
          .get(INSTANCE_PATH)
          .reply(200, {}, HEADERS);
        const awsScope = nock(AWS_HOST)
          .get(AWS_PATH)
          .replyWithError({ code: 'ENOTFOUND' });
        await sdk.detectResources();
        const resource: Resource = sdk['_resource'];

        awsScope.done();
        gcpSecondaryScope.done();
        gcpScope.done();

        assertCloudResource(resource, {
          provider: 'gcp',
          accountId: 'my-project-id',
          zone: 'my-zone',
        });
        assertHostResource(resource, { id: '452003179927758' });
        assertServiceResource(resource, {
          instanceId: '627cc493',
          name: 'my-service',
          namespace: 'default',
          version: '0.0.1',
        });
      });
    });

    describe('in AWS environment', () => {
      it('returns a merged resource', async () => {
        const gcpScope = nock(HOST_ADDRESS).get(INSTANCE_PATH).replyWithError({
          code: 'ENOTFOUND',
        });
        const gcpSecondaryScope = nock(SECONDARY_HOST_ADDRESS)
          .get(INSTANCE_PATH)
          .replyWithError({
            code: 'ENOTFOUND',
          });
        const awsScope = nock(AWS_HOST)
          .get(AWS_PATH)
          .reply(200, () => mockedAwsResponse);

        await sdk.detectResources();
        const resource: Resource = sdk['_resource'];

        gcpSecondaryScope.done();
        gcpScope.done();
        awsScope.done();

        assertCloudResource(resource, {
          provider: 'aws',
          accountId: 'my-account-id',
          region: 'my-region',
          zone: 'my-zone',
        });
        assertHostResource(resource, {
          id: 'my-instance-id',
          hostType: 'my-instance-type',
        });
        assertServiceResource(resource, {
          instanceId: '627cc493',
          name: 'my-service',
          namespace: 'default',
          version: '0.0.1',
        });
      });
    });

    describe('with a buggy detector', () => {
      it('returns a merged resource', async () => {
        const stub = Sinon.stub(awsEc2Detector, 'detect').throws();

        await sdk.detectResources();
        const resource: Resource = sdk['_resource'];

        assertServiceResource(resource, {
          instanceId: '627cc493',
          name: 'my-service',
          namespace: 'default',
          version: '0.0.1',
        });

        stub.restore();
      });
    });

    describe('with a debug logger', () => {
      // Local functions to test if a mocked method is ever called with a specific argument or regex matching for an argument.
      // Needed because of race condition with parallel detectors.
      const callArgsContains = (
        mockedFunction: Sinon.SinonSpy,
        arg: any
      ): boolean => {
        return mockedFunction.getCalls().some(call => {
          return call.args.some(callarg => arg === callarg);
        });
      };
      const callArgsMatches = (
        mockedFunction: Sinon.SinonSpy,
        regex: RegExp
      ): boolean => {
        return mockedFunction.getCalls().some(call => {
          return regex.test(call.args.toString());
        });
      };

      it('prints detected resources and debug messages to the logger', async () => {
        // This test depends on the env detector to be functioning as intended
        const mockedLoggerMethod = Sinon.fake();
        await sdk.detectResources({
          logger: {
            debug: mockedLoggerMethod,
            info: Sinon.fake(),
            warn: Sinon.fake(),
            error: Sinon.fake(),
          },
        });

        // Test for AWS and GCP Detector failure
        assert.ok(
          callArgsContains(
            mockedLoggerMethod,
            'GcpDetector failed: GCP Metadata unavailable.'
          )
        );
        assert.ok(
          callArgsContains(
            mockedLoggerMethod,
            'AwsEc2Detector failed: Nock: Disallowed net connect for "169.254.169.254:80/latest/dynamic/instance-identity/document"'
          )
        );
        // Test that the Env Detector successfully found its resource and populated it with the right values.
        assert.ok(
          callArgsContains(mockedLoggerMethod, 'EnvDetector found resource.')
        );
        // Regex formatting accounts for whitespace variations in util.inspect output over different node versions
        assert.ok(
          callArgsMatches(
            mockedLoggerMethod,
            /{\s+'service\.instance\.id':\s+'627cc493',\s+'service\.name':\s+'my-service',\s+'service\.namespace':\s+'default',\s+'service\.version':\s+'0\.0\.1'\s+}\s*/
          )
        );
      });

      describe('with missing environemnt variable', () => {
        beforeEach(() => {
          delete process.env.OTEL_RESOURCE_LABELS;
        });

        it('prints correct error messages when EnvDetector has no env variable', async () => {
          const mockedLoggerMethod = Sinon.fake();
          await sdk.detectResources({
            logger: {
              debug: mockedLoggerMethod,
              info: Sinon.fake(),
              warn: Sinon.fake(),
              error: Sinon.fake(),
            },
          });

          assert.ok(
            callArgsContains(
              mockedLoggerMethod,
              'EnvDetector failed: Environment variable "OTEL_RESOURCE_LABELS" is missing.'
            )
          );
        });
      });

      describe('with a faulty environment variable', () => {
        beforeEach(() => {
          process.env.OTEL_RESOURCE_LABELS = 'bad=~label';
        });

        it('prints correct error messages when EnvDetector has an invalid variable', async () => {
          const mockedLoggerMethod = Sinon.fake();
          await sdk.detectResources({
            logger: {
              debug: mockedLoggerMethod,
              info: Sinon.fake(),
              warn: Sinon.fake(),
              error: Sinon.fake(),
            },
          });

          assert.ok(
            callArgsContains(
              mockedLoggerMethod,
              'EnvDetector failed: Label value should be a ASCII string with a length not exceed 255 characters.'
            )
          );
        });
      });
    });
  });
});
