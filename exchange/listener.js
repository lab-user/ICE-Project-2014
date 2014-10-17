var express = require('express');
var adapter = require('./adapter/adapter');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var daemon = require('./daemon');
var app = express();

daemon.run();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

  /* serves all the static files */
   app.get(/^(.+)$/, function(req, res){ 
   console.log("static file request : " + req.params);
       res.send(200);
		if(req.query !== null && req.body !== {}){
      setTimeout(function(){
       adapter.pull(req.query, req.body);
     }, 10000);

		 console.dir("This is the query received from the GET-request: " + JSON.stringify(req.query));
		 } 
   });

 var port = process.env.PORT || 3000;
 app.listen(port, function() {
   console.log("Listening on " + port);
 });

/* GET home page and call adapters*/
app.get('/', function(req, res) {
	res.send(200);
	 if(req.query !== null && req.body !== {}){
    setTimeout(function(){
	 adapter.pull(req.query, req.body);
   }, 10000);

	 console.dir("This is the query received from the GET-request: " + JSON.stringify(req.query));
	 }
});

/* POST home page and call adapters*/
app.post('/', function(req, res) {
    res.send(200);
  adapter.pull(req.query, req.body);
  console.dir("This is the query received from the POST-request: " + JSON.stringify(req.query));
 // console.dir("JSON-Objekt aus dem POST:" + JSON.stringify(req.body));
});

/* PUT home page and call adapters*/
app.put('/', function(req, res) {
    res.send(200);
  adapter.pull(req.query, req.body);
	console.dir("This is the query received from the PUT-request: " + JSON.stringify(req.query));
 // console.dir("JSON-Objekt aus dem PUT:" + JSON.stringify(req.body));
});