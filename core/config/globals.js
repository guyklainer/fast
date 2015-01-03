
var path = require( 'path'),
	root = path.dirname( require.main.filename );

module.exports = {
	siteName      		: 'SITENAME',
	sessionSecret 		: 'SOME_SECRET',
	port          		: process.env.PORT || 3000,
	environment			: process.env.NODE_ENV || 'development',
	root				: root,
	logsPath 			: path.join( root, 'logs/node.log' ),
//	viewRoot 			: path.join( root, 'views' ),
	apiRoot 			: path.join( root, 'api' ),
	layout 				: path.join( "interface", "layout" ),
	apiName				: "api",
	publicFolder 		: "ui",
	headersFolder 		: "headers",
	apiDocsPath			: "docs",
	exposeDocs			: true,
	extraModules 		: false,
	enableWebSocket 	: false,
	websocketMonitorPort: 8000,
	debug        		: false,

	loginPath 			: "/login",

	db           		: [{
		type 	: "DB_TYPE",
		login 	: {
			host	: 'localhost',
			user	: 'root',
			password: 'root',
			database: 'DB_NAME'
		}
	}]
};