var express = require( 'express' );

module.exports.load = function() {

	var env = Core.app.settings.env;

	// -- DEVELOPMENT
	if ('development' == env) {
		require("./development")( Core.app, express );
	}

	// -- PRODUCTION
	if ('production' == env) {
		require("./production")( Core.app, express );
	}
};