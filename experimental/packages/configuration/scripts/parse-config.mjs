#!/usr/bin/env node
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parse declaractive config files and print its JS object representation.
 * This is a convenience script for development of this package.
 */

/* eslint-disable no-console */

import { createConfigFactory } from '@opentelemetry/configuration';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), { logLevel: DiagLogLevel.INFO });

const configFile = process.argv[2];
if (!configFile) {
  console.error('parse-config: error: missing CONFIG_FILE argument');
  console.error('usage: ./scripts/parse-config.mjs CONFIG_FILE');
  process.exit(1);
}

process.env.OTEL_CONFIG_FILE = configFile;
const fac = createConfigFactory();
const config = fac.getConfigModel();
console.dir(config, { depth: 50 });
