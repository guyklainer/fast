

var fs 			= require( 'fs' ),
	path		= require( 'path' ),
	View		= require( './view' ),
	viewRoot	= Core.config.globals.viewRoot,

	viewsToSkip = [ 'interface', 'home' ];


// Public
//----------
module.exports.load = function( location ){

	var root = location ? location : viewRoot;

	fs.readdirSync( root ).forEach( function ( view ){

		if( viewsToSkip.indexOf( view ) != -1 )
			return;

		var currentLocation = path.join( root, view ),
			stats 			= fs.lstatSync( currentLocation ),
			indexExist		= fs.existsSync( path.join( currentLocation, View.indexFile ) );

		if( stats.isDirectory() ){
			if( indexExist )
				new View( currentLocation, view );

			else
				module.exports.load( currentLocation );

		}
	});
};