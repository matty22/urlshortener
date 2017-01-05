var express = require('express');
var path = require('path');
var logger = require('morgan');
var validUrl = require('valid-url');
var dbOps = require('./dbOps');
var MongoClient = require('mongodb').MongoClient;
// Database Connection URL
var dbUrl = process.env.MONGOURL;


var index = require('./routes/index');
var app = express();
var dbId = 1;


app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);

//Get the URL parameter the user has passed in 
//Because the user is passing a URL, we must encode it
app.get('/:location(*)', function(request, response) {
  var urlParam = request.params.location;
    
    MongoClient.connect(dbUrl, function(err, db) {
       if (err) {
          throw err;
        }

        if (!isNaN(Number(urlParam))) {
          // Search for document by ID.
          var urlParamNumber = Number(urlParam);
          dbOps.findOneById(db, urlParamNumber, "urlColl", function(docs) {
            //If it exists, redirect to the original_url
            if (docs.length > 0) {
              response.writeHead(301, { Location: docs[0].original_url });
              response.end();
            } else {
              // Else inform user that their shortened url does not exist
              response.send("That shortened url does not exist");
            }
          });

        } else if (validUrl.is_http_uri(urlParam) || validUrl.is_https_uri(urlParam)) {
          // Search for document by original_url
          dbOps.findOneByUrl(db, urlParam, "urlColl", function(docs) {
            // If it already exists, inform user so, and provide the id of that shortened url.
            if (docs.length > 0) {
              response.send("This shortened url already exists. Use the url http://matty22urlshortener.herokuapp.com/" + docs[0]._id + " to redirect to that location.");
            } else {
              // Else add that url to the database as a new record
              dbOps.insertDocument(db, { "original_url": urlParam, "shortened_url": "http://matty22urlshortener.herokuapp.com/" + dbId, "_id": dbId }, "urlColl", function(results) {
                 dbId = dbId + 1;
                 response.send(results.ops[0]);
              });
            }
          });
        } else {
          // If the passed in parameter is not a valid URL, inform users as such.
          response.send("The url parameter is invalid");
        }
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
