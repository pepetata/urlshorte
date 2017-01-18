var express = require('express')
        , stylus = require('stylus')
        , app = express()
        , url
        , MongoClient = require('mongodb').MongoClient
        , db
        , result
        , surl
        , urldoc
        , urls
        , counters
        , ref
        , origurl


// Connect to the db
MongoClient.connect("mongodb://localhost:27017/db", function (err, database) {
   if (!err) {
      console.log("MongoDB connected to port 27017");
   }
   db = database
   counters = db.collection('counters')
   app.listen(8080, function () {
      console.log('App listening on port 8080!')
   })
});

app.set('views', __dirname );
app.set('view engine', 'stylus');
app.use(express.static(__dirname));
app.use(stylus.middleware( __dirname));

app.get('*', function (req, res) {
   url = req.url.substr(1)
   if (url === "favicon.ico" || url === "style.css")
      return
   console.log(url, isValidNum(url), isValidURL(url))
   var origurl = req.protocol + '://' + req.get('host') + '/'

    if (url <" ") {
        res.render('urlshortener.jade');
        return
    } 
    
   if (!isValidURL(url) && !isValidNum(url)) {
      res.end(JSON.stringify({error: "Invalid URL"}))
      return
   } else {

      var find
      if (!isValidNum(url))
         find = {url: url}
      else
         find = {_id: Number(url)}
      console.log(find)
      // check if url already exists
      db.collection('urls', function (err, coletion) {
         if (err) {
            return err
         }
         urls = coletion
         urls.find(find).toArray(function (err, doc) {
            if (err) {
               return err
            }
            if (doc.length > 0) {
               if (!isValidNum(url)) {
                  surl = '';
                  result = {original_url: url, short_url: origurl + doc[0]._id}
                  res.end(JSON.stringify(result))
                  // return
               } else {
                  res.end('<!DOCTYPE html><html><head><script>window.open("' + doc[0].url + '","_self");</script></head><body></body></html>')
               }
            } else {
               if (isValidNum(url)) {
                  res.end(JSON.stringify({error: "this short URL is not in the database"}))
               } else {//save it
                  counters.findAndModify(
                          {_id: 'urlid'},
                          [],
                          {$inc: {seq: 1}},
                          {new : true}
                  , function (err, counter) {
                     if (err) {
                        return err
                     }
                     urldoc = {_id: counter.value.seq, url: url}
                     urls.insert(urldoc)
                     result = {original_url: url, short_url: origurl + urldoc._id}
                     res.end(JSON.stringify(result))
                  })
               }
            }
         })
      })
   }
})


function getNextSequence(name) {
   counters.findAndModify(
           {_id: name},
           [],
           {$inc: {seq: 1}},
           {new : true}
   , function (err, counter) {
      if (err) {
         return err
      }
      urldoc = {_id: counter.value.seq, url: url}
      urls.insert(urldoc)
      return
   })
   return
}

function isValidURL(url) {
// per http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url/22648406#22648406
   // true = valid
   return /(ftp|http|https):\/\/www(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gm.test(url)
}

function isValidNum(str) {
// per http://stackoverflow.com/questions/15699094/how-to-validate-a-number-field-in-javascript-using-regular-expressions
   return /^[+-]?(?:\d+,)*\d*(?:\.\d+)?\.?$/gm.test(str)
}