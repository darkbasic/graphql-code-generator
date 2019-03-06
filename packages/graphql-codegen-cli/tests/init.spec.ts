jest.mock('fs');
import * as bddStdin from 'bdd-stdin';
import { resolve } from 'path';
import * as init from '../src/init';
import { parseConfigFile } from '../src/yml';
const { version } = require('../package.json');

// const SELECT = ' '; // checkbox
const ENTER = '\n';
// const DOWN = bddStdin.keys.down;

const packageJson = {
  withAngular: JSON.stringify({
    version,
    dependencies: {
      '@angular/core': 'x.x.x'
    }
  }),
  withTypescript: JSON.stringify({
    version,
    devDependencies: {
      typescript: 'x.x.x'
    }
  }),
  withReact: JSON.stringify({
    version,
    dependencies: {
      react: 'x.x.x'
    }
  })
};

describe('init', () => {
  afterEach(() => {
    require('fs').__resetMockFiles();
  });

  it('should guess angular project', async () => {
    require('fs').__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    const targets = await init.guessTargets();
    expect(targets.Angular).toEqual(true);
  });

  it('should guess typescript project', async () => {
    require('fs').__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withTypescript);
    const targets = await init.guessTargets();
    expect(targets.TypeScript).toEqual(true);
  });

  it('should guess react project', async () => {
    require('fs').__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withReact);
    const targets = await init.guessTargets();
    expect(targets.React).toEqual(true);
  });

  it('should show angular related plugins', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    const documents = 'graphql/*.ts';
    const script = 'generate:types';

    useInputs({
      onTarget: [ENTER], // confirm angular target
      onSchema: [ENTER], // use default
      onDocuments: [documents, ENTER],
      onPackages: [ENTER], // use selected packages
      onOutput: [ENTER], // use default output path
      onIntrospection: ['n', ENTER], // no introspection,
      onConfig: [ENTER], // use default config path
      onScript: [script, ENTER] // use custom npm script
    });

    await init.init();

    expect(writeFileSpy).toHaveBeenCalledTimes(2);

    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);

    // config
    // should overwrite
    expect(config.overwrite).toEqual(true);
    // should match default schema
    expect(config.schema).toEqual('https://localhost:4000');
    // should match documents glob that we provided
    expect(config.documents).toEqual(documents);
    // should use default output path
    expect(config.generates['src/generated/graphql.ts']).toBeDefined();

    const output: any = config.generates['src/generated/graphql.ts'];
    expect(output.plugins).toContainEqual('typescript');
    expect(output.plugins).toContainEqual('typescript-operations');
    expect(output.plugins).toContainEqual('typescript-apollo-angular');

    // script name should match what we provided
    expect(pkg.scripts[script]).toEqual('gql-gen --config codegen.yml');
    // expected plugins
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript');
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript-operations');
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript-apollo-angular');
    // should not have these plugins
    expect(pkg.devDependencies).not.toHaveProperty('graphql-codegen-typescript-resolvers');
  });

  it('should write plugins to the config file', async () => {});

  it('should write plugins to package.json', async () => {});

  it('should write script to package.json', async () => {});
});

function useInputs(inputs: {
  onTarget: string[];
  onSchema: string[];
  onDocuments?: string[];
  onPackages: string[];
  onOutput: string[];
  onIntrospection: string[];
  onConfig: string[];
  onScript: string[];
}) {
  bddStdin(
    [].concat(
      inputs.onTarget,
      inputs.onSchema,
      inputs.onDocuments || [],
      inputs.onPackages,
      inputs.onOutput,
      inputs.onIntrospection,
      inputs.onConfig,
      inputs.onScript
    )
  );
}
