const Start = require('./lib/Start');
const Middleware = require('./lib/Middleware');

module.exports = {
  ...Start,
  ...Middleware
};