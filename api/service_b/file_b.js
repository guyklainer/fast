
module.exports = function( req, res ){

	req.then( function( data ){
		console.log( data );

		setTimeout( function(){
			res.deferred.resolve( "bye" );
		}, 1000 );
	});

	return res.deferred.promise;
};