var DB = require('./post.js');
var url = require('url');
var req = require('request');

// Status Codes
var STATUS_OK = 200;
var SERVER_ERROR = 500;
var NOT_FOUND = 404;
var BAD_REQUEST = 400;

// The object 'fetching' is passed in. It's purpose is to
// tell which jobs are still being fetched.
module.exports = function(app, fetching) {

  /*** Helper functions ***/
  // Stores a new object into the MongoDB
  var store_url = function(id, contents) {
    var newURL = new DB({
      job_id: id,
      html: contents
    });
    newURL.save(function(error) {
      delete fetching[id];
      if (error) {
        console.log({
          "job_id": id,
          "Error": error
        });
      }
    });
  }

  // Makes a request to get the url that the user gave
  var get_url_information = function(url, id) {
    req(url, function(error, status, body) {
      if (error != null || status.statusCode != STATUS_OK) { //didn't work
        console.log({
          "URL Error":"Couldn't get correct response from given url"
        });
      delete fetching[id];
      } else store_url(id, body);
    });
  }

  // For database errors
  var db_error = function(response, error) {
    response.status(SERVER_ERROR).json({
      "Database Error": error
    });
  }

  // Given the id, returns the contents of a url the user gave
  var return_job_information = function(response, id) {
    DB.find({'job_id': id}, function(error, sites) {
      if(error) { //first check if db failed
        db_error(response, error);
      } else if (sites.length == 0) { //id doesn't exist in database
        response.status(NOT_FOUND).json({
          "Message":"ID doesn't exist. Either you enetered your ID incorrectly or there was a server or database error."
        });
      } else { //return JSON object containing contents of URL
        response.json(STATUS_OK, {
          "job_id": sites[0].job_id,
          "contents": sites[0].html
        });
      }
    });
  }
  /*** END Helper Functions ***/


  /*** Routes ***/
  // Test for response
  app.get('/', function(request, response) {
    response.status(STATUS_OK).json({"Hello":"World"});
  });

  // Creates a job id and queues the job up to store in the DB
  app.post('/create', function(request, response) {
    var url = request.body.url;
    if (url == undefined || url == null) {
      response.status(BAD_REQUEST).json({"Error": "JSON passed in is non-existent or incorrect"});
    }
    var id = require('crypto').createHash('md5').update(url).digest('hex');

    if (fetching[id]) { //already fetching
      response.status(STATUS_OK).json({
        "job_id": id,
        "message":"Currently fetching for other request"
      });
      return; //no need to make another request
    };

    // put in new job to fetch
    fetching[id] = true;

    //check if it exists already.
    //This will will asynchronously after the user is given a job id
    //If it already exists, the user will just be able to access it faster
    DB.find({'job_id': id}, function(error, sites) {
      if (error) { //check database
        delete fetching[id];
        db_error(response, error);
      //Here we check if the job already is stored
      } else if (sites.length == 0) { //doesn't exist yet
        get_url_information(url, id); //need to make a request
        response.status(STATUS_OK).json({
          "job_id": id,
          "message": "Check status to get results in a little bit."
        });
      } else { //site already in db, return to user
        delete fetching[id];
        response.status(STATUS_OK).json({
          "Message": "No need to queue, it's already in the database!",
          "job_id": sites[0].job_id,
          "contents": sites[0].html
        });
      }
    });
  });

  // Check status of jobs and return if ready
  app.get('/status/:id', function(request, response) {
    var id = request.param('id');
    if (fetching[id]) { //still fetching
      response.status(STATUS_OK).json({
        "Message":"Still fetching job"
      });
    } else { //done, get from db and return
      return_job_information(response, id);
    }
  });

};