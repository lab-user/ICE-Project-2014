var zendeskAdapter = require("./zendeskAdapter");
var trelloAdapter = require("./trelloAdapter");
var request = require('request');

/**
 * Is called when a common schema ticket has to be published into a subscribed system's schema. 
 * It forwards the requests to the corresponding adapters (e.g. trelloAdapter).
 * 
 * @param {JSON-Object} incomingTicket
 * @param {function} callback
 */
function push(incomingTicket, callback){
	console.log("Entering push function in Adapter");
	console.log("IncomingTicket-Target: " + incomingTicket.target);
	findMapper(incomingTicket.target, function(err, mapper){	
	console.log("Das ist das mapperfile received: " + mapper.sourceSystem.name + ".");
	switch(mapper.sourceSystem.name.toLowerCase()){
		//TODO: adjust cases, after tools registered through GUI!!
		case "zendesk":
		zendeskAdapter.push(incomingTicket, mapper, function(error, ticket){
				if(!error){
					//console.dir("In adapter zendesk case. callback...");
					updateTicket(ticket);
					//console.dir("zendeskIncomingTicket-ID" + incomingTicket.id);
					callback(false, incomingTicket.id);
				}
			});
		break;
	
		case "trello":
		trelloAdapter.push(incomingTicket, mapper, function(error, ticket){
				if(!error){
					console.dir("In adapter trello case. callback...");
					console.dir("incomingTicket: " + JSON.stringify(ticket));
					updateTicket(ticket);
					console.dir("trelloIncomingTicket-ID" + incomingTicket.id);
					callback(false, incomingTicket.id);
				}
			});
		break;
		default:
		console.dir("ERROR: No adapter for source system detected");
	}
	});
}

/**
 * Pull forwards queries and bodies from requests the listener has received. It forwards the data to the corresponding system
 * which has to convert the tickets into the common schema.
 *
 * @param {JSON-Object} query
 * @param {JSON-Object} body
 */ 
function pull(query, body){
	console.dir("This is the query mapper ID: " + query.mapper);
	
	findMapper(query.mapper, function(err, mapper){	
	console.log(mapper.sourceSystem.name);
	switch(mapper.sourceSystem.name.toLowerCase()){
		/* hard-coded values for tool-names, 
		make sure they are the same as the
		ones defined in the GUI. To add a new tool,
		just add the toolname as a new case and call
		the corresponding functino in there.
		Example:
			case "Jira":
			jiraAdapter.pull(query, mapper);
			break;
		*/
		case "zendesk":
		console.dir("Zendesk-Adapter (Pull) being called.");
		zendeskAdapter.pull(query, mapper);
		break;
		case "trello":
		console.dir("Trello-Adapter (Pull) being called.");
		trelloAdapter.pull(query, body, mapper);
		break;	
		default:
		console.dir("ERROR: No adapter for source system detected");
	}
	});
}

/**
 * Is requesting a mapperFile from the storage-component through an API-call
 * with the mapperID received from the query.
 *
 * @param {String} mapperID
 * @param {function} callback
 *
 * @return {JSON-Object} error
 * @return {JSON-Object} body
 */ 
function findMapper(mapperID, callback){
	request.get('http://toolchainapi.beta.scapp.io/api/v1/mapper?mapperID=' + mapperID,
		function(error, response, body){
			body = JSON.parse(body);
			if(error){
				console.dir(error);
			}else{
				console.dir("Response is: " + response);
				console.dir("Body is: " + body);
				callback(error, body);
			}
		});
}

/**
 * Creates a transaction through the storage-API.
 *
 * @param {JSON-Object} ticket
 */ 
function createTransaction(ticket) {
	console.dir("entering createTransaction-Function in Adapter.");
	request.post('http://toolchainapi.beta.scapp.io/api/v1/transaction',
		{ form:  ticket},
    	function (error, response, body) {
        if (!error) {
            console.log(body)
        }
    });
}

/**
 * Updates a ticket through the storage-API.
 *
 * @param {JSON-Object} transaction
 */ 
function updateTicket(transaction){
	console.dir("entering updateTicket-Function in Adapter.");

	if(transaction.transactionType === "New"){
		//console.dir("Post Ticket in Adapter.");
		request.post('http://toolchainapi.beta.scapp.io/api/v1/tickets',
		{ form:  transaction},
    	function (error, response, body) {
        if (!error) {
            console.log(body)
        }
    	});
	}else{
		console.dir("Put Ticket in Adapter.");
		request.put('http://toolchainapi.beta.scapp.io/api/v1/tickets',
		{ form:  transaction},
    	function (error, response, body) {
        if (!error) {
            console.log(body)
        }
    	});
	}
	
}

/**
 * Requests a ticket through the storage-API.
 *
 * @param {String} swisscomID
 * @param {String} partnerID
 * @param {function} callback
 *
 * @return {JSON-Object} body
 */ 
function requestTicket(swisscomID, partnerID, callback){
	request.get('http://toolchainapi.beta.scapp.io/api/v1/ticket?swisscomID=' + swisscomID + '&partnerID=' + partnerID, 
		function(error, response, body){

			body = JSON.parse(body);
			
			if(body === "400"){
				callback(null);
			}else{
				callback(body);
			}
		});

}

exports.findMapper = findMapper;
exports.createTransaction = createTransaction;
exports.updateTicket = updateTicket;
exports.requestTicket = requestTicket;
exports.push = push;
exports.pull = pull;