import { italic } from './helpers';
import { PluginOption, Tags } from './types';

// KAMIL: react has some ts packages selected by default (we might want to change it because of flow)
export const plugins: Array<PluginOption> = [
  {
    name: `TypeScript ${italic('(required by other typescript plugins)')}`,
    package: 'graphql-codegen-typescript',
    value: 'typescript',
    available: () => true,
    shouldBeSelected: tags => oneOf(tags, Tags.angular, Tags.stencil, Tags.react, Tags.typescript)
  },
  {
    name: `TypeScript Operations ${italic('(operations and fragments)')}`,
    package: 'graphql-codegen-typescript-operations',
    value: 'typescript-operations',
    available: hasTag(Tags.browser),
    shouldBeSelected: tags =>
      oneOf(tags, Tags.angular, Tags.stencil, Tags.react) || allOf(tags, Tags.typescript, Tags.browser)
  },
  {
    name: `TypeScript Resolvers ${italic('(strongly typed resolve functions)')}`,
    package: 'graphql-codegen-typescript-resolvers',
    value: 'typescript-resolvers',
    available: hasTag(Tags.node),
    shouldBeSelected: tags => allOf(tags, Tags.typescript, Tags.node)
  },
  {
    name: `TypeScript Apollo Angular ${italic('(typed GQL services)')}`,
    package: 'graphql-codegen-typescript-apollo-angular',
    value: 'typescript-apollo-angular',
    available: hasTag(Tags.angular),
    shouldBeSelected: () => true
  },
  {
    name: `TypeScript React Apollo ${italic('(typed components and HOCs)')}`,
    package: 'graphql-codegen-typescript-react-apollo',
    value: 'typescript-react-apollo',
    available: hasTag(Tags.react),
    shouldBeSelected: () => true
  },
  {
    name: `TypeScript Stencil Apollo ${italic('(typed components)')}`,
    package: 'graphql-codegen-typescript-stencil-apollo',
    value: 'typescript-stencil-apollo',
    available: hasTag(Tags.stencil),
    shouldBeSelected: () => true
  },
  {
    name: `TypeScript MongoDB ${italic('(typed MongoDB objects)')}`,
    package: 'graphql-codegen-typescript-mongodb',
    value: 'typescript-mongodb',
    available: hasTag(Tags.node),
    shouldBeSelected: () => false
  },
  {
    name: `TypeScript GraphQL files modules ${italic('(declarations for .graphql files)')}`,
    package: 'graphql-codegen-typescript-graphql-files-modules',
    value: 'typescript-graphql-files-modules',
    available: hasTag(Tags.browser),
    shouldBeSelected: () => false
  },
  {
    name: `Introspection Fragment Matcher ${italic('(for Apollo Client)')}`,
    package: 'graphql-codegen-fragment-matcher',
    value: 'fragment-matcher',
    available: hasTag(Tags.browser),
    shouldBeSelected: () => false
  }
];

function hasTag(tag: Tags) {
  return (tags: Tags[]) => tags.includes(tag);
}

function oneOf<T>(list: T[], ...items: T[]): boolean {
  return list.some(i => items.includes(i));
}

function allOf<T>(list: T[], ...items: T[]): boolean {
  return items.every(i => list.includes(i));
}
