var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

// Compile a 'Transaction' model using the transactionSchema as the structure. This model is used to save the data to keep track of all the transactions.
var transactionSchema = new Schema ({
			id : String,
			transactionType: String,
			type : String,
			topic : String,
			description : String,
			comment: [{
    			body : String
    		}],
			label : String,
			status : String,
			target : String,
			source : String,
			priority : String,
			startDate : String,
			endDate : String,
			lastModified : String,
			partnerID : String,
			swisscomID : String,
			processed : Boolean,
			claimed : Boolean
}); 

mongoose.model('Transaction', transactionSchema);

var counterSchema = new Schema ({
	id : String,
	seq : String
});

mongoose.model('Counter', counterSchema);

var ticketSchema = new Schema ({
			id : String,
			transactionType: String,
			type : String,
			topic : String,
			description : String,
			comment: [{
    			body : String
    		}],
			label : String,
			status : String,
			target : String,
			source : String,
			priority : String,
			startDate : String,
			endDate : String,
			lastModified : String,
			partnerID : String,
			swisscomID : String,
			processed : Boolean,
			claimed : Boolean
}); 
mongoose.model('Ticket', ticketSchema);

// Compile a 'Mapper' model using the mapperSchema as the structure. This model is used to save the partner and system specific information such as API-Token, URL and mapping spe
var mapperSchema = new Schema ({
	id : {
		type : String
	},
	source : String,
	sourceSystem : {
		name : String,
		Defect : {
			subscribed : Boolean,
			name : String
		},
		Roadmap : {
			subscribed : Boolean,
			name : String
		},
		CustomerIndividual : {
			subscribed : Boolean,
			name : String
		},
		credentials : {
			token : String,
			user : String,
			password : String,
			url : String
		},
		mapping : {
			ticketStatuses : [
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},				
			],
			priorityStatuses : [
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				}
			],
			labelTypes : [
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				}
			],
			ticketTypes : [
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				},
				{
					common : String,
					source : String
				}
			]
		}
	}
});
mongoose.model('Mapper', mapperSchema);




// Connect to MongoDB service in the Swisscom Cloud Foundry infrastructure
var boundServices = process.env.VCAP_SERVICES 
  ? JSON.parse(process.env.VCAP_SERVICES) : null;

if(process.env.VCAP_SERVICES){
	mongoose.connect(boundServices['mongodb-2.2'][0]['credentials'].url);
}