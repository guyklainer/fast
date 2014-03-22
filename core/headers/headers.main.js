
var fs 			= require( 'fs' ),
	path 		= require( 'path' ),
	express 	= require( 'express' );

// Class Headers
//--------------


function Headers( location ){

	this.headers = {
		js 	: [],
		css : []
	};

	this.location 		= location;
	this.uiPath 		= path.join( location, Core.config.globals.publicFolder );
	this.headersPath 	= path.join( this.uiPath, Core.config.globals.headersFolder );
	this.replacePatern	= "[*URL*]";
	this.templates 		= {
		"js" 	: '<script src="' + this.replacePatern + '"></script>',
		"css"	: '<link href="' + this.replacePatern + '">'
	};

	this.init();

	return this.headers;
}

Headers.prototype.loadStatics = function( ext, location, template ){

	var statics = [],
		that 	= this;

	fs.readdirSync( location ).forEach( function ( file ){

		var currentLocation = path.join( location, file ),
			stats 			= fs.lstatSync( currentLocation );

		if( stats.isFile() )
			statics.push( currentLocation.replace( Core.config.globals.viewRoot, "" ) );

		else
			that.loadStatics( ext, path.join( location, file ), template );
	});

	for( var i = 0; i < statics.length; i++ )
		this.headers[ ext ].push( template.replace( this.replacePatern, statics[i] ) );
};

Headers.prototype.init = function(){

	var that = this;

	fs.readdirSync( that.headersPath ).forEach( function ( dir ){
		var stats = fs.lstatSync( path.join( that.headersPath, dir ) );

		if( stats.isDirectory() && that.templates.hasOwnProperty( dir ) )
			that.loadStatics( dir, path.join( that.headersPath, dir ), that.templates[dir] );
	});
};


module.exports = function( location ){
	return new Headers( location );
};