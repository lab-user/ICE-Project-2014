// BASE SETUP
// =============================================================================

// call the packages we need
var express    	= require('express'); 		// call express
var app        	= express(); 				// define our app using express
var bodyParser 	= require('body-parser');
var storage		= require('./storage/storage');

//storage.deleteDatabase();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });


var port = process.env.PORT || 8080; 		// set our port


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

router.get('/', function(req, res) {
	res.json({ message: 'Welcome to our toolchain api!' });	
});

// more routes for our API will happen here
// ----------------------------------------------------
router.route('/v1/tickets')

	.post(function(req, res) {
		console.log(req.body);
		storage.createTicket(req.body, function(err, ticket){
		res.json(ticket);	
		});
	})

	.get(function(req, res){
		storage.showTicket(req.query.partnerName, function(err, partnertickets){
			res.json(partnertickets);
		});
	})

	.put(function(req, res){
		console.log(req.body);
		storage.updateTicket(req.body, function(err, ticket){
			if(err){
				console.dir(err)
			}else{
				res.json(ticket);
			}
		});
	});

router.route('/v1/mapper')

	.post(function(req, res){
		console.dir("POST Function for creating new mapper is called")
		console.log(req.body);
		storage.createMapper(req.body, function(err, mapper){
		//console.dir("Mappingfile created: " + mapper.id);
		res.json(mapper);	
		});
	})

	.get(function(req, res){
		console.dir(req.query.mapperID);
		storage.findMapper(req.query.mapperID, function(err, mapper){
			//console.dir(mapper);
			if(err){
				console.dir(err);
			}else{
				res.json(mapper);
			}
			
		});
	})

	.put(function(req, res){
		storage.updateMapper(req.body, function(err, mapper){
			if(err){
				console.dir(err)
			}else{
				res.json(mapper);
			}
		});
	});

	router.route('/v1/transaction')

		.post(function(req, res){
			storage.createTransaction(req.body);
		})

		.get(function(req, res){
			storage.findUnprocessed(function(transactions){
				if(transactions.length>0){
					console.dir("Found unprocessed transactions.")
					res.json(transactions);	
				}else{
					console.dir("No unprocessed transactions found.")
					res.json("400");
				}
				
			});
		})

		.put(function(req, res){
		storage.setTransactionProcessed(req.body.id, function(err, transactionID){
			if(err){
				console.dir(err)
			}else{
				res.json({"id": transactionID});
			}
		});
	});

	router.route('/v1/ticket')

		.get(function(req, res){
			console.dir("Query Swisscom ID: " + req.query.swisscomID);
			console.dir("Query Partner ID: " + req.query.partnerID);
			storage.findTicketById(req.query.swisscomID, req.query.partnerID, function(err, ticket){
				if(err){
					console.dir(err);
				}else{
					if(ticket.length>0){
						console.dir(ticket);
						res.json(ticket);	
					}else{
						res.json("400");
					}
					
				}
			});
		});



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);