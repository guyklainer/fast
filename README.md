Fast API
========

Create RESTFul API in seconds

Example:
app.js
--------------
<pre><code>
    var Fast    = require( 'fast' ),
        Path    = require('path' );

    var app = Fast.createServer({
            apiRoot : Path.join( __dirname, "api" )
    });

    app.listen( "4000" );
</code></pre>

Then, in the api folder, you can have this file:

myservice.js
--------------
<pre><code>
module.exports.routes = {
	"/"  	: {
		summery 	: "Get list",
		httpMethod 	: "get",
		parameters 	:[
			{
				name            : "username",
				description     : "User Name",
				required 	    : true,
				dataType 		: "string",
				allowMultiple 	: true,
				paramType 		: "query"
			},
			{
				name 			: "id",
				description 	: "User ID",
				required 		: false,
				dataType 		: "number",
				allowMultiple 	: false,
				paramType 		: "path"
			}
		],

		service 	: "service"
	},

	"/:id" 	: {
		summery 	: "Get list by ID",
		httpMethod 	: "get",
		parameters	: [
			{
			    name            : "id",
			    description     : "User ID",
			    required        : true,
			    dataType        : "number",
			    allowMultiple   : false,
			    paramType       : "path"
			}
		],

		service 	: "getByID"
	}
};

module.exports.privileges = {
	"service" : 0,
	"getByID" : 1
};

module.exports.getByID = function( req, res ){
	console.log( req.params.id );
};

module.exports.service = function( req, res ){
	res.success( "done" );
};
</code></pre>

Then, go to <br>
http://YOUR-APP/api/myservice<br>
and........ Voila!

NOTE..<br>
You can put your service in directory, "mydir", inside the api folder.<br>
Now your route will be Then, go to http://YOUR-APP/api/mydir/myservice
