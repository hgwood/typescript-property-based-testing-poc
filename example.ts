import * as jsc from 'jsverify';

jsc.assert(
  /*jsc.fn(jsc.bool), jsc.bool*/
  jsc.forall(function(f: (a: boolean) => boolean, b: boolean) {
    return f(f(f(b))) === f(b);
  }),
);

interface Whatever {
  s: string;
  n: number;
}

jsc.assert(
  /* jsc.record({s: jsc.string, n: jsc.number}) */
  jsc.forall(function(whatever: Whatever) {
    return typeof whatever.s === 'string' && typeof whatever.n === 'number';
  }),
);
