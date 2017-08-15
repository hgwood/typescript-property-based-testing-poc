"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var ts = require("typescript");
var fileName = './example.ts';
var sourceFile = ts.createSourceFile(fileName, fs_1.readFileSync(fileName).toString(), ts.ScriptTarget.Latest, 
/*setParentNodes */ true);
function visit(node) {
    if (ts.isCallExpression(node)) {
        if (ts.isPropertyAccessExpression(node.expression)) {
            if (ts.isIdentifier(node.expression.expression) &&
                ts.isIdentifier(node.expression.name)) {
                if (node.expression.expression.text === 'jsc' &&
                    node.expression.name.text === 'forall') {
                    var forallCallback = node.arguments[0];
                    // console.log(forallCallback.getFullText())
                    if (!ts.isFunctionExpression(forallCallback)) {
                        throw new Error('first parameter to jsc.forall should be a function');
                    }
                    forallCallback.parameters.forEach(function (parameter) {
                        if (parameter.type === undefined) {
                            throw new Error('forall callback should have fully typed parameters');
                        }
                        if (ts.isToken(parameter.type) &&
                            parameter.type.kind === ts.SyntaxKind.BooleanKeyword) {
                            ts.createPropertyAccess(ts.createIdentifier('jsc'), ts.createIdentifier('bool'));
                        }
                        else if (ts.isFunctionTypeNode(parameter.type)) {
                            console.log(ts.createCall(ts.createPropertyAccess(ts.createIdentifier('jsc'), ts.createIdentifier('fn')), undefined, [
                                ts.createPropertyAccess(ts.createIdentifier('jsc'), ts.createIdentifier('bool')),
                            ]));
                            sourceFile.up;
                        }
                        console.log(ts.SyntaxKind[parameter.type.kind]);
                        console.log(parameter.type.kind);
                    });
                }
            }
        }
    }
    node.forEachChild(visit);
}
visit(sourceFile);
