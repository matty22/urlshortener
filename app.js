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


app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);

//Get the URL parameter the user has passed in 
//Because the user is passing a URL, we must encode it
app.get('/:location(*)', function(request, response) {
  var urlParam = request.params.location;
  if (validUrl.is_http_uri(urlParam) || validUrl.is_https_uri(urlParam)) {
    
    MongoClient.connect(dbUrl, function(err, db) {
       if (err) {
          throw err;
        }
        console.log("***** Successfully connected to Mongo Database  *****");
        // This returns all documents in the database
        // dbOps.findDocument(db, "urlColl", function(docs) {
        //   console.log(docs);
        // });

        // This returns the first match in the dB for the urlParam query
        dbOps.findOneDocument(db, urlParam, "urlColl", function(docs) {
          if (docs) {
            response.send("This shortened url already exists with id ");
          } else {
            response.send("This shortened url does not exist yet");
          }
        })
        // dbOps.insertDocument(db, { original_url: urlParam }, "urlColl", function(results) {
        //   response.send(results.ops);

          
        // });
    });
  } else {
    response.send("Not a valid URL");
  }
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
