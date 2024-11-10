const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

const cors = require('cors');

/**
 * Set a limits for your routes.
 * @param maxReq Maximum requests per time.
 * @param time Timee in seconds.
 * @param message Message if ratelimit is triggered.
 * @param route Route to rate limit.
*/
function Limiter(maxReq: number, time: number, message: string, route?: string) {
  const limiter = rateLimit({
    max: maxReq,
    windowMs: time,
    message: message
  })

  if (route) {
    app.use(route, limiter);
  } else {
    app.use(limiter);
  }
}

/**
 * Start the Server.
 * @param port Port to Host the Routes Server.
 * @param onListeningCallback Callback when server start.
 * @param useCors Use CORS.
 * @param corsOptions CORS options.
 */
function Start(port: number, onListeningCallback: () => void, useCors?: boolean, corsOptions?: object) {
  function registerRoute(routeModule: any, routePrefix: string) {
    const { Get, Post, Put, Delete, Patch, Head, Options } = routeModule;
    const formattedPrefix = routePrefix.startsWith('/') ? routePrefix : `/${routePrefix}`;

    if(useCors){
      app.use(cors(corsOptions));
    }

    if (Get) {
      switch (typeof (Get)) {
        case "function":
          app.get(formattedPrefix, Get);
        default:
          console.warn("Get is not a function!");
      }
    }

    if (Post) {
      switch (typeof (Post)) {
        case "function":
          app.post(formattedPrefix, Post);
        default:
          console.warn("Post is not a function!");
      }
    }

    if (Put) {
      switch (typeof (Put)) {
        case "function":
          app.put(formattedPrefix, Put);
        default:
          console.warn("Put is not a function!");
      }
    }

    if (Delete) {
      switch (typeof (Delete)) {
        case "function":
          app.delete(formattedPrefix, Delete);
        default:
          console.warn("Delete is not a function!");
      }
    }

    if (Patch) {
      switch (typeof (Patch)) {
        case "function":
          app.patch(formattedPrefix, Patch);
        default:
          console.warn("Patch is not a function!");
      }
    }

    if (Head) {
      switch (typeof (Head)) {
        case "function":
          app.head(formattedPrefix, Head);
        default:
          console.warn("Patch is not a function!");
      }
    }

    if (Options) {
      switch (typeof (Options)) {
        case "function":
          app.options(formattedPrefix, Options);
        default:
          console.warn("Patch is not a function!");
      }
    }
  }

  const routesDir = path.join(process.cwd(), 'src');


  function exploreRoutes(currentDir: string, routePrefix: string): void {
    const folderList = fs.readdirSync(currentDir);

    for (const folder of folderList) {
      const folderPath = path.join(currentDir, folder);

      if (fs.lstatSync(folderPath).isDirectory()) {
        const hasSubfolders = fs.readdirSync(folderPath).some((item: string) => {
          const itemPath = path.join(folderPath, item);
          return fs.lstatSync(itemPath).isDirectory();
        });

        if (hasSubfolders) {
          exploreRoutes(folderPath, `${routePrefix}${folder}/`);
        } else {
          const codeModJs = path.join(folderPath, 'code.js');
          const codeModTs = path.join(folderPath, 'code.ts');
          const codeMod = fs.existsSync(codeModJs) ? codeModJs : fs.existsSync(codeModTs) ? codeModTs : null;

          if (codeMod) {
            try {
              let routeModule;
              if (codeMod.endsWith('.ts')) {
                routeModule = require('ts-node').register({
                  transpileOnly: true,
                });
                routeModule = require(codeMod);
              } else {
                routeModule = require(codeMod);
              }
              registerRoute(routeModule, routePrefix + folder);
            } catch (error) {
              console.warn(`Could not load route module at ${codeMod}:`, error);
            }
          } else {
            console.warn(`Missing route module (code.js/code.ts) in directory: ${folderPath}`);
          }
        }
      }
    }
  }



  const middlewareFileTs = path.join(process.cwd(), 'middleware.ts');
  const middlewareFileJs = path.join(process.cwd(), 'middleware.js');

  try {
    if (fs.existsSync(middlewareFileTs)) {
      const middlewareModule = require(middlewareFileTs);
      app.use(middlewareModule);
    } else if (fs.existsSync(middlewareFileJs)) {
      const middlewareModule = require(middlewareFileJs);
      app.use(middlewareModule);
    }
  } catch (error) {
    console.warn(`Could not load middleware:`, error);
  }

  exploreRoutes(routesDir, '');

  app.listen(port, () => {
    onListeningCallback();
  });
}

export { Start, Limiter };