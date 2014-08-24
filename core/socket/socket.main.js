
var change = require( "chance" );

var sockets = {};

module.exports.listenForConnections = function( io, subscribers ){

	io.sockets.on( 'connection', function( socket ){

		var userID = socket.handshake.query.user_id;

		if( !sockets[userID] )
			sockets[userID] = {
				socket : socket,
				unique : change.hash({length: 9})
			};

		for( var path in subscribers ){
			if( !subscribers.hasOwnProperty( path ) )
				continue;

			startListen( sockets[userID], path );
		}

		socket.emit( "connection_response", success( sockets[userID].unique ) );
	});

	var startListen = function( socketParams, path ){

		var socket = socketParams.socket,
			unique = socketParams.unique;

		socket.on( path, function( params ){
			var req = {
					body 			: params,
					isAuthenticated	: function(){
						return params.token && params.token == unique;
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
	return sockets[id].socket;
};

module.exports.joinRoom = function( userID, roomID ){
	if( sockets[userID] )
		sockets[userID].socket.join( roomID );
};

module.exports.leaveRoom = function( userID, roomID ){
	if( sockets[userID] )
		sockets[userID].socket.leave( roomID );
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