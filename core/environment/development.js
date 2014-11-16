
var traceback 	= require( 'traceback' ),
	http 		= require( 'http' ),
	morgan  	= require( 'morgan' );

module.exports.load = function( app ) {

	app.use( morgan( 'dev') );

	app.use( require( 'errorhandler' )() );
};

module.exports.error = function( data, code ){
	var stack = traceback(),
		trace = {};

	for( var index = 0; index < 5; index ++ ){
		var item 	= stack[index],
			params 	= [];

		for (var key in item.fun.arguments)
			if (item.fun.arguments.hasOwnProperty(key))

				try {
					JSON.stringify( item.fun.arguments[key] );
					params.push( item.fun.arguments[key] );
				} catch (e) {
					params.push( "Unable to print param" );
				}

		trace[ (index+1) + ") " + item.file ] = {
			path	: item.path.replace(Core.config.globals.root, ""),
			method	: item.name,
			line	: item.line,
			params	: params
		};
	}

	var result = {
		status  : 0,
		content : [],
		errors 	: data,
		stack 	: trace
	};

	if( this instanceof http.OutgoingMessage ){

		result.request = { params : this.req.params, body : this.req.body, query : this.req.query };

		this.status( code || "500" ).json( result );

	} else
		return result;
};