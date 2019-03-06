jest.mock('fs');
import * as bddStdin from 'bdd-stdin';
import { resolve } from 'path';
import chalk from 'chalk';
import * as init from '../src/init';
import { parseConfigFile } from '../src/yml';
const { version } = require('../package.json');

const SELECT = ' '; // checkbox
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
  beforeEach(() => {
    // make sure we don't get noisy terminal
    jest.spyOn(process.stdout, 'write').mockImplementation();
  });

  afterEach(() => {
    require('fs').__resetMockFiles();
    jest.clearAllMocks();
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

  it('should use angular related plugins when @angular/core is found', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    // silent
    jest.spyOn(console, 'log').mockImplementation();

    useInputs({
      onTarget: [ENTER], // confirm angular target
      onSchema: [ENTER], // use default
      onDocuments: [ENTER],
      onPlugins: [ENTER], // use selected packages
      onOutput: [ENTER], // use default output path
      onIntrospection: ['n', ENTER], // no introspection,
      onConfig: [ENTER], // use default config path
      onScript: ['graphql', ENTER] // use custom npm script
    });

    await init.init();

    expect(writeFileSpy).toHaveBeenCalledTimes(2);

    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);

    // should use default output path
    expect(config.generates['src/generated/graphql.ts']).toBeDefined();

    const output: any = config.generates['src/generated/graphql.ts'];
    expect(output.plugins).toContainEqual('typescript');
    expect(output.plugins).toContainEqual('typescript-operations');
    expect(output.plugins).toContainEqual('typescript-apollo-angular');
    expect(output.plugins).toHaveLength(3);

    // expected plugins
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript');
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript-operations');
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript-apollo-angular');
    // should not have other plugins
    expect(Object.keys(pkg.devDependencies)).toHaveLength(3);
  });

  it('should use react related plugins when react is found', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withReact);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    // silent
    jest.spyOn(console, 'log').mockImplementation();

    useInputs({
      onTarget: [ENTER], // confirm react target
      onSchema: [ENTER], // use default
      onDocuments: [ENTER],
      onPlugins: [ENTER], // use selected packages
      onOutput: [ENTER], // use default output path
      onIntrospection: ['n', ENTER], // no introspection,
      onConfig: [ENTER], // use default config path
      onScript: ['graphql', ENTER] // use custom npm script
    });

    await init.init();

    expect(writeFileSpy).toHaveBeenCalledTimes(2);

    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);

    // should use default output path
    expect(config.generates['src/generated/graphql.ts']).toBeDefined();

    const output: any = config.generates['src/generated/graphql.ts'];
    expect(output.plugins).toContainEqual('typescript');
    expect(output.plugins).toContainEqual('typescript-operations');
    expect(output.plugins).toContainEqual('typescript-react-apollo');
    expect(output.plugins).toHaveLength(3);

    // expected plugins
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript');
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript-operations');
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript-react-apollo');
    // should not have other plugins
    expect(Object.keys(pkg.devDependencies)).toHaveLength(3);
  });

  it('should use typescript related plugins when typescript is found (node)', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withTypescript);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    // silent
    jest.spyOn(console, 'log').mockImplementation();

    useInputs({
      onTarget: [SELECT, ENTER], // confirm api target
      onSchema: [ENTER], // use default
      onPlugins: [ENTER], // use selected packages
      onOutput: [ENTER], // use default output path
      onIntrospection: ['n', ENTER], // no introspection,
      onConfig: [ENTER], // use default config path
      onScript: ['graphql', ENTER] // use custom npm script
    });

    await init.init();

    expect(writeFileSpy).toHaveBeenCalledTimes(2);

    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);

    // should use default output path
    expect(config.generates['src/generated/graphql.ts']).toBeDefined();

    const output: any = config.generates['src/generated/graphql.ts'];
    expect(output.plugins).toContainEqual('typescript');
    expect(output.plugins).toContainEqual('typescript-resolvers');
    expect(output.plugins).toHaveLength(2);

    // expected plugins
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript');
    expect(pkg.devDependencies).toHaveProperty('graphql-codegen-typescript-resolvers');
    // should not have other plugins
    expect(Object.keys(pkg.devDependencies)).toHaveLength(3); // 3 - because we have typescript package in devDeps
  });

  it('should have few default values', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const defaults = {
      schema: 'http://localhost:4000',
      documents: '**/*.graphql',
      output: 'src/generated/graphql.ts',
      config: 'codegen.yml'
    };

    useInputs({
      onTarget: [ENTER], // confirm angular target
      onSchema: [ENTER], // use default
      onDocuments: [ENTER],
      onPlugins: [ENTER], // use selected packages
      onOutput: [ENTER], // use default output path
      onIntrospection: ['n', ENTER], // no introspection,
      onConfig: [ENTER], // use default config path
      onScript: ['graphql', ENTER] // use custom npm script
    });

    await init.init();

    const configFile = writeFileSpy.mock.calls[0][0] as string;
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);
    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);

    expect(pkg.scripts['graphql']).toEqual(`gql-gen --config ${defaults.config}`);
    expect(configFile).toEqual(resolve(process.cwd(), defaults.config));
    expect(config.overwrite).toEqual(true);
    expect(config.schema).toEqual(defaults.schema);
    expect(config.documents).toEqual(defaults.documents);
    expect(config.generates[defaults.output]).toBeDefined();
    expect(logSpy.mock.calls[1][0]).toContain(`Config file generated at ${chalk.bold(defaults.config)}`);
  });

  it('should have few default values', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const options = {
      script: 'graphql',
      schema: './schema.ts',
      documents: 'graphql/**/*.graphql',
      output: 'graphql/index.ts',
      config: 'app-codegen.yml'
    };

    useInputs({
      onTarget: [ENTER], // confirm angular target
      onSchema: [options.schema, ENTER], // use default
      onDocuments: [options.documents, ENTER],
      onPlugins: [ENTER], // use selected packages
      onOutput: [options.output, ENTER], // use default output path
      onIntrospection: ['n', ENTER], // no introspection,
      onConfig: [options.config, ENTER], // use default config path
      onScript: [options.script, ENTER] // use custom npm script
    });

    await init.init();

    const configFile = writeFileSpy.mock.calls[0][0] as string;
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);
    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);

    expect(pkg.scripts[options.script]).toEqual(`gql-gen --config ${options.config}`);
    expect(configFile).toEqual(resolve(process.cwd(), options.config));
    expect(config.overwrite).toEqual(true);
    expect(config.schema).toEqual(options.schema);
    expect(config.documents).toEqual(options.documents);
    expect(config.generates[options.output]).toBeDefined();
    expect(logSpy.mock.calls[1][0]).toContain(`Config file generated at ${chalk.bold(options.config)}`);
  });

  it('custom setup', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const documents = 'graphql/*.ts';
    const script = 'generate:types';

    useInputs({
      onTarget: [ENTER], // confirm angular target
      onSchema: [ENTER], // use default
      onDocuments: [documents, ENTER],
      onPlugins: [ENTER], // use selected packages
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
    expect(config.schema).toEqual('http://localhost:4000');
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

    // logs
    const welcomeMsg = logSpy.mock.calls[0][0];
    const doneMsg = logSpy.mock.calls[1][0];

    expect(welcomeMsg).toContain(`Welcome to ${chalk.bold('GraphQL Code Generator')}`);
    expect(doneMsg).toContain(`Config file generated at ${chalk.bold('codegen.yml')}`);
    expect(doneMsg).toContain(chalk.bold('$ npm install'));
    expect(doneMsg).toContain(chalk.bold(`$ npm run ${script}`));
  });

  describe('plugin choices', () => {
    function getAvailable(tags: init.Tags[]): string[] {
      return init
        .getPluginChoices({
          targets: tags
        } as any)
        .map((c: any) => c.value.value);
    }

    function getSelected(tags: init.Tags[]): string[] {
      return init
        .getPluginChoices({
          targets: tags
        } as any)
        .filter((c: any) => c.checked)
        .map((c: any) => c.value.value);
    }

    function getPlugins(targets: init.Tags[]) {
      const tags: init.Tags[] = init
        .getApplicationTypeChoices({
          [init.Tags.angular]: targets.includes(init.Tags.angular),
          [init.Tags.react]: targets.includes(init.Tags.react),
          [init.Tags.browser]: targets.includes(init.Tags.browser),
          [init.Tags.node]: targets.includes(init.Tags.node),
          [init.Tags.typescript]: targets.includes(init.Tags.typescript)
        })
        .filter(c => c.checked)
        .reduce((all, choice) => all.concat(choice.value), []);

      return {
        available: getAvailable(tags),
        selected: getSelected(tags)
      };
    }

    it('node', () => {
      const { available, selected } = getPlugins([init.Tags.node]);

      // available
      expect(available).toHaveLength(3);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-resolvers');
      expect(available).toContainEqual('typescript-mongodb');
      // selected
      expect(selected).toHaveLength(2);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-resolvers');
    });

    it('node + typescript', () => {
      const { selected, available } = getPlugins([init.Tags.node, init.Tags.typescript]);

      // available
      expect(available).toHaveLength(3);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-resolvers');
      expect(available).toContainEqual('typescript-mongodb');
      // selected
      expect(selected).toHaveLength(2);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-resolvers');
    });

    it('angular', () => {
      const { selected, available } = getPlugins([init.Tags.angular]);

      // available
      expect(available).toHaveLength(5);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-operations');
      expect(available).toContainEqual('typescript-apollo-angular');
      expect(available).toContainEqual('typescript-graphql-files-modules');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(3);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-operations');
      expect(selected).toContainEqual('typescript-apollo-angular');
    });

    it('react', () => {
      const { selected, available } = getPlugins([init.Tags.react]);

      // available
      expect(available).toHaveLength(5);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-operations');
      expect(available).toContainEqual('typescript-react-apollo');
      expect(available).toContainEqual('typescript-graphql-files-modules');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(3);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-operations');
      expect(selected).toContainEqual('typescript-react-apollo');
    });

    it('react + typescript', () => {
      const { selected, available } = getPlugins([init.Tags.react, init.Tags.typescript]);

      // available
      expect(available).toHaveLength(5);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-operations');
      expect(available).toContainEqual('typescript-react-apollo');
      expect(available).toContainEqual('typescript-graphql-files-modules');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(3);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-operations');
      expect(selected).toContainEqual('typescript-react-apollo');
    });

    it('vanilla', () => {
      const { selected, available } = getPlugins([init.Tags.browser]);

      // available
      expect(available).toHaveLength(4);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-operations');
      expect(available).toContainEqual('typescript-graphql-files-modules');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(2);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-operations');
    });
  });
});

function useInputs(inputs: {
  onTarget: string[];
  onSchema: string[];
  onDocuments?: string[];
  onPlugins: string[];
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
      inputs.onPlugins,
      inputs.onOutput,
      inputs.onIntrospection,
      inputs.onConfig,
      inputs.onScript
    )
  );
}
