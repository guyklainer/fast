var path 	= require( "path" ),
	fs 		= require( "fs" ),
	modules	= {};

module.exports.load = function( location ){

	var root  	= path.join( Core.config.globals.root, location ),
		stats 	= fs.lstatSync( root );

	if( !stats.isDirectory() )
		return;

	fs.readdirSync( root ).forEach( function ( file ){

		var currentLocation = path.join( root, file );

		file = file.replace( ".js", "" );

		modules[ file ] = require( currentLocation );
	});
};

module.exports.modules = modules;