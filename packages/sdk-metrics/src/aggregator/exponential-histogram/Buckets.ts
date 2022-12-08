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
export class Buckets {
  constructor(
    public backing = new BucketsBacking(),
    public indexBase = 0,
    public indexStart = 0,
    public indexEnd = 0,
  ) {}

  //todo: can probably delete
  toString(): string {
    return this.backing.toString();
  }

  offset(): number {
    return this.indexStart;
  }

  // returns the counts from the backing array as-is
  counts(): number[] {
    return this.backing.counts();
  }

  clone(): Buckets {
    return new Buckets(
      this.backing.clone(),
      this.indexBase,
      this.indexStart,
      this.indexEnd,
    )
  }

  length(): number {
    if (this.backing.size() === 0) {
      return 0;
    }

    if (this.indexEnd === this.indexStart && this.at(0) === 0) {
      return 0;
    }

    return this.indexEnd - this.indexStart + 1;
  }

  /**
   * At returns the count of the bucket at a position in the logical
   * array of counts.
   * @param position
   * @returns
   */
  at(position: number): number {
    const bias = this.indexBase - this.indexStart;
    if (position < bias) {
      position += this.backing.size();
    }

    position -= bias;
    return this.backing.countAt(position);
  }

  /**
   * incrementBucket increments the backing array index by `increment`
   * @param bucketIndex
   * @param increment
   */
  incrementBucket(bucketIndex: number, increment: number) {
    this.backing.increment(bucketIndex, increment);
  }

  /**
   * decrementBucket decrements the backing array index by `decrement`
   * if decrement is greater than the current value, it's set to 0.
   * @param bucketIndex
   * @param increment
   */
   decrementBucket(bucketIndex: number, decrement: number) {
    this.backing.decrement(bucketIndex, decrement);
  }

  /**
   * clear zeros the backing array.
   */
  clear() {}

  /**
   * trim removes leading and / or trailing zero buckets (which can occur
   * after diffing two histos) and rotates the backing array so that the
   * smallest non-zero index is in the 0th position of the backing array
   */
  trim() {
    for(let i = 0; i < this.length(); i++) {
        if(this.at(i) !== 0) {
          this.indexStart += i
          break;
        }
        else if(i == this.length() - 1) {
          //the entire array is zeroed out
          this.indexStart = this.indexEnd = this.indexBase = 0;
          return;
        }
    }

    for(let i = this.length() - 1; i >= 0; i--) {
      console.log(i)
      if(this.at(i) !== 0 ) {
        this.indexEnd -= this.length() - i - 1;
        break;
      }
    }

    this._rotate();
  }

  /**
   *
   * @param {number} by - expected to be int32
   */
  downscale(by: number) {
    this._rotate();

    const size = 1 + this.indexEnd - this.indexStart;
    const each = 1 << by;
    let inpos = 0;
    let outpos = 0;

    for (let pos = this.indexStart; pos <= this.indexEnd; ) {
      let mod = pos % each;
      if (mod < 0) {
        mod += each;
      }
      for (let i = mod; i < each && inpos < size; i++) {
        this._relocateBucket(outpos, inpos);
        inpos++;
        pos++;
      }
      outpos++;
    }

    this.indexStart >>= by;
    this.indexEnd >>= by;
    this.indexBase = this.indexStart;
  }

  private _rotate() {
    const bias = this.indexBase - this.indexStart;

    if (bias === 0) {
      return;
    } else if( bias > 0) {
      this.backing.reverse(0, this.backing.size());
      this.backing.reverse(0, bias);
      this.backing.reverse(bias, this.backing.size());
    } else {
      // negative bias, this can happen when diffing two histograms
      this.backing.reverse(0, this.backing.size());
      this.backing.reverse(0, this.backing.size() + bias);
    }
    this.indexBase = this.indexStart;
  }

  private _relocateBucket(dest: number, src: number) {
    if (dest === src) {
      return;
    }
    this.incrementBucket(dest, this.backing.emptyBucket(src));
  }
}

class BucketsBacking {
  constructor(
    private _counts = [0],
  ) {}

  toString(): string {
    return `[${this._counts.join(',')}]`;
  }

  size(): number {
    return this._counts.length;
  }

  counts(): number[] {
    return this._counts;
  }

  growTo(newSize: number, oldPositiveLimit: number, newPositiveLimit: number) {
    const tmp = new Array<number>(newSize).fill(0);
    tmp.splice(
      newPositiveLimit,
      this._counts.length - oldPositiveLimit,
      ...this._counts.slice(oldPositiveLimit)
    );
    tmp.splice(0, oldPositiveLimit, ...this._counts.slice(0, oldPositiveLimit));
    this._counts = tmp;
  }

  reverse(from: number, limit: number) {
    const num = Math.floor((from + limit) / 2) - from;
    for (let i = 0; i < num; i++) {
      const tmp = this._counts[from + i];
      this._counts[from + i] = this._counts[limit - i - 1];
      this._counts[limit - i - 1] = tmp;
    }
  }

  emptyBucket(src: number): number {
    const tmp = this._counts[src];
    this._counts[src] = 0;
    return tmp;
  }

  increment(bucketIndex: number, increment: number) {
    this._counts[bucketIndex] += increment;
  }

  decrement(bucketIndex: number, decrement: number) {
    if (this._counts[bucketIndex] >= decrement) {
      this._counts[bucketIndex] -= decrement;
    } else {
      // should not happen, todo: log
      this._counts[bucketIndex] = 0;
    }
  }

  countAt(pos: number): number {
    return this._counts[pos];
  }

  reset() {
    for (let i = 0; i < this._counts.length; i++) {
      this._counts[i] = 0;
    }
  }

  clone(): BucketsBacking {
    return new BucketsBacking([...this._counts]);
  }
}
