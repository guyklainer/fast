
var sockets = {};

module.exports.listenForConnections = function( io, subscribers ){

	io.sockets.on( 'connection', function( socket ){

		var userID = socket.handshake.query.user_id;

		if( !sockets[userID] )
			sockets[userID] = socket;

		for( var path in subscribers ){
			if( !subscribers.hasOwnProperty( path ) )
				continue;

			startListen( socket, path );
		}
	});

	var startListen = function( socket, path ){

		socket.on( path, function( params ){
			var req = { body : params },
				res = {
					success : function( data ){
						console.log( "success: ", data );
						socket.emit( path + "_success", data );
					},
					error : function( data ){
						console.log( "error: ", data );
						socket.emit( path + "_error", data );
					}
				};

			subscribers[path].apply( this, [ req, res ] );
		});
	};
};

module.exports.getSocket = function( id ){
	return sockets[id];
};

module.exports.joinRoom = function( userID, roomID ){
	if( sockets[userID] )
		sockets[userID].join( roomID );
};

module.exports.leaveRoom = function( userID, roomID ){
	if( sockets[userID] )
		sockets[userID].leave( roomID );
};