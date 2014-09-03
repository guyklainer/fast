
var Fast  	= require( 'fast-api' ),
	config 	= require( './config' );

var TalksServer = Fast.createServer( config.fast );

TalksServer.listen( config.app.port );

