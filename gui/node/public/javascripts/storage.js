//Component to store data in Transaction files
require('./db');
var mongoose = require('mongoose');
var mTransaction = mongoose.model('Transaction');
var mTicket = mongoose.model('Ticket');
var mMapper = mongoose.model('Mapper');
var uuid = require('node-uuid');

function createTransaction(transaction){
	console.dir("Entering createTransaction function.");

	//Create Unique ID for Transaction
	transaction.id = uuid.v1();
	new mTransaction(transaction).save(function(err, supporttransaction) {
			if (err)
				return //console.error(err);
			console.dir("Exit createTransaction function");
			if(transaction.transactionType === "New"){
				createTicket(transaction);
			}else{
				updateTicket(transaction);
			}
		});
}

function createMapper(mapper, callback){
	console.dir("Entering createMapper function.");

	//Create Unique ID for Mapper
	mapper.id = uuid.v1();
	new mMapper(mapper).save(callback);
}

function createTicket(transaction){
	replaceSourceTarget(transaction, function(ticket){
		new mTicket(ticket).save(function(err, ticket) {
			if (err)
				return console.error(err);
			console.dir("Exit createTransaction function");
		});
	});	
}

function replaceSourceTarget(transaction, callback){
	mMapper.find({id: transaction.source}, function(err, lMapper){
		transaction.source = lMapper.source;
		mMapper.find({id: transaction.target}, function(err, lMapper){
			transaction.target = lMapper.source;
			callback(transaction);
		});
	});
}

function updateTicket(transaction){
	replaceSourceTarget(transaction, function(ticket){
		mTicket.findOneAndUpdate({swisscomID: transaction.swisscomID}, ticket, {new: true}, function(err, ticket) {
 		if (err) {
    		console.dir(err);
  		}
		});
	});
	
}

function showTicket(partnerName, callback){
	mTicket.find({$or:[{
			target : partnerName
		}, {
			source : partnerName
		}]}, function(err, partnerTickets){
			callback(err, partnerTickets)
		});
}

function findUnprocessed(callback){
	console.dir("Entering findUnprocessed Function");
		mTransaction.find({
			processed : false
		}, function(err, supporttransactions) {
			if (err){
				return console.error(err);
		}
		callback(supporttransactions);
		});
}

function findMapper(mapperID, callback){
	console.dir("Mapper-ID: " + mapperID);
	mMapper.findOne({id : mapperID,}, function(err, mapper) {
		if (err){
		return console.error(err);
		}
		callback(err, mapper);
	});
}

function setTransactionProcessed(transactionId, callback){
	mTransaction.findOneAndUpdate({id: transactionId}, {processed: true}, {new: true}, function(err, transaction) {
  if (err) {
    callback(err, null);
  }else{
  	callback(null, transactionId);
  }
	});
}

function deleteAllUnprocessedTransactions(){
	mTransaction.remove({processed: false}, function(err){
		if(err)
			console.log(err);
	});
}

function deleteDatabase(){
	mongoose.connection.collections['mappers'].drop( function(err) {
    console.log('collection tickets dropped');
	});

	mongoose.connection.collections['transactions'].drop( function(err) {
    console.log('collection partners dropped');
	});
}

function emptyCollections(){
	mTransaction.remove({}, function(err){
		console.log("mTransaction removed.");
	});
	mMapper.remove({}, function(err){
		console.log("mMapper removed.");
	});
}

exports.createTransaction = createTransaction;
exports.createMapper = createMapper;
exports.createTicket = createTicket;
exports.updateTicket = updateTicket;
exports.showTicket = showTicket;
exports.findUnprocessed = findUnprocessed;
exports.findMapper = findMapper;
exports.setTransactionProcessed = setTransactionProcessed;
exports.deleteAllUnprocessedTransactions = deleteAllUnprocessedTransactions;
exports.deleteDatabase = deleteDatabase;
exports.emptyCollections = emptyCollections;