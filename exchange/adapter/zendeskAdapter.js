var zd = require('node-zendesk');
var adapter = require('./adapter');
var transactionType;

/**
 * Initializes the client from the node-zendesk library to create an OAuth-Connection with the credentials provided in the corresponding mapper-file.
 *
 * @param {JSON-Object} lMapper
 * @param {function} callback
 *
 * @return {JSON-Object} client
 */
function init(lMapper, callback){
    console.log("Entered Zendesk-init function.");

    var client = zd.createClient({
    username : lMapper.sourceSystem.credentials.user,
    token : lMapper.sourceSystem.credentials.token,
    remoteUri : lMapper.sourceSystem.credentials.url
    })
    callback(client);
  }

/**
 * Is called when a common schema ticket has to be published into a subscribed Zendesk system. It calls the methods to convert the common schema ticket into a 
 * Zendesk ticket and pushes it into the target system. In the end it will create a transaction through the storage component.
 *
 * @param {JSON-Object} incomingTicket
 * @param {JSON-Object} targetMapper
 * @param {function} callback
 *
 * @return {boolean} error
 * @return {JSON-Object} incomingTicket
 */
function push(incomingTicket, targetMapper, callback){
  console.dir("Entered push function in ZenDesk adapter.");

    init(targetMapper, function(client){


      //read out requester-ID from ZenDesk-Instance with the subscriber-name being equal to the requester-username
      client.users.list(function (err, req, result) {
         if (err) {
          console.log(err);
        return;
          }

          var requesterID;
          for(i = 0; i < result.length; i++){
            if(result[i].name == incomingTicket.source){
            requesterID = result[i].id;

          }
         }

      mapCommonSchemaToZenDeskTicket(incomingTicket, targetMapper, requesterID, function(zendeskTicket) {
        if(incomingTicket.transactionType === "New"){
          console.dir("RequesterID zum Zweiten: " + requesterID);

          zendeskTicket = JSON.parse(JSON.stringify(zendeskTicket, null, 2, true));

          client.tickets.create(zendeskTicket, function(err, req, result) {
          if (err) {
            console.dir(err);
            return;
          }
          if(targetMapper.source === "swisscom"){
             // console.dir("Swisscom-Mapper.");
              //console.dir("ResultID im ZendeskAdapter: " + result.id);
              incomingTicket.swisscomID = result.id;
            }else{
              console.dir("Partner-Mapper.");
              console.dir("ResultID im ZendeskAdapter: " + result.id);
              incomingTicket.partnerID = result.id;
            }
          callback(false, incomingTicket);
        });
        }else{
          var destinationID;
          if(targetMapper.source==="swisscom"){
            destinationID = incomingTicket.swisscomID;
          }else{
            destinationID = incomingTicket.partnerID;
          }

          console.dir("RequesterID zum Zweiten: " + requesterID);

          zendeskTicket = JSON.parse(JSON.stringify(zendeskTicket, null, 2, true));

          console.dir("Trying to make Ticket-Update in Zendesk-Push-Function.");
          console.dir("ZD-Ticket: " + zendeskTicket);

          console.dir("DestinationID: " + destinationID);

          client.tickets.update(destinationID, zendeskTicket, function(err, req, result) {
          if (err) {
            console.dir(err);
            return;
         }
                callback(false, incomingTicket);
        });
        }

        }); 

      });
    });
}

/**
 * Is called when Webhook or URL-Target gets a query or information about an action in a subscribed Zendesk system,
 * it will then call methods to convert Zendesk-Ticket into the common schema and will then create a transaction through
 * the storage component.
 *
 * @param {JSON-Object} query
 * @param {JSON-Object} mapperFile
 */ 
