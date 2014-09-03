
var Couchbase 	= require( "./couchbase" ),
	connections = {};

module.exports.load = function() {

	var dbConnectionsSettings = Core.config.globals.db;

	dbConnectionsSettings.forEach( function( db ){

		switch( db.type ){
			case "couchbase":
				if( !connections[db.login.bucket] )
					connections[db.login.bucket] = new Couchbase( db.login.host, db.login.port, db.login.bucket );
				break;

			default :
				Core.error( db.type + " DB type is not supported yet", true );
				break;
		}
	});

	module.exports.connections = connections;
};