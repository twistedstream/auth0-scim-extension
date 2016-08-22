var express  = require('express');
var app      = express();
var template = require('./views/index.jade');
var ManagementClient    = require('auth0').ManagementClient;
var auth0ToScim = require('./mappers/auth0UserToSCIMUser');

var management = new ManagementClient({
  token: process.env.AUTH0_APIV2_TOKEN,
  domain: 'auth0-scim-demo.auth0.com'
});

app.get('/users', function (req, res) {
  management.users.getAll()
    .then(users => {

console.log(users);

      res.json(users.map(auth0ToScim.map));
    })
    .catch(error => {
      res.json(error);
    });
});

app.get('/', function (req, res) {
  res.header("Content-Type", 'text/html');
  res.status(200).send(template());
});

module.exports = app;