function pull(query, mapperFile){
    console.log("Entered Zendesk-pull function.");

    init(mapperFile, function(client) {
    client.tickets.show(query.id, function (err, req, result) {
      var ticket = result;
      if (err) {
      console.dir(err);
      return;
      }
      
       client.tickets.getComments(query.id, function (err, req, result){
         if(!err){

         if (result !== null) {
           var commentArray = [];
           for (i = 0; i < result[0].comments.length; i++) {
             commentArray.push({
              //id: result[0].comments[i].id,
              body: result[0].comments[i].body
             });
           //console.dir("This is the comments' body: " + result[0].comments[i].body + " from comment # " + i);
           } 
         }  
         }
        var subscriberID = ticket.requester_id;
        console.dir("subscriberID aus Zendesk: " + subscriberID);
        
        client.users.show(subscriberID, function (err, req, res) {
             /* 
              In Trello username of assignee has to be equal with their Subscriber-ID in our system.
              If not, implementation for another detection algorithm is required.
             */
             console.dir("REQ-File: " + JSON.stringify(req));
            console.dir("RES-File: " + JSON.stringify(res));

            var targetMapperID = res.name;
               if (err) {
                console.dir(err);
              }
         mapZenDeskTicketToCommonSchema(mapperFile, ticket, commentArray, targetMapperID, function(commonTicket) {

          


      commonTicket.transactionType = query.type;
      adapter.createTransaction(commonTicket);
      });
      });    
  });
  });
});
}

/**
 * Maps incoming common schema ticket to Zendesk ticket.
 *
 * @param {JSON-Object} incomingTicket
 * @param {JSON-Object} incomingMapper
 * @param {String} requesterID
 * @param {function} callback
 * 
 * @return {JSON-Object} zendeskTicket
 */
function mapCommonSchemaToZenDeskTicket(incomingTicket, incomingMapper, requesterID, callback) {
  var externalID;
  console.log("entered functino mapCommonSchemaToZenDeskTicket");

  if(incomingMapper.source === "swisscom"){
    externalID = incomingTicket.partnerID;
  }else{
    externalID = incomingTicket.swisscomID;
  }

  var commentArray = [];

  // TODO: uncomment if comments are mapped.

  // var commentArray = [];
  //        for (i = 0; i < incomingTicket.comment.length; i++) {
  //          commentArray.push(
  //           {"body": incomingTicket.comment[i].body}
  //          );
  //        }

  mapFieldsToZenDesk(incomingTicket, incomingMapper, function(lType, lStatus, lPriority){
    console.dir("Requester: " + incomingTicket.source);
        console.dir("Requester: " + incomingTicket.source);
        
        if(incomingTicket.topic !== null){
          var topic = incomingTicket.topic;
        }else{
          var topic = "No topic entered.";
        }

        if(incomingTicket.description !== null){
          var description = incomingTicket.description;
        }else{
          var description = "No description entered.";
        }
        
    // TODO: Map comments!
    var zendeskTicket = {
      "ticket" : {
        "external_id":      externalID,
        "requester_id":     requesterID, 
        "created_at":       incomingTicket.startDate,
        "updated_at":       incomingTicket.lastModificationDate,
        "type":             lType,
        "subject":          unescape(incomingTicket.topic),
        "description":      unescape(description),
        "priority":         lPriority,
        "status":           lStatus,
        //"comment":          {"type":      "Comment", "body":      "Test comment from Zendesk #1!",  "public":    true},//[{"body": "First comment Fix", "public": true}, {"body": "Second comment Fix", "public": true}],
        "due_at":           incomingTicket.endDate,
        "tags":             [incomingTicket.label]
      }     
    };

    console.dir("ZendeskTicket: " + JSON.stringify(zendeskTicket));
    console.dir("Unescape Description: " + unescape(incomingTicket.description));
    console.dir("Unescape Topic: " + unescape(incomingTicket.topic));

    callback(zendeskTicket);
    });
}

/**
 * Maps incoming Zendesk ticket from a Zendesk system to the common ticket schema.
 *
 * @param {JSON-Object} lMapperFile
 * @param {JSON-Object} result
 * @param {Array} commentArray  
 * @param {String} targetMapperID
 * @param {function} callback
 */
