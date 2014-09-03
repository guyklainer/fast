

var User = {};

User.get = function( id ){

	var deferred = Core.deferred();

	Core.db.users.get( id, function( err, res ){

		if( err )
			deferred.reject( err );
		else
			deferred.resolve( res.value );
	});

	return deferred.promise;
};

User.set = function( user ){

	var deferred = Core.deferred();

	Core.db.users.set( user.username, user, function( err, res ){

		if( err )
			deferred.reject( err );
		else
			deferred.resolve( user );
	});

	return deferred.promise;
};

module.exports = User;