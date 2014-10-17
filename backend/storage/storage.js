//Component to store data in Transaction files
require('./db');
var mongoose = require('mongoose');
var mTransaction = mongoose.model('Transaction');
var mTicket = mongoose.model('Ticket');
var mMapper = mongoose.model('Mapper');
var mCounter = mongoose.model('Counter');
var uuid = require('node-uuid');

/*creates a new transaction in mongoDB*/
function createTransaction(transaction){
	console.dir("Entering createTransaction function.");

	//Create Unique ID for Transaction
	transaction.id = uuid.v1();
	transaction.claimed = false;
	new mTransaction(transaction).save(function(err, supporttransaction) {
			if (err){
				console.error(err);
				return
			}
			console.dir("Exit createTransaction function");
		});
}

/*creates a new mapper file in mongoDB*/
function createMapper(mapper, callback){
	console.dir("Entering createMapper function.");
	getNextID(function(mapperID){
		mapper.id = "SU" + mapperID
		new mMapper(mapper).save(callback);
	});
	
}

function createCounter(){
	mCounter({
					id: "MapperID",
					seq: 0
					}).save(function(err, cMapperID){
				});
}

/*This function returns an inkremental id which are used as mapper id's*/
function getNextID(callback){
	mCounter.findOne({id: "MapperID"}, function(err, mapperID){
		if(!err){
			mapperID.seq++;
			mapperID.save(function(err){
			callback(mapperID.seq);	
			});
			}		
	});
	
}

/*Creates a new ticket.*/
function createTicket(transaction, callback){
	replaceSourceTarget(transaction, function(ticket){
		new mTicket(ticket).save(callback);
	});	
}

/*In this function the source and target fields are replaced with the name of the partner. In the
transaction these fields are filled with the mapperID. For the tickets there should be the name
of the partner.
*/
function replaceSourceTarget(transaction, callback){
	console.dir("Entering replaceSourceTarget");
	console.dir("Transaction source id: " + transaction.source);
	console.dir("Transaction target id: " + transaction.target);
	findMapper(transaction.source, function(err, lMapper){
		console.dir("Source is: " + lMapper.source);
		transaction.source = lMapper.source;
		findMapper(transaction.target, function(err, lMapper){
			console.dir("Target is: " + lMapper.source);
			transaction.target = lMapper.source;
			console.dir("transaction.source:" + transaction.source);
			console.dir("transaction.target:" + transaction.target);
			callback(transaction);
		});
	});
}

/*This function updates an existing ticket. The new ticket is the first parameter of this function.
The callback function returns an error message or the new ticket.*/
function updateTicket(transaction, callback){
	replaceSourceTarget(transaction, function(ticket){
		mTicket.findOne({swisscomID: transaction.swisscomID}, function(err, lTicket) {
 		if (err) {
    		console.dir(err);
  		}else{
  			lTicket.id = transaction.id;
  			lTicket.transactionType = transaction.transactionType;
			lTicket.topic = transaction.topic;
			lTicket.description = transaction.description;
			lTicket.status = transaction.status;
			lTicket.target = transaction.target;
			lTicket.source = transaction.source;
			lTicket.priority = transaction.priority;
			lTicket.partnerID = transaction.partnerID;
			lTicket.swisscomID = transaction.swisscomID;
			lTicket.processed = true;

			lTicket.save(callback);
  		}
		});
	});
}
/*Returns all tickets for one partner. The parameter is the name of the partner. This functions returns
an array with all tickets.*/
function showTicket(partnerName, callback){
	mTicket.find({$or:[{
			target : partnerName
		}, {
			source : partnerName
		}]}, callback);
}

/*Returns all tickets for one partner. The parameter is the name of the partner. This functions returns
an array with all tickets.*/
function findTicketById(lswisscomID, lpartnerID, callback){
	mTicket.find({$or:[{
			partnerID : lpartnerID
		}, {
			swisscomID : lswisscomID
		}]}, callback);
}

/*This function returns all unprocessed transactions in an array.*/
function findUnprocessed(callback){
	console.dir("Entering findUnprocessed Function");
		mTransaction.find({$and:[{
			processed : false
		}, {claimed : false}]}, function(err, supporttransactions) {
			if (err){
				return console.error(err);
		}
		for(i = 0; i < supporttransactions.length; i++){
			mTransaction.findOneAndUpdate({id : supporttransactions[i].id}, {claimed: true}, function(err, lTransaction){	
			});
		}
		callback(supporttransactions);
		});
}

/*Returns a mapper file. The condition for the search is the mapper id.*/
function findMapper(mapperID, callback){
	console.dir("Mapper-ID: " + mapperID);
	mMapper.findOne({id : mapperID,}, function(err, mapper) {
		if (err){
		return console.error(err);
		}
		callback(err, mapper);
	});
}

