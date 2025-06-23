const db = require('./index');

db.serialize(() => {
	//Create db table if it doesn't already exist
	db.run(`
		CREATE TABLE IF NOT EXISTS posts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			content TEXT NOT NULL,
			slug TEXT UNIQUE NOT NULL,
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
		)

	`);
});
