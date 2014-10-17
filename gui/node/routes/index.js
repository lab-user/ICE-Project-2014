var express = require('express');
var router = express.Router();

//TODO
var storage = require('./../public/javascripts/storage');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
	res.render('helloworld', { title: 'Hello, World!' })
});

/* GET Ticketlist page. 
router.get('/ticketlist', function(req, res) {
	var db = req.db;
	var collection = db.get('ticketcollection');
	collection.find({},{},function(e,docs){
		res.render('ticketlist', {
			title: 'Ticketlist',
			"ticketlist" : docs
		});
	});
});
*/

router.get('/ticketlist', function(req, res) {
	storage.showTicket('piston',function(err,pistonTickets) {
		res.render('ticketlist', {
			title: 'Ticketlist',
			"ticketlist" : pistonTickets
		});
	});
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
	res.render('newuser', { title: 'Add New User' });
});

/* GET Existing User page. */
router.get('/existinguser', function(req, res) {
	res.render('existinguser', { title: 'Modify Existing User' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

	console.log("STRING!");

	var ticket = '{' +
		'"id":"",' +
		'"source":"' + req.body.source + '",' +
		'"sourceSystem":{' +
			'"name":"' + req.body.sourceSystem + '",' +
			'"defect":{' +
				'"subscribed":' + Boolean(req.body.cb_defect) + ',' +
				'"name":"' + req.body.defect + '"' +
			'},' +
			'"roadmap":{' +
				'"subscribed":' + Boolean(req.body.cb_roadmap) + ',' +
				'"name":"' + req.body.roadmap + '"' +
			'},' +
			'"customerIndividual":{' +
				'"subscribed":' + Boolean(req.body.cb_customerIndividual) + ',' +
				'"name":"' + req.body.customerIndividual + '"' +
			'},' +
			'"credentials":{' +
				'"token":"' + req.body.token + '",' +
				'"user":"' + req.body.user + '",' +
				'"password":"' + req.body.password + '",' +
				'"url":"' + req.body.url + '"' +
			'},' +
			'"mapping":{' +
				'"ticketStatuses":[' +
					'{' +
						'"common":"new",' +
						'"source":"' + req.body.new + '"' +
					'},' +
					'{' +
						'"common":"validation",' +
						'"source":"' + req.body.validation + '"' +
					'},' +
					'{' +
						'"common":"assigned",' +
						'"source":"' + req.body.assigned + '"' +
					'},' +
					'{' +
						'"common":"on hold",' +
						'"source":"' + req.body.onHold + '"' +
					'},'+
					'{' +
						'"common":"working",' +
						'"source":"' + req.body.working + '"' +
					'},' +
					'{' +
						'"common":"delivered",' +
						'"source":"' + req.body.delivered + '"' +
					'},' +
					'{' +
						'"common":"closed",' +
						'"source":"' + req.body.closed + '"' +
					'},' +
					'{' +
						'"common":"declined",' +
						'"source":"' + req.body.declined + '"' +
					'}' +
				'],' +
				'"priorityStatuses":[' +
					'{' +
						'"common":"low",' +
						'"source":"' + req.body.low + '"' +
					'},' +
					'{' +
						'"common":"standard",' +
						'"source":"' + req.body.standard + '"' +
					'},' +
					'{' +
						'"common":"high",' +
						'"source":"' + req.body.high + '"' +
					'},' +
					'{' +
						'"common":"urgent",' +
						'"source":"' + req.body.urgent + '"' +
					'}' +
				'],' +
				'"labelTypes":[' +
					'{' +
						'"common":"assembly",' +
						'"source":"' + req.body.assembly + '"' +
					'},' +
					'{' +
						'"common":"qa",' +
						'"source":"' + req.body.qa + '"' +
					'}' +
				'],' +
				'"ticketTypes":[' +
					'{' +
						'"common":"issue",' +
						'"source":"' + req.body.issue + '"' +
					'},' +
					'{' +
						'"common":"incident",' +
						'"source":"' + req.body.incident + '"' +
					'},' +
					'{' +
						'"common":"question",' +
						'"source":"' + req.body.question + '"' +
					'},' +
					'{' +
						'"common":"task",' +
						'"source":"' + req.body.task + '"' +
					'}' +
				']' +
			'}' + 
		'}' +
	'}';

	obj = JSON.parse(ticket);
	console.log(JSON.stringify(obj));

	res.redirect("newuser");

	/*
	// Set our internal DB variable
	var db = req.db;

	// Set our collection
	var collection = db.get('ticketcollection');

	// Submit to the DB
	collection.insert({
		"id" : "6666",
		"type" : "defect", 
		"topic" : "Another issue from the adapter",  
		"status" : "new", 
		"partner" : "piston",
		"priority" : "urgent",
		"processed" : false
	}, function (err, doc) {
		if (err) {
			// If it failed, return error
			res.send("There was a problem adding the information to the database.");
		}
		else {
			// If it worked, set the header so the address bar doesn't still say /adduser
			res.location("ticketlist");
			// And forward to success page
			res.redirect("ticketlist");
		}
	});
	*/
});

module.exports = router;
