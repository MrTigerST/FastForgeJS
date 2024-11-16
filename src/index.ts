"use strict";

const Start = require("./lib/Start");
const Limiter = require("./lib/Start");
const Use = require("./lib/Start");
const Middleware = require("./lib/Middleware");

const FastForgeJS = {
  ...Start,
  ...Limiter,
  ...Use,
  ...Middleware
};

module.exports = FastForgeJS;