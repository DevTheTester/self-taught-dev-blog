//Imports express class from express
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('cookie-session');
require('dotenv').config();

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
app.use(express.urlencoded({ extended: true, limit: "2mb", parameterLimit: 5 }));
//Set up session config
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
		maxAge: 1000 * 60 * 60 * 30 // 30 Days
	}
}));

/* ROUTES */

//Index
app.get('/', (req, res) => {
	res.render('index'); 
});

//About
app.get('/about', (req, res) => {
	res.render('about'); 
});

//Register
app.get('/register', (req, res) => {
	res.render('register');
});

//Register: Post
app.post('/register', (req, res) => {
	//Get form data from request
	const { fname, lname, email, password } = req.body;
	const role = 'user';
	//Generate password hash and store in database
	const hash = bcrypt.hashSync(password, 10);
	db.run(
		`INSERT INTO users (fname, lname, email, password, role) VALUES (?, ?, ?, ?, ?)`,
		[fname, lname, email, hash, role],
		function (err)	{
		if (err){
			console.log(err);
			return res.status(500).send("Something went wrong.");
		}
			res.redirect('/');
		}
	);
});

//Login
app.get('/login', (req, res) => {
	res.render('login');
});

//Login>Post
app.post('login', (req, res) => {
	
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

//Blog: Index>Post
app.post('/blog', (req, res) => {
	const { title, content } = req.body;

	const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^w-]/g, '');
	const createdAt = new Date().toISOString();

	db.run(
		`INSERT INTO posts (title, content, slug, createdAt) VALUES (?, ?, ?, ?)`,
		[title, content, slug, createdAt],
		function (err) {
			if (err) {
				console.error(err);
				return res.status(500).send("Something went wrong.");
			}
		console.log(`${this.lastID}`);
		res.redirect(`/blog/${this.lastID}`); // redirect to blog post after the post request

		}
	);

});


//Blog: New
app.get('/blog/new', (req, res) => {
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

//Blog: Post>POST/Delete
app.post('/blog/:id/delete', (req, res) => {
	db.run(`DELETE FROM posts WHERE id = ?`, [req.params.id], function (err) {
		if (err) {
			console.error(err);
			return res.status(500).send('Failed to delete post.');
		}
		console.log(`Deleted post with ID ${req.params.id}`);
		res.redirect('/blog');
	});
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
