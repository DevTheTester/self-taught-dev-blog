//Imports express class from express
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

//Initializes an app object using express class
const app = express();

// Defines port (Computer door to knock on)
const port = 3000; 
// Get system path or some shit

// Set ejs as the extension to use, and views as the views thing
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout'); //Looks for layout.ejs in views

// Make the app use public folder to find images
app.use(express.static('public'));
app.use(expressLayouts);

//Routes
app.get('/', (req, res) => {
	res.render('index'); 
});

app.get('/about', (req, res) => {
	res.render('about'); 
});

app.get('/blog', (req, res) => {
	res.send('Welcome to the blog index, nothing here right now soz.');
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
