import { readFileSync } from 'fs';
import * as ts from 'typescript';

const fileName = './example.ts';
let sourceFile = ts.createSourceFile(
  fileName,
  readFileSync(fileName).toString(),
  ts.ScriptTarget.Latest,
  /*setParentNodes */ true,
);

function visit(node: ts.Node) {
  if (ts.isCallExpression(node)) {
    if (ts.isPropertyAccessExpression(node.expression)) {
      if (
        ts.isIdentifier(node.expression.expression) &&
        ts.isIdentifier(node.expression.name)
      ) {
        if (
          node.expression.expression.text === 'jsc' &&
          node.expression.name.text === 'forall'
        ) {
          const forallCallback = node.arguments[0];
          // console.log(forallCallback.getFullText())
          if (!ts.isFunctionExpression(forallCallback)) {
            throw new Error(
              'first parameter to jsc.forall should be a function',
            );
          }
          forallCallback.parameters.forEach(parameter => {
            if (parameter.type === undefined) {
              throw new Error(
                'forall callback should have fully typed parameters',
              );
            }

            if (
              ts.isToken(parameter.type) &&
              parameter.type.kind === ts.SyntaxKind.BooleanKeyword
            ) {
              ts.createPropertyAccess(
                ts.createIdentifier('jsc'),
                ts.createIdentifier('bool'),
              );
            } else if (ts.isFunctionTypeNode(parameter.type)) {
              console.log(ts.createCall(
                ts.createPropertyAccess(
                  ts.createIdentifier('jsc'),
                  ts.createIdentifier('fn'),
                ),
                undefined,
                [
                  ts.createPropertyAccess(
                    ts.createIdentifier('jsc'),
                    ts.createIdentifier('bool'),
                  ),
                ],
              ));
            }
          });
        }
      }
    }
  }
  node.forEachChild(visit);
}

visit(sourceFile);
