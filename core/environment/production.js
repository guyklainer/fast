
var fs      = require("fs" ),
	http	= require('http' ),
	gzippo  = require('gzippo' ),
	morgan  = require( 'morgan' );

module.exports.load = function( app ) {

	app.use( morgan({
		format : 'tiny',
		stream : fs.createWriteStream( Core.config.globals.logsPath )
	}));

	var duration = 2592000000; // One month
	app.use( gzippo.staticGzip(__dirname + '/../public_build/', { maxAge: duration }) );
};

module.exports.error = function( data, code ){

	var result = {
		status  : 0,
		content : [],
		errors 	: data
	};

	if( this instanceof http.OutgoingMessage ){

		result.request = { params : this.req.params, body : this.req.body, query : this.req.query };

		this.status( code || "500" ).json( result );

	} else
		return result;
};