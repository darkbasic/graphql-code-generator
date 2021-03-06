---
id: fragment-matcher
title: Fragment Matcher
---

The `graphql-codegen-fragment-matcher` generates an introspection file but only with Interfaces and Unions, based on your GraphQLSchema.

If you are using `apollo-client` and your schema contains `interface` or `union` declaration, it's recommended to use Apollo's Fragment Matcher and the result generated by the plugin.

You can read more about it [in `apollo-client` documentation](https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher).

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-fragment-matcher

## Configuration

Fragment Matcher plugin accepts a TypeScript / JavaScript or a JSON file as an output _(`.ts, .tsx, .js, .jsx, .json`)_.

Both in TypeScript and JavaScript a default export is being used.

```yaml
generates:
  ./src/introspection-result.ts:
    plugins:
      - fragment-matcher
```

## Usage

```typescript
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';

// generated by Fragment Matcher plugin
import introspectionResult from '../introspection-result';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: introspectionResult
});

const cache = new InMemoryCache({
  fragmentMatcher
});
```
