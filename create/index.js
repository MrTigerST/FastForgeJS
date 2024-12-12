#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import inquirer from 'inquirer';
import ora from 'ora';
import util from 'util';


const execAsync = util.promisify(exec);

async function askServerName() {
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

async function askServerDescription() {
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

async function askInstallMySQL() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installMySQL',
      message: 'Install MySQL support?',
      default: false,
    },
  ]);
  return answers.installMySQL;
}

async function askDatabaseDetails() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'customDBConfig',
      message: 'Do you want to enter custom database configuration?',
      default: false,
    },
    {
      type: 'input',
      name: 'DB_HOST',
      message: 'Database Host:',
      default: 'localhost',
      when: (answers) => answers.customDBConfig,
    },
    {
      type: 'input',
      name: 'DB_USER',
      message: 'Database User:',
      default: 'root',
      when: (answers) => answers.customDBConfig,
    },
    {
      type: 'password',
      name: 'DB_PASSWORD',
      message: 'Database Password:',
      default: '',
      when: (answers) => answers.customDBConfig,
    },
    {
      type: 'input',
      name: 'DB_DATABASE',
      message: 'Database Name:',
      default: 'my_database',
      when: (answers) => answers.customDBConfig,
    },
    {
      type: 'input',
      name: 'DB_PORT',
      message: 'Database Port:',
      default: '3306',
      when: (answers) => answers.customDBConfig,
    },
  ]);

  return {
    DB_HOST: answers.DB_HOST || 'localhost',
    DB_USER: answers.DB_USER || 'root',
    DB_PASSWORD: answers.DB_PASSWORD || '',
    DB_DATABASE: answers.DB_DATABASE || 'my_database',
    DB_PORT: answers.DB_PORT || '3306',
  };
}

async function createDatabaseConfig(serverName, installMySQL, dbConfig, installTS) {
  let dbConfigContent = `
DB_HOST=${dbConfig.DB_HOST}
DB_USER=${dbConfig.DB_USER}
DB_PASSWORD=${dbConfig.DB_PASSWORD}
DB_DATABASE=${dbConfig.DB_DATABASE}
DB_PORT=${dbConfig.DB_PORT}
`;

  fs.writeFileSync(path.join(serverName, '.env'), dbConfigContent);

  if (installMySQL) {
    const dbFileContent = installTS ? `const mysqlLib = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

const dbConfig: DbConfig = {
  host: process.env.DB_HOST || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
};

const connection = mysqlLib.createConnection(dbConfig);

connection.connect((err: Error) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
});

module.exports = connection;` : `const mysqlLib = require('mysql2');
require('dotenv').config();

const connection = mysqlLib.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
});

module.exports = connection;`;

    fs.writeFileSync(path.join(serverName, 'src', installTS ? 'db.ts' : 'db.js'), dbFileContent);
  }
}


async function askInstallEnvBridge() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installEnvBridge',
      message: 'Setup EnvBridge JSON (https://github.com/MrTigerST/envbridge) ?',
      default: false,
    },
  ]);
  return answers.installEnvBridge;
}


async function installDependencies(projectDir, installMySQL, installTs) {
  const dependencies = ['express', 'cors', 'fastforge@latest', 'dotenv'];
  const devDependencies = ['nodemon'];

  if (installTs) {
    dependencies.push('ts-node');
    devDependencies.push('@types/node');
  }

  if (installMySQL) {
    dependencies.push('mysql2');
  }

  const spinner = ora('Installing dependencies...').start();
  execAsync(`npm install ${dependencies.join(' ')}`, { cwd: projectDir, stdio: 'ignore' });
  execAsync(`npm install -D ${devDependencies.join(' ')}`, { cwd: projectDir, stdio: 'ignore' });
  spinner.succeed('Dependencies installed!');
}

async function createRouteFolder(routeName, serverName, installTS, installMySQL) {
  const projectRootDir = process.cwd();
  const routePath = path.join(projectRootDir, serverName + '/src', routeName);
  const codeFileName = `code.${installTS ? 'ts' : 'js'}`;

  if (!fs.existsSync(routePath)) {
    const spinner = ora(`Creating route: ${routeName}...`).start();

    fs.mkdirSync(routePath, { recursive: true });
    //MySqlDir
    const codeFileContent = installTS
      ? `${installMySQL ? 'const { MySqlDir } = require("fastforge");\nconst mysqlConn = require(MySqlDir());\n\n' : ''}function GetMethod(req: any, res: any): void {
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

function AllMethod(req: any, res: any): void {
  res.send("This route accepts all HTTP methods");
}
  
module.exports = {
  Get: GetMethod,
  Post: PostMethod,
  Put: PutMethod,
  Delete: DeleteMethod,
  Patch: PatchMethod,
  Head: HeadMethod,
  Options: OptionsMethod,
  All: AllMethod
};

`
      : `${installMySQL ? 'const { MySqlDir } = require("fastforge");\nconst mysqlConn = require(MySqlDir());\n\n' : ''}function GetMethod(req, res){
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

function AllMethod(req, res){
  res.send("This route accepts all HTTP methods");
}

module.exports = {
  Get: GetMethod,
  Post: PostMethod,
  Put: PutMethod,
  Delete: DeleteMethod,
  Patch: PatchMethod,
  Head: HeadMethod,
  Options: OptionsMethod,
  All: AllMethod
};`;

    fs.writeFileSync(path.join(routePath, codeFileName), codeFileContent);



    spinner.succeed(`Route ${routeName} created with ${codeFileName}.`);
  }
}

