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
};
if (libPath && fs.existsSync(libPath)) {
  oracledb.initOracleClient({ libDir: libPath });
};

//declare port number for the api
const PORT = process.env.PORT || 3000;
app.use(express.json());

/* CRUD OPS */
async function crudOP(query, binds, isRead){
    let connection;
    try{
        //OPEN CONNECTION
        connection = await oracledb.getConnection({
            user: username,
            password: pass,
            connectString: conn
        });
        console.log('[DB]CONNECTION OPEN');
        // EXECUTE QUERY
        if (binds === undefined) {
            if (isRead) {
                // If NO Binds and IS Reading
                result = await connection.execute(query);
            }else{
                //  If NO Binds and IS NOT Reading
                result = await connection.execute(query, {autoCommit:true});
                console.log(`${result.rowsAffected} Rows Affected`);
            }
        }else{
            if (isRead) {
                //  If Binds and IS Reading
                result = await connection.execute(query,binds);
            }else{
                //  If Binds and IS NOT Reading
                result = await connection.execute(query,binds, {autoCommit:true});
                console.log(`${result.rowsAffected} Rows Affected`);
            }
        }
        return result
    }catch(err){
        console.log(err);
        return 'FAILURE'
    }finally{
        if (connection){
            try{
                // CLOSE CONNECTION
                await connection.close();
                console.log('[DB]CONNECTION CLOSED');
            }catch(err){
                console.log(err);
            }
        }
    }
};
/* Compare and Update */
function compare_update(oldValue, newValue) {
    if (oldValue.toUpperCase() == newValue.toUpperCase()) {
        return oldValue;
    } else if (oldValue.toUpperCase() != newValue.toUpperCase()) {
        return newValue;
    }
};

/* EMPLOYEE */
// CREATE
app.post('/employee', async function(req, res){
    // Column Names
    const empAttributes = ":emp_id, :emp_address, :city, :state, :zip, :phone, :datehired, :Lname, :Fname, :sex";
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
    let query = `INSERT INTO EMPLOYEE VALUES (${empAttributes})`;
    let binds = [emp_id,emp_address,city,state,zip,phone,datehired,Lname,Fname,sex];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/employee', async function(req, res){
    // For WHERE statement
    let column = req.body.column; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted || false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM EMPLOYEE WHERE ${column} = :columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query,binds, true));
    }else{
        let query = 'SELECT * FROM EMPLOYEE';
        // Send a response
        res.send(await crudOP(query, undefined, true));
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
    let readQuery = 'SELECT * FROM EMPLOYEE WHERE emp_id = :emp_id'
    let readBinds = [emp_id];
    let readEmp = await crudOP(readQuery, readBinds, true);
    let currentEmp = readEmp.rows[0];
    // Store Old
    let oldAddress = currentEmp[1];
    let oldCity = currentEmp[2];
    let oldState = currentEmp[3];
    let oldZip = currentEmp[4];
    let oldPhone = currentEmp[5];
    let oldDateHired = currentEmp[6];
    let oldLname = currentEmp[7];
    let oldFname = currentEmp[8];
    let oldSex = currentEmp[9];
    // Request New
    let newAddress = req.body.address;
    let newCity = req.body.city;
    let newState = req.body.state;
    let newZip = req.body.zip;
    let newPhone = req.body.phone;
    let newDateHired = new Date(req.body.datehired);
    let newLname = req.body.lastname;
    let newFname = req.body.firstname;
    let newSex = req.body.sex;

    /* COMPARE and UPDATE */
    let emp_address = compare_update(oldAddress,newAddress);
    let city = compare_update(oldCity, newCity);
    let state = compare_update(oldState, newState);
    let zip = compare_update(oldZip, newZip);
    let phone = compare_update(oldPhone, newPhone);
    let datehired = '';
    if (oldDateHired == newDateHired){
        datehired = oldDateHired;
    }else if (oldDateHired  != newDateHired){
        datehired = newDateHired;
    };
    let Lname = compare_update(oldLname, newLname);
    let Fname = compare_update(oldFname, newFname);
    let sex = compare_update(oldSex, newSex);
    // Query Creation 
    let query = `UPDATE EMPLOYEE SET ${empAttributes} WHERE emp_id = :emp_id`;
    let binds = [emp_address,city,state,zip,phone,datehired,Lname,Fname,sex,emp_id];
    res.send(await crudOP(updateQuery, updateBinds, false));
});
// DELETE
app.delete('/employee',async function(req, res){
    // Values
    let emp_id = req.body.id;
    // Query Creation
    let query = 'DELETE FROM EMPLOYEE WHERE emp_id = :emp_id';
    let binds = [emp_id];
    res.send(await crudOP(query, binds, false));
});
/* EMP_STATUS */
// READ
app.get('/employee_status', async function(req, res){
    // For WHERE statement
    let column = req.body.column; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted || false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM EMP_STATUS WHERE ${column} = :columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query,binds, true));
    }else{
        let query = 'SELECT * FROM EMP_STATUS';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});

