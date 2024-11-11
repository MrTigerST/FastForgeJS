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

let alreadyStarted = false;

function Start(port: number, onListeningCallback: () => void, useCors?: boolean, corsOptions?: object) {
  if (alreadyStarted) {
    console.warn("The server has already been started!");
    return;
  }

  alreadyStarted = true;
  const middlewarePathJs = path.join(process.cwd(), 'src', 'middleware.js');
  const middlewarePathTs = path.join(process.cwd(), 'src', 'middleware.ts');
  let middleware: any;

  if (fs.existsSync(middlewarePathTs)) {
    require('ts-node').register({ transpileOnly: true });
    middleware = require(middlewarePathTs);
  } else if (fs.existsSync(middlewarePathJs)) {
    middleware = require(middlewarePathJs);
  }

  function registerRoute(routeModule: any, routePrefix: string) {
    let { Get, Post, Put, Delete, Patch, Head, Options } = routeModule;
    let formattedPrefix = routePrefix.startsWith('/') ? routePrefix : `/${routePrefix}`;

    if (!formattedPrefix.endsWith('/')) {
      formattedPrefix += '/';
    }

    if (useCors) {
      app.use(cors(corsOptions));
    }

    if (Get) {
      const OldGet = Get;

      Get = (req: any, res: any) => {
        const resp = middleware(formattedPrefix, req);

        if (resp !== null && typeof (resp) === 'function') {
          resp(res, req);
          return;
        }

        OldGet(req, res);
      }

      switch (typeof (Get)) {
        case "function":
          app.get(formattedPrefix, Get);
          break;
        default:
          console.warn("Get is not a function!");
      }
    }

    if (Post) {
      const OldPost = Post;

      Post = (req: any, res: any) => {
        const resp = middleware(formattedPrefix, req);

        if (resp !== null && typeof (resp) === 'function') {
          resp(res, req);
          return;
        }

        OldPost(req, res);
      }
      switch (typeof (Post)) {
        case "function":
          app.post(formattedPrefix, Post);
          break;
        default:
          console.warn("Post is not a function!");
      }
    }

    if (Put) {
      const OldPut = Put;

      Put = (req: any, res: any) => {
        const resp = middleware(formattedPrefix, req);

        if (resp !== null && typeof (resp) === 'function') {
          resp(res, req);
          return;
        }

        OldPut(req, res);
      }
      switch (typeof (Put)) {
        case "function":
          app.put(formattedPrefix, Put);
          break;
        default:
          console.warn("Put is not a function!");
      }
    }

    if (Delete) {
      const OldDelete = Delete;

      Delete = (req: any, res: any) => {
        const resp = middleware(formattedPrefix, req);

        if (resp !== null && typeof (resp) === 'function') {
          resp(res, req);
          return;
        }

        OldDelete(req, res);
      }

      switch (typeof (Delete)) {
        case "function":
          app.delete(formattedPrefix, Delete);
          break;
        default:
          console.warn("Delete is not a function!");
      }
    }

    if (Patch) {
      const OldPatch = Patch;

      Patch = (req: any, res: any) => {
        const resp = middleware(formattedPrefix, req);

        if (resp !== null && typeof (resp) === 'function') {
          resp(res, req);
          return;
        }

        OldPatch(req, res);
      }

      switch (typeof (Patch)) {
        case "function":
          app.patch(formattedPrefix, Patch);
          break;
        default:
          console.warn("Patch is not a function!");
      }
    }

    if (Head) {
      const OldHead = Head;

      Head = (req: any, res: any) => {
        const resp = middleware(formattedPrefix, req);

        if (resp !== null && typeof (resp) === 'function') {
          resp(res, req);
          return;
        }

        OldHead(req, res);
      }

      switch (typeof (Head)) {
        case "function":
          app.head(formattedPrefix, Head);
          break;
        default:
          console.warn("Head is not a function!");
      }
    }

    if (Options) {
      const OldOptions = Options;

      Options = (req: any, res: any) => {
        const resp = middleware(formattedPrefix, req);

        if (resp !== null && typeof (resp) === 'function') {
          resp(res, req);
          return;
        }

        OldOptions(req, res);
      }
      
      switch (typeof (Options)) {
        case "function":
          app.options(formattedPrefix, Options);
          break;
        default:
          console.warn("Options is not a function!");
      }
    }
  }

  const routesDir = path.join(process.cwd(), 'src');


  function exploreRoutes(currentDir: string, routePrefix: string): void {
    const folderList = fs.readdirSync(currentDir);

    for (const item of folderList) {
      const itemPath = path.join(currentDir, item);
      const isDirectory = fs.lstatSync(itemPath).isDirectory();

      if (isDirectory) {
        exploreRoutes(itemPath, `${routePrefix}${item}/`);
      } else if (item === 'code.js' || item === 'code.ts') {
        try {
          let routeModule;

          if (item.endsWith('.ts')) {
            require('ts-node').register({ transpileOnly: true });
          }

          routeModule = require(itemPath);
          registerRoute(routeModule, routePrefix);
        } catch (error) {
          console.warn(`Could not load route code at ${itemPath}:`, error);
        }
      }
    }
  }

  exploreRoutes(routesDir, '');

  app.listen(port, () => {
    onListeningCallback();
  });
}

export { Start, Limiter };