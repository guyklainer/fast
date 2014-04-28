
var docs = angular.module( "docs", [] );

docs.controller( "docsCtrl", [ "$scope", "$http", function( scope, ajax ){
	var ctrl = this;

	ajax.get( "/api/docs" ).success( function( data ){
		ctrl.docs = data.content;
	});

	return ctrl;

}]);