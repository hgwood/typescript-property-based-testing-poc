import { readFileSync, writeFileSync } from 'fs';
import * as ts from 'typescript';

const fileName = './example.ts';
const program = ts.createProgram([fileName], {});
const checker = program.getTypeChecker();

function typeToArbitrary(type: ts.TypeNode): ts.Expression {
  if (ts.isToken(type)) {
    return ts.createPropertyAccess(
      ts.createIdentifier('jsc'),
      ts.createIdentifier(
        {
          [ts.SyntaxKind.BooleanKeyword]: 'bool',
          [ts.SyntaxKind.StringKeyword]: 'string',
          [ts.SyntaxKind.NumberKeyword]: 'number',
        }[type.kind],
      ),
    );
  } else if (ts.isFunctionTypeNode(type)) {
    return ts.createCall(
      ts.createPropertyAccess(
        ts.createIdentifier('jsc'),
        ts.createIdentifier('fn'),
      ),
      [],
      [
        ts.createPropertyAccess(
          ts.createIdentifier('jsc'),
          ts.createIdentifier('bool'),
        ),
      ],
    );
  } else if (ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName)) {
    const symbol = checker.getSymbolAtLocation(type.typeName);
    if (symbol === undefined) {
      throw new Error('unknown symbol');
    }
    const decs = symbol.getDeclarations();
    if (decs === undefined) {
      throw new Error('declaration for symbol not found: ' + symbol.getName());
    }
    const decArbitraries = decs.map(dec => {
      if (!ts.isInterfaceDeclaration(dec)) {
        throw new Error('unknown declaration');
      }
      const recordMembers: [
        string,
        ts.Expression
      ][] = dec.members.map(member => {
        if (!ts.isPropertySignature(member)) {
          throw new Error('unknown member in interface declaration');
        }
        if (member.type === undefined) {
          throw new Error('forall callback should have fully typed parameters');
        }
        if (!ts.isIdentifier(member.name)) {
          throw new Error('unsupported member name in interface');
        }
        return [member.name.text, typeToArbitrary(member.type)] as [
          string,
          ts.Expression
        ];
      });
      return ts.createCall(
        ts.createPropertyAccess(
          ts.createIdentifier('jsc'),
          ts.createIdentifier('record'),
        ),
        [],
        [
          ts.createObjectLiteral(
            recordMembers.map(([prop, arbitrary]) =>
              ts.createPropertyAssignment(prop, arbitrary),
            ),
          ),
        ],
      );
    });
    return decArbitraries[0];
  } else {
    console.log(ts.SyntaxKind[type.kind]);
    throw new Error('unknown type');
  }
}

const transformer: ts.TransformerFactory<ts.SourceFile> = <T extends ts.Node>(
  context: ts.TransformationContext,
) => (rootNode: T) => {
  function visit(node: ts.Node): ts.Node {
    node = ts.visitEachChild(node, visit, context);
    if (!ts.isCallExpression(node)) {
      return node;
    }
    if (!ts.isPropertyAccessExpression(node.expression)) {
      return node;
    }
    if (
      !ts.isIdentifier(node.expression.expression) ||
      !ts.isIdentifier(node.expression.name)
    ) {
      return node;
    }
    if (
      node.expression.expression.text !== 'jsc' ||
      node.expression.name.text !== 'forall'
    ) {
      return node;
    }
    const forallCallback = node.arguments[0];
    if (!ts.isFunctionExpression(forallCallback)) {
      throw new Error('first parameter to jsc.forall should be a function');
    }
    const arbitraries: ts.Expression[] = forallCallback.parameters.map(
      parameter => {
        if (parameter.type === undefined) {
          throw new Error('forall callback should have fully typed parameters');
        }
        return typeToArbitrary(parameter.type);
      },
    );
    return ts.createCall(node.expression, [], [...arbitraries, forallCallback]);
  }
  return ts.visitNode(rootNode, visit);
};

program.emit(undefined, undefined, undefined, undefined, {
  before: [transformer],
});
