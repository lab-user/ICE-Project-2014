var adapter = require('./adapter/adapter');
var request = require('request');

function run(){
	console.dir("Daemon started.");

	//createMapperFiles();

	setInterval(function(){
					request.get('http://toolchainapi.beta.scapp.io/api/v1/transaction',
						function(error, response, body){
							body = JSON.parse(body);
							if(error){
								console.dir(error);
								return;
							}else if (body !== "400"){
								cbFindUnprocessed(body);
							}else {
								console.dir("No transactions found.");
								return;
							}
					});
					}, 10000); 
}

function cbFindUnprocessed(tickets){
	if(tickets.length > 0){
		for(i=0; i < tickets.length; i++){
			console.dir("Call push funtion");	
			adapter.push(tickets[i], cbPushAdapter);
		}
	}
}

function cbPushAdapter(err, transactionId){
	if(!err){
		request.put('http://toolchainapi.beta.scapp.io/api/v1/transaction',
					{form: {"id": transactionId}},
						function(error, response, body){
							if(error){
								console.dir(error);
							}else{
								cbSetTransactionProcessed(error, transactionId);
							}
					});
	}else{
		console.dir(err);
	}
}

function cbSetTransactionProcessed(err, transactionId){
	if(err){
		console.dir(err);
	}else{
		console.dir("Transaction " + transactionId + " is set to processed");
	}
}

