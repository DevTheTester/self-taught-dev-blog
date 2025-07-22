//Imports express class from express
require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const { verifySignature } = require('./utils/verifySignature');


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
	genid: function(req){
		const uuid = uuidv4();
		return uuid;
	},
	store: new SQLiteStore,
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
		maxAge: 1000 * 60 * 60 * 30 // 30 Days
	}
}));
app.use((req, res, next) => {
	// Make `user` available in templates
	res.locals.user = req.session.userId || null;
  	next();
})

// Checks if users session has been assigned to a userID
function requireLogin(req, res, next) {
	if (!req.session.userId){
		return res.status(401).send("Unauthorized");
	}
	next();
}

/* ROUTES */

const SECRET = process.env.WEBHOOK_SECRET;
//Webhook Handler for deployments
app.post('/deploy-4f93jd92hf', express.json({type: 'application/json'}), async (req, res) => {
	//Verify the webhook is from github
	try {
		const secret = process.env.WEBHOOK_SECRET;
		const signature = req.get('x-hub-signature-256');
		const payload = req.body;

		const valid = await verifySignature(secret, signature, payload);

		//Testing = test in prod
		if (!valid) {
			console.log("This shit was not valid at all");
		} else {
			console.log("This shit is so valid bro");
		}
	// If there's an unexpected error then show it
	} catch (e) {
		console.error(e);
	}	
	console.log("Received github push payload");
	res.status(200).send("Yeet");
});

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
app.get('/admin', (req, res) => {
	res.render('login');
});

//Login>Post
app.post('/admin', (req, res) => {
	//Get the request data
	const { email, password } = req.body;
	//See if you can find user row in db by the email 
	db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
		//If you failling get the data from db error 
		if (err) {
			console.log(err);
			return res.status(500).send("Something went wrong.");
		}
		console.log(row);
		if (!row){
			console.log(`User not found ${email}`);
			return res.status(401).send("No matching account found");
		}
		bcrypt.compare(password, row.password, (err, result) => {
			if (err) {
				console.log(err);
				return res.status(500).send("Something went wrong.");
			}
			if (result){
				console.log("Logged in Successfully")
				//If they are the same then give the user the sessionID token 
				req.session.userId = row.id;
				console.log(req.session);
				console.log("Logged in successfully redirect to index page");
				res.redirect(`/`);
			} else {
				//If they aren't error
				console.log('Login details incorrect');
				return res.status(401).send("Login details incorrect");
			}
		})
	});
	
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

	const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
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
app.get('/blog/new', requireLogin, (req, res) => {
	res.render('new');
});

//Blog: Posts 
app.get('/blog/:id', (req, res) => {
	db.get(`SELECT * FROM posts WHERE id = ? ORDER BY CreatedAt DESC`, [req.params.id], (err, row) => {
		if (err) {
			res.status(500).send('Something went wrong');
		} 
		if (row) {
			const htmlContent = md.render(row.content);
			res.render('post', { post: row ,content: htmlContent});
		} else {
			res.status(404).send(`Post not found`);
		}
	});
});

//Blog: Post>POST/Delete
app.post('/blog/:id/delete', requireLogin, (req, res) => {
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
