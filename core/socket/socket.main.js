
var chance = require( "chance" )();

var sockets = {};

module.exports.listenForConnections = function( io, subscribers ){

	io.sockets.on( 'connection', function( socket ){

		var socketID = socket.handshake.query[Core.config.globals.socketKey];

		if( !sockets[socketID] )
			sockets[socketID] = {
				socket : socket,

				token : chance.hash({length: 9})
			};

		for( var path in subscribers ){
			if( !subscribers.hasOwnProperty( path ) )
				continue;

			startListen( sockets[socketID], path );
		}

		socket.emit( "connection_response", success( sockets[socketID].token ) );

		socket.on( "disconnect", function(){
			if( sockets[socketID] )
				delete sockets[socketID];
		});
	});

	var startListen = function( socketParams, path ){

		var socket = socketParams.socket,
			token = socketParams.token;

		socket.on( path, function( params ){
			var req = {
					body 			: params,
					isSocket 		: true,
					isAuthenticated	: function(){
						return params.token && params.token == token;
					}
				},

				res = {
					success : function( data ){
						console.log( "success: ", data );
						socket.emit( path + "_response", success( data ) );
					},
					error : function( data ){
						console.log( "error: ", data );
						socket.emit( path + "_response", error( data ) );
					}
				};

			subscribers[path].apply( this, [ req, res ] );
		});
	};
};

module.exports.getSocket = function( id ){
	if( sockets[id] )
		return sockets[id].socket;
};

module.exports.joinRoom = function( socketID, roomID ){
	if( sockets[socketID] )
		sockets[socketID].socket.join( roomID );
};

module.exports.leaveRoom = function( socketID, roomID ){
	if( sockets[socketID] )
		sockets[socketID].socket.leave( roomID );
};

var success = function( data ){
	return {
		status	: 1,
		content : data
	}
};

var error = function( data ){
	return {
		status	: 0,
		content : data
	}
};