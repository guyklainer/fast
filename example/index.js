
var Fast  	= require( 'fast-api' ),
	config 	= require( './config' );

var ExampleServer = Fast.createServer( config.fast );

ExampleServer.listen( config.app.port );

