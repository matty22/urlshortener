
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

exports.findOneByUrl = function(db, passedParam, collection, callback) {
  // Get the document collection
  var coll = db.collection(collection);

  // Find one document by url
  coll.find({ "original_url": passedParam }).toArray(function(err, docs) {
    if (err) {
      throw err;
    }

    callback(docs);
  });
}

exports.findOneById = function(db, passedParam, collection, callback) {
  // Get the document collection
  var coll = db.collection(collection);

  // Find one document by id
  coll.find({ "_id": passedParam }).toArray(function(err, docs) {
    if (err) {
      throw err;
    }

    callback(docs);
  });
}