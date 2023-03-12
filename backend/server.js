// oracledb
const express = require("express");
const oracledb = require('oracledb');
const fs = require("fs");
// dotenv
require("dotenv").config();
// Express
const app = express();

//Credentials for oracleDB user from .env
const username = process.env.USER;
const pass = process.env.PASSWORD;
const conn = process.env.CONNECTIONSTRING;

// Client Libraries
let libPath;
if (process.platform === 'win32') {           // Windows
  libPath = 'C:\\oracle\\instantclient_21_9';
} else if (process.platform === 'darwin') {   // macOS
  libPath = process.env.HOME + '/Downloads/instantclient_19_8';
}
if (libPath && fs.existsSync(libPath)) {
  oracledb.initOracleClient({ libDir: libPath });
}

//declare port number for the api
const PORT = process.env.PORT || 3000;
app.use(express.json());

/* CRUD OPS */
// CREATE
async function createOP(query, binds){
    let connection;
    try{
        //CONNECTION OPEN
        connection = await oracledb.getConnection(
            {
                user : username, 
                password : pass, 
                connectString : conn
            });
        console.log("Successfully connected to database");

        // EXECUTION
        result = await connection.executeMany(query, binds, {autoCommit: true});
        console.log("Rows inserted: " + result.rowsAffected);
    }catch(err){
        console.log(err);
    }finally{
        if(connection){
            try{
                //CONNECTION CLOSE
                await connection.close();
                console.log("Connection Closed");
            }catch(err){
                console.log(err);
            }
        }
    }
};
// READ
async function readOP(query){
    let connection;
    try{
        //CONNECTION OPEN
        connection = await oracledb.getConnection(
            {
                user : username, 
                password : pass, 
                connectString : conn
            });
        console.log("Successfully connected to database");

        // EXECUTION
        result = await connection.execute(query);
        return result
    }catch(err){
        console.log(err);
    }finally{
        if(connection){
            try{
                //CONNECTION CLOSE
                await connection.close();
                console.log("Connection Closed");
            }catch(err){
                console.log(err);
            }
        }
    }
};
// UPDATE
async function updateOP(query, binds){
    let connection;
    try{
        //CONNECTION OPEN
        connection = await oracledb.getConnection(
            {
                user : username, 
                password : pass, 
                connectString : conn
            });
        console.log("Successfully connected to database");

        // EXECUTION
        result = await connection.execute(query, binds, {autoCommit: true});
        console.log("Rows Updated: " + result.rowsAffected);
    }catch(err){
        console.log(err);
    }finally{
        if(connection){
            try{
                //CONNECTION CLOSE
                await connection.close();
                console.log("Connection Closed");
            }catch(err){
                console.log(err);
            }
        }
    }
};
// DELETE 
async function deleteOP(query, binds){
    let connection;
    try{
        //CONNECTION OPEN
        connection = await oracledb.getConnection(
            {
                user : username, 
                password : pass, 
                connectString : conn
            });
        console.log("Successfully connected to database");

        // EXECUTION
        result = await connection.execute(query, binds, {autoCommit: true});
        console.log("Rows Deleted: " + result.rowsAffected);
    }catch(err){
        console.log(err);
    }finally{
        if(connection){
            try{
                //CONNECTION CLOSE
                await connection.close();
                console.log("Connection Closed");
            }catch(err){
                console.log(err);
            }
        }
    }
};

/* EMPLOYEE */
// CREATE
app.post('/employee', function(req, res){
  const empAttributes = ':emp_Id,:emp_address,:city,:state,:zip,:phone,:datehired,:Lname,:Fname,:sex'
  let emp_Id = '';
  let emp_address = '';
  let city = '';
  let state = '';
  let zip = '';
  let phone = '';
  let datehired = '';
  let Lname = '';
  let Fname = '';
  let sex = '';
  // Query Creation
  let createQuery = 'INSERT INTO EMPLOYEE VALUES '+'('+empAttributes+')';
  let createBinds = [[emp_Id,emp_address,city,state,zip,phone,datehired,Lname,Fname,sex]];
  createOP(createQuery, createBinds);
});
// READ
app.get('/employee', function(req, res){
  // Query Creation
  let readQuery = 'SELECT * FROM EMPLOYEE';
  readOP(readQuery);
});
// UPDATE
app.put('/employee', function(req, res){
  // Query Creation
  let updateQuery = ''
  let updateBinds = [];
  updateOP(updateQuery, updateBinds);
});
// DELETE
app.delete('/employee', function(req, res){
  let emp_Id = '';
  // Query Creation
  let deleteQuery = 'DELETE FROM EMPLOYEE WHERE id = :1';
  let deleteBinds = [emp_Id];
  deleteOP(deleteQuery, deleteBinds);
});

/* CUSTOMER */
// CREATE
// READ
// UPDATE
// DELETE

/* VENDOR */
// CREATE
// READ
// UPDATE
// DELETE

app.listen(PORT, () => {
    console.log(PORT, "is the magic port");
});
//error handler
app.use(function (err, req, res, next) {
    // logs error and error code to console
    console.error(err.message, req);
    if (!err.statusCode)
      err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});
