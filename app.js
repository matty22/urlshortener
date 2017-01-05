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

        // This returns the first match in the dB for the urlParam query
        dbOps.findOneDocument(db, urlParam, "urlColl", function(docs) {
            
            // If the search finds a match, we don't want to add it again
            // START HERE - Figure out a way to check if the passes param is a number
            // that matches a document ID in the dB
            if (docs.length > 0) {
              response.send("This shortened url exists in the database with id " + docs[0]._id);
            } else if (docs.length == 0 && validUrl.is_http_uri(urlParam) || validUrl.is_https_uri(urlParam)) {
              // If the search does not find a match and the parameter is a valid URL, we want to add it to the database
              dbOps.insertDocument(db, { "original_url": urlParam, "shortened_url": "http://matty22urlshortener.herokuapp.com/" + dbId, "_id": dbId }, "urlColl", function(results) {
                response.send(results.ops);
              });
              dbId = dbId + 1;
            } else {
              console.log("THE URL PARAM IS " + urlParam + "and its type is " + typeof urlParam);
              response.send("This is not a valid URL");
            }
        });
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
