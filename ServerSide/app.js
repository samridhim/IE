/*
Specifying all the required libraries and packages for the project, also mentioned in package.json file.
*/
var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose  = require('mongoose');
var readline = require("readline");
var stream = require("stream");
const {parser} = require('stream-json');
var fs = require('fs');
var cors = require('cors')
app.use(cors())
var formidable = require('formidable');
const JSONStream = require('JSONStream');
const cp = require("child_process")
var async = require('async');
app.set('view engine', 'ejs');


/*
Setting up database connection with a database called mydb and using bodyParser to allow requests to be accepted in a json format.
*/
mongoose.connect('mongodb://localhost/mydb', { useNewUrlParser: true });
var db = mongoose.connection;
app.use(bodyParser.json());


/*
API Endpoint for accepting a file sent by client to the server. After receiving the file, it first uploads the file in the /tmp directory 
Using fs.rename() we put the file in the current directory
Since the file has many documents, using a file handling method to read through contents of file and using insertMany() was failing because limit of insertMany is 1000 documents at a time.
So, I have used the command "mongoimport" which inputs the entire file as a collection in our database. On a successful insrtion, I am returining "success:1" as json response.


Note : I was trying to use stream-json to handle the huge 150mb file, but I could not get it to work, hence I have decided to use this method.
*/
app.post('/api/postfile', function(req, res){
  res.setHeader('Content-Type', 'application/json');
	var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if(err) throw err;
    var oldpath = files.filetoupload.path;
    var newpath = './' + files.filetoupload.name;
    fs.rename(oldpath, newpath, function (err) {
      if (err) {console.log(err);}
      var child =   cp.exec("mongoimport --jsonArray --db mydb --collection "+files.filetoupload.name.split('.')[0]+" --file "+files.filetoupload.name, (error, stdout, stderr)=>{
        if(error){
          console.log(`${error.stack}`)
         }
         console.log(stdout);
      });
    });
  });
    var instream = fs.createReadStream("/home/samridhi/ION_Energy/ServerSide/THERM0001.json");
    var outstream = new stream();
    var lineCount =0;
    var lines = ""
    var rl = readline.createInterface(instream,outstream);
    rl.on('line', function(line){
      //console.log(line);
      lines = line
      lineCount++;
    });
    rl.on('close', function(){
     var string = JSON.parse(lines);
      console.log(lineCount);
      var jsonArray = [];
      var val_sum = 0;
      var x = 1;
      for (var i=0; i< string.length; i++){
        val_sum = val_sum + string[i]["val"];
        x = x+ 1;
        if(x==8640){
          jsonArray.push({"ts" : string[i]["ts"], "val" : val_sum / x});
          x =1;
          val_sum = 0;
        }
      }
      console.log(jsonArray);
      db.collection("data_agg").insertMany(jsonArray);
      res.json(JSON.stringify({"success" : 1}));  
      console.log(JSON.stringify({"success":1}));
  });
});

/*
API Endpoint to get the values of temprature between a particular time duration. The duration can be a year, a month, a day. 
This EndPoint takes in a start date and an end date and returns all the documents with a timestamp between that range.
At the client side, the values are used to make a line chart using ChartJS
*/
app.post('/api/getchart', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  console.log(req.body["start"]);
  var start_int = Date.parse(req.body["start"]);
  var end_int = Date.parse(req.body["end"]);
  console.log(start_int);
  console.log(end_int);
  db.collection("data_agg").find({"ts":{$gte:start_int, $lte:end_int}}).sort({"ts":1}).toArray(function(err, docs) {
    console.log(docs);
    res.json(docs);
  });
});

/*
API Endpoint which is constantly receiving real time data and pushing the data into the database collection
The inserts are done every 10 seconds to the collection "data_agg_rt"
*/
app.post('/api/realtime', function(req, res){
  console.log(req.body);
  db.collection("data_agg_rt").insertOne(req.body, function(err, data) {
    if(err) throw err;
    console.log("inserted");
  });
  res.json(req.body);
});

/*
API Endpoint to send all the documents in the real time data.
This endpoint does not need a start and end data since the data is real time data and is constantly updating.
*/
app.post('/api/getrealtimechart', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  console.log(req.body["start"]);
  var start_int = Date.parse(req.body["start"]);
  console.log(start_int);
  db.collection("data_agg_rt").find({}).sort({"ts":1}).toArray(function(err, docs) {
    if(err)
    {
      throw err;
    }
    console.log(docs);
    res.json(docs);
  });
});

//Port at which the app is running
app.listen(3000);
console.log('Running on Port 3000...');


