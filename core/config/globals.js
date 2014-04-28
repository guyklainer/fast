
var path = require( 'path' );

module.exports = {
	siteName      	: 'SITENAME',
	sessionSecret 	: 'SOME_SECRET',
	port          	: process.env.PORT || 3000,
	environment		: process.env.NODE_ENV || 'production',
	debug        	: 0,

	layout 			: path.join( "interface", "layout" ),
	viewRoot 		: path.join( __dirname, '..', '..', 'views' ),
	apiRoot 		: path.join( __dirname, '..', '..', 'api' ),
	apiURIPrefix	: "/api",
	apiDocsPath		: "docs",
	exposeDocs		: true,
	publicFolder 	: "ui",
	headersFolder 	: "headers",

	db           	: {
		host 	: 'localhost',
		user 	: 'root',
		password: 'root',
		database: 'DB_NAME'
	}
};