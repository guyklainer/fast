
var fs 			= require( 'fs' ),
	express		= require( 'express' ),
	_			= require( 'underscore' ),
	path 		= require('path' );

var data = {};

// Static Class Core
//----------
function Core( dir ){

	Core.modulesPath = dir;

	Core.modules = {
		app		: express(),
		error	: error
	};

	return Core.modules;
}

Core.lock = function(){

	for( var key in Core.modules )
		if( Core.modules.hasOwnProperty( key ) )
			Object.freeze( Core.modules[key] );

	Object.freeze( Core.modules );

};

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

			else
				Core.error( mainFile + ".js is missing", true );
		}
	});

	if( callback )
		callback();
};

Core.loadConfig = function( options ){
	var configPath = path.join( Core.modulesPath, "config" );

	if( fs.existsSync( configPath ) ) {

		Core.modules.config = require( path.join( configPath, "config.main" ) );
		_.extend( Core.modules.config.globals, options );

	} else
		error( "Config is missing", true );

};

var error = function( msg, fatal ){
	console.log( new Error( msg.toString().red ).stack.red );

	if( fatal )
		process.exit(1);
};

module.exports = Core;