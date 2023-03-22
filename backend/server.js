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
        return 'Success'
    }catch(err){
        console.log(err);
        return err
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
        return err
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
        return 'Success'
    }catch(err){
        console.log(err);
        return err
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
        return 'Success'
    }catch(err){
        console.log(err);
        return err
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
app.post('/employee', async function(req, res){
    // Column Names
    const empAttributes = ":emp_id,:emp_address,:city,:state,:zip,:phone,:datehired,:Lname,:Fname,:sex";
    // Values
    let emp_id = req.body.id;
    let emp_address = req.body.address;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;
    let phone = req.body.phone;
    let datehired = new Date(req.body.datehired);
    let Lname = req.body.lastname;
    let Fname = req.body.firstname;
    let sex = req.body.sex;
    // Query Creation
    let createQuery = 'INSERT INTO EMPLOYEE VALUES '+'('+empAttributes+')';
    let createBinds = [[emp_id,emp_address,city,state,zip,phone,datehired,Lname,Fname,sex]];
    res.send(await createOP(createQuery, createBinds));
});
// READ
app.get('/employee', async function(req, res){
    // Values
    let restriction = req.body.restriction; // Search by table attribute
    let restrictionValue = req.body.restrictionvalue; // Value of attribute

    let isRestricted = req.body.isRestricted || false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
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
app.put('/employee', async function(req, res){
    // Columns
    const empAttributes = "emp_address = :emp_address, city = :city, state = :state, zip = :zip, phone = :phone, datehired = :datehired, Lname = :Lname,Fname = :Fname, sex = :sex"
    // Values
    let emp_id = req.body.id;
    // READ COMPARE and UPDATE
    /*READ*/
    //Current Values
    let restrictionValue = emp_id;
    let readQuery = 'SELECT * FROM EMPLOYEE WHERE emp_id =:restrictionValue'
    let readBinds = [restrictionValue];
    let readEmp = await readOP(readQuery, readBinds);
    let currentEmp = readEmp.rows[0];
    // Store Old
    let currentAddress = currentEmp[1];
    let currentCity = currentEmp[2];
    let currentState = currentEmp[3];
    let currentZip = currentEmp[4];
    let currentPhone = currentEmp[5];
    let currentDateHired = currentEmp[6];
    let currentLname = currentEmp[7];
    let currentFname = currentEmp[8];
    let currentSex = currentEmp[9];
    // Request New
    let newCity = req.body.city;
    let newState = req.body.state;
    let newZip = req.body.zip;
    let newPhone = req.body.phone;
    let newDateHired = new Date(req.body.datehired);
    let newLname = req.body.lastname;
    let newFname = req.body.firstname;
    let newSex = req.body.sex;

    // INITAL
    let emp_address = '';
    let city = '';
    let state = '';
    let zip = '';
    let phone = '';
    let datehired = '';
    let Lname = '';
    let Fname = '';
    let sex = '';

    /* COMPARE and UPDATE */
    if (currentAddress.toUpperCase() == newAddress.toUpperCase()){
        emp_address = currentAddress;
    }else if (currentAddress.toUpperCase() != newAddress.toUpperCase()){
        emp_address = newAddress;
    };
    if (currentCity.toUpperCase() == newCity.toUpperCase()){
        city = currentCity;
    }else if (currentCity.toUpperCase() != newCity.toUpperCase()){
        city = newCity;
    };
    if (currentState.toUpperCase() == newState.toUpperCase()){
        state = currentState;
    }else if (currentState.toUpperCase() != newState.toUpperCase()){
        state = newState;
    };
    if (currentZip.toUpperCase() == newZip.toUpperCase()){
        zip = currentZip;
    }else if (currentZip.toUpperCase() != newZip.toUpperCase()){
        zip = newZip;
    };
    if (currentPhone.toUpperCase() == newPhone.toUpperCase()){
        phone = currentPhone;
    }else if (currentPhone.toUpperCase() != newPhone.toUpperCase()){
        phone = newPhone;
    };
    if (currentDateHired == newDateHired){
        datehired = currentDateHired;
    }else if (currentDateHired  != newDateHired){
        datehired = newDateHired;
    };
    if (currentLname.toUpperCase() == newLname.toUpperCase()){
        Lname = currentLname;
    }else if (currentLname.toUpperCase() != newLname.toUpperCase()){
        Lname = newLname;
    };
    if (currentFname.toUpperCase() == newFname.toUpperCase()){
        Fname = currentFname;
    }else if (currentFname.toUpperCase() != newFname.toUpperCase()){
        Fname = newFname;
    };
    if (currentSex.toUpperCase() == newSex.toUpperCase()){
        sex = currentSex;
    }else if (currentSex.toUpperCase() != newSex.toUpperCase()){
        sex = newAddress;
    };
    // Query Creation 
    let updateQuery = 'UPDATE EMPLOYEE SET ' +empAttributes+ ' WHERE emp_id = :emp_id';
    let updateBinds = [emp_address,city,state,zip,phone,datehired,Lname,Fname,sex,emp_id];
    res.send(await updateOP(updateQuery, updateBinds));
});
// DELETE
app.delete('/employee',async function(req, res){
    // Values
    let emp_id = req.body.id;
    // Query Creation
    let deleteQuery = 'DELETE FROM EMPLOYEE WHERE emp_id = :emp_id';
    let deleteBinds = [emp_id];
    res.send(await deleteOP(deleteQuery, deleteBinds));
});

/* CUSTOMER */
// CREATE
app.post('/customer',async function(req, res){
    // Column Names
    const custAttributes = ':cust_id,:name,:address,:city,:state,:zip,:phone,:Edate,:company,:taxnum';
    // Values
    let cust_id = req.body.id;
    let name = req.body.name;
    let address = req.body.address;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;
    let phone = req.body.phone;
    let Edate = new Date (req.body.edate);
    let company = req.body.company;
    let taxnum = req.body.taxnum;
    // Query Creation
    let createQuery = 'INSERT INTO CUSTOMER VALUES '+'('+custAttributes+')';
    let createBinds = [[cust_id,name,address,city,state,zip,phone,Edate,company,taxnum]];
    res.send(await createOP(createQuery, createBinds));
});
// READ
app.get('/customer', async function(req, res){
    // Values
    let restriction = req.body.restriction; // Search by table attribute
    let restrictionValue = req.body.restrictionvalue; // Value of attribute

    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
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
app.put('/customer', async function(req, res){
    // Columns
    const custAttributes = "name = :name, address = :address, city = :city, state = :state, zip = :zip, phone = :phone, Edate = :Edate, company = :company, taxnum = :taxnum";
    // Values
    let cust_id = req.body.id ||'';
    // READ COMPARE and UPDATE
    /*READ*/
    //Current Values
    let restrictionValue = cust_id;
    let readQuery = 'SELECT * FROM CUSTOMER WHERE cust_id = :restrictionValue';
    let readBinds = [restrictionValue];
    let readCust = await readOP(readQuery, readBinds);
    let currentCust = readCust.rows[0];
    // Store Old
    let currentName = currentCust[1];
    let currentAddress = currentCust[2];
    let currentCity = currentCust[3];
    let currentState = currentCust[4];
    let currentZip = currentCust[5];
    let currentPhone = currentCust[6];
    let currentEdate = currentCust[7];
    let currentCompany = currentCust[8];
    let currentTaxnum = currentCust[9];
    // Request New
    let newName = req.body.name;
    let newAddress = req.body.address;
    let newCity = req.body.city;
    let newState = req.body.state;
    let newZip = req.body.zip;
    let newPhone = req.body.phone;
    let newEdate = new Date(req.body.edate);
    let newCompany = req.body.company;
    let newTaxnum = req.body.taxnum;

    // INITAL
    let name = '';
    let address = '';
    let city = '';
    let state = '';
    let zip = '';
    let phone = '';
    let Edate = '';
    let company = '';
    let taxnum = '';

    /* COMPARE and UPDATE */
    if (currentName.toUpperCase() == newName.toUpperCase()){
        name = currentName;
    }else if (currentName.toUpperCase() != newName.toUpperCase()){
        name = newName;
    };
    if (currentAddress.toUpperCase() == newAddress.toUpperCase()){
        address = currentAddress;
    }else if (currentAddress.toUpperCase() != newAddress.toUpperCase()){
        address = newAddress;
    };
    if (currentCity.toUpperCase() == newCity.toUpperCase()){
        city = currentCity;
    }else if (currentCity.toUpperCase() != newCity.toUpperCase()){
        city = newCity;
    };
    if (currentState.toUpperCase() == newState.toUpperCase()){
        state = currentState;
    }else if (currentName.toUpperCase() != newState.toUpperCase()){
        state = newState;
    };
    if (currentZip.toUpperCase() == newZip.toUpperCase()){
        zip = currentZip;
    }else if (currentZip.toUpperCase() != newZip.toUpperCase()){
        zip = newZip;
    };
    if (currentPhone.toUpperCase() == newPhone.toUpperCase()){
        phone = currentPhone;
    }else if (currentPhone.toUpperCase() != newPhone.toUpperCase()){
        phone = newPhone;
    };
    if (currentEdate === newEdate){
        Edate = currentEdate;
    }else if (currentEdate != newEdate){
        Edate = newEdate;
    };
    if (currentCompany.toUpperCase() == newCompany.toUpperCase()){
        company = currentCompany;
    }else if (currentCompany.toUpperCase() != newCompany.toUpperCase()){
        company = newCompany;
    };
    if (currentTaxnum.toUpperCase() == newTaxnum.toUpperCase()){
        taxnum = currentTaxnum;
    }else if (currentTaxnum.toUpperCase() != newTaxnum.toUpperCase()){
        taxnum = newTaxnum;
    };
    // Query Creation
    let updateQuery = 'UPDATE CUSTOMER SET '+custAttributes+' WHERE cust_id =:cust_id';
    let updateBinds = [name, address, city, state, zip, phone, Edate, company, taxnum, cust_id];
    res.send(await updateOP(updateQuery, updateBinds));
});
// DELETE
app.delete('/customer',async function(req, res){
    // Values
    let cust_id = req.body.id;
    // Query Creation
    let deleteQuery = 'DELETE FROM CUSTOMER WHERE cust_id = :cust_id';
    let deleteBinds = [cust_id];
    res.send(await deleteOP(deleteQuery, deleteBinds));
});

/* VENDOR */
// CREATE
app.post('/vendor',async function(req, res){
    // Column Names
    const vendAttributes = ':vendor_id,:ven_name,:address,:city,:state,:zip,:phone,:phone2,:fax,:contact,:Edate,:email,:keymap';
    // Values
    let vendor_id = req.body.id;
    let ven_name = req.body.name;
    let address = req.body.address ;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;
    let phone = req.body.phone;
    let phone2 = req.body.phone2;
    let fax = req.body.fax;
    let contact = req.body.contact;
    let Edate = new Date(req.body.edate);
    let email = req.body.email;
    let keymap = req.body.keymap;
    // Query Creation
    let createQuery = 'INSERT INTO VENDOR VALUES '+'('+vendAttributes+')';
    let createBinds = [[vendor_id,ven_name,address,city,state,zip,phone,phone2,fax,contact,Edate,email,keymap]];
    res.send(await createOP(createQuery, createBinds));
});
// READ
app.get('/vendor', async function(req, res){
    // Values
    let restriction = req.body.restriction; // Search by table attribute
    let restrictionValue = req.body.restrictionvalue; // Value of attribute

    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
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
app.put('/vendor',async function(req, res){
    // Columns
    const vendAttributes = 'ven_name = :ven_name, address = :address, city = :city, state = :state, zip = :zip, phone1 = :phone1, phone2 = :phone2, fax = :fax, contact = :contact, Edate = :Edate, email = :email, keymap = :keymap';
    // Values
    let vendor_id = req.body.id;
    // READ COMPARE and UPDATE
    /*READ*/
    //Current Values
    let restrictionValue = vendor_id;
    let readQuery = 'SELCT * FROM VENDOR WHERE vendor_id = :restrictionValue';
    let readBinds = [restrictionValue];
    let readVend = await readOP(readQuery, readBinds);
    let currentVend = readVend.rows[0];
    // Store Old
    let currentName = currentVend[1];
    let currentAddress = currentVend[2];
    let currentCity = currentVend[3];
    let currentState = currentVend[4];
    let currentZip = currentVend[9];
    let currentPhone1 = currentVend[5];
    let currentPhone2 = currentVend[6];
    let currentFax = currentVend[7];
    let currentContact = currentVend[8];
    let currentEdate = currentVend[10];
    let currentEmail = currentVend[11];
    let currentKeymap = currentVend[12];
    // Request New
    let newName = req.body.name;
    let newAddress = req.body.address;
    let newCity = req.body.city;
    let newState = req.body.state;
    let newZip = req.body.zip;
    let newPhone1 = req.body.phone1;
    let newPhone2 = req.body.phone2;
    let newFax = req.body.fax;
    let newContact = req.body.contact;
    let newEdate = new Date(req.body.edate);
    let newEmail = req.body.email;
    let newKeymap = req.body.keymap;

    // INITAL
    let ven_name = '';
    let address = '';
    let city = '';
    let state = '';
    let zip = '';
    let phone1 = '';
    let phone2 = '';
    let fax = '';
    let contact = '';
    let Edate = '';
    let email = '';
    let keymap = '';

    /* COMPARE and UPDATE */
    if (currentName.toUpperCase() == newName.toUpperCase()){
        ven_name = currentName;
    }else if (currentName.toUpperCase() != newName.toUpperCase()){
        ven_name = newName;
    };
    if (currentAddress.toUpperCase() == newAddress.toUpperCase()){
        address = currentAddress;
    }else if (currentAddress.toUpperCase() != newAddress.toUpperCase()){
        address = newAddress;
    };
    if (currentCity.toUpperCase() == newCity.toUpperCase()){
        city = currentCity;
    }else if (currentCity.toUpperCase() != newCity.toUpperCase()){
        city = newCity;
    };
    if (currentState.toUpperCase() == newState.toUpperCase()){
        state = currentState;
    }else if (currentName.toUpperCase() != newState.toUpperCase()){
        state = newState;
    };
    if (currentZip.toUpperCase() == newZip.toUpperCase()){
        zip = currentZip;
    }else if (currentZip.toUpperCase() != newZip.toUpperCase()){
        zip = newZip;
    };
    if (currentPhone1.toUpperCase() == newPhone1.toUpperCase()){
        phone1 = currentPhone1;
    }else if (currentPhone1.toUpperCase() != newPhone1.toUpperCase()){
        phone1 = newPhone1;
    };
    if (currentPhone2.toUpperCase() == newPhone2.toUpperCase()){
        phone2 = currentPhone2;
    }else if (currentPhone2.toUpperCase() != newPhone2.toUpperCase()){
        phone2 = newPhone2;
    };
    if (currentFax.toUpperCase() == newFax.toUpperCase()){
        fax = currentFax;
    }else if (currentFax.toUpperCase() != newFax.toUpperCase()){
        fax = newFax;
    };
    if (currentContact.toUpperCase() == newContact.toUpperCase()){
        contact = currentContact;
    }else if (currentContact.toUpperCase() != newContact.toUpperCase()){
        contact = newContact;
    };
    if (currentEdate === newEdate){
        Edate = currentEdate;
    }else if (currentEdate != newEdate){
        Edate = newEdate;
    };
    if (currentEmail.toUpperCase() == newEmail.toUpperCase()){
        email = currentEmail;
    }else if (currentEmail.toUpperCase() != newEmail.toUpperCase()){
        email = newEmail;
    };
    if (currentKeymap.toUpperCase() == newKeymap.toUpperCase()){
        keymap = currentKeymap;
    }else if (currentKeymap.toUpperCase() != newKeymap.toUpperCase()){
        keymap = newKeymap;
    };
    // Query Creation
    let updateQuery = 'UPDATE CUSTOMER SET '+vendAttributes+' WHERE vendor_id =:vendor_id';
    let updateBinds = [ven_name, address, city, state, zip, phone1, phone2,fax, contact, Edate, email, keymap, vendor_id];
    res.send(await updateOP(updateQuery, updateBinds));
});
// DELETE
app.delete('/vendor',async function(req, res){
    // Values
    let vendor_id = req.body.id;
    // Query Creation
    let deleteQuery = 'DELETE FROM CUSTOMER WHERE vendor_id = :vendor_id';
    let deleteBinds = [vendor_id];
    res.send(await deleteOP(deleteQuery, deleteBinds));
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
