const express = require('express');
const fs = require('fs');
const path = require('path');

function StartEndpoint(port: number, onListeningCallback: () => void) {
  const app = express();

  app.use(express.json());


  function registerRoute(routeModule: any, routePrefix: string) {
    const { Get, Post, Put, Delete, Patch, Head, Options } = routeModule;
    const formattedPrefix = routePrefix.startsWith('/') ? routePrefix : `/${routePrefix}`;

    if(Get){
      switch(typeof(Get)){
        case "function":
          app.get(formattedPrefix, Get);
        default:
          console.warn("Get is not a function!");
      }
    }

    if(Post){
      switch(typeof(Post)){
        case "function":
          app.post(formattedPrefix, Post);
        default:
          console.warn("Post is not a function!");
      }
    }

    if(Put){
      switch(typeof(Put)){
        case "function":
          app.put(formattedPrefix, Post);
        default:
          console.warn("Put is not a function!");
      }
    }

    if(Delete){
      switch(typeof(Delete)){
        case "function":
          app.delete(formattedPrefix, Delete);
        default:
          console.warn("Delete is not a function!");
      }
    }

    if(Patch){
      switch(typeof(Patch)){
        case "function":
          app.patch(formattedPrefix, Delete);
        default:
          console.warn("Patch is not a function!");
      }
    }

    if(Head){
      switch(typeof(Head)){
        case "function":
          app.head(formattedPrefix, Delete);
        default:
          console.warn("Patch is not a function!");
      }
    }

    if(Options){
      switch(typeof(Options)){
        case "function":
          app.options(formattedPrefix, Delete);
        default:
          console.warn("Patch is not a function!");
      }
    }
  
    // if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method)) {
    //   app[method as HttpMethod](formattedPrefix, handler);
    // } else {
    //   console.warn(`Invalid HTTP method: ${method} for route ${formattedPrefix}`);
    // }
  }

  const routesDir = path.join(process.cwd(), 'src');

  function exploreRoutes(currentDir: string, routePrefix: string) {
    const folderList = fs.readdirSync(currentDir);

    for (const folder of folderList) {
      const folderPath = path.join(currentDir, folder);

      if (fs.lstatSync(folderPath).isDirectory()) {
        const codeMod = path.join(folderPath, 'code.js');

        try {
          const routeModule = require(codeMod);
          registerRoute(routeModule, routePrefix + folder);
        } catch (error) {
          console.warn(`Could not load route module at ${codeMod}:`, error);
        }

        exploreRoutes(folderPath, `${routePrefix}${folder}/`);
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

export { StartEndpoint };