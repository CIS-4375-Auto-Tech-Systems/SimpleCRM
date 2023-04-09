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
app.get('/', async function(req, res) {
  const getServiceOrder = await axios.get('http://localhost:3000/service-order').then(function(response) {
    if (response.data == 'FAILURE'){
      // Cant decide on error yet
      return [['ERROR','ERROR']]
    }else{
      return response.data
    }
  });
  const getCustomer = await axios.get('http://localhost:3000/customer').then(function(response) {
    if (response.data == 'FAILURE'){
      // Cant decide on error yet
      return [['ERROR','ERROR']]
    }else{
      return response.data
    }
  });
  const getEmployee = await axios.get('http://localhost:3000/employee').then(function(response) {
    if (response.data == 'FAILURE'){
      // Cant decide on error yet
      return [['ERROR','ERROR']]
    }else{
      return response.data
    }
  });
  const getStates = await axios.get('http://localhost:3000/state').then(function(response) {
    if (response.data == 'FAILURE'){
      // Cant decide on error yet
      return [['ERROR','ERROR']]
    }else{
      return response.data
    }
  });
  const getServices = await axios.get('http://localhost:3000/service').then(function(response) {
    if (response.data == 'FAILURE'){
      // Cant decide on error yet
      return [['ERROR','ERROR']]
    }else{
      return response.data
    }
  });
  const getMakes = await axios.get('http://localhost:3000/vehicle-make').then(function(response) {
    if (response.data == 'FAILURE'){
      // Cant decide on error yet
      return [['ERROR','ERROR']]
    }else{
      return response.data
    }
  });
  const getModels = await axios.get('http://localhost:3000/vehicle-model').then(function(response) {
    if (response.data == 'FAILURE'){
      // Cant decide on error yet
      return [['ERROR','ERROR']]
    }else{
      return response.data
    }
  });
  const getOrderStatus = await axios.get('http://localhost:3000/order-status').then(function(response) {
    if (response.data == 'FAILURE'){
      // Cant decide on error yet
      return [['ERROR','ERROR']]
    }else{
      return response.data
    }
  });
  
  res.render('start', {
    customer: getCustomer,
    serviceorder: getServiceOrder,
    employee: getEmployee,
    states: getStates,
    services: getServices,
    makes: getMakes,
    models: getModels,
    orederstatus: getOrderStatus
  });

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
  
  app.get('/customer', function(req, res){
    res.render('customer');
  });

  app.get('/createorder', async function(req, res){
    const getVehicles = await axios.get('http://localhost:3000/vehicle').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getServices = await axios.get('http://localhost:3000/service').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getEmployees = await axios.get('http://localhost:3000/employee').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    res.render('createorder',{
      vehicles: getVehicles,
      services: getServices,
      employees: getEmployees
    });
  });

  app.get('/editorder', async function(req, res){
    const getOrderStatus = await axios.get('http://localhost:3000/order-status').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getServices = await axios.get('http://localhost:3000/service').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getEmployees = await axios.get('http://localhost:3000/employee').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    res.render('editorder',{
      orderStatuses: getOrderStatus,
      services: getServices,
      employees: getEmployees
    });
  });

  app.get('/createvehicle', async function(req, res){
    const getColor = await axios.get('http://localhost:3000/color').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getMakes = await axios.get('http://localhost:3000/vehicle-make').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getModels = await axios.get('http://localhost:3000/vehicle-model').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getStates = await axios.get('http://localhost:3000/state').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    res.render('createvehicle', {
      makes: getMakes,
      models: getModels,
      color: getColor,
      states: getStates
    });
  });

  app.get('/editvehicle', async function(req, res){
    const getColor = await axios.get('http://localhost:3000/color').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getMakes = await axios.get('http://localhost:3000/vehicle-make').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getModels = await axios.get('http://localhost:3000/vehicle-model').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getStates = await axios.get('http://localhost:3000/state').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    res.render('editvehicle', {
      makes: getMakes,
      models: getModels,
      color: getColor,
      states: getStates
    });
  });

  // remove later: just seeing the customer profile page style
  app.get('/customer', function(req, res) {
    res.render('customer');
  });

  app.get('/createcustomer', async function(req, res) {
    const getColor = await axios.get('http://localhost:3000/color').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getStates = await axios.get('http://localhost:3000/state').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getServices = await axios.get('http://localhost:3000/service').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getMakes = await axios.get('http://localhost:3000/vehicle-make').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getModels = await axios.get('http://localhost:3000/vehicle-model').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    res.render('createcustomer', {
      states: getStates,
      services: getServices,
      makes: getMakes,
      models: getModels,
      color: getColor
    });
  });

  app.get('/editcustomer', async function(req, res) {
    const getColor = await axios.get('http://localhost:3000/color').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getStates = await axios.get('http://localhost:3000/state').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getServices = await axios.get('http://localhost:3000/service').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getMakes = await axios.get('http://localhost:3000/vehicle-make').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getModels = await axios.get('http://localhost:3000/vehicle-model').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    res.render('editcustomer', {
      states: getStates,
      services: getServices,
      makes: getMakes,
      models: getModels,
      color: getColor
    });
  });

  app.get('/reports', async function(req, res) {
    const getServiceOrder = await axios.get('http://localhost:3000/service-order').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getCustomer = await axios.get('http://localhost:3000/customer').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getEmployee = await axios.get('http://localhost:3000/employee').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getStates = await axios.get('http://localhost:3000/state').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getServices = await axios.get('http://localhost:3000/service').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getMakes = await axios.get('http://localhost:3000/vehicle-make').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getModels = await axios.get('http://localhost:3000/vehicle-model').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    const getOrderStatus = await axios.get('http://localhost:3000/order-status').then(function(response) {
      if (response.data == 'FAILURE'){
        // Cant decide on error yet
        return [['ERROR','ERROR']]
      }else{
        return response.data
      }
    });
    
    res.render('reports', {
      customer: getCustomer,
      serviceorder: getServiceOrder,
      employee: getEmployee,
      states: getStates,
      services: getServices,
      makes: getMakes,
      models: getModels,
      orederstatus: getOrderStatus
    });

  });
  
// start the express application on on port 8080
app.listen(port, ()=>console.log('Application started listening on port '+port));