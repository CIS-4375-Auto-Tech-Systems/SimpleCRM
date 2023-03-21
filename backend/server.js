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
async function readOP(query, binds){
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
        if (binds === undefined){
            result = await connection.execute(query);
        }else{
            result = await connection.execute(query,binds); 
        }
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
    // Column Names
    const empAttributes = ':emp_id,:emp_address,:city,:state,:zip,:phone,:datehired,:Lname,:Fname,:sex';
    // Values
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
app.get('/employee', async function(req, res){
    // Values
    let restriction = ''; // Search by table attribute
    let restrictionValue = ''; // Value of attribute

    let isRestricted = false; // (TRUE = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let readQuery = 'SELECT * FROM EMPLOYEE WHERE '+restriction+'=:restrictionValue';
        let readBinds = [restrictionValue];
        console.log(await readOP(readQuery,readBinds));
    }else{
        let readQuery = 'SELECT * FROM EMPLOYEE';
        console.log(await readOP(readQuery));
    }
});
// UPDATE
app.put('/employee', function(req, res){
    // Values
    let emp_id = '';
    let emp_address = '';
    let city = '';
    let state = '';
    let zip = '';
    let phone = '';
    let datehired = '';
    let Lname = '';
    let Fname = '';
    let sex = '';
    // Need a way to only update the columns that have been changed
    let columnNames = '';
    let updatedValues = '';
    // Query Creation
    let updateQuery = 'UPDATE EMPLOYEE SET '+columnNames+' = :updatedValues WHERE emp_id =:emp_id';
    let updateBinds = [updatedValues, emp_id];
    updateOP(updateQuery, updateBinds);
});
// DELETE
app.delete('/employee', function(req, res){
    // Values
    let emp_Id = '';
    // Query Creation
    let deleteQuery = 'DELETE FROM EMPLOYEE WHERE emp_id = :emp_id';
    let deleteBinds = [emp_Id];
    deleteOP(deleteQuery, deleteBinds);
});

/* CUSTOMER */
// CREATE
app.post('/customer', function(req, res){
    // Column Names
    const custAttributes = ':cust_id,:name,:address,:city,:state,:zip,:phone,:Edate,:company,:taxnum';
    // Values
    let cust_id = '';
    let name = '';
    let address = '';
    let city = '';
    let state = '';
    let zip = '';
    let phone = '';
    let Edate = '';
    let company = '';
    let taxnum = '';
    // Query Creation
    let createQuery = 'INSERT INTO CUSTOMER VALUES '+'('+custAttributes+')';
    let createBinds = [[cust_id,name,address,city,state,zip,phone,Edate,company,taxnum]];
    createOP(createQuery, createBinds);
});
// READ
app.get('/customer', async function(req, res){
    // Values
    let restriction = ''; // Search by table attribute
    let restrictionValue = ''; // Value of attribute

    let isRestricted = false; // (TRUE = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let readQuery = 'SELECT * FROM CUSTOMER WHERE '+restriction+'=:restrictionValue';
        let readBinds = [restrictionValue];
        console.log(await readOP(readQuery,readBinds));
    }else{
        let readQuery = 'SELECT * FROM CUSTOMER';
        console.log(await readOP(readQuery));
    }
});
// UPDATE
app.put('/customer', function(req, res){
    // Values
    let cust_id = '';
    let name = '';
    let address = '';
    let city = '';
    let state = '';
    let zip = '';
    let phone = '';
    let Edate = '';
    let company = '';
    let taxnum = '';
    // Need a way to only update the columns that have been changed
    let columnNames = '';
    let updatedValues = '';
    // Query Creation
    let updateQuery = 'UPDATE CUSTOMER SET '+columnNames+' = :updatedValues WHERE cust_id =:cust_id';
    let updateBinds = [updatedValues, cust_id];
    updateOP(updateQuery, updateBinds);
});
// DELETE
app.delete('/customer', function(req, res){
    // Values
    let cust_id = '';
    // Query Creation
    let deleteQuery = 'DELETE FROM CUSTOMER WHERE cust_id = :cust_id';
    let deleteBinds = [cust_id];
    deleteOP(deleteQuery, deleteBinds);
});

/* VENDOR */
// CREATE
app.post('/vendor', function(req, res){
    // Column Names
    const vendAttributes = ':vendor_id,:ven_name,:address,:city,:state,:zip,:phone,:phone2,:fax,:contact,:Edate,:email,:keymap';
    // Values
    let vendor_id = '';
    let ven_name = '';
    let address = '';
    let city = '';
    let state = '';
    let zip = '';
    let phone = '';
    let phone2 = '';
    let fax = '';
    let contact = '';
    let Edate = '';
    let email = '';
    let keymap = '';
    // Query Creation
    let createQuery = 'INSERT INTO VENDOR VALUES '+'('+vendAttributes+')';
    let createBinds = [[vendor_id,ven_name,address,city,state,zip,phone,phone2,fax,contact,Edate,email,keymap]];
    createOP(createQuery, createBinds);
});
// READ
app.get('/vendor', async function(req, res){
    // Values
    let restriction = ''; // Search by table attribute
    let restrictionValue = ''; // Value of attribute

    let isRestricted = false; // (TRUE = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let readQuery = 'SELECT * FROM VENDOR WHERE '+restriction+'=:restrictionValue';
        let readBinds = [restrictionValue];
        console.log(await readOP(readQuery,readBinds));
    }else{
        let readQuery = 'SELECT * FROM CUSTOMER';
        console.log(await readOP(readQuery));
    }
});
// UPDATE
app.put('/vendor', function(req, res){
    // Values
    let vendor_id = '';
    let ven_name = '';
    let address = '';
    let city = '';
    let state = '';
    let zip = '';
    let phone = '';
    let phone2 = '';
    let fax = '';
    let contact = '';
    let Edate = '';
    let email = '';
    let keymap = '';
    // Need a way to only update the columns that have been changed
    let columnNames = '';
    let updatedValues = '';
    // Query Creation
    let updateQuery = 'UPDATE CUSTOMER SET '+columnNames+' = :updatedValues WHERE cust_id =:cust_id';
    let updateBinds = [updatedValues, cust_id];
    updateOP(updateQuery, updateBinds);
});
// DELETE
app.delete('/vendor', function(req, res){
    // Values
    let vendor_id = '';
    // Query Creation
    let deleteQuery = 'DELETE FROM CUSTOMER WHERE vendor_id = :vendor_id';
    let deleteBinds = [vendor_id];
    deleteOP(deleteQuery, deleteBinds);
});

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
