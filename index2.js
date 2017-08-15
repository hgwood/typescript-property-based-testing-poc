"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var tspoon = require("tspoon");
var ts = require("typescript");
var visitor = {
    filter: function (node) {
        return ts.isCallExpression(node.);
    },
    visit: function (node, context, traverse) {
    }
};
// from examples/poc/build.js 
var config = __assign({ sourceFileName: 'example.ts', visitors:  }, // insert visitors here 
);
var sourceCode = fs.readFileSync.apply(fs, );
var transpilerOut = tspoon.transpile(sourceCode, config);
