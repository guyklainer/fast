
var couchcase 	= require( "./couchbase"),
	connections = {};

module.exports.load = function() {

	var dbConnectionsSettings = Core.config.globals.db;

	dbConnectionsSettings.forEach( function( db ){

		switch( db.type ){
			case "couchbase":
				if( !connections[db.login.bucket] ) {
					connections[db.login.bucket] 				= couchcase(db.login.host, db.login.port, db.login.bucket);
					connections[db.login.bucket].getUsingView 	= function(){
						getFromCouchUsingView.apply( connections[db.login.bucket], arguments );
					}
				}
				break;

			default :
				Core.error( db.type + " DB type is not supported yet", true );
				break;
		}
	});

	module.exports.connections = connections;
};

var getFromCouchUsingView = function(  designDoc, viewName, query, getDB, callback ){

	var view = this.view( designDoc, viewName );

	if( arguments.length == 4 ) {
		callback 	= getDB;
		getDB 	 	= this;
	}

	view.query( query, function( err, res ){

		if( err && callback )
			callback( err );

		else {
			var ids = res.map( function( doc ){ return doc.value });

			getDB.getMulti( ids, null, callback );
		}
	});
};