/* CUSTOMER */
// CREATE
app.post('/customer',async function(req, res){
    // Column Names
    const custAttributes = ':cust_id, :name, :address, :city, :state, :zip, :phone, :Edate, :company, :taxnum';
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
    let query = `INSERT INTO CUSTOMER VALUES (${custAttributes})`;
    let binds = [cust_id,name,address,city,state,zip,phone,Edate,company,taxnum];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/customer', async function(req, res){
    // For WHERE statement
    let column = req.body.column; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted || false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM CUSTOMER WHERE ${column} =:columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query,binds, true));
    }else{
        let query = 'SELECT * FROM CUSTOMER';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});
// UPDATE
app.put('/customer', async function(req, res){
    // Columns
    const custAttributes = "name = :name, address = :address, city = :city, state = :state, zip = :zip, phone = :phone, Edate = :Edate, company = :company, taxnum = :taxnum";
    // Values
    let cust_id = req.body.id;
    // READ COMPARE and UPDATE
    /*READ*/
    //Current Values
    let readQuery = 'SELECT * FROM CUSTOMER WHERE cust_id = :cust_id';
    let readBinds = [cust_id];
    let readCust = await crudOP(readQuery, readBinds, true);
    let currentCust = readCust.rows[0];
    // Store Old
    let oldName = currentCust[1];
    let oldAddress = currentCust[2];
    let oldCity = currentCust[3];
    let oldState = currentCust[4];
    let oldZip = currentCust[5];
    let oldPhone = currentCust[6];
    let oldEdate = currentCust[7];
    let oldCompany = currentCust[8];
    let oldTaxnum = currentCust[9];
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

    /* COMPARE and UPDATE */
    let name = compare_update(oldName, newName);
    let address = compare_update(oldAddress,newAddress);
    let city = compare_update(oldCity, newCity);
    let state = compare_update(oldState, newState);
    let zip = compare_update(oldZip, newZip);
    let phone = compare_update(oldPhone, newPhone);
    let Edate = '';
    if (oldEdate === newEdate){
        Edate = currentEdate;
    }else if (oldEdate != newEdate){
        Edate = newEdate;
    };
    let company = compare_update(oldCompany,newCompany);
    let taxnum = compare_update(oldTaxnum, newTaxnum);
    // Query Creation
    let query = `UPDATE CUSTOMER SET ${custAttributes} WHERE cust_id =:cust_id`;
    let binds = [name, address, city, state, zip, phone, Edate, company, taxnum, cust_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/customer',async function(req, res){
    // Values
    let cust_id = req.body.id;
    // Query Creation
    let query = 'DELETE FROM CUSTOMER WHERE cust_id = :cust_id';
    let binds = [cust_id];
    res.send(await crudOP(query, binds, false));
});
/* CUST_STATUS */
// READ
app.get('/customer_status', async function(req, res){
    // For WHERE statement
    let column = req.body.column; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM CUST_STATUS WHERE ${column} =:columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query,binds, true));
    }else{
        let query = 'SELECT * FROM CUST_STATUS';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});

