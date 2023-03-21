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
    let emp_Id = req.body.id ||'';
    let emp_address = req.body.address ||'';
    let city = req.body.city ||'';
    let state = req.body.state ||'';
    let zip = req.body.zip ||'';
    let phone = req.body.phone ||'';
    let datehired = req.body.datehired ||'';
    let Lname = req.body.lastname ||'';
    let Fname = req.body.firstname ||'';
    let sex = req.body.sex ||'';
    // Query Creation
    let createQuery = 'INSERT INTO EMPLOYEE VALUES '+'('+empAttributes+')';
    let createBinds = [[emp_Id,emp_address,city,state,zip,phone,datehired,Lname,Fname,sex]];
    createOP(createQuery, createBinds);
});
// READ
app.get('/employee', async function(req, res){
    // Values
    let restriction = req.body.restriction ||''; // Search by table attribute
    let restrictionValue = req.body.restrictionvalue ||''; // Value of attribute

    let isRestricted = req.body.isRestricted || false; // (TRUE = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let readQuery = 'SELECT * FROM EMPLOYEE WHERE '+restriction+'=:restrictionValue';
        let readBinds = [restrictionValue];
        // Send a response
        res.send(await readOP(readQuery,readBinds));
    }else{
        let readQuery = 'SELECT * FROM EMPLOYEE';
        // Send a response
        res.send(await readOP(readQuery));
    }
});
// UPDATE
app.put('/employee', function(req, res){
    /*
    Most likely going to read customer by ID and compare their current values to the new values.
    IF the value is different THEN it will UPDATE the column to the new value.
    Will repeat for each column other than ID.
    */
    // Values
    let emp_id = req.body.id ||'';
    let emp_address = req.body.address ||'';
    let city = req.body.city ||'';
    let state = req.body.state ||'';
    let zip = req.body.zip ||'';
    let phone = req.body.phone ||'';
    let datehired = req.body.datehired ||'';
    let Lname = req.body.lastname ||'';
    let Fname = req.body.firstname ||'';
    let sex = req.body.sex ||'';
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
    let emp_Id = req.body.id ||'';
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
    let cust_id = req.body.id ||'';
    let name = req.body.name ||'';
    let address = req.body.address ||'';
    let city = req.body.city ||'';
    let state = req.body.state ||'';
    let zip = req.body.zip ||'';
    let phone = req.body.phone ||'';
    let Edate = req.body.edate ||'';
    let company = req.body.company ||'';
    let taxnum = req.body.taxnum ||'';
    // Query Creation
    let createQuery = 'INSERT INTO CUSTOMER VALUES '+'('+custAttributes+')';
    let createBinds = [[cust_id,name,address,city,state,zip,phone,Edate,company,taxnum]];
    createOP(createQuery, createBinds);
});
// READ
app.get('/customer', async function(req, res){
    // Values
    let restriction = req.body.restriction ||''; // Search by table attribute
    let restrictionValue = req.body.restrictionvalue ||''; // Value of attribute

    let isRestricted = req.body.isRestricted ||false; // (TRUE = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let readQuery = 'SELECT * FROM CUSTOMER WHERE '+restriction+'=:restrictionValue';
        let readBinds = [restrictionValue];
        // Send a response
        res.send(await readOP(readQuery,readBinds));
    }else{
        let readQuery = 'SELECT * FROM CUSTOMER';
        // Send a response
        res.send(await readOP(readQuery));
    }
});
// UPDATE
app.put('/customer', function(req, res){
    /*
    Most likely going to read customer by ID and compare their current values to the new values.
    IF the value is different THEN it will UPDATE the column to the new value.
    Will repeat for each column other than ID.
    */
    // Values
    let cust_id = req.body.id ||'';
    let name = req.body.name ||'';
    let address = req.body.address ||'';
    let city = req.body.city ||'';
    let state = req.body.state ||'';
    let zip = req.body.zip ||'';
    let phone = req.body.phone ||'';
    let Edate = req.body.edate ||'';
    let company = req.body.company ||'';
    let taxnum = req.body.taxnum ||'';
    // SEE ABOVE
    let columnName = '';
    let updatedValue = '';
    // Query Creation
    let updateQuery = 'UPDATE CUSTOMER SET '+columnName+' = :updatedValue WHERE cust_id =:cust_id';
    let updateBinds = [updatedValue, cust_id];
    updateOP(updateQuery, updateBinds);
});
// DELETE
app.delete('/customer', function(req, res){
    // Values
    let cust_id = req.body.id ||'';
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
    let vendor_id = req.body.id ||'';
    let ven_name = req.body.name ||'';
    let address = req.body.address ||'';
    let city = req.body.city ||'';
    let state = req.body.state ||'';
    let zip = req.body.zip ||'';
    let phone = req.body.phone ||'';
    let phone2 = req.body.phone2 ||'';
    let fax = req.body.fax ||'';
    let contact = req.body.contact ||'';
    let Edate = req.body.edate ||'';
    let email = req.body.email ||'';
    let keymap = req.body.keymap ||'';
    // Query Creation
    let createQuery = 'INSERT INTO VENDOR VALUES '+'('+vendAttributes+')';
    let createBinds = [[vendor_id,ven_name,address,city,state,zip,phone,phone2,fax,contact,Edate,email,keymap]];
    createOP(createQuery, createBinds);
});
// READ
app.get('/vendor', async function(req, res){
    // Values
    let restriction = req.body.restriction ||''; // Search by table attribute
    let restrictionValue = req.body.restrictionvalue ||''; // Value of attribute

    let isRestricted = req.body.isRestricted ||false; // (TRUE = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let readQuery = 'SELECT * FROM VENDOR WHERE '+restriction+'=:restrictionValue';
        let readBinds = [restrictionValue];
        // Send a response
        res.send(await readOP(readQuery,readBinds));
    }else{
        let readQuery = 'SELECT * FROM CUSTOMER';
        // Send a response
        res.send(await readOP(readQuery));
    }
});
// UPDATE
app.put('/vendor', function(req, res){
    /*
    Most likely going to read customer by ID and compare their current values to the new values.
    IF the value is different THEN it will UPDATE the column to the new value.
    Will repeat for each column other than ID.
    */
    // Values
    let vendor_id = req.body.id ||'';
    let ven_name = req.body.name ||'';
    let address = req.body.address ||'';
    let city = req.body.city ||'';
    let state = req.body.state ||'';
    let zip = req.body.zip ||'';
    let phone = req.body.phone ||'';
    let phone2 = req.body.phone2 ||'';
    let fax = req.body.fax ||'';
    let contact = req.body.contact ||'';
    let Edate = req.body.edate ||'';
    let email = req.body.email ||'';
    let keymap = req.body.keymap ||'';
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
    let vendor_id = req.body.id ||'';
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
