
/**
 * Module dependencies.
 */

var express 	= require( 'express' ),
	http 		= require( 'http');

/**
 * Init App.
 */
Core 		= require( './core/core' );
Core.app	= express();

Core.load( function(){
	var config	= Core.config.settings;

	Core.environment.load();
	Core.config.load();
	Core.auth.load();
	Core.api.load();
	Core.view.load();


	var x = require( "./models/some_model");
	new x();
//	var resA = Core.api.service( 'service_a/file_a' );
//	resA.then( console.log );

	http.createServer( Core.app ).listen( config.port, function(){
		console.log( 'Express server listening on port ' + config.port );
	});
});


