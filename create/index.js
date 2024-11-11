#! /usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import ora from 'ora';

async function askApiName() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiName',
      message: 'Enter the name of your API project:',
      default: 'my-new-api',
    },
  ]);
  return answers.apiName;
}

async function askApiDescription() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiDesc',
      message: 'Enter the description of your API project:',
      default: '',
    },
  ]);
  return answers.apiDesc;
}

async function askInstallTypeScript() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installTS',
      message: 'Use of TypeScript ?',
      default: false,
    },
  ]);
  return answers.installTS;
}

async function createRouteFolder(routeName, apiName) {
  const projectRootDir = process.cwd();
  const routePath = path.join(projectRootDir, apiName + '/src', routeName);

  if (!fs.existsSync(routePath)) {
    const spinner = ora(`Creating route: ${routeName}...`).start();

    fs.mkdirSync(routePath, { recursive: true });

    const codeFileContentJs = `function Get(req, res){
  res.send("This is a GET request");
}

function Post(req, res){
  res.send("This is a POST request!");
}

function Put(req, res){
  res.send("This is a PUT request");
}

function Delete(req, res){
  res.send("This is a DELETE request");
}

function Patch(req, res){
  res.send("This is a PATCH request");
}

function Head(req, res){
  res.send("This is a HEAD request");
}

function Options(req, res){
  res.send("This is a OPTIONS request");
}

module.exports = {
  Get: Get,
  Post: Post,
  Put: Put,
  Delete: Delete,
  Patch: Patch,
  Head: Head,
  Options: Options
};`;

    fs.writeFileSync(path.join(routePath, 'code.js'), codeFileContentJs);

    spinner.succeed(`Route ${routeName} created with code.js.`);
  }
}

let apiName;

async function createApiProject() {
  apiName = await askApiName();
  const apiDescription = await askApiDescription();
  const installTS = await askInstallTypeScript();
  const projectDir = path.join(process.cwd(), apiName);

  const spinner = ora('Creating project structure...').start();

  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });

  const packageJson = {
    name: apiName,
    version: '1.0.0',
    description: apiDescription,
    main: 'index.js',
    scripts: {
      start: 'nodemon .',
    },
    dependencies: {
      express: '^4.18.1',
      "cors": "^2.8.5",
      "testing-fastforgejs": "latest",
    },
    devDependencies: {
      express: '^4.17.13',
    },
    engines: {
      node: '>=14.0.0',
    },
  };

  if (installTS) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      typescript: '^4.8.4',
      'ts-node': '^10.4.0',
    };
    packageJson.scripts.start = 'ts-node index.ts';
  }

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  const middleWareJs = `const { Middleware } = require("testing-fastforgejs");

function onRequest(route, req) {
    if(route == "/lockedroute"){
        return Middleware.lock(route, "This route is locked.");
    }
}

module.exports = onRequest;`;

  fs.writeFileSync(path.join(projectDir, 'src', 'middleware.js'), middleWareJs);

  const indexMain = installTS
    ? `import { Start } from 'testing-fastforgejs';

Start(3000, () => {
  console.log("Hello World !");
});`
    : `const { Start } = require('testing-fastforgejs');

Start(3000, () => {
  console.log("Hello World !");
});`;

  fs.writeFileSync(path.join(projectDir, installTS ? 'index.ts' : 'index.js'), indexMain);

  if (installTS) {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
      },
      include: ['./src/**/*'],
      exclude: ['node_modules'],
    };

    fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
  }

  try {
    execSync('npm install', { cwd: projectDir, stdio: 'ignore' });
    await createRouteFolder('example', apiName);
    spinner.succeed(`API project ${apiName} created and dependencies installed!`);
  } catch (error) {
    spinner.fail('Error during API project setup.');
    console.error('Error:', error);
    throw error;
  }
}

async function setupWorkspace() {
  console.log('Setting up workspace for creating server scripts ...');

  try {
    await createApiProject();

    console.log("The framework has been successfully configured! To start your server, run the following commands:")
    console.log(`\n\ncd ${apiName}\nnpm run start`);
  } catch (error) {
    console.error('Error during setup:', error);
  }
}

setupWorkspace();