//Trello-Adapter: Priority is handled with position of cards (the higher up, the more important they are). This is not supported at the moment.

//TODO: Map Lists with statuses!!
//TODO: Map List names with ID.
//TODO: Priorities have not yet been mapped.
//TODO: Board-ID as URL in Mapper-File
var Trello = require("node-trello");
var adapter = require("./adapter");
var querystring = require ('querystring');
var request = require ('request');

/**
 * Initializes the client from the node-trello library to create an OAuth-Connection with the credentials provided in the corresponding mapper-file.
 *
 * @param {JSON-Object} lMapper
 * @param {function} callback
 *
 * @return {JSON-Object} client
 */
function init(lMapper, callback){
    // Trello(<key>, <token>)
    //TODO: Map fields correctly in next version. Token will be added as credentials.token, key as credentials.password and Board-ID as credentials.url 
    console.dir("Mapper-URL: " + lMapper.sourceSystem.credentials.url); 
    console.dir("Mapper-Token: " + lMapper.sourceSystem.credentials.token);
    var client = new Trello(lMapper.sourceSystem.credentials.url, lMapper.sourceSystem.credentials.token);
    callback(client);
  }

/**
 * Is called when a common schema ticket has to be published into a subscribed Trello system. It calls the methods to convert the common schema ticket into a 
 * Trello card and pushes it into the target system. In the end it will create a transaction through the storage component.
 *
 * @param {JSON-Object} incomingTicket
 * @param {JSON-Object} incomingMapper
 * @param {function} callback
 *
 * @return {boolean} error
 * @return {JSON-Object} incomingTicket
 */
function push(incomingTicket, incomingMapper, callback){
  console.log("Entered push function in Trello-Adapter.");

  init(incomingMapper, function(client){
      if(incomingMapper.source === "swisscom"){
        var ticketID = incomingTicket.swisscomID;
      }else{
        var ticketID = incomingTicket.partnerID;
      }
      console.log("TicketID: " + ticketID);

      if (ticketID !== null){
        transactionType = "Update";
      }else{
        transactionType = "New";
      }

      var member;
      client.get("/1/members/" + incomingTicket.source.toLowerCase(), function (err, data) {
        //console.dir("Member-Object: " + JSON.stringify(data));
        member = data.id;

        if(incomingTicket.transactionType === "Update") {

          console.log("Trello-Push-Function: updated card.");
          incomingTicket.transactionType === "Update";
          mapCommonSchemaToTrelloCard(incomingTicket, incomingMapper, member, function(trelloCard) {
          // console.log("Ticket-Status is update. Trellocard: " + JSON.stringify(trelloCard));
          var destinationID;
          if(incomingMapper.source==="swisscom"){
            destinationID = incomingTicket.swisscomID;
          }else{
            destinationID = incomingTicket.partnerID;
          }
          trelloCard = JSON.parse(JSON.stringify(trelloCard, null, 2, true));
          var ticketQuery = querystring.stringify(trelloCard);
 

          console.dir('https://api.trello.com/1/cards/' + destinationID + '?key=' + incomingMapper.sourceSystem.credentials.url + '&token='
              + incomingMapper.sourceSystem.credentials.token + '&' + ticketQuery);

          request.put('https://api.trello.com/1/cards/' + destinationID + '?key=' + incomingMapper.sourceSystem.credentials.url + '&token='
              + incomingMapper.sourceSystem.credentials.token + '&' + ticketQuery, function (error, response, body) {
            if (!error) {
              console.log(body)
            }
            console.dir("Destination-ID: " + destinationID);
           
            if(incomingMapper.source === "swisscom"){
              console.dir("Trello-DataID = SwisscomID.");
              incomingTicket.swisscomID = destinationID;
            }else{
              console.dir("Trello-DataID = PartnerID.");
              incomingTicket.partnerID = destinationID;
            }
            callback(false, incomingTicket);
          });
          });
        }else{
          console.log("Trello-Push-Function: new card.");
          incomingTicket.transactionType === "New";

          mapCommonSchemaToTrelloCard(incomingTicket, incomingMapper, member, function(trelloCard) {
           client.post("/1/cards", trelloCard, function(err, data) {
            if (err) throw err;

            console.dir("Data-ID: " + data.id);

            if(incomingMapper.source === "swisscom"){
            console.dir("Trello-DataID = SwisscomID.");
            incomingTicket.swisscomID = data.id;
            }else{
              console.dir("Trello-DataID = PartnerID.");
              incomingTicket.partnerID = data.id;
            }

            callback(false, incomingTicket);

            });
          });
        }
        });
        }); 
}   

/**
 * Is called when Webhook or URL-Target gets a query or information about an action in a subscribed Trello system,
 * it will then call methods to convert Trello card into the common schema and will then create a transaction through
 * the storage component.
 *
 * @param {JSON-Object} query
 * @param {JSON-Object} body
 * @param {JSON-Object} incomingMapper
 */ 
