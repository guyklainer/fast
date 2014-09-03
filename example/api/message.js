
module.exports.subscribers = {

	"get_private"  	: {
		summery 	: "Get Messages of Private Talk",
		parameters 	: [
			{ name 		: "sender_id", 		description : "Sender ID", 		required : true, dataType : "string", allowMultiple : false },
			{ name 		: "receiver_id", 	description : "Receiver ID", 	required : true, dataType : "string", allowMultiple : false }
		],

		service 	: "getPrivateMessages"
	},

	"set_private"  	: {
		summery 	: "Set Private Message",
		parameters 	: [
			{ name 		: "receiver_id",	description : "Receiver ID", 	required : true, dataType : "string", allowMultiple : false },
			{ name 		: "sender_id",	 	description : "Sender ID", 		required : true, dataType : "string", allowMultiple : false },
			{ name 		: "media_type",	 	description : "Media Type", 	required : true, dataType : "number", allowMultiple : false },
			{ name 		: "content",	 	description : "Content", 		required : true, dataType : "string", allowMultiple : false },
			{ name 		: "balloon_color",	description : "Balloon Color", 	required : false, dataType : "string", allowMultiple : false },
			{ name 		: "text_color",		description : "Text Color", 	required : false, dataType : "string", allowMultiple : false }
		],

		service 	: "setPrivateMessages"
	}
};

module.exports.privileges = {
	"service" : 0,
	"getByID" : 1
};

module.exports.getPrivateMessages = function( req, res ){
	return Core.models.message.getPrivateMessages( req.body.sender_id, req.body.receiver_id );
};

module.exports.setPrivateMessages = function( req, res ){
	req.body.timestamp 	= Core.date.unix();
	req.body.sent 		= 1;
	req.body.received 	= 0;
	req.body.likes 		= [];

	Core.models.message.setPrivate( req.body ).then( res.success, res.error );

	if( req.isSocket ){
		var sender 		= Core.socket.getSocket( req.body.sender_id ),
			receiver 	= Core.socket.getSocket( req.body.receiver_id );

		sender.broadcast.to( receiver ).emit( "message", req.body );
	}
};