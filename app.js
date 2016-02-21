var http = require('http');
var bodyParser = require("body-parser");
var express = require('express');
var app = express();
app.use(bodyParser.urlencoded({extended:true}));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/url_storage');

// This is where all the routes and logic are
// If this app had more routes that were different than fetch,
// then they would all link here
require('./fetch.js')(app);
var server = http.createServer(app);

server.listen(process.env.PORT || 3000);
console.log('Listening at 127.0.0.1:' + 3000);