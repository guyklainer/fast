
var Path = require( 'path' );

module.exports = {
	fast : {
		siteName		: "Example App",
		apiRoot			: Path.join( __dirname, "api" ),
		servicesPath	: Path.join( __dirname, "services" ),
		enableWebSocket	: true,
		socketKey		: "user",
		extraModules 	: "models",
		db  	: [
			{
				type: "couchbase",
				login: {
					host	: 'localhost',
					port	: 8091,
					bucket	: "users"
				}

			},{
				type: "couchbase",
				login  	: {
					host	: 'localhost',
					port	: 8091,
					bucket	: "private_messages"
				}
			}
		]
	},

	app : {
		port 	: 3000

	}
};