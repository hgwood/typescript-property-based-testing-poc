import * as tspoon from 'tspoon'
import * as ts from 'typescript';

const visitor: tspoon.Visitor = {
  filter(node) {
    return ts.isCallExpression(node.)
  },
  visit(node, context, traverse) {

  }
}


// from examples/poc/build.js 
const config = {
    sourceFileName: 'example.ts',
    visitors: ... // insert visitors here 
};
const sourceCode = fs.readFileSync(...);
const transpilerOut = tspoon.transpile(sourceCode, config);
