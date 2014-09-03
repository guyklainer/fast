
var couchbase = require( "couchbase" );

function Couchbase( host, port, bucket ){
	var url = host + ":" + port;

	this.connection = new couchbase.Connection( { host: url, bucket: bucket } );

	if( !this.connection.getUsingView )
		this.connection.getUsingView = getUsingView;
	else
		Core.error( "Couchbase method 'getUsingView' already exist", true );

	return this.connection;

}

var getUsingView = function(  designDoc, viewName, query, getDB, callback ){

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

module.exports = Couchbase;