const StartEndpoint = require('./lib/StartEndpoint');
const Middleware = require('./lib/Middleware');

module.exports = {
  ...StartEndpoint,
  ...Middleware
};