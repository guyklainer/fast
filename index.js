
var http 		= require( "http" ),
	path		= require( "path" ),
	color 		= require( "colors" ),
	Q			= require( "q" ),
	CoreModule 	= require( './core/core' );

var deferred 	= Q.defer(),
	loadPromise = deferred.promise;


// Main Class
var Fast = function( options ){

	console.log( '\n----------------------------'.yellow );
	console.log( 'Preparing everything...'.yellow );

	Core = CoreModule( path.join( __dirname, "core" ) );

	CoreModule.load( options || {}, function(){

		Core.environment.load();
		Core.config.load();
		Core.auth.load();
		Core.api.load();
		Core.view.load();

		Core.api = Core.api.services;

		// Make Core object immutable
		// Preventing malicious altering
		CoreModule.lock();

		deferred.resolve();
	});

	return {
		listen : listen
	};
};

var listen = function( port, callback ){

	loadPromise.then( function(){

		if( typeof port == "function" || !port || isNaN( port ) ) {
			callback 	= port;
			port 		= Core.config.globals.port;

		} else
			Core.config.globals.port = port;

		if( !callback ){
			callback = function(){
				console.log( 'Success!'.green );
				console.log( '\nFast is running on port '.cyan + port.toString().cyan );
				console.log( '\nAPI root folder path is '.cyan + Core.config.globals.apiRoot.cyan );
				console.log( '----------------------------\n'.yellow );
			}
		}

		if( Core.config.globals.useSSL ){
			if( Core.config.globals.SSLKeys && Core.config.globals.SSLKeys.key && Core.config.globals.SSLKeys.cert )
				https.createServer( Core.config.globals.SSLKeys, Core.app ).listen( port, callback );
			else
				Core.error( "SSL keys are missing", true );

		} else
			http.createServer( Core.app ).listen( port, callback );
	});
};

module.exports.createServer = Fast;
module.exports.listen 		= listen;