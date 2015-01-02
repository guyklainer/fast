Fast API
========

Create RESTful API in seconds.

[![Build Status](https://travis-ci.org/guyklainer/fast.svg?branch=master)](https://travis-ci.org/guyklainer/fast)
[![npm version](https://badge.fury.io/js/fast-api.svg)](http://badge.fury.io/js/fast-api)
[![Dependency Status](https://david-dm.org/guyklainer/fast.svg)](https://david-dm.org/guyklainer/fast)

With Fast, you don't have to define routes for each service in your API.<br>
Just put your service in your API folder, and the path to the service will be his access point.<br>
You can also nest folders, Fast will handle it.

Each module should exports 'routes' object which defines the services in this module. <br>

In the example below the module 'myservice.js' expose 2 GET services:
 - http://YOUR-APP/api/myservice/
 - http://YOUR-APP/api/myservice/:id

Inside your service, 'Core' object is available.

If you want to use one of your services in other module, just expose the service with the name 'service' like the second service in myservice.js file.<br>
Then, call it from other modules like this:<br>
    
    var result = Core.api.myservice();

You have access to the lodash utility module from:
    
    Core.utils

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
    
    module.exports.subscribers = {
    	"set_private"  	: {
        		summery 	: "Set Private Message",
        		parameters 	: [
        			{ name 		: "receiver_id",	description : "Receiver ID", 	required : true, dataType : "string", allowMultiple : false },
        			{ name 		: "sender_id",	 	description : "Sender ID", 		required : true, dataType : "string", allowMultiple : false },
        			{ name 		: "media_type",	 	description : "Media Type", 	required : true, dataType : "number", allowMultiple : false },
        			{ name 		: "content",	 	description : "Content", 		required : true, dataType : "string", allowMultiple : false },
        			{ name 		: "balloon_color",	description : "Balloon Color", 	required : false, dataType : "string", allowMultiple : false },
        			{ name 		: "text_color",		description : "Text Color", 	required : false, dataType : "string", allowMultiple : false }
        		],
        
        		service 	: "setPrivate"
        	}
    };
    
    module.exports.privileges = {
        "service" : 0,
        "getByID" : 1
    };
    
    module.exports.getByID = function( req, res ){
        console.log( req.params.id );
    };
    
    module.exports.setPrivate = function( req, res ){
    	req.body.timestamp 	= Core.date.unix();
    	req.body.sent 		= 1;
    	req.body.received 	= 0;
    	req.body.likes 		= [];
    
    	Core.models.message.setPrivate( req.body ).then( res.success, res.error );
    
    	if( req.isSocket ){
    		var sender 		= Core.socket.getSocket( req.body.sender_id ),
    			receiver 	= Core.socket.getSocket( req.body.receiver_id );
    
    		sender.broadcast.to( receiver ).emit( "message", req.body );
    	}
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


Extra Modules
-------------
You can inject to the Core object one property of you own.<br>
For example, if you want to have 'models' module for the DB layer, add this to the options:

    extraModules : "models"
    
Then create 'models' directory right under your project root.<br>
Lets say we have 'message' model. ( meaning 'message.js' file inside this directory )<br>
We can call it like this:

    Core.models.message.setPrivate()


Socket.io:
----------
To enable socket.io support, add this to the createServer options:
    
    enableWebSocket	: true,
    socketKey       : "KEY-IN-HANDSHAKE"

The socketKey property should hold the property name in the handshake phase of the connection.<br>
The value of this propery should hold the identifier for this socket. ( userID for example ).<br>
<br>
When true, Fast will look for 'subscribers' object that exported from each API end point.<br>
This object is the same as the 'routes' object, except the httpMethod property.<br>
Also, the paramType for socket params is always 'body'.<br>
<br>
You can get any socket object using:

    Core.socket.getSocket( SOCKET-ID )



SSL:
----------
To enable SSL, add this to the createServer options:
    
    useSSL : true
    useSSL : {
        key   : YOUR_KEY,
        cert  : YOUR_CERT
    }




