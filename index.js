var express  = require('express');
var app      = express();
var template = require('./views/index.jade');

app.get('/', function (req, res) {
  res.header("Content-Type", 'text/html');
  res.status(200).send(template());
});

module.exports = app;
