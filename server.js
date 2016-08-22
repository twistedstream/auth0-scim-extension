const dotenv = require('dotenv');
var App = require('./');

dotenv.config();

console.log('process.env:', process.env);

var port = process.env.PORT || 3000;

App.listen(port, function () {
    console.log('Server started on port', port);
})