/* VENDOR */
// CREATE
app.post('/vendor',async function(req, res){
    // Column Names
    const vendAttributes = ':vendor_id, :ven_name, :address, :city, :state, :zip, :phone, :phone2, :fax, :contact, :Edate, :email, :keymap';
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
    let query = `INSERT INTO VENDOR VALUES (${vendAttributes})`;
    let binds = [vendor_id,ven_name,address,city,state,zip,phone,phone2,fax,contact,Edate,email,keymap];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/vendor', async function(req, res){
    // For WHERE statement
    let column = req.body.column; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM VENDOR WHERE ${column} =:columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query,binds, true));
    }else{
        let query = 'SELECT * FROM VENDOR';
        // Send a response
        res.send(await crudOP(query, undefined, true));
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
    let readQuery = 'SELCT * FROM VENDOR WHERE vendor_id = :vendor_id';
    let readBinds = [vendor_id];
    let readVend = await crudOP(readQuery, readBinds, true);
    let currentVend = readVend.rows[0];
    // Store Old
    let oldName = currentVend[1];
    let oldAddress = currentVend[2];
    let oldCity = currentVend[3];
    let oldState = currentVend[4];
    let oldZip = currentVend[9];
    let oldPhone1 = currentVend[5];
    let oldPhone2 = currentVend[6];
    let oldFax = currentVend[7];
    let oldContact = currentVend[8];
    let oldEdate = currentVend[10];
    let oldEmail = currentVend[11];
    let oldKeymap = currentVend[12];
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

    /* COMPARE and UPDATE */
    let ven_name = compare_update(oldName,newName);
    let address = compare_update(oldAddress,newAddress);
    let city = compare_update(oldCity,newCity);
    let state = compare_update(oldState,newState);
    let zip = compare_update(oldZip,newZip);
    let phone1 = compare_update(oldPhone1,newPhone1);
    let phone2 = compare_update(oldPhone2,newPhone2);
    let fax = compare_update(oldFax,newFax);
    let contact = compare_update(oldContact,newContact);
    let Edate = '';
    if (oldEdate === newEdate){
        Edate = currentEdate;
    }else if (oldEdate != newEdate){
        Edate = newEdate;
    };
    let email = compare_update(oldEmail,newEmail);
    let keymap = compare_update(oldKeymap,newKeymap);

    // Query Creation
    let query = `UPDATE CUSTOMER SET ${vendAttributes} WHERE vendor_id =:vendor_id`;
    let binds = [ven_name, address, city, state, zip, phone1, phone2,fax, contact, Edate, email, keymap, vendor_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/vendor',async function(req, res){
    // Values
    let vendor_id = req.body.id;
    // Query Creation
    let query = 'DELETE FROM CUSTOMER WHERE vendor_id = :vendor_id';
    let binds = [vendor_id];
    res.send(await crudOP(query, binds, false));
});
/* VENDOR_INV */
// READ
app.get('/vendor_inventory', async function(req, res){
    // For WHERE statement
    let column = req.body.column; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted || false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM VENDOR_INV WHERE ${column} = :columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query,binds, true));
    }else{
        let query = 'SELECT * FROM VENDOR_INV';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});

/* PART */
// READ
app.get('/part', async function(req, res){
    // For WHERE statement
    let column = req.body.column; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM PART WHERE ${column} =:columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query,binds, true));
    }else{
        let query = 'SELECT * FROM PART';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});

/* ESTIMATE */
// READ


/* INVOICE */
// READ


/* STATE */
// READ
app.get('/state', async function(req, res){
    // For WHERE statement
    let column = req.body.column; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM STATE WHERE ${column} =:columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query,binds, true));
    }else{
        let query = 'SELECT * FROM STATE';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
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
