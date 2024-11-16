![FastForgeJS](https://i.ibb.co/Lhz9C92/fastforgejs-white.png)
![FastForgeJSBlack](https://i.ibb.co/862X7wg/fastforgejs-black.png)

### FastForgeJS is a Framework that makes easy the process to create a server and API in a quick and organized way.
## How to install

To install FastForgeJS :

```bash
npx fastforge
```
## How to use it

To create a Route, you just need to create a folder in the src directory with the name of the Route, and inside it create a file called code.js or code.ts in case you want to develop in TypeScript (remember that if you created the project in JavaScript and you want to convert it to TypeScript, you should install ts-node and run the project with this module).
Inside the src you will find the Middleware and also the file db.js/db.ts, in case you chose to install the support for MySQL.
## Middleware

The Middleware is an intermediary between the client request and the server request, and our system provides 2 methods for managing the Middleware:


**Locks the specified Route for the client.**
```ts
return Middleware.Lock(route: string, msg: string)
```

**Redirects the request to a new URL.**
```ts
return Middleware.Redirect(url: string)
```
## Start File

In the Workspace, you will find a file called **index.js / index.ts** , which will contain the function to start your server, called Start, which will have the following constructs based on the type of server you want to start:

## Start Function intestation:
Start the Server.

* **port:** Port to Host the Routes Server.
* **onListeningCallback:** Callback when server start.
* **corsOptions:** CORS options (optional).
* **httpsOptions:** HTTPS Options (optional).

```ts
Start(port: number, onListeningCallback: () => void, corsOptions?: object, httpsOptions?: { key: string; cert: string; passphrase?: string; }
```
### Example of HTTP Server for Start Function
```ts
Start(3000, () => {
  console.log("I am hosted in localhost on port 3000 (http://localhost:3000) ! You can change the port and various settings on the index file of this project!");
});
```
### Example of HTTPS Server for Start Function
```ts
Start(3000, () => {
  console.log("I am hosted in localhost on port 3000 (http://localhost:3000) ! You can change the port and various settings on the index file of this project!");
}, null, { key: "your dir for file .key", cert: "your dir for file .cert" });
```

#
Now let's describe other functions available for the Start File : 

## Limiter Function intestation
Equivalent of 'use' function on Express.

* **maxReq:** Maximum requests per time.
* **time:** Timee in seconds.
* **message:** Message if ratelimit is triggered.
* **route:** Route to rate limit.

```ts
Limiter(maxReq: number, time: number, message: string, route?: string)
```
### Example of Limiter for all Routes
```ts
Limiter(5, 2*1000, "Rate Limit for all Routes.");
```
### Example of Limiter for specific route
```ts
Limiter(5, 2*1000, "Rate Limit", "/specificRoute");
```

## Use Function intestation
Equivalent of 'use' function on Express.

 * **content:** Content to use.
 * **route:** Route where the content is used on the express app (optional).

```ts
Use(content: any, route?: string)
```

## Set Function intestation
Equivalent of 'set' function on Express.

* **setting:** Setting to change
* **val:** Value to write on the setting

```ts
Set(setting: string, val: any)
```
# Include MySQL

To make queries on mysql, you must first include its connection, which is contained in the **db.js / db.ts file**. Use this code snippet to include it:

```js
const { MySqlDir } = require("fastforge");
const mysqlConn = require(MySqlDir());
```
# Structure of code.js / code.ts File

The code file represents the code of your Route, and you can provide the response to different methods, such as GET, POST, PUT etc...

On FastForgeJS, the management of these methods is done in the following way:

**Note: the `req` and `res` parameters are the same as in [Express](https://expressjs.com/en/api.html).**
**JavaScript**
```js
function GetMethod(req, res){
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
};
```


**TypeScript**
```ts
function GetMethod(req: any, res: any): void {
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
```


## Authors

- [@MrTigerST](https://www.github.com/mrtigerst)

- [@ThatsDipo](https://github.com/ThatsDipo)

Anyone can contribute to the project by making a Pull Request!


