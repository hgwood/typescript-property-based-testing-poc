# typescript-property-based-testing-poc

This repo explores how can arbitrary generators for property based-testing 
be generated from TypeScript types.

## Problem

When doing property-based testing with TypeScript, a JS property-based testing
can be used. However, types of value to generate as input for tests have to
expressed for the testing framework, even if they are already well-defined in
the TypeScript code under test, because no types are retained at runtime.

```typescript
interface Whatever {
  prop1: string;
  prop2: number;
}

jsc.forall(
  // type has to be expressed again
  jsc.record({
    prop1: jsc.string,
    prop2: jsc.number,
  }),  
  (whateverInstance: Whatever) =>
    // ...
  );
```

## Goal

```typescript
interface Whatever {
  prop1: string;
  prop2: number;
}

awesomeTool.forall(
  (whateverInstance: Whatever) =>
    // ...
  );
```

## Latest attempt

Code is in `index4.ts`.

The actual property-based testing is done by 
[JSVerify](http://jsverify.github.io/).

It works by looking for calls to `jsc.forall`, looks at the types of the
arguments of its unique argument (must be a function), generates
the corresponding arbitraries, then inserts them in the original code.

It is implemented as a TypeScript transformer (see TypeScript transformation
API in the References).

### Working examples

See `example.ts`.

### Run it

`npm test` will compile `index4.ts`, run `index4.js`, then run `example.js`.
Compare `example.ts` and `example.js` to see the transformation that was
applied.

### Limitations

- Supports only JSVerify
- JSVerify must be imported as `jsc`
- Call to JSVerify's `forall` must appear as `jsc.forall`
- Support only those types:
  - `boolean`
  - `string`
  - `number`
  - interfaces that combine those types

## References

- https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
- http://blog.scottlogic.com/2017/05/02/typescript-compiler-api-revisited.html
- https://stackoverflow.com/questions/44599255/resolve-original-node-by-identifier-in-typescript-ast