function pull(query, body, incomingMapper){
  if (body.action.type !== "deleteCard"){
	console.log("Entering pull-function of TrelloAdapter.");
  var destinationSystemId = body.action.data.card.id;
  console.log("DestinationSystemID: " + destinationSystemId);

  var transactionType = "";

  init(incomingMapper, function(client) {

    client.get("/1/cards/" + body.action.data.card.shortLink, function (err, data) {

      if (err) {
      console.error(err);
      return;
      }
      var trelloCard = data;
      
      var ticketToTest, destinationID;

      if(incomingMapper.source === "swisscom"){
        console.dir("Request-ID-Swisscom: " + data.id);
        adapter.requestTicket(data.id, null, function (body){
        ticketToTest = body;
        console.dir("TicketToTest is: " + JSON.stringify(ticketToTest));


          if(ticketToTest !== null){
            transactionType = "Update";
          }else{
            transactionType = "New";
          }

        console.dir("Transactiontype: " + transactionType);

        });
      }else{
        console.dir("Request-ID-Partner: " + data.id);

        adapter.requestTicket(null, data.id, function(body){
        ticketToTest = body;
        console.dir("TicketToTest is: " + ticketToTest);

        if(ticketToTest !== null){
            transactionType = "Update";
          }else{
            transactionType = "New";
          }

        console.dir("Transactiontype: " + transactionType);

        });
    }

      //check if a member has been assigned to the Trello-card.
      if (data.idMembers.length > 0){
        var subscriberID = data.idMembers[0];
        console.log("SubscriberID: " + subscriberID);
        client.get("/1/members/" + subscriberID, function (err, data) {
        /* 
        TODO: in Trello username of assignee has to be equal with their Subscriber-ID in our system.
        If not, implementation for another detection algorithm is required.
        */
        var targetMapperID = data.username.toUpperCase();
        console.dir("targetMapperID: " + targetMapperID);
        
        if (err) {
          console.error(err);
        }

        mapTrelloCardToCommonSchema(incomingMapper, trelloCard, targetMapperID, function(commonTicket) {
        commonTicket.transactionType = transactionType;
        if(ticketToTest !== null){
        commonTicket.swisscomID = ticketToTest[0].swisscomID;
        console.dir("SWISSCOM-ID: " + commonTicket.swisscomID);
        commonTicket.partnerID = ticketToTest[0].partnerID;
        console.dir("Partner-ID: " + commonTicket.swisscomID);
        }
        //console.log("Commonticket:" + JSON.stringify(commonTicket));
        adapter.createTransaction(commonTicket);
      });
      });
      }else{
        console.error("Error: No user is assigned to the corresponding card.");
      }
      });    
  });
}else{
  console.dir("Card has been deleted. No further action required.");
  return;
}
}

/**
 * Maps incoming common schema ticket to Trello card.
 *
 * @param {JSON-Object} incomingTicket
 * @param {JSON-Object} incomingMapper
 * @param {String} member
 * @param {function} callback
 * 
 * @return {JSON-Object} trelloCard
 */
function mapCommonSchemaToTrelloCard(incomingTicket, incomingMapper, member, callback){

    var externalID;
    //map commonSchema ticket data to zendesk-ticket
    if(incomingMapper.source === "swisscom"){
      externalID = incomingTicket.partnerID;
    }else{
      externalID = incomingTicket.swisscomID;
    }

    //TODO: read comments from common schema file
   
    //map common schema to Trello fields
    mapFieldsToTrello(incomingTicket, incomingMapper, function(lType, lStatus, lPriority){

    incomingTicket.source

    var trelloCard = {
      "name": incomingTicket.topic,
      "desc": incomingTicket.description,
      "closed": false,
      "idList": lStatus,
      "idBoard": "5417684179931e027c3d6bb9", //incomingMapper.sourceSystem.credentials.url, //TODO: read boardID from credentials.url (mapper has been wrongly implemented).
      "idMembers": [member],
      "url":"",
      "checkItemStates":[],
      //TODO: check badges-fields and map them
      "badges":{
			  "votes":0,
			  "fogbugz":"",
			  "checkItems":0,
			  "checkItemsChecked":0,
			  "comments":0,
			  "attachments":0,
			  "description":false,
        "due":null
		    },
        "labels":[]
    };
	callback(trelloCard);
    });
} 

/**
 * Maps incoming Trello card from a Trello system to the common ticket schema.
 *
 * @param {JSON-Object} incomingMapper
 * @param {JSON-Object} incomingTicket  
 * @param {String} targetMapperID
 * @param {function} callback
 *
 */
