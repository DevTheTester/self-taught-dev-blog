const db = require('./db');

db.all(`SELECT * FROM users`, [], (err, rows) => {
	if (err) throw err;
	console.log(rows);
	db.close();
});
