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
/**
 * Enum representing different types of sampling strategies.
 */
export enum StrategyType {
  /** Constant sampling strategy */
  CONST = 'CONST',
  /** Probabilistic sampling strategy */
  PROBABILISTIC = 'PROBABILISTIC',
  /** Rate-limiting sampling strategy */
  RATELIMITING = 'RATELIMITING',
  /** Remote sampling strategy */
  REMOTE = 'REMOTE',
}

/**
 * Interface for probabilistic sampling options.
 */
export interface ProbabilisticSamplingOptions {
  /** The sampling rate, typically a number between 0 and 1 */
  samplingRate: number;
}

/**
 * Interface representing a per-operation sampling strategy.
 */
export interface PerOperationStrategy {
  /** The name or identifier of the operation */
  operation: string;
  /** The probabilistic sampling options for this operation */
  probabilisticSampling: ProbabilisticSamplingOptions;
}

/**
 * Interface representing the response of a sampling strategy.
 */
export interface SamplingStrategyResponse {
  /** The type of sampling strategy being used */
  strategyType: StrategyType;
  /** The probabilistic sampling options */
  probabilisticSampling: ProbabilisticSamplingOptions;
  /** Optional operation-specific sampling configuration */
  operationSampling?: {
    /** The default sampling probability for operations */
    defaultSamplingProbability: number;
    /** The default lower bound of traces per second */
    defaultLowerBoundTracesPerSecond: number;
    /** Array of per-operation sampling strategies */
    perOperationStrategies: PerOperationStrategy[];
    /** The default upper bound of traces per second */
    defaultUpperBoundTracesPerSecond: number;
  };
}
