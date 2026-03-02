/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

import {
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_SERVICE_NAMESPACE,
} from '../../src/semconv';

/**
 * Test utility method to validate a service resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource attributes
 */
export const assertServiceResource = (
  resource: Resource,
  validations: {
    name: string;
    instanceId?: string;
    namespace?: string;
    version?: string;
  }
) => {
  assert.strictEqual(resource.attributes[ATTR_SERVICE_NAME], validations.name);
  assert.strictEqual(
    resource.attributes[ATTR_SERVICE_INSTANCE_ID],
    validations.instanceId
  );
  if (validations.namespace)
    assert.strictEqual(
      resource.attributes[ATTR_SERVICE_NAMESPACE],
      validations.namespace
    );
  if (validations.version)
    assert.strictEqual(
      resource.attributes[ATTR_SERVICE_VERSION],
      validations.version
    );
};

export const assertServiceInstanceIdIsUUID = (resource: Resource): void => {
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert.equal(
    UUID_REGEX.test(
      resource.attributes[ATTR_SERVICE_INSTANCE_ID]?.toString() || ''
    ),
    true
  );
};
