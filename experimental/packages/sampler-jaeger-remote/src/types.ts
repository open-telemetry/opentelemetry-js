/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
