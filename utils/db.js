const fs = require("fs");
const csv = require("fast-csv");
const sqlite3 = require('sqlite3').verbose();
const DB_SQLITE3 = 'db.sqlite3';


var db_mode = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
var db = new sqlite3.Database(DB_SQLITE3, db_mode, function callback(err) {
	if (err) {
		console.log("sqlite3: ", err);
		return;
	}
	
	// Setup table
	db.run("CREATE TABLE IF NOT EXISTS `data` ( \
			  `id` INTEGER primary key,\
			  `content` TEXT NULL DEFAULT NULL,\
			  `label` INTEGER NULL DEFAULT NULL,\
			  `last_update` datetime NULL DEFAULT NULL\
			);", function(err, row) {
				db.get("SELECT COUNT(*) as count FROM `data`;", function(err, row) {
					if (!row['count'] || row['count'] == 0) {
						var stream = fs.createReadStream("./dummies_data/comments.csv");
						var csvStream = csv()
						    .on("data", function(data){
						        console.log(data);
						        // Insert default admin
								db.run("INSERT INTO `data` (id, content, label, last_update) \
										VALUES ($id, $content, $label, $last_update)",
										{ $id: data[0], $content: data[1], $label: 0, $last_update: new Date()},
										function(err, inserted) {
											console.info('[DB] Insert initial data for `data`.')
											console.log(err, inserted);
										}
								);
						    })
						    .on("end", function(){
						         console.log("done");
						    });
						 
						stream.pipe(csvStream, {headers: true});

						
					}
				});
			});
});

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: DB_SQLITE3
  },
  useNullAsDefault: true
});

var bookshelf = require('bookshelf')(knex);

module.exports = {
	'db': db,
	'Data': bookshelf.Model.extend({
			  tableName: 'data'
			})
};