function createMapperFiles(){
	var mapperFile = {
	id : "s02",
	source : "swisscom",
	sourceSystem : {
		name : "zendesk",
		Defect : {
			subscribed : true,
			name : "bug"
		},
		Roadmap : {
			subscribed : false,
			name : ""
		},
		CustomerIndividual : {
			subscribed : false,
			name : ""
		},
		credentials : {
			token : "0Plp9elxRTSolLhVhMFuqk33CYXEdzXZvYald9EH",
			user : "gordian.st@gmail.com",
			password : "",
			url : "https://toolchain.zendesk.com/api/v2"
		},
		mapping : {
			ticketStatuses : [{
					common : "new",
					source : "new"
				},
				{
					common : "validation",
					source : "open"
				},
				{
					common : "assigned",
					source : "open"
				},
				{
					common : "on hold",
					source : "hold"
				},
				{
					common : "working",
					source : "pending"
				},
				{
					common : "delivered",
					source : "solved"
				},
				{
					common : "closed",
					source : "closed"
				},
				{
					common : "declined",
					source : "closed"
				}				
			],
			priorityStatuses : [
				{
					common : "low",
					source : "low"
				},
				{
					common : "standard",
					source : "normal"
				},
				{
					common : "high",
					source : "high"
				},
				{
					common : "urgent",
					source : "urgent"
				}
			],
			labelTypes : [
				{
					common : "assembly",
					source : "common"
				},
				{
					common : "qa",
					source : "testing"
				}
			],
			ticketTypes : [
				{
					common : "issue",
					source : "issue"
				},
				{
					common : "incident",
					source : "incident"
				},
				{
					common : "question",
					source : "question"
				},
				{
					common : "task",
					source : "task"
				}
			]
		}
	}
};

for(i = 0; i < mapperFile.sourceSystem.mapping.ticketTypes.length; i++){
	console.log("Mapping of field number " + (i + 1));
	console.log("Common Schema field is: " +mapperFile.sourceSystem.mapping.ticketTypes[i].common);
	console.log("Source system field is: " +mapperFile.sourceSystem.mapping.ticketTypes[i].source);
	console.log();
}

var mapperFile2 = {
	id : "s02",
	source : "piston",
	sourceSystem : {
		name : "zendesk",
		Defect : {
			subscribed : true,
			name : "bug"
		},
		Roadmap : {
			subscribed : false,
			name : ""
		},
		CustomerIndividual : {
			subscribed : false,
			name : ""
		},
		credentials : {
			token : "J2q7x7CP79E5us1RH6MyGO8ChrjWWZt3VzUKLst7",
			user : "cedric.amstalden@stud.hslu.ch",
			password : "",
			url : "https://toolchain2.zendesk.com/api/v2"
		},
		mapping : {
			ticketStatuses : [{
					common : "new",
					source : "new"
				},
				{
					common : "validation",
					source : "open"
				},
				{
					common : "assigned",
					source : "open"
				},
				{
					common : "on hold",
					source : "hold"
				},
				{
					common : "working",
					source : "pending"
				},
				{
					common : "delivered",
					source : "solved"
				},
				{
					common : "closed",
					source : "closed"
				},
				{
					common : "declined",
					source : "closed"
				}				
			],
			priorityStatuses : [
				{
					common : "low",
					source : "low"
				},
				{
					common : "standard",
					source : "normal"
				},
				{
					common : "high",
					source : "high"
				},
				{
					common : "urgent",
					source : "urgent"
				}
			],
			labelTypes : [
				{
					common : "assembly",
					source : "common"
				},
				{
					common : "qa",
					source : "testing"
				}
			],
			ticketTypes : [
				{
					common : "issue",
					source : "issue"
				},
				{
					common : "incident",
					source : "incident"
				},
				{
					common : "question",
					source : "question"
				},
				{
					common : "task",
					source : "task"
				}
			]
		}
	}
};

for(i = 0; i < mapperFile.sourceSystem.mapping.ticketTypes.length; i++){
	console.log("Mapping of field number " + (i + 1));
	console.log("Common Schema field is: " + mapperFile.sourceSystem.mapping.ticketTypes[i].common);
	console.log("Source system field is: " + mapperFile.sourceSystem.mapping.ticketTypes[i].source);
	console.log();
}

var mapperFile3 = {
	id : "s03",
	source : "plumgrid",
	sourceSystem : {
		name : "trello",
		Defect : {
			subscribed : true,
			name : "bug"
		},
		Roadmap : {
			subscribed : false,
			name : ""
		},
		CustomerIndividual : {
			subscribed : false,
			name : ""
		},
		credentials : {
			token : "ae5e037629d1369f2c0d8c3bfb7d2afa8e04582c87e187713dbadb518644f1ad",
			user : "",
			password : "c8c5d668ce446074d247cae451f8df4c",
			url : "5417684179931e027c3d6bb9"
		},
		mapping : {
			ticketStatuses : [{
					common : "new",
					source : "5417684179931e027c3d6bba"
				},
				{
					common : "validation",
					source : "5417684179931e027c3d6bbc"
				},
				{
					common : "assigned",
					source : "5417684179931e027c3d6bbb"
				},
				{
					common : "on hold",
					source : "5432dc4940bf758cefa34814"
				},
				{
					common : "working",
					source : "5417687315b2b75559066976"
				},
				{
					common : "delivered",
					source : "541768695e14f1a7bf504528"
				},
				{
					common : "closed",
					source : "5432dc54e20db3ec953170bb"
				},
				{
					common : "declined",
					source : "54176865a4ffa7e7a3095e24"
				}				
			],
			priorityStatuses : [
				{
					common : "low",
					source : "low"
				},
				{
					common : "standard",
					source : "normal"
				},
				{
					common : "high",
					source : "high"
				},
				{
					common : "urgent",
					source : "urgent"
				}
			],
			labelTypes : [
				{
					common : "assembly",
					source : "common"
				},
				{
					common : "qa",
					source : "testing"
				}
			],
			ticketTypes : [
				{
					common : "issue",
					source : "issue"
				},
				{
					common : "incident",
					source : "incident"
				},
				{
					common : "question",
					source : "question"
				},
				{
					common : "task",
					source : "task"
				}
			]
		}
	}
};

//simulating registration process
setTimeout(function(){
	createMapper(mapperFile);
	setTimeout(function(){
		createMapper(mapperFile2);
		setTimeout(function(){
			createMapper(mapperFile3);
		}, 10000);
	}, 10000);
}, 10000);

}

function createMapper(mapperFile){
	request.post('http://toolchainapi.beta.scapp.io/api/v1/mapper',
		{ form:  mapperFile},
    	function (error, response, body) {
        if (!error) {
            console.log(body)
        }
    });
}

exports.run = run;
