
var http 		= require( "http" ),
	path		= require( "path" ),
	color 		= require( "colors" ),
	Q			= require( "q" ),
	fs			= require( "fs" ),
	socketIO 	= require( "socket.io" ),
	CoreModule 	= require( "./core/core" );

var deferred 	= Q.defer(),
	loadPromise = deferred.promise;


// Main Class
var Fast = function( options ){

	console.log( '\n----------------------------'.yellow );
	console.log( 'Preparing everything...'.yellow );

	Core = CoreModule( path.join( __dirname, "core" ) );

	CoreModule.load( options || {}, function(){

		modulesLoader();

		// Make Core object immutable
		// Preventing malicious altering
		CoreModule.lock();

		deferred.resolve();
	});

	return {
		listen : listen
	};
};

var modulesLoader = function(){
	var extraModules = Core.config.globals.extraModules;

	Core.environment.load();
	Core.db.load();
	Core.config.load();
	Core.auth.load();
	Core.api.load();

	if( fs.existsSync( Core.config.globals.viewRoot ) )
		Core.view.load();

	if( extraModules && !Core[ extraModules ] && fs.existsSync( extraModules ) ) {
		Core.modules.load( extraModules );
		Core[extraModules] = Core.modules.modules;
	}

	Core.subscribers 	= Core.api.subscribers;
	Core.api 			= Core.api.services;
	Core.db 			= Core.db.connections;

};

var listen = function( port, callback ){

	var server,
		io;

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
				server = https.createServer( Core.config.globals.SSLKeys, Core.app );
			else
				Core.error( "SSL keys are missing", true );

		} else {
			server = http.createServer( Core.app );
		}

		if( server ){
			if( Core.config.globals.enableWebSocket ){
				io = socketIO.listen( server, { log: Core.config.globals.environment != "production" } );

				Core.socket.listenForConnections( io, Core.subscribers );
			}

			server.listen( port, callback );
		}
	});
};

module.exports.createServer = Fast;
module.exports.listen 		= listen;