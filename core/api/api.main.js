

var fs 			= require( 'fs' ),
	path		= require( 'path' ),
	http 		= require( 'http' ),
	API			= require( './api' ),

	response 	= http.OutgoingMessage.prototype,
	apiRoot		= Core.config.globals.apiRoot;

// Private
//----------
var prepareReqResOnjects = function(){

	if( success in response || error in response )
		Core.error( "possible conflict in response object", true );

	response.success 	= success;
	response.error 		= error;
};

var success = function( data ){

	var result = {
		status  : 1,
		content : data,
		errors 	: []
	};

	if( this instanceof http.OutgoingMessage && this.deferred )
		this.deferred.resolve( result );

	else
		return result;
};

var error = function( data, code ){
	var result = {
		status  : 0,
		content : [],
		errors 	: data
	};

	if( this instanceof http.OutgoingMessage )
		this.json( code || "500", result );

	else
		return result;
};

var loadAPI = function( location ){
	var root = location ? location : apiRoot;

	fs.readdirSync( root ).forEach( function ( file ){

		var currentLocation = path.join( root, file ),
			stats 			= fs.lstatSync( currentLocation );

		if( stats.isDirectory() )
			loadAPI( currentLocation );

		else
			new API( currentLocation );
	});
};

var loadDocs = function(){
	var docsPath = path.join( Core.config.globals.apiURIPrefix, Core.config.globals.apiDocsPath );

	Core.app.get( docsPath, function( req, res ){
		res.json( res.success( API.getDocs() ) );
	});
};

// Public
//----------
module.exports.load = function(){

	prepareReqResOnjects();

	if( Core.config.globals.exposeDocs )
		loadDocs();

	loadAPI();
};