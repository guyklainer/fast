Fast API
========

Create RESTful API in seconds.

With Fast, you don't have to define routes for each service in your API.<br>
Just put your service in your API folder, and the path to the service will be his access point.<br>
You can also nest folders, Fast will handle it.

Each module should exports 'routes' object which defines the services in this module. <br>

In the example below the module 'myservice.js' expose 2 GET services:
 - http://YOUR-APP/api/myservice/
 - http://YOUR-APP/api/myservice/:id

For each service you need to define his params.<br>
Only this params with this settings will be valid for this service.<br>

Inside your service, 'Core' object is available.

If you want to use one of your services in other module, just expose the service with the name 'service' like the second service in myservice.js file.<br>
Then, call it from other modules like this:<br>
    
    var result = Core.api.myservice();

You have access to the underscore utility module from:
    
    Core.utils
   

Fast has built on top of Express so you more then welcome to fork on github and start hack it.


Install
------------
    npm install fast-api

**Example:**
app.js
--------------

    var Fast    = require( 'fast' ),
        Path    = require('path' );

    var app = Fast.createServer({
            apiRoot : Path.join( __dirname, "api" )
    });

    app.listen( "4000" );


Then, in the api folder, you can have this file:

myservice.js
--------------
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

<br>

Go to <br>
http://YOUR-APP/api/myservice<br><br>
and........ Voila!<br><br>

Available options for createServer method and defaults
--------------
    {
        apiURIPrefix	: "/api",
        apiDocsPath		: "docs",
        exposeDocs		: true
    }
<br>

The listen method accept 2 parameters, both are optional:<br>

    app.listen( port, callback );

The default port is 3000.<br>
The callback gets no params and invoked when Fast finisg the init phase and ready for requests.. 

