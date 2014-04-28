
module.exports = {
	'siteName'      : 'SITENAME',
	'sessionSecret' : 'SOME_SECRET',
	'port'          : process.env.PORT || 3000,
	'debug'         : 0,
	'db'            : {
		host 	: 'localhost',
		user 	: 'root',
		password: 'root',
		database: 'DB_NAME'
	}
};