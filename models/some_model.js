
Core.inherits( SomeModel, Core.orm.model );

function SomeModel(){
	this.table 		= "table_name";
	this.connection = Core.db( Core.config.settings.db );

}

SomeModel.prototype.get = function( params ){
	var query = Core.orm.get( params );

	this.connection.query( query, function( err, data ){

	});
};

module.exports = SomeModel;