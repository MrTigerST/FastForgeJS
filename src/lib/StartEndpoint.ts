import express from 'express';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

async function StartEndpoint(port: number, onListeningCallback: () => void) {
  const app = express();

  app.use(express.json());

  type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

  function registerRoute(routeModule: any, routePrefix: string) {
    if (routeModule && routeModule.default) {
      const { method, handler } = routeModule.default;

      if (method && handler) {
        if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method)) {
          app[method as HttpMethod](routePrefix, handler);
        } else {
          console.warn(`Invalid HTTP method: ${method} for route ${routePrefix}`);
        }
      }
    }
  }

  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const routesDir = path.join(__dirname, 'routes');

  async function exploreRoutes(currentDir: string, routePrefix: string) {
    const folderList = fs.readdirSync(currentDir);

    for (const folder of folderList) {
      const folderPath = path.join(currentDir, folder);

      if (fs.lstatSync(folderPath).isDirectory()) {
        const codeFileTs = path.join(folderPath, 'code.ts');
        const codeFileJs = path.join(folderPath, 'code.js');

        if (fs.existsSync(codeFileTs)) {
          const routeModule = await import(pathToFileURL(codeFileTs).href);
          registerRoute(routeModule, routePrefix + folder);
        } else if (fs.existsSync(codeFileJs)) {
          const routeModule = await import(pathToFileURL(codeFileJs).href);
          registerRoute(routeModule, routePrefix + folder);
        }

        await exploreRoutes(folderPath, `${routePrefix}${folder}/`);
      }
    }
  }

  const middlewareFileTs = path.join(__dirname, 'middleware.ts');
  const middlewareFileJs = path.join(__dirname, 'middleware.js');
  if (fs.existsSync(middlewareFileTs)) {
    const middlewareModule = await import(pathToFileURL(middlewareFileTs).href);
    app.use(middlewareModule);
  } else if (fs.existsSync(middlewareFileJs)) {
    const middlewareModule = await import(pathToFileURL(middlewareFileJs).href);
    app.use(middlewareModule);
  }

  await exploreRoutes(routesDir, '');

  app.listen(port, () => {
    onListeningCallback();
  });
}

export { StartEndpoint };