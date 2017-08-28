import * as jsc from 'jsverify';
import arbitraries from './genotype';

jsc.assert(
  /*jsc.fn(jsc.bool), jsc.bool*/
  jsc.forall(arbitraries(function(f: (a: boolean) => boolean, b: boolean) {
    return f(f(f(b))) === f(b);
  })),
);

interface Whatever {
  s: string;
  n: number;
}

jsc.assert(
  /* jsc.record({s: jsc.string, n: jsc.number}) */
  jsc.forall(arbitraries(function(whatever: Whatever) {
    return typeof whatever.s === 'string' && typeof whatever.n === 'number';
  })),
);