let serverName;

async function createServerProject() {
  serverName = await askServerName();
  const serverDescription = await askServerDescription();
  const installTS = await askInstallTypeScript();
  const installMySQL = await askInstallMySQL();

  let databaseDetails;
  if (installMySQL) {
    databaseDetails = await askDatabaseDetails();
  }

  const installEnvBridge = await askInstallEnvBridge();

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
      start: installTS ? 'nodemon index.ts' : 'nodemon .',
    },
  };

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  const middleWareContent = installTS
    ? `const { Middleware } = require("fastforge");

function onRequest(route: string, req: any) {
    if(route === "/lockedroute") {
        return Middleware.Lock(route, "This route is locked.");
    }
}
module.exports = onRequest;`
    : `const { Middleware } = require("fastforge");

function onRequest(route, req) {
    if(route === "/lockedroute") {
        return Middleware.Lock(route, "This route is locked.");
    }
}

module.exports = onRequest;`;

  fs.writeFileSync(path.join(projectDir, 'src', `middleware.${installTS ? 'ts' : 'js'}`), middleWareContent);

  if (installMySQL) {
    await createDatabaseConfig(serverName, installMySQL, databaseDetails, installTS);
  }

  if (installEnvBridge) {
    const envBridgeConfig = {
      dataenv: [
        {
          name: "TOKEN",
          description: "Lorem ipsum dolor sit amet",
          defaultValue: 'A simple Default Value.',
        },
        {
          name: "TOKEN2",
          description: "Lorem ipsum dolor sit amet 2",
          defaultValue: '',
        }
      ]
    }

    const envBridgeFilePath = path.join(projectDir, 'envinfo.json');
    fs.writeFileSync(envBridgeFilePath, JSON.stringify(envBridgeConfig, null, 4), 'utf8');
  }

  const indexMain = installTS
    ? `const { Start, Limiter } = require('fastforge');

Limiter(5 /*max requests*/, 2*1000 /*time*/, "Rate Limit" /*message if rate limit is exceeded*/);
Limiter(5, 2*1000, "Rate Limit", "/specialRoute" /*can rate limit specific routes*/);

Start(3000, () => {
  console.log("I am hosted in localhost on port 3000 (http://localhost:3000 or https://localhost:3000 if you are set server for HTTPS) ! You can change the port and various settings on the index file of this project!");
});`
    : `const { Start, Limiter } = require('fastforge');

Limiter(5 /*max requests*/, 2*1000 /*time*/, "Rate Limit" /*message if rate limit is exceeded*/);
Limiter(5, 2*1000, "Rate Limit", "/specialRoute" /*can rate limit specific routes*/);

Start(3000, () => {
  console.log("I am hosted in localhost on port 3000 (http://localhost:3000 or https://localhost:3000 if you are set server for HTTPS) ! You can change the port and various settings on the index file of this project!");
});`;


  fs.writeFileSync(path.join(projectDir, installTS ? 'index.ts' : 'index.js'), indexMain);


  const gitIgnoreFile = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# vuepress v2.x temp and cache directory
.temp
.cache

# Docusaurus cache and generated files
.docusaurus

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*`;

  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitIgnoreFile);

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

  await installDependencies(projectDir, installMySQL, installTS);
  await createRouteFolder('example', serverName, installTS, installMySQL);

  const projectRootDir = process.cwd();
  const routePath = path.join(projectRootDir, serverName + '/src');
  const codeFileName = `code.${installTS ? 'ts' : 'js'}`;

  if (!fs.existsSync(routePath)) {
    fs.mkdirSync(routePath);
  }

  const codeFileContent = installTS
    ? `${installMySQL ? 'const { MySqlDir } = require("fastforge");\nconst mysqlConn = require(MySqlDir());\n\n' : ''}function GetMethod(req: any, res: any): void {
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

function AllMethod(req: any, res: any): void {
res.send("This route accepts all HTTP methods");
}

module.exports = {
Get: GetMethod,
Post: PostMethod,
Put: PutMethod,
Delete: DeleteMethod,
Patch: PatchMethod,
Head: HeadMethod,
Options: OptionsMethod,
All: AllMethod
};

`
    : `${installMySQL ? 'const { MySqlDir } = require("fastforge");\nconst mysqlConn = require(MySqlDir());\n\n' : ''}function GetMethod(req, res){
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

function AllMethod(req, res){
res.send("This route accepts all HTTP methods");
}

module.exports = {
Get: GetMethod,
Post: PostMethod,
Put: PutMethod,
Delete: DeleteMethod,
Patch: PatchMethod,
Head: HeadMethod,
Options: OptionsMethod,
All: AllMethod
};`;

  fs.writeFileSync(path.join(routePath, codeFileName), codeFileContent);

  await createRouteFolder('', serverName, installTS, installMySQL);

  spinner.succeed(`Server project ${serverName} created!`);
}

async function setupWorkspace() {
  console.log('Setting up workspace for creating server scripts ...');

  try {
    await createServerProject();

    console.log("The framework has been successfully configured! To start your server, run the following commands:");
    console.log(`\n\ncd ${serverName}\nnpm run start`);
  } catch (error) {
    console.error('Error during setup:', error);
  }
}

setupWorkspace();