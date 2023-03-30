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
    const empAttributes = ":emp_id, :emp_status_id, :emp_address, :email, :city, :state, :zip, :phone, :datehired, :Lname, :Fname, :sex";
    // Values
    let emp_id = req.body.id;
    let emp_status = req.body.status;
    let emp_address = req.body.address;
    let email = req.body.email;
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
    let binds = [emp_id,emp_status,emp_address,email,city,state,zip,phone,datehired,Lname,Fname,sex];
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
    const empAttributes = "emp_status_id = :emp_status_id, emp_address = :emp_address, email = :email, city = :city, state = :state, zip = :zip, phone = :phone, datehired = :datehired, Lname = :Lname,Fname = :Fname, sex = :sex"
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
    let oldStatus = currentEmp[1];
    let oldAddress = currentEmp[2];
    let oldEmail = currentEmp[3]
    let oldCity = currentEmp[4];
    let oldState = currentEmp[5];
    let oldZip = currentEmp[6];
    let oldPhone = currentEmp[7];
    let oldDateHired = currentEmp[8];
    let oldLname = currentEmp[9];
    let oldFname = currentEmp[10];
    let oldSex = currentEmp[11];
    // Request New
    let newStatus = req.body.status;
    let newAddress = req.body.address;
    let newEmail = req.body.email;
    let newCity = req.body.city;
    let newState = req.body.state;
    let newZip = req.body.zip;
    let newPhone = req.body.phone;
    let newDateHired = new Date(req.body.datehired);
    let newLname = req.body.lastname;
    let newFname = req.body.firstname;
    let newSex = req.body.sex;

    /* COMPARE and UPDATE */
    let status = compare_update(oldStatus, newStatus);
    let emp_address = compare_update(oldAddress,newAddress);
    let email = compare_update(oldEmail, newEmail);
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
    let binds = [status,emp_address,email,city,state,zip,phone,datehired,Lname,Fname,sex,emp_id];
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
    const custAttributes = ':cust_id, :cust_status_id, :name, :license_num, :lic_address, :lic_city, :lic_state, :zip, :phone, :email, :insurance, :ins_num';
    // Values
    let cust_id = req.body.id;
    let cust_status_id = req.body.status;
    let name = req.body.name;
    let license_num = req.body.license_num;
    let lic_address = req.body.address;
    let lic_city = req.body.city;
    let lic_state = req.body.state;
    let zip = req.body.zip;
    let phone = req.body.phone;
    let email = req.body.email;
    let insurance = req.body.insurance;
    let ins_num = req.body.ins_num;
    // Query Creation
    let query = `INSERT INTO CUSTOMER VALUES (${custAttributes})`;
    let binds = [cust_id, cust_status_id, name, license_num, lic_address, lic_city, lic_state, zip, phone, email, insurance, ins_num];
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
    const custAttributes = 'cust_status_id = :cust_status_id, name = :name, license_num = :license_num, lic_address = :lic_address, lic_city = :lic_city, lic_state = :lic_state, zip = :zip, phone = :phone, email = :email, insurance = :insurance, ins_num = :ins_num';
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
    let oldStatus = currentCust[1];
    let oldName = currentCust[2];
    let oldLicense_num = currentCust[3];
    let oldLic_address = currentCust[4];
    let oldLic_city = currentCust[5];
    let oldLic_state = currentCust[6];
    let oldZip = currentCust[7];
    let oldPhone = currentCust[8];
    let oldEmail = currentCust[9];
    let oldInsurance = currentCust[10];
    let oldIns_num = currentCust[11];
    // Request New
    let newStatus = req.body.status;
    let newName = req.body.name;
    let newLicense_num = req.body.license_num;
    let newLic_address = req.body.lic_address;
    let newLic_city = req.body.lic_city;
    let newLic_state = req.body.lic_state;
    let newZip = req.body.zip;
    let newPhone = req.body.phone;
    let newEmail = req.body.email;
    let newInsurance = req.body.insurance;
    let newIns_num = req.body.ins_num;

    /* COMPARE and UPDATE */
    let cust_status_id = compare_update(oldStatus, newStatus);
    let name = compare_update(oldName, newName);
    let license_num = compare_update(oldLicense_num, newLicense_num);
    let lic_address = compare_update(oldLic_address, newLic_address);
    let lic_city = compare_update(oldLic_city, newLic_city);
    let lic_state = compare_update(oldLic_state, newLic_state);
    let zip = compare_update(oldZip, newZip);
    let phone = compare_update(oldPhone, newPhone);
    let email = compare_update(oldEmail, newEmail);
    let insurance = compare_update(oldInsurance, newInsurance);
    let ins_num = compare_update(oldIns_num, newIns_num);
    // Query Creation
    let query = `UPDATE CUSTOMER SET ${custAttributes} WHERE cust_id =:cust_id`;
    let binds = [cust_status_id, name, license_num, lic_address, lic_city, lic_state, zip, phone, email, insurance, ins_num, cust_id];
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
    const vendAttributes = ':vendor_id, :state_id, :venpart_id, :ven_name, :address, :city, :phone, :website, :contact_name, :zip, :email, :keymap';
    // Values
    let vendor_id = req.body.id;
    let state_id = req.body.state_id;
    let venpart_id = req.body.venpart_id;
    let ven_name = req.body.name;
    let address = req.body.address ;
    let city = req.body.city;
    let phone = req.body.phone;
    let website = req.body.website;
    let contact_name = req.body.contact_name;
    let zip = req.body.zip;
    let email = req.body.email;
    let keymap = req.body.keymap;
    // Query Creation
    let query = `INSERT INTO VENDOR VALUES (${vendAttributes})`;
    let binds = [vendor_id, state_id, venpart_id, ven_name, address, city, phone, website, contact_name, zip, email, keymap];
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
    const vendAttributes = 'vendor_id = :vendor_id, state_id = :state_id, venpart_id = :venpart_id, ven_name = :ven_name, address = :address, city = :city, phone = :phone, website = :website, contact_name = :contact_name, zip = :zip, email = :email, keymap = :keymap';
    // Values
    let vendor_id = req.body.id;
    // READ COMPARE and UPDATE
    /*READ*/
    //Current Values
    let readQuery = 'SELECT * FROM VENDOR WHERE vendor_id = :vendor_id';
    let readBinds = [vendor_id];
    let readVend = await crudOP(readQuery, readBinds, true);
    let currentVend = readVend.rows[0];
    // Store Old
    let oldState_id = currentVend[1];
    let oldVenpart_id = currentVend[2];
    let oldVen_name = currentVend[3];
    let oldAddress = currentVend[4];
    let oldCity = currentVend[5];
    let oldPhone = currentVend[6];
    let oldWebsite = currentVend[7];
    let oldContact_name = currentVend[8];
    let oldZip = currentVend[9];
    let oldEmail = currentVend[10];
    let oldKeymap = currentVend[11];
    // Request New
    let newState_id = req.body.state_id;
    let newVenpart_id = req.body.venpart_id;
    let newVen_name = req.body.name;
    let newAddress = req.body.address ;
    let newCity = req.body.city;
    let newPhone = req.body.phone;
    let newWebsite = req.body.website;
    let newContact_name = req.body.contact_name;
    let newZip = req.body.zip;
    let newEmail = req.body.email;
    let newKeymap = req.body.keymap;

    /* COMPARE and UPDATE */
    let state_id = compare_update(oldState_id, newState_id);
    let venpart_id = compare_update(oldVenpart_id, newVenpart_id);
    let ven_name = compare_update(oldVen_name, newVen_name);
    let address = compare_update(oldAddress, newAddress);
    let city = compare_update(oldCity, newCity);
    let phone = compare_update(oldPhone, newPhone);
    let website = compare_update(oldWebsite, newWebsite);
    let contact_name = compare_update(oldContact_name, newContact_name);
    let zip = compare_update(oldZip, newZip);
    let email = compare_update(oldEmail, newEmail);
    let keymap = compare_update(oldKeymap, newKeymap);

    // Query Creation
    let query = `UPDATE CUSTOMER SET ${vendAttributes} WHERE vendor_id =:vendor_id`;
    let binds = [state_id, venpart_id, ven_name, address, city, phone, website, contact_name, zip, email, keymap, vendor_id];
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
