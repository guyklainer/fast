
var path = require( 'path'),
	root = path.join( __dirname, '..', '..' );

module.exports = {
	siteName      	: 'SITENAME',
	sessionSecret 	: 'SOME_SECRET',
	port          	: process.env.PORT || 3000,
	environment		: process.env.NODE_ENV || 'development',
	debug        	: 0,
	layout 			: path.join( "interface", "layout" ),
	root			: root,
	viewRoot 		: path.join( root, 'views' ),
	apiRoot 		: path.join( root, 'api' ),
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