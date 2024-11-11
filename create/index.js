#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import ora from 'ora';

async function askserverName() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'serverName',
      message: 'Enter the name of your Server-side project:',
      default: 'my-new-server',
    },
  ]);
  return answers.serverName;
}

async function askserverDescription() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'serverDesc',
      message: 'Enter the description of your Server-side project:',
      default: '',
    },
  ]);
  return answers.serverDesc;
}

async function askInstallTypeScript() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installTS',
      message: 'Use TypeScript?',
      default: false,
    },
  ]);
  return answers.installTS;
}

async function createRouteFolder(routeName, serverName, installTS) {
  const projectRootDir = process.cwd();
  const routePath = path.join(projectRootDir, serverName + '/src', routeName);
  const codeFileName = `code.${installTS ? 'ts' : 'js'}`;

  if (!fs.existsSync(routePath)) {
    const spinner = ora(`Creating route: ${routeName}...`).start();

    fs.mkdirSync(routePath, { recursive: true });

    const codeFileContent = installTS
      ? `function Get(req: any, res: any): void {
  res.send("This is a GET request");
}

function PostMethod(req: any, res: any): void {
  res.send("This is a POST request!");
}

function PutMethod(req: any, res: any): void {
  res.send("This is a PUT request");
}

function DeleteMethod(req: any, res: any): void {
  res.send("This is a DELETE request");
}

function PatchMethod(req: any, res: any): void {
  res.send("This is a PATCH request");
}

function HeadMethod(req: any, res: any): void {
  res.send("This is a HEAD request");
}

function OptionsMethod(req: any, res: any): void {
  res.send("This is an OPTIONS request");
}
  
module.exports = {
  Get: GetMethod,
  Post: PostMethod,
  Put: PutMethod,
  Delete: DeleteMethod,
  Patch: PatchMethod,
  Head: HeadMethod,
  Options: OptionsMethod
};

`
      : `function GetMethod(req, res){
  res.send("This is a GET request");
}

function PostMethod(req, res){
  res.send("This is a POST request!");
}

function PutMethod(req, res){
  res.send("This is a PUT request");
}

function DeleteMethod(req, res){
  res.send("This is a DELETE request");
}

function PatchMethod(req, res){
  res.send("This is a PATCH request");
}

function HeadMethod(req, res){
  res.send("This is a HEAD request");
}

function OptionsMethod(req, res){
  res.send("This is an OPTIONS request");
}

module.exports = {
  Get: GetMethod,
  Post: PostMethod,
  Put: PutMethod,
  Delete: DeleteMethod,
  Patch: PatchMethod,
  Head: HeadMethod,
  Options: OptionsMethod
};`;

    fs.writeFileSync(path.join(routePath, codeFileName), codeFileContent);
    spinner.succeed(`Route ${routeName} created with ${codeFileName}.`);
  }
}

let serverName;

async function createserverProject() {
  serverName = await askserverName();
  const serverDescription = await askserverDescription();
  const installTS = await askInstallTypeScript();
  const projectDir = path.join(process.cwd(), serverName);

  const spinner = ora('Creating project structure...').start();

  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });

  const packageJson = {
    name: serverName,
    version: '1.0.0',
    description: serverDescription,
    main: installTS ? 'index.ts' : 'index.js',
    scripts: {
      start: installTS ? 'ts-node index.ts' : 'nodemon .',
    },
    dependencies: {
      express: '^4.18.1',
      cors: '^2.8.5',
      'testing-fastforgejs': 'latest',
    },
    devDependencies: {
      nodemon: '^2.0.20',
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
  }

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  const middleWareContent = installTS
    ? `const { Middleware } = require("testing-fastforgejs");

export function onRequest(route: string, req: any) {
    if(route === "/lockedroute") {
        return Middleware.lock(route, "This route is locked.");
    }
}`
    : `const { Middleware } = require("testing-fastforgejs");

function onRequest(route, req) {
    if(route === "/lockedroute") {
        return Middleware.lock(route, "This route is locked.");
    }
}

module.exports = onRequest;`;

  fs.writeFileSync(path.join(projectDir, 'src', `middleware.${installTS ? 'ts' : 'js'}`), middleWareContent);

  const indexMain = installTS
    ? `const { Start, Limiter } = require('testing-fastforgejs');

Limiter(5 /*max requests*/, 2*1000 /*time*/, "Rate Limit" /*message if rate limit is exceeded*/);
Limiter(5, 2*1000, "Rate Limit", "/specialRoute" /*can rate limit specific routes*/);

Start(3000, () => {
  console.log("Hello World! I am hosted in localhost on port 3000 (http://localhost:3000) ! You can change the port and various settings on the index file of this project!");
});`
    : `const { Start, Limiter } = require('testing-fastforgejs');

Limiter(5 /*max requests*/, 2*1000 /*time*/, "Rate Limit" /*message if rate limit is exceeded*/);
Limiter(5, 2*1000, "Rate Limit", "/specialRoute" /*can rate limit specific routes*/);

Start(3000, () => {
  console.log("Hello World! I am hosted in localhost on port 3000 (http://localhost:3000) ! You can change the port and various settings on the index file of this project!");
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
    await createRouteFolder('example', serverName, installTS);
    spinner.succeed(`server project ${serverName} created and dependencies installed!`);
  } catch (error) {
    spinner.fail('Error during server project setup.');
    console.error('Error:', error);
    throw error;
  }
}

async function setupWorkspace() {
  console.log('Setting up workspace for creating server scripts ...');

  try {
    await createserverProject();

    console.log("The framework has been successfully configured! To start your server, run the following commands:");
    console.log(`\n\ncd ${serverName}\nnpm run start`);
  } catch (error) {
    console.error('Error during setup:', error);
  }
}

setupWorkspace();