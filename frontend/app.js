//SETUP
const express = require('express');
const path =    require('path');
const axios =   require('axios');
const app = express();
const port = 5173;

app.set("views", path.resolve(__dirname, "views"));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

// HOMEPAGE
app.get('/', function(req, res) {
    res.render('start');
  });
  
  app.get('/helpcenter', function(req, res) {
    res.render('helpcenter');
  });
  
  app.get('/settings', function(req, res) {
    res.render('settings');
  });
  
  app.get('/customerlookup', function(req, res) {
    res.render('customerlookup');
  });
  
  app.get('/createcustomer', async function(req, res) {
    const getStates = await axios.get('http://localhost:3000/state').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data.rows
      }
    });
    const getServices = await axios.get('http://localhost:3000/service').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data.rows
      }
    });
    const getMake = await axios.get('http://localhost:3000/vehicle-make').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data.rows
      }
    });

    res.render('createcustomer', {
      states: getStates,
      services: getServices,
      makes: getMake
    });
  });
  

// start the express application on on port 8080
app.listen(port, ()=>console.log('Application started listening on port '+port));