/*Updates an existing mapper file. As Parameter is the new mapper file required. The callback
function returns the new mapper file or an error message.*/
function updateMapper(mapper, callback){
	mMapper.findOne({id : mapper.id}, function(err, lmapper) {
		if (err) {
    		console.dir(err);
  		}else{
  			lmapper.id = mapper.id;
  			lmapper.source = mapper.source;
			lmapper.sourceSystem.name = mapper.sourceSystem.name;

			for(i = 0; i < lmapper.sourceSystem.mapping.ticketTypes.length; i++){
				lmapper.sourceSystem.mapping.ticketTypes[i].common = mapper.sourceSystem.mapping.ticketTypes[i].common;
				lmapper.sourceSystem.mapping.ticketTypes[i].source = mapper.sourceSystem.mapping.ticketTypes[i].source;
			}

			for(i = 0; i < lmapper.sourceSystem.mapping.labelTypes.length; i++){
				lmapper.sourceSystem.mapping.labelTypes[i].common = mapper.sourceSystem.mapping.labelTypes[i].common;
				lmapper.sourceSystem.mapping.labelTypes[i].source = mapper.sourceSystem.mapping.labelTypes[i].source;
			}

			for(i = 0; i < lmapper.sourceSystem.mapping.priorityStatuses.length; i++){
				lmapper.sourceSystem.mapping.priorityStatuses[i].common = mapper.sourceSystem.mapping.priorityStatuses[i].common;
				lmapper.sourceSystem.mapping.priorityStatuses[i].source = mapper.sourceSystem.mapping.priorityStatuses[i].source;
			}

			for(i = 0; i < lmapper.sourceSystem.mapping.ticketStatuses.length; i++){
				lmapper.sourceSystem.mapping.ticketStatuses[i].common = mapper.sourceSystem.mapping.ticketStatuses[i].common;
				lmapper.sourceSystem.mapping.ticketStatuses[i].source = mapper.sourceSystem.mapping.ticketStatuses[i].source;
			}

			lmapper.sourceSystem.credentials.token = mapper.sourceSystem.credentials.token;
			lmapper.sourceSystem.credentials.user = mapper.sourceSystem.credentials.user;
			lmapper.sourceSystem.credentials.password = mapper.sourceSystem.credentials.password;
			lmapper.sourceSystem.credentials.url = mapper.sourceSystem.credentials.url;

			if(mapper.sourceSystem.CustomerIndividual){
				lmapper.sourceSystem.CustomerIndividual.subscribed = mapper.sourceSystem.CustomerIndividual.subscribed;
				lmapper.sourceSystem.CustomerIndividual.name = mapper.sourceSystem.CustomerIndividual.name;
			}
			
			if(mapper.sourceSystem.Roadmap){
				lmapper.sourceSystem.Roadmap.subscribed = mapper.sourceSystem.Roadmap.subscribed;
				lmapper.sourceSystem.Roadmap.name = mapper.sourceSystem.Roadmap.name;
			}
			
			if(mapper.sourceSystem.Defect){
				lmapper.sourceSystem.Defect.subscribed = mapper.sourceSystem.Defect.subscribed;
				lmapper.sourceSystem.Defect.name = mapper.sourceSystem.Defect.name;
			}
			

			lmapper.save(callback);
  		}
	});
}
/*This function sets the processed flag to true. As parameter is the transaction id of the 
processed transaction required. The callback function returns the id of the processed function.
After the transaction is processed a new ticket is created or an existing ticket is updated.*/
function setTransactionProcessed(transactionId, callback){
	mTransaction.findOneAndUpdate({id: transactionId}, {processed: true}, {new: true}, function(err, transaction) {
  if (err) {
    callback(err, null);
  }else{
  		mTicket.findOneAndUpdate({$or:[{partnerID : transaction.partnerID}, {swisscomID : transaction.swisscomID}]}, {processed: true}, {new: true}, function(err, transaction) {
  			console.dir("Ticket updated.")
  		});
  		callback(null, transactionId);
  	 }
	});
}
/*This function deletes all unprocessed Transaction.*/
function deleteAllUnprocessedTransactions(){
	mTransaction.remove({processed: false}, function(err){
		if(err)
			console.log(err);
	});
}

function deleteDatabase(){
	
	/*mongoose.connection.collections['mappers'].drop( function(err) {
    console.log('collection mappers dropped');
	});

	mongoose.connection.collections['counters'].drop(function(err){
	console.log('collection counters dropped');
	});*/

	mongoose.connection.collections['tickets'].drop( function(err) {
    console.log('collection tickets dropped');
	});
	
	/*mongoose.connection.collections['partners'].drop( function(err) {
    console.log('collection transactions dropped');
	});*/

	mongoose.connection.collections['transactions'].drop( function(err) {
    console.log('collection transactions dropped');
	});
}


exports.createTransaction = createTransaction;
exports.setTransactionProcessed = setTransactionProcessed;
exports.createMapper = createMapper;
exports.updateMapper = updateMapper;
exports.findMapper = findMapper;
exports.createTicket = createTicket;
exports.updateTicket = updateTicket;
exports.showTicket = showTicket;
exports.findUnprocessed = findUnprocessed;
exports.deleteAllUnprocessedTransactions = deleteAllUnprocessedTransactions;
exports.deleteDatabase = deleteDatabase;
exports.createCounter = createCounter;
exports.findTicketById = findTicketById;

