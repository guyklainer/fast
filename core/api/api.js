
var App 		= Core.app,
	Q 			= require( "q" ),
	path		= require( 'path' ),
	http 		= require( 'http' ),
	apiRoot		= Core.config.globals.apiRoot,
	apiPrefix	= Core.config.globals.apiURIPrefix;


// Class API
//----------
function API( location ){

	this.location 		= location.replace( ".js", "" );
	this.uri 			= path.join( apiPrefix, this.location.replace( apiRoot, "" ) );
	this.module			= require( this.location ) || false;
	this.validMethods	= [ 'get', 'post', 'put', 'delete' ];
	this.paramTypeMap 	= {
		path : "params",
		body : "body",
		query: "query"
	};

	this.create();
}

// Static members
API.apiDocs 	= { socket : {}, http : {} };
API.services 	= {};
API.subscribers = {};

// Static methods
API.getDocs = function(){
	return API.apiDocs;
};

API.getServices = function(){
	return API.services;
};

API.getSubscribers = function(){
	return API.subscribers;
};

API.success = function( data ){

	var result = {
		status  : 1,
		content : data,
		errors 	: []
	};

	if( this instanceof http.OutgoingMessage && this.deferred )
		this.deferred.resolve( result );

	else
		return result;
};

// Methods
API.prototype.create = function(){

	if( !this.module )
		return;

	var routes 		= this.module.routes 		|| {};
	var subscribers = this.module.subscribers 	|| {};

	for( var key in routes )
		if( routes.hasOwnProperty( key ) )
			this.add( key, routes[ key ] );

	if( Core.config.globals.enableWebSocket )
		for( var k in subscribers )
			if( subscribers.hasOwnProperty( k ) )
				this.addEventSubscriber( k, subscribers[ k ] );
};

API.prototype.addEventSubscriber = function( key, subscriber ){
	var routhPath 	= this.uri,
		that 	 	= this;

	this.currRoute = subscriber;

	this.validateRoute( true );

	if( key != "/" )
		routhPath = path.join( routhPath, key );

	API.subscribers[ routhPath ] = function( req, res ){
		var isAuthenticated = Core.auth.ensureAuthenticated( req, that.module.privileges ),
			isValidParams 	= that.validateParams( req, subscriber.parameters, "body" );

		if( isAuthenticated ){

			if( isValidParams.status ){
				var promise = that.module[ subscriber.service ].apply( this, arguments );

				if (promise)
					promise.then( res.success, res.error );

			} else
				res.error( isValidParams.content );

		} else
			res.error( "Unauthorized" );
	}

	//Add to API Docs
	API.apiDocs.socket[ routhPath ] = subscriber;
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
		this.addService( routhPath, route.service );

	//Add to API Docs
	API.apiDocs.http[ routhPath ] = route;
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

	this.prepareReqResOnjects( res );

	if( privileges )
		privileges = privileges[service];

	var isAuthenticated = Core.auth.ensureAuthenticated( req, privileges ),
		isValidParams 	= this.validateParams( req, params );

	if( isAuthenticated ){

		if( isValidParams.status ){

			res.deferred = Q.defer();

			this.module[ service ]( req, res );

			res.deferred.promise.then( function( data ){

				data.request = { params : res.req.params, body : res.req.body, query : res.req.query };
				res.json( data );
			});

		} else
			res.error( isValidParams.content, "400" );

	} else
		res.error( "Unauthorized", "401" );
};

API.prototype.addService = function( routePath, service ){

	var splitedPath 	= routePath.split( path.sep ),
		lastPath 		= splitedPath.slice( -1 )[0],
		servicesPointer = API.services;

	for( var i in splitedPath ){
		if( !splitedPath.hasOwnProperty( i ) || splitedPath[i] == "" )
			continue;

		if( !servicesPointer[ splitedPath[i] ] )
			servicesPointer[ splitedPath[i] ] = {};

		servicesPointer = servicesPointer[ splitedPath[i]];
	}

	servicesPointer[lastPath] = this.module[service];
};

API.prototype.validateRoute = function( subscriber ){

	var method 		= subscriber ? null : this.currRoute.httpMethod.toLowerCase(),
		service 	= this.currRoute.service;

	if( this.validMethods.indexOf( method ) == -1 && !subscriber )
		Core.error( "invalid HTTP method " + method + " in " + this.location, true );

	if( !this.module[ service ] )
		Core.error( this.location + " is not exporting " + service, true );
};

API.prototype.validateParams = function( req, params, paramTypeOverride ){

	var that 		= this,
		res 		= {
			status 		: true,
			content		: ""
		},
		paramsByType = {
			params 		: [],
			body 		: [],
			query 		: []

		};

	for( var key in params ){
		if( !params.hasOwnProperty( key ) )
			continue;

		var param 		= params[key],
			paramType	= this.paramTypeMap[ param.paramType || paramTypeOverride ];

		res = that.validateParam( param, req[paramType] );

		paramsByType[ paramType ].push( param.name );

		if( !res.status )
			return res;
	}

	Object.keys( paramsByType ).forEach( function( paramsGroup ){
		for( var param in req[paramsGroup] )
			if( req[paramsGroup].hasOwnProperty( param ) && paramsByType[paramsGroup].indexOf( param ) == -1 )
				delete req[paramsGroup][param];
	});

	return res;
};

API.prototype.validateParam = function( param, reqParams ){

	var valid = {
		status		: !param.required,
		content		: param.required ? param.name + " is required" : ""
	};


	if( reqParams[ param.name ] ){

		if( ( param.dataType == 'array' && reqParams[ param.name ] instanceof Array )  ||
			( param.dataType == 'number' && !isNaN( reqParams[ param.name ] ) ) ||
			( param.dataType == 'object' && typeof reqParams[ param.name ] === param.dataType ) ||
			( param.dataType == 'string' && typeof reqParams[ param.name ] === param.dataType ) ||
			( param.dataType == 'boolean' && typeof reqParams[ param.name ] === param.dataType 	|| param.dataType == "true" || param.dataType == "false" ) ){
			valid.status  = true;
			valid.content = "";

		} else {
			valid.status 	= false;
			valid.content	= param.name + " should be from type " + param.dataType
		}
	}

	return valid;
};

API.prototype.prepareReqResOnjects = function( res ){

	if( res.success || res.error )
		Core.error( "possible conflict in response object" );

	res.success 	= function(){API.success.apply( res, arguments )};
	res.error 		= function(){Core.environment.error.apply( res, arguments )};
};

module.exports = API;