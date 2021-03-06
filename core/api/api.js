
var App 		= Core.app,
	path		= require( 'path' ),
	http 		= require( 'http' ),
	apiRoot		= Core.config.globals.apiRoot,
	apiPrefix	= path.sep + Core.config.globals.apiName;


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

	if( this instanceof http.OutgoingMessage )
		this.json( result );

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

	this.module[ subscriber.service ] = Core.promise.promisify( this.wrapForPromise( this.module[ subscriber.service ] ) );

	API.subscribers[ routhPath ] = function( req, res ){
		var isAuthenticated = Core.auth.ensureAuthenticated( req, that.module.privileges ),
			isValidParams 	= that.validateParams( req, subscriber.parameters, "body" );

		if( isAuthenticated ){

			if( isValidParams.status ){
				that.module[ subscriber.service ]( req )
					.then( res.success )
					.catch( res.error );

			} else
				res.error( isValidParams.content );

		} else
			res.error( "Unauthorized" );
	};

	//Add to API Docs
	API.apiDocs.socket[ routhPath ] = subscriber;
};

API.prototype.add = function( key, route ){
	var routhPath = this.uri;

	this.currRoute = route;

	this.validateRoute();

	if( key != path.sep )
		routhPath = path.join( routhPath, key );

	// Add route
	this.addRoute( routhPath );

	//Expose as service
	if( key == path.sep )
		this.addService( routhPath, route.service );

	//Add to API Docs
	API.apiDocs.http[ routhPath ] = route;
};

API.prototype.addRoute = function( routePath ){
	var that 		= this,
		currRoute 	= this.currRoute,
		method 		= this.currRoute.httpMethod.toLowerCase();

	this.module[ currRoute.service ] = Core.promise.promisify( this.wrapForPromise( this.module[ this.currRoute.service ] ) );

	App[ method ]( routePath, function( req, res ){
		that.routeCallback( req, res, currRoute );
	});
};

API.prototype.wrapForPromise = function( func ){
	return function( req, done ){
		var result = func( req );

		if( result instanceof Core.promise ){
			if( result.isRejected() )
				done( result.reason() );

			else if( result.isFulfilled() ){
				var error = result.value();

				if( !error instanceof Error )
					error = new Error( error );

				done( null, error );
			}

		} else if( result instanceof Error )
			done( result );

		else
			done( null, result );
	}
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
			this.module[ service ]( req )
				.bind( req )
				.then( this.addRequestParams )
				.then( res.success )
				.catch( res.error );

		} else
			res.error( isValidParams.content, "400" );

	} else
		res.error( "Unauthorized", "401" );
};

API.prototype.addRequestParams = function( data ){

	data.request = { params : this.params, body : this.body, query : this.query };
	return data;

};

API.prototype.addService = function( routePath, service ){

	var splitedPath 	= routePath.split( path.sep ),
		lastPath 		= splitedPath.splice( -1 )[0],
		servicesPointer = API.services,
		apiFolderName 	= Core.config.globals.apiName;


	for( var i in splitedPath ){
		if( !splitedPath.hasOwnProperty( i ) || splitedPath[i] == "" || splitedPath[i] == apiFolderName )
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