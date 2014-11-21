
var Passport		= require( 'passport' ),
	express 		= require( 'express' ),
	expressSSL 		= require( 'express-enforces-ssl' ),
	fs 				= require( 'fs' ),
	path 			= require( 'path' ),
	cookieParser 	= require( 'cookie-parser' ),
	session      	= require( 'express-session' ),
	RedisStore 		= require( 'connect-redis' ),
	methodOverride 	= require( 'method-override'),
	bodyParser 		= require( 'body-parser' ),
	favicon 		= require( 'serve-favicon' ),
	helmet			= require( 'helmet' ),
	App 			= Core.app;

// -- Global Settings
module.exports.globals  = require( './globals' );

// -- Bootstrap The Application
module.exports.load = function(){

	// -- Define view engine with its options
	if( fs.existsSync( Core.config.globals.viewRoot ) ) {
		App.set('views', Core.config.globals.viewRoot);
		App.set('view engine', 'ejs');
	}

	// -- Set uncompressed html output and disable layout templating
	App.locals.pretty = true;

	App.use( cookieParser() );
	App.use( bodyParser.urlencoded({
		extended: true
	}));
	App.use( bodyParser.json() );
	App.use( methodOverride() );

	App.use( helmet() );

	// -- Enforces SSL
	if( Core.config.globals.useSSL ) {
		App.enable('trust proxy');
		App.use(expressSSL());
	}

	// -- Static ressources
	if( fs.existsSync( Core.config.globals.viewRoot ) )
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
		secret 				: module.exports.globals.sessionSecret,
		name 				: 'sid',
		saveUninitialized	: true,
		resave				: true,
		cookie				: { secure: true },
		store				: new RedisStore()
	}));

	// -- Authentication
	App.use( Passport.initialize() );
	App.use( Passport.session() );
};
