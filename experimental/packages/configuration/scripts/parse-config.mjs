#!/usr/bin/env node
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parse a declaractive config file and print its JS object representation.
 * This is a convenience script for development of this package.
 *
 * Usage:
 *    ./scripts/parse-config.mjs [CONFIG_FILE]
 *
 * The config file to parse can be provided as a command-line argument, or
 * via the `OTEL_CONFIG_FILE` environment variable.
 */

import { parseConfigFile } from '@opentelemetry/configuration';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), { logLevel: DiagLogLevel.INFO });

const configFile = process.argv[2] || process.env.OTEL_CONFIG_FILE;
if (!configFile) {
  throw new Error('missing CONFIG_FILE argument or `OTEL_CONFIG_FILE` envvar');
}

const config = parseConfigFile(configFile);
console.dir(config, { depth: 50 });
