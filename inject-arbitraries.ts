import { readFileSync, writeFileSync } from 'fs';
import * as ts from 'typescript';
import * as R from 'ramda';

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

function isGenotypeImport(node: ts.Node): node is ts.ImportDeclaration {
  return (
    ts.isImportDeclaration(node) &&
    ts.isLiteralExpression(node.moduleSpecifier) &&
    node.moduleSpecifier.text === './genotype'
  );
}

function getBindingName(node: ts.ImportDeclaration): ts.Identifier | undefined {
  return (
    node.importClause && node.importClause.name
  );
}

function isCallExpressionTo(
  node: ts.Node,
  identifierText: string,
): node is ts.CallExpression {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === identifierText
  );
}

function getFirstArgumentsOfCall(node: ts.CallExpression): ts.Expression {
  return node.arguments[0];
}

function getTypesOfArguments(node: ts.FunctionExpression): Array<ts.TypeNode | undefined> {
  return node.parameters.map(parameter => parameter.type);
}

function transformer(f: (node: ts.Node, visit: Visitor, context: ts.TransformationContext) => ts.Node): ts.Transformer<ts.Node> {
  
}

const genotypeBinding: ts.Transformer<ts.Node> = transformer((node: ts.Node, visit: Visitor, context: ts.TransformationContext) => {

})

function findInjectionPoint(
  node: ts.Node): ts.Node {
    if (isGenotypeImport(node)) {
      return node;
    } else {
      return ts.visitEachChild(node, findInjectionPoint, context)
    }
  if (ts.isImportDeclaration(node)) {
    const moduleSpecifier = node.moduleSpecifier;
    if (ts.isLiteralExpression(moduleSpecifier)) {
      console.log(moduleSpecifier.text);
      console.log(node.importClause!.name!.text);
    }
  }
  ts.forEachChild
  return node;
}

const transformer: ts.TransformerFactory<ts.SourceFile> = <T extends ts.Node>(
  context: ts.TransformationContext,
) => (rootNode: T) => {
  function visit(node: ts.Node): ts.Node {
    return findInjectionPoint(
      ts.visitEachChild(node, visit, context),
      visit,
      context,
    );
  }
  return ts.visitNode(rootNode, visit);
};

program.emit(undefined, undefined, undefined, undefined, {
  before: [transformer],
});
