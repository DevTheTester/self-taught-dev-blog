//Imports express class from express
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

//Initializes an app object using express class
const app = express();
//Initialize db
const db = new sqlite3.Database('./db/blog.db');

// Defines port (Computer door to knock on)
const port = 3000; 
// Get system path or some shit Set ejs as the extension to use, and views as the views thing 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout'); //Looks for layout.ejs in views

// Set express layouts as the layouts we want to use? idek
app.use(expressLayouts);

/* ROUTES */

//Index
app.get('/', (req, res) => {
	res.render('index'); 
});

//About
app.get('/about', (req, res) => {
	res.render('about'); 
});

//Blog: Index 
app.get('/blog', (req, res) => {
	db.all(`SELECT * FROM posts ORDER BY createdAt DESC`, [], (err, rows) => {
		if (err) {
			console.error(err);
			return res.status(500).send('Something went wrong.');
		}
		res.render('blog', { posts: rows });
	});
});


//Blog: New
app.get('/blog/newpost', (req, res) => {
	res.render('new');
});

//Blog: Post
app.get('/blog/:id', (req, res) => {
	db.get(`SELECT * FROM posts WHERE id = ? ORDER BY CreatedAt DESC`, [req.params.id], (err, row) => {
		if (err) {
			res.status(500).send('Something went wrong');
		} 
		if (row) {
			res.render('post', { post: row });
		} else {
			res.status(404).send(`Post not found`);
		}
	});
});


app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