//TODO: include commentArray as Parameter instead of []
function mapZenDeskTicketToCommonSchema(lMapperFile, result, commentArray, targetMapperID, callback) {
    console.log("Entered mapZenDeskTicketToCommonSchema function.");

    var partnerID;
    var swisscomID;
    console.dir("Requester is: " + targetMapperID);

    if(lMapperFile.source === "swisscom"){
      partnerID = result.external_id;
      swisscomID = result.id;
    }else{
      partnerID = result.id;
      swisscomID = result.external_id;
    }

    //map common schema ticket data to Zendesk-ticket
    var commonTicket = {
      id : String,
      type : String,
      transactionType: transactionType,
      topic : result.subject,
      description : result.description,
      comment : commentArray,
      label : result.tags,
      status : String,
      target : targetMapperID,
      source : lMapperFile.id,
      priority : String,
      startDate : result.created_at,
      endDate : result.due_at,
      lastModified : result.updated_at,
      partnerID : partnerID,
      swisscomID : swisscomID,
      processed : false
    }
    mapFieldsToCommon(result, commonTicket, lMapperFile, callback);
}

/**
 * Maps fields from someone's Zendesk system's schema to the common schema.
 *
 * @param {JSON-Object} zTicket
 * @param {JSON-Object} commonTicket  
 * @param {JSON-Object} sourceMapper
 * @param {function} callback
 *
 * @return {JSON-Object} commonTicket
 */

 function mapFieldsToCommon(zTicket, commonTicket, sourceMapper, callback){
  var type = "incident";
  var status = "open";
  var priority = "normal";

  //Map ticket type
    console.log("Entered mapFieldsToCommon function.");
    if(commonTicket.type !== null){
  for(i = 0; i < sourceMapper.sourceSystem.mapping.ticketTypes.length; i++){
    if(zTicket.type === sourceMapper.sourceSystem.mapping.ticketTypes[i].source){
      commonTicket.type = sourceMapper.sourceSystem.mapping.ticketTypes[i].common;
      i = sourceMapper.sourceSystem.mapping.ticketTypes.length;
    }
  }
}
  //Map ticket status
  if(commonTicket.status !== null){
  for(i = 0; i < sourceMapper.sourceSystem.mapping.ticketStatuses.length; i++){
    if(zTicket.status === sourceMapper.sourceSystem.mapping.ticketStatuses[i].source){
      commonTicket.status = sourceMapper.sourceSystem.mapping.ticketStatuses[i].common;
      i = sourceMapper.sourceSystem.mapping.ticketStatuses.length;
    }
  }
}
  //Map ticket priority
    if(commonTicket.priority !== null){
for(i = 0; i < sourceMapper.sourceSystem.mapping.priorityStatuses.length; i++){
    if(zTicket.priority === sourceMapper.sourceSystem.mapping.priorityStatuses[i].source){
      commonTicket.priority = sourceMapper.sourceSystem.mapping.priorityStatuses[i].common;
      i = sourceMapper.sourceSystem.mapping.priorityStatuses.length;
    }
  }
}
  callback(commonTicket);
}


/**
 * Maps fields from common schema to someone's Zendesk system's schema.
 *
 * @param {JSON-Object} incomingTicket 
 * @param {JSON-Object} sourceMapper
 * @param {function} callback
 *
 * @return {String} type
 * @return {String} status
 * @return {String} priority
 */
 //TODO Map labels of ticket!
function mapFieldsToZenDesk(incomingTicket, sourceMapper, callback){
  var type = "incident";
  var status = "open";
  var priority = "normal";

  console.log("Entered mapFieldsToZenDesk function.");
  console.log("sourceMapper:" + sourceMapper)
  console.log("Tickettype: " + incomingTicket.type);
  console.log("Ticketstatus: " + incomingTicket.status);
  console.log("Ticketpriority: " + incomingTicket.priority);

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
  console.log("Tickettype: " + type);
  console.log("Ticketstatus: " + status);
  console.log("Ticketpriority: " + priority);

  callback(type, status, priority);
}

exports.push = push;
exports.pull = pull;