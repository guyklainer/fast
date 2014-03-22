
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
	"/:id" 	: { method : "get", service : "getByID" },
	"/"  	: { method : "get", service : "service" }
};

module.exports.privileges = {
	"service" : 0,
	"getByID" : 1
};

module.exports.getByID = function( req, res ){
	console.log( req.params.id );
};

module.exports.service = function( req, res ){
	setTimeout( function(){
		Core.orm.targeting.update( options )

		res.success( "done", req );
	}, 1000 );
};