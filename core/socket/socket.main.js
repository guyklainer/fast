
var io = require( "socket.io");

module.exports = function( callback ){
	io.sockets.on( 'connection', function( socket ){
		callback( socket );
	});
};