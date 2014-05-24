
var Passport		= require( 'passport' ),
	express 		= require( 'express' ),
	ejs 			= require( 'ejs' ),
	fs 				= require( 'fs' ),
	path 			= require( 'path' ),
	cookieParser 	= require( 'cookie-parser' ),
	session      	= require( 'express-session' ),
	RedisStore 		= require( 'connect-redis' ),
	methodOverride 	= require( 'method-override'),
	bodyParser 		= require( 'body-parser' ),
	favicon 		= require( 'serve-favicon' ),
	App 			= Core.app;

// -- Global Settings
module.exports.globals  = require( './globals' );

// -- Bootstrap The Application
module.exports.load = function(){

	// -- Define view engine with its options
	App.set('views', Core.config.globals.viewRoot );
	App.set('view engine', 'ejs');

	// -- Set uncompressed html output and disable layout templating
	App.locals.pretty = true;

	App.use( cookieParser() );
	App.use( bodyParser() );
	App.use( methodOverride() );


	// -- Static ressources
	fs.readdirSync( Core.config.globals.viewRoot ).forEach( function ( view ){
		var route 			= path.join( view, Core.config.globals.publicFolder ),
			publicFolder 	= path.join( Core.config.globals.viewRoot, route );

		if( fs.existsSync( publicFolder ) )
			App.use( "/" + route, express.static( publicFolder ) );
	});

	//App.use( favicon( Path.join( static_root, 'img/favicon.ico' ) ) );

	//Sessions
	RedisStore = RedisStore( session );

	App.use( session({
		secret 	: module.exports.globals.sessionSecret,
		name 	: 'sid',
		cookie	: { secure: true },
		store	: new RedisStore()
	}));

	// -- Authentication
	App.use( Passport.initialize() );
	App.use( Passport.session() );
};
