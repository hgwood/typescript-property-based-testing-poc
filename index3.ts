import Ast from 'ts-simple-ast/src/main';

const ast = new Ast();
ast.addSourceFiles('./example.ts');
const sourceFile = ast.getSourceFile('example.ts');
sourceFile.
