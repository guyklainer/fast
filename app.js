
var http 		= require( 'http' ),
	path		= require( "path"),
	CoreModule 	= require( './core/core' );

/**
 * Init App.
 */
Core = CoreModule( path.join( __dirname, "core" ) );

CoreModule.load( function(){

	var config = Core.config.settings;

	Core.environment.load();
	Core.config.load();
	Core.auth.load();
	Core.api.load();
	Core.view.load();

	http.createServer( Core.app ).listen( config.port, function(){
		console.log( 'Server listening on port ' + config.port );
	});
});


