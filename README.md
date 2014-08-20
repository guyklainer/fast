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

You can change the default '/api' path for your API folder.
Just add this to the createServer options:
    
    apiURIPrefix : "/MY_CUSTOM_PATH"

For each service you need to define his params.<br>
Only this params with this settings will be valid for this service.<br>

By default, Fast will expose for you API documentation in JSON foramat in this path:
    
    /YOUR_API_FOLDER/docs

You can change it by adding this to the createServer options:
    
    apiDocsPath : "MY_CUSTOM_DOCS_PATH"
and the path will be:
    
    /YOUR_API_FOLDER/MY_CUSTOM_DOCS_PATH

To disable the documentation feature, add this to createServer options:
    
    exposeDocs : false


Inside your service, 'Core' object is available.

If you want to use one of your services in other module, just expose the service with the name 'service' like the second service in myservice.js file.<br>
Then, call it from other modules like this:<br>
    
    var result = Core.api.myservice();

You have access to the underscore utility module from:
    
    Core.utils
   

Fast has built on top of Express so you are more then welcome to fork on github and start hacking.


Install
------------
    npm install fast-api
    
Example:
----------
**app.js**

    var Fast    = require( 'fast-api' ),
        Path    = require('path' );

    var app = Fast.createServer({
            apiRoot : Path.join( __dirname, "api" )
    });

    app.listen( "4000" );


Then, in the api folder, you can have this file:

**myservice.js**

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


Go to http://YOUR-APP/api/myservice<br><br>
**and........ Voila!**

Available options for createServer method and defaults
--------------
    {
        apiURIPrefix	            : "/api",
        apiDocsPath		            : "docs",
        exposeDocs		            : true,
        enableWebSocket	            : false,
        webSocketConnectionCallback	: false,
        
    }

The listen method accept 2 parameters, both are optional:<br>

    app.listen( port, callback );

The default port is 3000.<br>
The callback gets no params and invoked when Fast finisg the init phase and ready for requests.. 


Socket.io:
----------
To enable socket.io support, add this to the createServer options:
    
    enableWebSocket	            : true,
    webSocketConnectionCallback	: function( socket ){
        //your code
    }

webSocketConnectionCallback is the callback that invoked after new connection. 
You will get the new socket as the first parameter.

SSL:
----------
To enable SSL, add this to the createServer options:
    
    useSSL : true
    useSSL : {
        key   : YOUR_KEY,
        cert  : YOUR_CERT
    }




