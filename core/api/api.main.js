

var fs 			= require( 'fs' ),
	path		= require( 'path' ),
	http 		= require( 'http' ),
	API			= require( './api'),

	response 	= http.OutgoingMessage.prototype,
	apiRoot		= Core.config.globals.apiRoot;

if( !fs.existsSync( apiRoot ) )
	Core.error( "API folder is missing at " + apiRoot, true );

// Private
//----------
var prepareReqResOnjects = function(){

	if( response.success || response.error )
		Core.error( "possible conflict in response object", true );

	response.success 	= success;
	response.error 		= Core.environment.error;
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

var loadErrorRoutes = function(){

	Core.app.use(function(err, req, res, next) {
		console.log( "500", err );
		res.render('500', {
			status: err.status || 500,
			error: err
		});
	});

	Core.app.use(function(req, res, next) {
		console.log( "404", req.url );
		res.end( "Not Found" );
//		res.render('404', {
//			status: 404,
//			url: req.url
//		});
	});
};

// Public
//----------
module.exports.load = function(){

	prepareReqResOnjects();

	if( Core.config.globals.exposeDocs )
		loadDocs();

	loadAPI();

	loadErrorRoutes();
};

module.exports.services = API.getServices();