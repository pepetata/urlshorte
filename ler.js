var MongoClient = require('mongodb').MongoClient


// Connect to the db
MongoClient.connect("mongodb://localhost:27017/db", function(err, db) {
    if(err) console.log(err)
    console.log('Creating counters!')
    db.collection('counters', function(err, counters) {
        if (err) console.log(err)
        counters.find().toArray(function(err, doc) {
            console.log('counters', doc)
        })
    })
    db.collection('urls', function(err, colletion) {
        if (err) console.log(err)
        colletion.find().toArray(function(err, doc) {
            console.log('urls', doc)
        })
    })
    db.close
});

