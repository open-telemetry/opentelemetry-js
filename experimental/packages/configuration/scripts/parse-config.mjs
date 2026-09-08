#!/usr/bin/env node
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parse a declaractive config file (or create a config from env vars) and
 * print its JS object representation.  This is a convenience script for
 * development of this package.
 *
 * Usage:
 *    ./scripts/parse-config.mjs [CONFIG_FILE]
 *
 * If `CONFIG_FILE` is given, it is used to set the `OTEL_CONFIG_FILE` envvar.
 * That means that if no `CONFIG_FILE` is given, the config will be
 * generated from envvars.
 */

import { createConfigFactory } from '@opentelemetry/configuration';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), { logLevel: DiagLogLevel.INFO });

const configFile = process.argv[2];
if (configFile) {
  process.env.OTEL_CONFIG_FILE = configFile;
}

const fac = createConfigFactory();
const config = fac.getConfigModel();
console.dir(config, { depth: 50 });
