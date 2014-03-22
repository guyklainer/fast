
var mysql = require( 'mysql' );

function DB_connection( options ){
	var host 		= options.host,
		user 		= options.user,
		password	= options.password,
		database	= options.database;

	this.connection = mysql.createConnection({
		host     : host,
		user     : user,
		password : password,
		database : database
	});

	return this.connection;
}

module.exports = function( host, user, pass, db ){
	return new DB_connection( host, user, pass, db );
};
