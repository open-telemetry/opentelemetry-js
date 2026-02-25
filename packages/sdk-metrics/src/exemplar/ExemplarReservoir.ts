/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Context,
  HrTime,
  isSpanContextValid,
  trace,
  Attributes,
} from '@opentelemetry/api';
import { Exemplar } from './Exemplar';

/**
 * An interface for an exemplar reservoir of samples.
 */
export interface ExemplarReservoir {
  /** Offers a measurement to be sampled. */
  offer(
    value: number,
    timestamp: HrTime,
    attributes: Attributes,
    ctx: Context
  ): void;
  /**
   * Returns accumulated Exemplars and also resets the reservoir
   * for the next sampling period
   *
   * @param pointAttributes The attributes associated with metric point.
   *
   * @returns a list of {@link Exemplar}s. Returned exemplars contain the attributes that were filtered out by the
   * aggregator, but recorded alongside the original measurement.
   */
  collect(pointAttributes: Attributes): Exemplar[];
}

class ExemplarBucket {
  private value: number = 0;
  private attributes: Attributes = {};
  private timestamp: HrTime = [0, 0];
  private spanId?: string;
  private traceId?: string;
  private _offered: boolean = false;

  offer(
    value: number,
    timestamp: HrTime,
    attributes: Attributes,
    ctx: Context
  ) {
    this.value = value;
    this.timestamp = timestamp;
    this.attributes = attributes;
    const spanContext = trace.getSpanContext(ctx);
    if (spanContext && isSpanContextValid(spanContext)) {
      this.spanId = spanContext.spanId;
      this.traceId = spanContext.traceId;
    }
    this._offered = true;
  }

  collect(pointAttributes: Attributes): Exemplar | null {
    if (!this._offered) return null;
    const currentAttributes = this.attributes;
    // filter attributes
    Object.keys(pointAttributes).forEach(key => {
      if (pointAttributes[key] === currentAttributes[key]) {
        delete currentAttributes[key];
      }
    });
    const retVal: Exemplar = {
      filteredAttributes: currentAttributes,
      value: this.value,
      timestamp: this.timestamp,
      spanId: this.spanId,
      traceId: this.traceId,
    };
    this.attributes = {};
    this.value = 0;
    this.timestamp = [0, 0];
    this.spanId = undefined;
    this.traceId = undefined;
    this._offered = false;
    return retVal;
  }
}

export abstract class FixedSizeExemplarReservoirBase
  implements ExemplarReservoir
{
  protected _reservoirStorage: ExemplarBucket[];
  protected _size: number;

  constructor(size: number) {
    this._size = size;
    this._reservoirStorage = new Array<ExemplarBucket>(size);
    for (let i = 0; i < this._size; i++) {
      this._reservoirStorage[i] = new ExemplarBucket();
    }
  }

  abstract offer(
    value: number,
    timestamp: HrTime,
    attributes: Attributes,
    ctx: Context
  ): void;

  maxSize(): number {
    return this._size;
  }

  /**
   * Resets the reservoir
   */
  protected reset(): void {}

  collect(pointAttributes: Attributes): Exemplar[] {
    const exemplars: Exemplar[] = [];
    this._reservoirStorage.forEach(storageItem => {
      const res = storageItem.collect(pointAttributes);
      if (res !== null) {
        exemplars.push(res);
      }
    });
    this.reset();
    return exemplars;
  }
}