function mapTrelloCardToCommonSchema(incomingMapper, incomingTicket, targetMapperID, callback){
    var partnerID;
    var swisscomID;
    
    if(incomingMapper.source === "swisscom"){
      partnerID = incomingTicket.external_id;
      swisscomID = incomingTicket.id;
    }else{
      partnerID = incomingTicket.id;
      swisscomID = incomingTicket.external_id;
    }

    var commonTicket = {
      id : String,
      type : String,
      transactionType: String,
      topic : incomingTicket.name,
      description : incomingTicket.desc,
      //comment : commentArray,
      label : incomingTicket.labels,
      status : String,
      target : targetMapperID,
      source : incomingMapper.id,
      priority : String,
      // startDate : incomingTicket.created_at,
      // endDate : incomingTicket.due_at,
      lastModified : incomingTicket.dateLastActivity,
      partnerID : partnerID,
      swisscomID : swisscomID,
      processed : false
    }
    mapFieldsToCommon(incomingTicket, commonTicket, incomingMapper, callback);
  }

/**
 * Maps fields from common schema to someone's Trello system's schema.
 *
 * @param {JSON-Object} incomingTicket 
 * @param {JSON-Object} sourceMapper
 * @param {function} callback
 *
 * @return {String} type
 * @return {String} status
 * @return {String} priority
 */
function mapFieldsToTrello(incomingTicket, sourceMapper, callback){
  var type = "";
  var status = "";
  var priority = "";

  //Map ticket type
if(incomingTicket.type !== null){
  for(i = 0; i < sourceMapper.sourceSystem.mapping.ticketTypes.length; i++){
    if(incomingTicket.type === sourceMapper.sourceSystem.mapping.ticketTypes[i].common){
      type = sourceMapper.sourceSystem.mapping.ticketTypes[i].source;
      i = sourceMapper.sourceSystem.mapping.ticketTypes.length;
    }
  }
}
  //Map ticket status
  if(incomingTicket.status !== null){
  for(i = 0; i < sourceMapper.sourceSystem.mapping.ticketStatuses.length; i++){
    if(incomingTicket.status === sourceMapper.sourceSystem.mapping.ticketStatuses[i].common){
      status = sourceMapper.sourceSystem.mapping.ticketStatuses[i].source;
      i = sourceMapper.sourceSystem.mapping.ticketStatuses.length;
    }
  }
  }
  //Map ticket priority
  if(incomingTicket.priority !== null){
  for(i = 0; i < sourceMapper.sourceSystem.mapping.priorityStatuses.length; i++){
    if(incomingTicket.priority === sourceMapper.sourceSystem.mapping.priorityStatuses[i].common){
      priority = sourceMapper.sourceSystem.mapping.priorityStatuses[i].source;
      i = sourceMapper.sourceSystem.mapping.priorityStatuses.length;
    }
   }
  }
  callback(type, status, priority);
}

/**
 * Maps fields from someone's Trello system's schema to the common schema.
 *
 * @param {JSON-Object} trelloCard
 * @param {JSON-Object} commonTicket  
 * @param {JSON-Object} sourceMapper
 * @param {function} callback
 *
 * @return {JSON-Object} commonTicket
 */
function mapFieldsToCommon(trelloCard, commonTicket, sourceMapper, callback){

console.log("entered mapFieldsToCommon-Function."); 

//Map ticket types
// if(sourceMapper.sourceSystem.mapping.ticketTypes !== null){
//  for(i = 0; i < sourceMapper.sourceSystem.mapping.ticketTypes.length; i++){
//     if(trelloCard.XXX === sourceMapper.sourceSystem.mapping.ticketTypes[i].source){
//       commonTicket.type = sourceMapper.sourceSystem.mapping.ticketTypes[i].common;
//       i = sourceMapper.sourceSystem.mapping.ticketTypes.length;
//      }
//    }
// }else{
 commonTicket.type = "incident";
// }
  //Map ticket status
  if(sourceMapper.sourceSystem.mapping.ticketStatuses !== null){
  for(i = 0; i < sourceMapper.sourceSystem.mapping.ticketStatuses.length; i++){
    if(trelloCard.idList === sourceMapper.sourceSystem.mapping.ticketStatuses[i].source){
      commonTicket.status = sourceMapper.sourceSystem.mapping.ticketStatuses[i].common;
      i = sourceMapper.sourceSystem.mapping.ticketStatuses.length;
    }
  }
  }else{
  commonTicket.status = "working";
  }
 //Map ticket priority
  // if(sourceMapper.sourceSystem.mapping.priorityStatuses !== null){
  // for(i = 0; i < sourceMapper.sourceSystem.mapping.priorityStatuses.length; i++){
  //     if(trelloCard.priority === sourceMapper.sourceSystem.mapping.priorityStatuses[i].source){
  //       commonTicket.priority = sourceMapper.sourceSystem.mapping.priorityStatuses[i].common;
  //       i = sourceMapper.sourceSystem.mapping.priorityStatuses.length;
  //     }
  //   }
  // }else{
      commonTicket.priority = "standard";
    // } 
  callback(commonTicket);
  console.log("exit mapFieldsToCommon-Function.");
}

exports.pull = pull;
exports.push = push;