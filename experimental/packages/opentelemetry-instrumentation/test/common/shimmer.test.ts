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

/*
 * BSD 2-Clause License
 *
 * Copyright (c) 2013-2019, Forrest L Norvell
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* Modified by OpenTelemetry Authors
 *  - converted to TypeScript
 *  - adapted tests to use `node:assert` and `mocha`
 *  - aligned with style-guide
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import shimmer from '../../src/shimmer';
import { ShimWrapped } from '../../src';

describe('Shimmer', function () {
  describe('init', function () {
    it('shimmer initialization', function () {
      assert.doesNotThrow(function () {
        (shimmer as any)();
      });
      const mock = sinon.expectation
        .create('logger')
        .withArgs('no original function undefined to wrap')
        .once();

      assert.doesNotThrow(function () {
        shimmer({ logger: mock });
      }, "initializer doesn't throw");

      assert.doesNotThrow(function () {
        (shimmer as any).wrap();
      }, "invoking the wrap method with no params doesn't throw");

      assert.doesNotThrow(function () {
        mock.verify();
      }, 'logger method was called with the expected message');
    });

    it('shimmer initialized with non-function logger', function () {
      const mock = sinon.expectation
        .create('logger')
        .withArgs("new logger isn't a function, not replacing")
        .once();

      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        shimmer({ logger: { ham: 'chunx' } } as any);
      }, "even bad initialization doesn't throw");

      assert.doesNotThrow(function () {
        mock.verify();
      }, 'logger initialization failed in the expected way');
    });
  });

  describe('wrap', function () {
    let outsider = 0;

    function counter() {
      return ++outsider;
    }
    function anticounter() {
      return --outsider;
    }

    const generator: any = {
      inc: counter,
    };
    Object.defineProperty(generator, 'dec', {
      value: anticounter,
      writable: true,
      configurable: true,
      enumerable: false,
    });

    it('should wrap safely', function () {
      assert.equal(counter, generator.inc, 'method is mapped to function');
      assert.doesNotThrow(function () {
        generator.inc();
      }, 'original function works');
      assert.equal(1, outsider, 'calls have side effects');

      let count = 0;
      function wrapper(original: any) {
        return function (this: any) {
          count++;
          const returned = original.apply(this, arguments);
          count++;
          return returned;
        };
      }
      shimmer.wrap(generator, 'inc', wrapper);

      assert.ok(
        (generator.inc as unknown as ShimWrapped).__wrapped,
        "function tells us it's wrapped"
      );
      assert.equal(
        (generator.inc as unknown as ShimWrapped).__original,
        counter,
        'original function is available'
      );
      assert.doesNotThrow(function () {
        generator.inc();
      }, 'wrapping works');
      assert.equal(
        2,
        count,
        'both pre and post increments should have happened'
      );
      assert.equal(2, outsider, 'original function has still been called');
      assert.ok(
        Object.prototype.propertyIsEnumerable.call(generator, 'inc'),
        'wrapped enumerable property is still enumerable'
      );
      assert.equal(
        Object.keys(generator.inc).length,
        0,
        'wrapped object has no additional properties'
      );

      shimmer.wrap(generator, 'dec', function (original) {
        return function (this: any) {
          return original.apply(this, arguments);
        };
      });

      assert.ok(
        !Object.prototype.propertyIsEnumerable.call(generator, 'dec'),
        'wrapped unenumerable property is still unenumerable'
      );
    });

    it('wrap called with no arguments', function () {
      const mock = sinon.expectation
        .create('logger')
        .withExactArgs('no original function undefined to wrap')
        .once();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).wrap();
      }, "wrapping with no arguments doesn't throw");

      assert.doesNotThrow(function () {
        mock.verify();
      }, 'logger was called with the expected message');
    });

    it('wrap called with module but nothing else', function () {
      const mock = sinon.expectation
        .create('logger')
        .withExactArgs('no original function undefined to wrap')
        .once();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).wrap(generator);
      }, "wrapping with only 1 argument doesn't throw");

      assert.doesNotThrow(function () {
        mock.verify();
      }, 'logger was called with the expected message');
    });

    it('wrap called with original but no wrapper', function () {
      const mock = sinon.expectation.create('logger').twice();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).wrap(generator, 'inc');
      }, "wrapping with only original method doesn't throw");

      assert.doesNotThrow(function () {
        mock.verify();
      }, 'logger was called with the expected message');
    });

    it('wrap called with non-function original', function () {
      const mock = sinon.expectation
        .create('logger')
        .withExactArgs('original object and wrapper must be functions')
        .once();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        shimmer.wrap({ orange: 'slices' }, 'orange', function () {} as any);
      }, "wrapping non-function original doesn't throw");

      assert.doesNotThrow(function () {
        mock.verify();
      }, 'logger was called with the expected message');
    });

    it('wrap called with non-function wrapper', function () {
      const mock = sinon.expectation
        .create('logger')
        .withArgs('original object and wrapper must be functions')
        .once();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).wrap({ orange: function () {} }, 'orange', 'hamchunx');
      }, "wrapping with non-function wrapper doesn't throw");

      assert.doesNotThrow(function () {
        mock.verify();
      }, 'logger was called with the expected message');
    });
  });

  describe('unwrap', function () {
    let outsider = 0;

    function counter() {
      return ++outsider;
    }

    const generator = {
      inc: counter,
    };

    it('should unwrap safely', function () {
      assert.equal(
        counter,
        generator.inc,
        'basic function equality testing should work'
      );
      assert.doesNotThrow(function () {
        generator.inc();
      });
      assert.equal(1, outsider, 'calls have side effects');

      function wrapper(original: any) {
        return function (this: any) {
          return original.apply(this, arguments);
        };
      }
      shimmer.wrap(generator, 'inc', wrapper);

      assert.notEqual(counter, generator.inc, 'function should be wrapped');

      assert.doesNotThrow(function () {
        generator.inc();
      });
      assert.equal(2, outsider, 'original function has still been called');

      shimmer.unwrap(generator, 'inc');
      assert.equal(
        counter,
        generator.inc,
        'basic function equality testing should work'
      );
      assert.doesNotThrow(function () {
        generator.inc();
      });
      assert.equal(3, outsider, 'original function has still been called');
    });

    it("shouldn't throw on double unwrapping", function () {
      assert.equal(
        counter,
        generator.inc,
        'basic function equality testing should work'
      );

      const mock = sinon.expectation
        .create('logger')
        .withArgs(
          'no original to unwrap to -- ' + 'has inc already been unwrapped?'
        )
        .once();
      shimmer({ logger: mock });

      function wrapper(original: any) {
        return function (this: any) {
          return original.apply(this, arguments);
        };
      }
      shimmer.wrap(generator, 'inc', wrapper);

      assert.notEqual(counter, generator.inc, 'function should be wrapped');

      shimmer.unwrap(generator, 'inc');
      assert.equal(
        counter,
        generator.inc,
        'basic function equality testing should work'
      );

      assert.doesNotThrow(function () {
        shimmer.unwrap(generator, 'inc');
      }, 'should double unwrap without issue');
      assert.equal(
        counter,
        generator.inc,
        'function is unchanged after unwrapping'
      );

      mock.verify();
    });

    it('unwrap called with no arguments', function () {
      const mock = sinon.expectation.create('logger').twice();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).unwrap();
      }, 'should log instead of throwing');

      mock.verify();
    });

    it('unwrap called with module but no name', function () {
      const mock = sinon.expectation.create('logger').twice();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).unwrap({});
      }, 'should log instead of throwing');

      mock.verify();
    });
  });

  describe('massWrap', function () {
    let outsider = 0;
    function counter() {
      return ++outsider;
    }
    function anticounter() {
      return --outsider;
    }

    const generator: any = {
      inc: counter,
      dec: anticounter,
    };

    const arrow = {
      in: counter,
      out: anticounter,
    };

    const nester = {
      in: counter,
      out: anticounter,
    };

    it('should wrap multiple functions safely', function () {
      assert.equal(
        counter,
        generator.inc,
        'basic function equality testing should work'
      );
      assert.equal(
        anticounter,
        generator.dec,
        'basic function equality testing should work'
      );
      assert.doesNotThrow(function () {
        generator.inc();
      });
      assert.doesNotThrow(function () {
        generator.dec();
      });
      assert.equal(0, outsider, 'calls have side effects');

      let count = 0;
      function wrapper(original: any) {
        return function (this: any) {
          count++;
          const returned = original.apply(this, arguments);
          count++;
          return returned;
        };
      }
      (shimmer as any).massWrap(generator, ['inc', 'dec'], wrapper);

      assert.doesNotThrow(function () {
        generator.inc();
      });
      assert.doesNotThrow(function () {
        generator.dec();
      });
      assert.equal(
        4,
        count,
        'both pre and post increments should have happened'
      );
      assert.equal(0, outsider, 'original function has still been called');
    });

    it('should wrap multiple functions on multiple modules safely', function () {
      assert.equal(
        counter,
        arrow.in,
        'basic function equality testing should work'
      );
      assert.equal(
        counter,
        nester.in,
        'basic function equality testing should work'
      );
      assert.equal(
        anticounter,
        arrow.out,
        'basic function equality testing should work'
      );
      assert.equal(
        anticounter,
        nester.out,
        'basic function equality testing should work'
      );

      assert.doesNotThrow(function () {
        arrow.in();
      });
      assert.doesNotThrow(function () {
        nester.in();
      });
      assert.doesNotThrow(function () {
        arrow.out();
      });
      assert.doesNotThrow(function () {
        nester.out();
      });

      assert.equal(0, outsider, 'calls have side effects');

      let count = 0;

      function wrapper(original: any) {
        return function (this: any) {
          count++;
          const returned = original.apply(this, arguments);
          count++;
          return returned;
        };
      }
      shimmer.massWrap([arrow, nester], ['in', 'out'], wrapper);

      assert.doesNotThrow(function () {
        arrow.in();
      });
      assert.doesNotThrow(function () {
        arrow.out();
      });
      assert.doesNotThrow(function () {
        nester.in();
      });
      assert.doesNotThrow(function () {
        nester.out();
      });

      assert.equal(
        8,
        count,
        'both pre and post increments should have happened'
      );
      assert.equal(0, outsider, 'original function has still been called');
    });

    it('wrap called with no arguments', function () {
      const mock = sinon.expectation.create('logger').twice();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).massWrap();
      }, "wrapping with no arguments doesn't throw");

      assert.doesNotThrow(function () {
        mock.verify();
      }, 'logger was called with the expected message');
    });

    it('wrap called with module but nothing else', function () {
      const mock = sinon.expectation
        .create('logger')
        .withExactArgs('must provide one or more functions to wrap on modules')
        .once();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).massWrap(generator);
      }, "wrapping with only 1 argument doesn't throw");

      assert.doesNotThrow(function () {
        mock.verify();
      }, 'logger was called with the expected message');
    });

    it('wrap called with original but no wrapper', function () {
      const mock = sinon.expectation.create('logger').twice();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).massWrap(generator, ['inc']);
      }, "wrapping with only original function doesn't throw");

      mock.verify();
    });

    it('wrap called with non-function original', function () {
      const mock = sinon.expectation
        .create('logger')
        .withExactArgs('must provide one or more functions to wrap on modules')
        .once();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).massWrap(
          { orange: 'slices' },
          'orange',
          function () {}
        );
      }, "wrapping non-function original doesn't throw");

      mock.verify();
    });

    it('wrap called with non-function wrapper', function () {
      const mock = sinon.expectation
        .create('logger')
        .withArgs('must provide one or more functions to wrap on modules')
        .once();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).massWrap(
          { orange: function () {} },
          'orange',
          'hamchunx'
        );
      }, "wrapping with non-function wrapper doesn't throw");

      mock.verify();
    });
  });

  describe('massUnwrap', function () {
    let outsider = 0;

    function counter() {
      return ++outsider;
    }
    function anticounter() {
      return --outsider;
    }

    const generator: any = {
      inc: counter,
      dec: anticounter,
    };

    it('should unwrap safely', function () {
      assert.equal(
        counter,
        generator.inc,
        'basic function equality testing should work'
      );
      assert.equal(
        anticounter,
        generator.dec,
        'basic function equality testing should work'
      );
      assert.doesNotThrow(function () {
        generator.inc();
      });
      assert.equal(1, outsider, 'calls have side effects');
      assert.doesNotThrow(function () {
        generator.dec();
      });
      assert.equal(0, outsider, 'calls have side effects');

      function wrapper(original: any) {
        return function (this: any) {
          return original.apply(this, arguments);
        };
      }

      (shimmer as any).massWrap(generator, ['inc', 'dec'], wrapper);

      assert.notEqual(counter, generator.inc, 'function should be wrapped');
      assert.notEqual(anticounter, generator.dec, 'function should be wrapped');

      assert.doesNotThrow(function () {
        generator.inc();
      });
      assert.equal(1, outsider, 'original function has still been called');
      assert.doesNotThrow(function () {
        generator.dec();
      });
      assert.equal(0, outsider, 'original function has still been called');

      shimmer.massUnwrap(generator, ['inc', 'dec']);
      assert.equal(
        counter,
        generator.inc,
        'basic function equality testing should work'
      );
      assert.equal(
        anticounter,
        generator.dec,
        'basic function equality testing should work'
      );

      assert.doesNotThrow(function () {
        generator.inc();
      });
      assert.equal(1, outsider, 'original function has still been called');
      assert.doesNotThrow(function () {
        generator.dec();
      });
      assert.equal(0, outsider, 'original function has still been called');
    });

    it("shouldn't throw on double unwrapping", function () {
      assert.equal(
        counter,
        generator.inc,
        'basic function equality testing should work'
      );
      assert.equal(
        anticounter,
        generator.dec,
        'basic function equality testing should work'
      );

      const mock = sinon.stub();
      shimmer({ logger: mock });

      function wrapper(original: any) {
        return function (this: any) {
          return original.apply(this, arguments);
        };
      }
      shimmer.wrap(generator, 'inc', wrapper);
      shimmer.wrap(generator, 'dec', wrapper);

      assert.notEqual(counter, generator.inc, 'function should be wrapped');
      assert.notEqual(anticounter, generator.dec, 'function should be wrapped');

      shimmer.massUnwrap(generator, ['inc', 'dec']);
      assert.equal(
        counter,
        generator.inc,
        'basic function equality testing should work'
      );
      assert.equal(
        anticounter,
        generator.dec,
        'basic function equality testing should work'
      );

      assert.doesNotThrow(function () {
        shimmer.massUnwrap(generator, ['inc', 'dec']);
      }, 'should double unwrap without issue');
      assert.equal(
        counter,
        generator.inc,
        'function is unchanged after unwrapping'
      );
      assert.equal(
        anticounter,
        generator.dec,
        'function is unchanged after unwrapping'
      );

      sinon.assert.calledWith(
        mock,
        'no original to unwrap to -- ' + 'has inc already been unwrapped?'
      );
      sinon.assert.calledWith(
        mock,
        'no original to unwrap to -- ' + 'has dec already been unwrapped?'
      );
      sinon.assert.calledTwice(mock);
    });

    it('massUnwrap called with no arguments', function () {
      const mock = sinon.expectation.create('logger').twice();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).massUnwrap();
      }, 'should log instead of throwing');

      mock.verify();
    });

    it('massUnwrap called with module but nothing else', function () {
      const mock = sinon.expectation
        .create('logger')
        .withExactArgs(
          'must provide one or more functions to unwrap on modules'
        )
        .once();
      shimmer({ logger: mock });

      assert.doesNotThrow(function () {
        (shimmer as any).massUnwrap(generator);
      }, "wrapping with only 1 argument doesn't throw");

      mock.verify();
    });
  });
});
