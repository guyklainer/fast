
/* Default: ( But you can override this as your desire )
 ----------
module.exports.routes = {
	"/" : { method : "get", service : "service" }
};

 module.exports.privileges = {
 	0 	: [ ALL_METHODS ]
 };

*/

module.exports.routes = {
	"/"  	: {
		summery 	: "Get list",
		httpMethod 	: "get",
		parameters 	:[
			{
				name 			: "username",
				description 	: "User Name",
				required 		: true,
				dataType 		: "string",
				allowMultiple 	: true,
				paramType 		: "query"
			},
			{
				name 			: "id",
				description 	: "User ID",
				required 		: false,
				dataType 		: "number",
				allowMultiple 	: false,
				paramType 		: "path"
			}
		],

		service 	: "service"
	},

	"/:id" 	: {
		summery 	: "Get list by ID",
		httpMethod 	: "get",
		parameters	: [
			{ name : "id", description : "User ID", required : true, dataType : "number", allowMultiple : false, paramType : "path" }
		],

		service 	: "getByID"
	}
};

module.exports.privileges = {
	"service" : 0,
	"getByID" : 1
};

module.exports.getByID = function( req, res ){
	console.log( req.params.id );
};

module.exports.service = function( req, res ){
	res.success( "done" );
};