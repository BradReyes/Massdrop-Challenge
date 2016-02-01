var http = require('http');
var bodyParser = require("body-parser");
var express = require('express');
var app = express();
app.use(bodyParser.urlencoded({extended:true}));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/url_storage');

// This is passed in to the routes
// It will keep track of jobs that are still fetching data
var fetching = {};

// This is where all the routes and logic are
require('./index.js')(app, fetching);
var server = http.createServer(app);

server.listen(process.env.PORT || 3000);
console.log('Listening at 127.0.0.1:' + 3000);