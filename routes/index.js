
/*
 * GET home page.
 */

var mysql      	= require('mysql'),
	http 		= require("http"),
	graph		= require("fbgraph");

var connection;

exports.index = function(req, res){
  	res.render('index', { title: 'express' });

	connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'root',
		database : 'du_operative'
	});

	connection.connect();

	connection.query('SELECT SQL_CALC_FOUND_ROWS * FROM a_actions', function(err, actions, fields) {
		if (err) throw err;

	});
	connection.query('SELECT SQL_CALC_FOUND_ROWS * FROM ae_apps', function(err, apps, fields) {
		if (err) throw err;
		getAppsFromFB( apps );

	});

	//connection.end();
};

var getAppsFromFB = function( apps ){
	var ids = [];
	for( key in apps )
		ids.push( apps[key].id );

	var query = 'SELECT app_id,display_name,company_name,namespace,subcategory,daily_active_users,daily_active_users_rank,monthly_active_users,monthly_active_users_rank FROM application WHERE app_id IN ('+ ids.join(",") +') LIMIT '+ids.length;

	graph.fql(query, function(err, res) {
		var apps = res.data;

		for( key in apps ){
			if( apps[key].company_name )
				apps[key].company_name = apps[key].company_name.replace(/"/g, '&quot;');
			if( apps[key].namespace )
				apps[key].namespace = apps[key].namespace.replace(/"/g, '&quot;');
			if( apps[key].subcategory )
				apps[key].subcategory = apps[key].subcategory.replace(/"/g, '&quot;');
			if( apps[key].display_name )
				apps[key].display_name = apps[key].display_name.replace(/"/g, '&quot;');
			connection.query('UPDATE `ae_apps` SET `company_name` = "'+ apps[key].company_name +'" ,`namespace` = "'+ apps[key].namespace +'" ,`subcategory` = "'+ apps[key].subcategory +'" ,`daily_active_users` = '+ apps[key].daily_active_users +' ,`daily_active_users_rank` = '+ apps[key].daily_active_users_rank +' ,`monthly_active_users` = '+ apps[key].monthly_active_users +' ,`monthly_active_users_rank` = '+ apps[key].monthly_active_users_rank +' ,`name` = "'+ apps[key].display_name +'" WHERE `id` IN ('+ apps[key].app_id +')', function(err, res, fields) {
				if (err) throw err;
				console.log("-------------" + res);
			});
		}
	});
};