const fs = require("fs");
const csv = require("fast-csv");
const sqlite3 = require('sqlite3').verbose();
const DB_SQLITE3 = 'db.sqlite3';

getLink = function(id) {
	return `https://vnexpress.net/tin-tuc/phap-luat/xxx-${id}.html`
}

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
			  `content_length` INTEGER NULL DEFAULT 0,\
			  `label` INTEGER NULL DEFAULT NULL,\
			  `article_link` VARCHAR(255) NULL DEFAULT NULL,\
			  `last_update` datetime NULL DEFAULT NULL\
			);", function(err, row) {
				db.get("SELECT COUNT(*) as count FROM `data`;", function(err, row) {
					if (!row['count'] || row['count'] == 0) {
						var stream = fs.createReadStream("./dummies_data/comments.csv");
						var csvStream = csv()
						    .on("data", function(data){
						        console.log(data);
						        // Insert default admin
								db.run("INSERT INTO `data` (id, content, content_length, label, article_link, last_update) \
										VALUES ($id, $content, $content_length, $label, $article_link, $last_update)",
										{
											$id: data[0],
											$content: data[1], 
											$content_length: data[1].length, 
											$label: 0, 
											$article_link: getLink(data[3]), 
											$last_update: new Date()
										},
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