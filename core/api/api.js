
var App 		= Core.app,
	Q 			= require( "q" ),
	path		= require( 'path' ),
	apiRoot		= Core.config.globals.apiRoot,
	apiPrefix	= Core.config.globals.apiURIPrefix;

// Class API
//----------
function API( location ){

	this.location 		= location.replace( ".js", "" );
	this.uri 			= path.join( apiPrefix, this.location.replace( apiRoot, "" ) );
	this.module			= require( this.location ) || false;
	this.validMethods	= [ 'get', 'post', 'put', 'delete' ];

	this.create();
}

// Static member
API.apiDocs = {};

// Static method
API.getDocs = function(){
	return API.apiDocs;
};

// Methods
API.prototype.create = function(){

	if( !this.module )
		return;

	var routes = this.module.routes || {};

	for( var key in routes )
		if( routes.hasOwnProperty( key ) )
			this.add( key, routes[ key ] );
};

API.prototype.add = function( key, route ){
	var routhPath = this.uri;

	this.currRoute = route;

	this.validateRoute();

	if( key != "/" )
		routhPath = path.join( routhPath, key );

	// Add route
	this.addRoute( routhPath );

	//Expose as service
	if( key == "/" )
		this.addService( routhPath );

	//Add to API Docs
	API.apiDocs[ routhPath ] = route;
};

API.prototype.addRoute = function( routePath ){
	var that 		= this,
		currRoute 	= this.currRoute,
		method 		= this.currRoute.httpMethod.toLowerCase();


	App[ method ]( routePath, function( req, res ){
		that.routeCallback( req, res, currRoute );
	});
};

API.prototype.routeCallback = function( req, res, currRoute ){
	var privileges 	= this.module.privileges,
		params 		= currRoute.parameters,
		service 	= currRoute.service;

	if( privileges )
		privileges = privileges[service];

	var isAuthenticated = Core.auth.ensureAuthenticated( req, privileges ),
		isValidParams 	= this.validateParams( req, params );

	if( isAuthenticated ){

		if( isValidParams.status ){

			res.deferred = Q.defer();

			this.module[ service ]( req, res );

			res.deferred.promise.then( function( data ){
				res.json( data );
			});

		} else
			res.error( isValidParams.content, "400" );

	} else
		res.error( "Unauthorized", "401" );
};

API.prototype.addService = function( routePath ){

	var splitedPath 	= routePath.split( path.sep ),
		lastPath 		= splitedPath.slice( -1 ),
		exportsPointer	= module.exports;

	// remove extension
	splitedPath = splitedPath.slice( 2, -1 );

	for( var i in splitedPath ){
		if( !splitedPath.hasOwnProperty( i ) )
			continue;

		if( !exportsPointer[ splitedPath[i] ] )
			exportsPointer[ splitedPath[i] ] = {};

		exportsPointer = exportsPointer[ splitedPath[i]];
	}

	exportsPointer[lastPath] = this.module;
};

API.prototype.validateRoute = function(){

	var method 		= this.currRoute.httpMethod.toLowerCase(),
		service 	= this.currRoute.service;

	if( this.validMethods.indexOf( method ) == -1 )
		Core.error( "invalid HTTP method " + method + " in " + this.location, true );

	if( !this.module[ service ] )
		Core.error( this.location + " is not exporting " + service, true );
};

API.prototype.validateParams = function( req, params ){

	var that 	= this,
		res 	= {
			status 	: true,
			content	: ""
		};

	for( var key in params ){
		if( !params.hasOwnProperty( key ) )
			continue;

		var param = params[key];

		switch( param.paramType ){
			case "path":
				res = that.validateParam( param, req.params );
				break;

			case "body":
				res = that.validateParam( param, req.body );
				break;

			case "query":
				res = that.validateParam( param, req.query );
				break;
		}

		if( !res.status )
			return res;
	}

	return res;
};

API.prototype.validateParam = function( param, reqParams ){

	var valid = {
		status		: !param.required,
		content		: param.required ? param.name + " is required" : ""
	};


	if( reqParams[ param.name ] ){

		if( ( param.dataType == 'string' && typeof reqParams[ param.name ] === param.dataType && isNaN( reqParams[ param.name ] ) )  ||
			( param.dataType == 'number' && !isNaN( reqParams[ param.name ] ) ) ||
			( param.dataType == 'boolean' && typeof reqParams[ param.name ] === param.dataType || param.dataType == "true" || param.dataType == "false" ) ){
			valid.status  = true;
			valid.content = "";

		} else {
			valid.status 	= false;
			valid.content	= param.name + " should be from type " + param.dataType
		}
	}

	return valid;
};

module.exports = API;