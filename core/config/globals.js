
var path = require( 'path' );

module.exports = {
	layout 			: path.join( "interface", "layout" ),
	viewRoot 		: path.join( __dirname, '..', '..', 'views' ),
	apiRoot 		: path.join( __dirname, '..', '..', 'api' ),
	apiURIPrefix	: "/api",
	apiDocsPath		: "docs",
	exposeDocs		: true,
	publicFolder 	: "ui",
	headersFolder 	: "headers"
};