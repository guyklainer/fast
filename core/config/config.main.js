
var Passport	= require( 'passport' ),
	express 	= require( 'express' ),
	ejs 		= require( 'ejs' ),
	fs 			= require( 'fs' ),
	path 		= require( 'path' ),
	App 		= Core.app;

// -- Global Settings
module.exports.globals  = require( './globals' );

// -- Bootstrap The Application
module.exports.load = function(){

	// -- Define view engine with its options
	App.set('views', Core.config.globals.viewRoot );
	App.set('view engine', 'ejs');

	// -- Set uncompressed html output and disable layout templating
	App.locals({
		pretty 	: true
	});

	// -- Parses x-www-form-urlencoded request bodies (and json)
	App.use(express.cookieParser());
	App.use(express.bodyParser());
	App.use(express.methodOverride());


	// -- Static ressources
	fs.readdirSync( Core.config.globals.viewRoot ).forEach( function ( view ){
		var route 			= path.join( view, Core.config.globals.publicFolder ),
			publicFolder 	= path.join( Core.config.globals.viewRoot, route );

		if( fs.existsSync( publicFolder ) )
			App.use( "/" + route, express.static( publicFolder ) );
	});

	//pp.use(express.favicon( Path.join( static_root, 'img/favicon.ico' ) ) );

	//Sessions
	App.use(express.session( { secret: module.exports.globals.sessionSecret } ));

	// -- Authentication
	App.use(Passport.initialize());
	App.use(Passport.session());

	// -- express routing
	App.use( App.router );

	// -- 500 status
//	App.use(function(err, req, res, next) {
//		console.log( "500", err );
////		res.render('500', {
////			status: err.status || 500,
////			error: err
////		});
//	});

	// -- 404 status
	App.use(function(req, res, next) {
		console.log( "404", req.url );
		res.end( "Not Found" );
//		res.render('404', {
//			status: 404,
//			url: req.url
//		});
	});

};
