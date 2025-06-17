//Imports express class from express
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const fs = require('fs');

//Initializes an app object using express class
const app = express();

// Defines port (Computer door to knock on)
const port = 3000; 
// Get system path or some shit

// Set ejs as the extension to use, and views as the views thing
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout'); //Looks for layout.ejs in views

// Set express layouts as the layouts we want to use? idek
app.use(expressLayouts);

//Routes
app.get('/', (req, res) => {
	res.render('index'); 
});


app.get('/about', (req, res) => {
	res.render('about'); 
});

// Turns the json into an html thingy? 
const posts = JSON.parse(fs.readFileSync('./data/posts.json', 'utf-8');
// Blog index page
app.get('/blog', (req, res) => {
	res.render('blog', { posts }); 
});

// Single Blog Post View
app.get('/blog/:slug', req, res => {
	const post = posts.find(p -> p.slug === req.params.slug);
	if (post) {
		res.render('post', {post});
	} else {
		res.status(404).send('Post not found);
	}
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
