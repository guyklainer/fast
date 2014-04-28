
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
	"/"  	: { httpMethod : "get", service : "service" }
};

module.exports.privileges = {
	"service" : 0,
	"getByID" : 1
};

module.exports.service = function( req, res ){
//	res.deferred.resolve( Core.api.getDocs() );
};