// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = process.env.MONGODB_URI

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/api/:userUrl(*)", (request, response) => {
  let userUrl = request.params.userUrl;
  let regex = RegExp("^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?$");
  if(regex.test(userUrl)){
    MongoClient.connect(url,(err, database) => {
      const db = database.db('shortened-urls');
      const urlCollection = db.collection('shortUrls');
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        console.log('Connection established to', url);
        urlCollection.findOne({longUrl: userUrl},(err,data)=>{
          if (err) throw err
          if (data) {
            const resData = {
              "shortUrl": "https://url-short-db.glitch.me/" + data.shortUrl,
              "longUrl": data.longUrl
            }
            response.end(JSON.stringify(resData));
          } else{
            urlCollection.findOne({}, { sort: { _id: -1 }, limit: 1 },(err,data)=>{
              let count = data.shortUrl +1;
              urlCollection.insert( { shortUrl: count, longUrl: userUrl } );
              const resData = {
               "shortUrl": "https://url-short-db.glitch.me/" + count,
               "longUrl": userUrl
              }
              response.end(JSON.stringify(resData));
            });
          }
        });
      }
    });
  }else{
   response.end(JSON.stringify({"longUrl":"Invalid","shortUrl":"Invalid"})); 
  }
});

app.get('/:id(\\d+)', (req, res) => {
    // id portion of the request is available as req.params.id
  const urlId = Number(req.params.id);
  console.log(urlId);
  MongoClient.connect(url,(err, database) => {
      const db = database.db('shortened-urls');
      const urlCollection = db.collection('shortUrls');
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        console.log('Connection established to', url);
        urlCollection.findOne({shortUrl: urlId},(err,data)=>{
          if (err) throw err
          console.log(data);
          if (data) {
            res.redirect(301, data.longUrl);
          }else{
              res.end("No such url exists in our database. Please try again.");
          }
        });
      }
    });
});


// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
