

var fs 			= require( 'fs' ),
	path		= require( 'path' ),
	http 		= require( 'http' ),
	response 	= http.OutgoingMessage.prototype,
	request 	= http.IncomingMessage.prototype,
	Q 			= require( "q" ),
	apiRoot		= path.join( __dirname, "..", "..", "api"),
	App 		= Core.app;

// Class API
//----------
function API( location ){

	this.uri 		= path.join( "/api", location.replace( apiRoot, "" ) ).replace( ".js", "" );
	this.location	= location;

	this.getRoutes();
}

API.prototype.getRoutes = function(){
	var routes = require( this.location ).routes;

	if( !routes )
		routes = { "/" : { method : "get", service : "service" } };

	for( var key in routes )
		if( routes.hasOwnProperty( key ) )
			this.addRoute( key, routes[ key ] );
};

API.prototype.addRoute = function( key, route ){
	var routhPath 	= this.uri,
		method 		= route.method  || "get",
		service 	= route.service || "service",
		privileges 	= require( this.location ).privileges,
		that 		= this;

	if( key != "/" )
		routhPath = path.join( routhPath, key );

	App[ method ]( routhPath, function( req, res ){
		if( Core.auth.ensureAuthenticated( req, service, privileges ) ){

			req.deferred = Q.defer();

			require( that.location )[ service ]( req, res );

			req.deferred.promise.then( function( data ){
				res.json( data );
			});

		} else
			res.send( "401", "Unauthorized" );
	});
};

// Private
//----------
var prepareReqResOnjects = function(){

	if( !response.success && !response.error ){
		response.success = success;
		response.error 	 = error;
	}
};

var success = function( data, req ){
	var result = {
		status  : 1,
		content : data,
		errors 	: []
	};

	if( req && req.deferred )
		req.deferred.resolve( result );

	else
		return result;
};

var error = function( data, req ){
	var result = {
		status  : 0,
		content : [],
		errors 	: data
	};

	if( req && req.deferred )
		req.deferred.resolve( result );

	else
		return result;
};

// Public
//----------
module.exports.load = function( location ){

	var root = location ? location : apiRoot;

	prepareReqResOnjects();

	fs.readdirSync( root ).forEach( function ( file ){

		var currentLocation = path.join( root, file ),
			stats 			= fs.lstatSync( currentLocation );

		if( stats.isDirectory() )
			module.exports.load( currentLocation );

		else
			new API( currentLocation );
	});
};

module.exports.service = function( location, req, res, next ){
	var deferred = Q.defer();

	require( path.join( apiRoot, location ) ).service( req, res, deferred );

	return deferred.promise;
};