
var Passport 		= require( "passport"),
	LocalStrategy   = require( 'passport-local' ).Strategy,
	App 			= Core.app;

function login( req, res, next ){
	if( req.isAuthenticated() ){
//		User.update( { _id: req.user._id }, { $set: { lastVisited: new Date() }  }, function( err ){
//			if( err )
//				res.json( Utils.createResult( false, err, "dbError" ) );
//
//			else
//				res.json( { result: true, user: req.user } );
//		});
		res.json( res.success( "logedin" ) );
	}
}

function loadLoginRoutes(){
	var passportRoute = {
		successRedirect	: '/',
		failureRedirect	: '/'
	};
	App.post( '/login', Passport.authenticate( 'local', passportRoute ), login );


	App.get( '/',  function( req, res, next ){
		if( req.isAuthenticated() )
			res.render( 'home/home', { title : "Test" } );
		else
			res.render( 'home/login', { title : "Test" } );
	});
}

module.exports.load = function(){
	loadLoginRoutes();

	Passport.serializeUser( function( user, done ) {
		done( null, user.id );
	});

	Passport.deserializeUser( function( id, done ) {
		done( null, { name : "Guy Klainer", id : 1, password : "123", role : 0 } );

//		User.findById( _id, function( err, user ) {
//			done( err, user );
//		});
	});
//
	Passport.use( new LocalStrategy(

		function( username, password, done ){

			if( password != "123" )
				return done( null, false, { message: 'Incorrect password.' } );

			return done( null, { name : "Guy Klainer", id : 1, password : "123", role : 0 } );
		}
//		function( username, password, done ){
//			User.findOne({ username: username }, function ( err, user ) {
//
//				if( err ) {
//					return done( err );
//				}
//				if( !user ) {
//					return done( null, false, { message: 'Incorrect username.' } );
//				}
//				if( !user.authenticate( password ) ) {
//					return done( null, false, { message: 'Incorrect password.' } );
//				}
//				return done( null, user );
//			});
//		}
	));
};

module.exports.ensureAuthenticated = function( req, service, privileges ){
	return true;
	var allow = true;

	if( req.isAuthenticated() ){

		if( privileges && privileges[ service ] ){
			var userRole = req.user.role || 0;

			if( userRole < privileges[ service ] )
				allow = false;
		}

	}

	else
		allow = false;

	// In View Router, so params received are ( req, res, next )
	if( service.hasOwnProperty( "end" ) && typeof( privileges ) == "function" ){
		var res 	= service;
		var next 	= privileges;

		if( allow )
			next();
		else
			res.send( "401", "Unauthorized" );

	} else
		return allow;
};