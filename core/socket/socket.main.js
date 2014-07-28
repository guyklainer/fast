
module.exports = function( io, callback ){
	io.sockets.on( 'connection', function( socket ){
		callback( socket );
	});
};