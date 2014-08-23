
var couchbase = require( "couchbase" );

function Couchbase( host, port, bucket ){
	var url = host + ":" + port;

	this.connection = new couchbase.Connection( { host: url, bucket: bucket } );

	return this.connection;

}

module.exports = Couchbase;