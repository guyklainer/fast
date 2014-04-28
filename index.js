
var http 		= require( "http" ),
	path		= require( "path" ),
	color 		= require( "colors" ),
	CoreModule 	= require( './core/core' );

// Main Class
var Rapid = function( options ){

	Core = CoreModule( path.join( __dirname, "core" ) );

	CoreModule.load( options || {}, function(){

		var config = Core.config.globals;

		Core.environment.load();
		Core.config.load();
		Core.auth.load();
		Core.api.load();
		Core.view.load();

		http.createServer( Core.app ).listen( config.port, function(){
			console.log( 'Rapid is running...'.green );
			console.log( 'Listening on port '.cyan + config.port.toString().cyan );
		});
	});

	return Core;
};

exports = module.exports = Rapid;