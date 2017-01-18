var MongoClient = require('mongodb').MongoClient


// Connect to the db
MongoClient.connect("mongodb://localhost:27017/db", function(err, db) {
    if(err) console.log(err)
    console.log('Creating counters!')
    db.createCollection("counters")
    db.collection('counters', function(err, counters) {
        if (err) console.log(err)
        counters.drop()
        counters.insert({_id:"urlid",seq:0},function(err, documents) {
                        if(err) { console.log('error=',err); }
                    })
        counters.find().toArray(function(err, doc) {
            console.log(doc)
        })
    })
    var urls = db.collection('urls')
    urls.drop()

    db.close
});

