const nconf = require('nconf');
var Webtask = require('webtask-tools');

// This is the entry-point for the Webpack build. We need to convert our module
// (which is a simple Express server) into a Webtask-compatible function.
module.exports = Webtask.fromExpress((req, res) => {
  nconf
    .defaults({
      AUTH0_APIV2_TOKEN: req.webtaskContext.secrets.AUTH0_APIV2_TOKEN
    });

  // Start the server.
  const app = require('./index');
  return app(req, res);
});
