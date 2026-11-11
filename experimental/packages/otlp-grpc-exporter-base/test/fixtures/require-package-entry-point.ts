/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import '../../src';
import { loadedGrpcJsFiles } from './loaded-grpc-js-files';

process.stdout.write(`${loadedGrpcJsFiles()}`);
