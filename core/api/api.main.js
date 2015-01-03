

var fs 			= require( 'fs' ),
	path		= require( 'path' ),
	API			= require( './api'),

	apiRoot		= Core.config.globals.apiRoot;

if( !fs.existsSync( apiRoot ) )
	Core.error( "API folder is missing at " + apiRoot, true );

// Private
//----------

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
	var docsPath = path.join( path.sep + Core.config.globals.apiName, Core.config.globals.apiDocsPath );

	Core.app.get( docsPath, function( req, res ){
		res.json( API.success( API.getDocs() ) );
	});
};

var loadErrorRoutes = function(){

	Core.app.use(function(err, req, res, next) {
		console.log( "500", err );

		if( Core.config.globals.viewRoot )
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

	if( Core.config.globals.exposeDocs )
		loadDocs();

	loadAPI();

	loadErrorRoutes();
};

module.exports.services 	= API.getServices();
module.exports.subscribers 	= API.getSubscribers();