const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/blog.db');

db.serialize(() => {
  db.run(`INSERT INTO posts (title, slug, content, createdAt) VALUES (?, ?, ?, ?)`, [
    "Hello World",
    "hello-world",
    "This is a seeded blog post.",
    new Date().toISOString()
  ]);

  db.run(`INSERT INTO posts (title, slug, content, createdAt) VALUES (?, ?, ?, ?)`, [
    "Another One",
    "another-one",
    "More dummy content here to test things out.",
    new Date().toISOString()
  ]);
});

db.close();

