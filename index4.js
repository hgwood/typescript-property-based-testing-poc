"use strict";
/**
 * https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
 * http://blog.scottlogic.com/2017/05/02/typescript-compiler-api-revisited.html
 * https://stackoverflow.com/questions/44599255/resolve-original-node-by-identifier-in-typescript-ast
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var fileName = './example.ts';
var program = ts.createProgram([fileName], {});
var checker = program.getTypeChecker();
function typeToArbitrary(type) {
    if (ts.isToken(type)) {
        return ts.createPropertyAccess(ts.createIdentifier('jsc'), ts.createIdentifier((_a = {},
            _a[ts.SyntaxKind.BooleanKeyword] = 'bool',
            _a[ts.SyntaxKind.StringKeyword] = 'string',
            _a[ts.SyntaxKind.NumberKeyword] = 'number',
            _a)[type.kind]));
    }
    else if (ts.isFunctionTypeNode(type)) {
        return ts.createCall(ts.createPropertyAccess(ts.createIdentifier('jsc'), ts.createIdentifier('fn')), [], [
            ts.createPropertyAccess(ts.createIdentifier('jsc'), ts.createIdentifier('bool')),
        ]);
    }
    else if (ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName)) {
        var symbol = checker.getSymbolAtLocation(type.typeName);
        if (symbol === undefined) {
            throw new Error('unknown symbol');
        }
        var decs = symbol.getDeclarations();
        if (decs === undefined) {
            throw new Error('declaration for symbol not found: ' + symbol.getName());
        }
        var decArbitraries = decs.map(function (dec) {
            if (!ts.isInterfaceDeclaration(dec)) {
                throw new Error('unknown declaration');
            }
            var recordMembers = dec.members.map(function (member) {
                if (!ts.isPropertySignature(member)) {
                    throw new Error('unknown member in interface declaration');
                }
                if (member.type === undefined) {
                    throw new Error('forall callback should have fully typed parameters');
                }
                if (!ts.isIdentifier(member.name)) {
                    throw new Error('unsupported member name in interface');
                }
                return [member.name.text, typeToArbitrary(member.type)];
            });
            return ts.createCall(ts.createPropertyAccess(ts.createIdentifier('jsc'), ts.createIdentifier('record')), [], [
                ts.createObjectLiteral(recordMembers.map(function (_a) {
                    var prop = _a[0], arbitrary = _a[1];
                    return ts.createPropertyAssignment(prop, arbitrary);
                })),
            ]);
        });
        return decArbitraries[0];
    }
    else {
        console.log(ts.SyntaxKind[type.kind]);
        throw new Error('unknown type');
    }
    var _a;
}
var transformer = function (context) { return function (rootNode) {
    function visit(node) {
        node = ts.visitEachChild(node, visit, context);
        if (!ts.isCallExpression(node)) {
            return node;
        }
        if (!ts.isPropertyAccessExpression(node.expression)) {
            return node;
        }
        if (!ts.isIdentifier(node.expression.expression) ||
            !ts.isIdentifier(node.expression.name)) {
            return node;
        }
        if (node.expression.expression.text !== 'jsc' ||
            node.expression.name.text !== 'forall') {
            return node;
        }
        var forallCallback = node.arguments[0];
        if (!ts.isFunctionExpression(forallCallback)) {
            throw new Error('first parameter to jsc.forall should be a function');
        }
        var arbitraries = forallCallback.parameters.map(function (parameter) {
            if (parameter.type === undefined) {
                throw new Error('forall callback should have fully typed parameters');
            }
            return typeToArbitrary(parameter.type);
        });
        return ts.createCall(node.expression, [], arbitraries.concat([forallCallback]));
    }
    return ts.visitNode(rootNode, visit);
}; };
program.emit(undefined, undefined, undefined, undefined, {
    before: [transformer],
});
