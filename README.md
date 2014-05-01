Fast
=====

Create RESTFull API in seconds

Example:
<pre><code>
    var Fast    = require( 'fast' ),
        Path    = require('path' );

    var app = Fast.createServer({
            apiRoot : Path.join( __dirname, "api" )
    });

    app.listen( "4000" );
</code></pre>
