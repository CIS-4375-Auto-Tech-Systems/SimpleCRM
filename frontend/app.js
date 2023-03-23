//SETUP
const express = require('express');
const path =    require('path');
const axios =   require('axios');
const app = express();
const port = 5173;

app.set("views", path.resolve(__dirname, "views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

// HOMEPAGE
app.get('/', function(req,res){
    const welcome = 'Welcome!'
    const team = 'Team 7';
    res.render('start', {
        welcome: welcome,
        team: team
    });
});
// start the express application on on port 8080
app.listen(port, ()=>console.log('Application started listening on port '+port));
