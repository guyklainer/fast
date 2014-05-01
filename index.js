
var http 		= require( "http" ),
	path		= require( "path" ),
	color 		= require( "colors" ),
	CoreModule 	= require( './core/core' );

var coreLoaded 	= false;

// Main Class
var Fast = function( options ){

	Core = CoreModule( path.join( __dirname, "core" ) );

	CoreModule.load( options || {}, function(){

		Core.environment.load();
		Core.config.load();
		Core.auth.load();
		Core.api.load();
		Core.view.load();

		coreLoaded = true;
	});

	return {
		listen : listen
	};
};

var listen = function( port, callback ){
	while( !coreLoaded ){}

	if( typeof port == "function" || !port || isNaN( port ) ) {
		callback 	= port;
		port 		= Core.config.globals.port;

	} else
		Core.config.globals.port = port;

	if( !callback ){
		callback = function(){
			console.log( 'Fast is running...'.green );
			console.log( 'Listening on port '.cyan + port.toString().cyan );
		}
	}

	http.createServer( Core.app ).listen( port, callback );
};

module.exports.createServer = Fast;
module.exports.listen 		= listen;