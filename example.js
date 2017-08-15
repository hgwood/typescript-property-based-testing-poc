"use strict";
exports.__esModule = true;
var jsc = require("jsverify");
jsc.assert(
/*jsc.fn(jsc.bool), jsc.bool*/
jsc.forall(jsc.fn(jsc.bool), jsc.bool, function (f, b) {
    return f(f(f(b))) === f(b);
}));
jsc.assert(
/* jsc.record({s: jsc.string, n: jsc.number}) */
jsc.forall(jsc.record({ s: jsc.string, n: jsc.number }), function (whatever) {
    return typeof whatever.s === 'string' && typeof whatever.n === 'number';
}));
