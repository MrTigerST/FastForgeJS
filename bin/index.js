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
  return answers.apiName;
}


async function createRouteFolder(routeName, apiName) {
  const projectRootDir = process.cwd();
  const routePath = path.join(projectRootDir, apiName + '/src', routeName);

  if (!fs.existsSync(routePath)) {
    const spinner = ora(`Creating route: ${routeName}...`).start();

    fs.mkdirSync(routePath, { recursive: true });

    const codeFileContentJs = `const { createApi } = require('fastforgejs');

      createApi('get', (req, res) => {
        res.send('Response from ${routeName} route!');
      });
    `;

    fs.writeFileSync(path.join(routePath, 'code.js'), codeFileContentJs);

    spinner.succeed(`Route ${routeName} created with code.js.`);
  }
}

async function createApiProject() {
  const apiName = await askApiName();
  const apiDescription = await askApiDescription();
  const projectDir = path.join(process.cwd(), apiName);

  const spinner = ora('Creating project structure...').start();

  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });

  const packageJson = {
    name: apiName,
    version: '1.0.0',
    description: apiDescription,
    main: 'src/index.js',
    scripts: {
      start: 'node .',
    },
    dependencies: {
      express: '^4.18.1',
      fastforgejs: "latest"
    },
    devDependencies: {
      'express': '^4.17.13',
    },
    engines: {
      node: '>=14.0.0',
    },
  };

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  const middleWareJs = `const { Middleware } = require('fastforgejs');

Middleware.lockMiddleware('/yourRoute');`;

  fs.writeFileSync(path.join(projectDir, 'src', 'middleware.js'), middleWareJs);

  const indexMain = `const { StartEndpoint } = require('fastforgejs');

StartEndpoint(3000, () => {
  console.log("Hello World !");
});`;

  fs.writeFileSync(path.join(projectDir, 'index.js'), indexMain);

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

    console.log(`Project setup complete! Change Directory to your project and run "npm run start" to start your API.`);
  } catch (error) {
    console.error('Error during setup:', error);
  }
}

setupWorkspace();