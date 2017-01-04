
exports.insertDocument = function(db, document, collection, callback) {
  // Get the document collection
  var coll = db.collection(collection);

  // Insert a document
  coll.insert(document, function(err, result){
    if (err) {
      throw err;
    }
    console.log("Inserted " + result.result.n + " documents into the collection " + collection);
    callback(result);

  });
};

exports.findDocument = function(db, collection, callback) {
  // Get the document collection
  var coll = db.collection(collection);

  // Find a document
  coll.find({}).toArray(function(err, docs) {
    if (err) {
      throw err;
    }

    callback(docs);
  });
};

exports.findOneDocument = function(db, originalUrl, collection, callback) {
  // Get the document collection
  var coll = db.collection(collection);

  // Find one document
  coll.findOne({ originalUrl }).toArray(function(err, docs) {
    if (err) {
      throw err;
    }

    callback(docs);
  });
}