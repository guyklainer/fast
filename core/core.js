
var fs 			= require( 'fs' ),
	express		= require( 'express' ),
	_			= require( 'underscore' ),
	path 		= require('path' );


// Static Class Core
//----------
function Core( dir ){

	Core.modulesPath = dir;

	Core.modules = {
		app	: express()
	};

	return Core.modules;
}

Core.load = function( options, callback ){

	Core.loadConfig( options );

	fs.readdirSync( Core.modulesPath ).forEach( function ( corePath ){
		if( corePath == "config" )
			return;

		var stats = fs.lstatSync( path.join( Core.modulesPath, corePath ) );

		if( stats.isDirectory() ){
			var mainFile = path.join( Core.modulesPath , corePath, corePath + ".main" );

			if( fs.existsSync( mainFile + ".js" ) )
				Core.modules[corePath] = require( mainFile );

			else {
				console.log( new Error( mainFile + ".js is missing" ).stack );
				process.exit(1);
			}
		}
	});

	if( callback )
		callback();
};

Core.loadConfig = function( options ){
	var configPath = path.join( Core.modulesPath, "config" );

	if( fs.existsSync( path.join( Core.modulesPath, "config" ) ) ) {

		Core.modules.config = require(path.join(configPath, "config.main"));
		_.extend( Core.modules.config.globals, options );

	} else {
		console.log( new Error( "Config is missing" ).stack );
		process.exit(1);
	}

};

module.exports = Core;