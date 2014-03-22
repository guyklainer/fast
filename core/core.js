
var fs 			= require( 'fs'),
	path 		= require('path');

module.exports.load = function( callback ){

	fs.readdirSync( __dirname ).forEach( function ( file ){

		var stats = fs.lstatSync( path.join( __dirname, file ) );

		if( stats.isDirectory() )
			module.exports[file] = require( path.join( __dirname , file, file + ".main" ) );
	});

	if( callback )
		callback();
};