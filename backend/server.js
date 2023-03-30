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
    const empAttributes = ":emp_id, :emp_status_id, :emp_address, :email, :city, :state, :zip, :phone, :datehired, :lname, :fname, :sex";
    // Values
    let emp_id = req.body.emp_id;
    let emp_status_id = req.body.emp_status_id;
    let emp_address = req.body.emp_address;
    let email = req.body.email;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;
    let phone = req.body.phone;
    let datehired = new Date(req.body.datehired);
    let lname = req.body.lname;
    let fname = req.body.fname;
    let sex = req.body.sex;
    // Query Creation
    let query = `INSERT INTO EMPLOYEE VALUES (${empAttributes})`;
    let binds = [emp_id, emp_status_id, emp_address, email, city, state, zip, phone, datehired, lname, fname, sex];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/employee', async function(req, res){
    // For WHERE statement
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted || false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM EMPLOYEE WHERE ${columnName} = :columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query, binds, true));
    }else{
        let query = 'SELECT * FROM EMPLOYEE';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});
// UPDATE
app.put('/employee', async function(req, res){
    // Columns
    const empAttributes = "emp_status_id = :emp_status_id, emp_address = :emp_address, email = :email, city = :city, state = :state, zip = :zip, phone = :phone, datehired = :datehired, lname = :lname, fname = :fname, sex = :sex"
    // Values
    let emp_id = req.body.emp_id;
    // READ COMPARE and UPDATE
    /*READ*/
    //Current Values
    let readQuery = 'SELECT * FROM EMPLOYEE WHERE emp_id = :emp_id';
    let readBinds = [emp_id];
    let readEmp = await crudOP(readQuery, readBinds, true);
    let currentEmp = readEmp.rows[0];
    // Store Old
    let oldEmp_status_id = currentEmp[1];
    let oldEmp_address = currentEmp[2];
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
    let newEmp_status_id = req.body.emp_status_id;
    let newEmp_address = req.body.emp_address;
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
    let emp_status_id = compare_update(oldEmp_status_id, newEmp_status_id);
    let emp_address = compare_update(oldEmp_address, newEmp_address);
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
    let lname = compare_update(oldLname, newLname);
    let fname = compare_update(oldFname, newFname);
    let sex = compare_update(oldSex, newSex);
    // Query Creation 
    let query = `UPDATE EMPLOYEE SET ${empAttributes} WHERE emp_id = :emp_id`;
    let binds = [emp_status_id, emp_address, email, city, state, zip, phone, datehired, lname, fname, sex, emp_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/employee',async function(req, res){
    // Values
    let emp_id = req.body.emp_id;
    // Query Creation
    let query = 'DELETE FROM EMPLOYEE WHERE emp_id = :emp_id';
    let binds = [emp_id];
    res.send(await crudOP(query, binds, false));
});
/* EMP_STATUS */
// CREATE
app.post('/employee-status', async function(req, res){
    // Column Names
    const emp_statusAttributes = ':emp_status_id, :status, :status_desc';
    // Values
    let emp_status_id = req.body.emp_status_id;
    let status = req.body.status;
    let status_desc = req.body.status_desc;
    // Query Creation
    let query = `INSERT INTO EMP_STATUS VALUES (${emp_statusAttributes})`;
    let binds = [emp_status_id, status, status_desc];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/employee-status', async function(req, res){
    // For WHERE statement
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted || false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM EMP_STATUS WHERE ${columnName} = :columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query, binds, true));
    }else{
        let query = 'SELECT * FROM EMP_STATUS';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});
//UPDATE
app.put('/employee-status', async function(req, res){
    // Columns
    const emp_statusAttributes = 'status = :status, status_desc = :status_desc';
    // Values
    let emp_status_id = req.body.emp_status_id;
    // READ COMPARE and UPDATE
    /* READ */
    // Current Values
    let readQuery = 'SELECT * FROM EMP_STATUS WHERE emp_status_id = :emp_status_id';
    let readBinds = [emp_status_id];
    let readEmp_status = await crudOP(readQuery, readBinds, true);
    let currentEmp_status = readEmp_status.rows[0];
    // Store Old
    let oldStatus = currentEmp_status[1];
    let oldStatus_desc = currentEmp_status[2];
    // Request New
    let newStatus = req.body.status;
    let newStatus_desc = req.body.status_desc;
    /* COMPARE and UPDATE */
    let status = compare_update(oldStatus, newStatus);
    let status_desc = compare_update(oldStatus_desc, newStatus_desc);
    // Query Creation
    let query = `UPDATE EMP_STATUS SET ${emp_statusAttributes} WHERE emp_status_id = :emp_status_id`;
    let binds = [status, status_desc, emp_status_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/employee-status', async function(req, res){
    // Values
    let emp_status_id = req.body.emp_status_id;
    // Query Creation
    let query = 'DELETE FROM EMPLOYEE WHERE emp_status_id = :emp_status_id';
    let binds = [emp_status_id];
    res.send(await crudOP(query, binds, false));
});

/* INVOICE */
// CREATE
app.post('/invoice', async function(req, res) {
    // Column
    const invoiceAttributes = ':inv_id, :inv_num, :cust_id, :emp_id, :inv_status_id, :estimate_id, :inv_seq, :ttlamt, :color, :year, :model, :make, :license_num, :vin, :datein, :dateout, :odometer, :desc';
    // Values
    let inv_id = req.body.inv_id;
    let inv_num = req.body.inv_num;
    let cust_id = req.body.cust_id;
    let emp_id = req.body.emp_id;
    let inv_status_id = req.body.inv_status_id;
    let estimate_id = req.body.estimate_id;
    let inv_seq = req.body.inv_seq;
    let ttlamt = req.body.ttlamt;
    let color = req.body.color;
    let year = req.body.year;
    let model = req.body.model;
    let make = req.body.make;
    let license_num = req.body.license_num;
    let vin = req.body.vin;
    let datein = req.body.datein;
    let dateout = req.body.dateout;
    let odometer = req.body.odometer;
    let desc = req.body.desc;
    // Query Creation
    let query = `INSERT INTO INVOICE VALUES (${invoiceAttributes})`;
    let binds = [inv_id, inv_num, cust_id, emp_id, inv_status_id, estimate_id, inv_seq, ttlamt, color, year, model, make, license_num, vin, datein, dateout, odometer, desc];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/invoice', async function(req, res){
    // For WHERE statement
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM INVOICE WHERE ${columnName} = :columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query,binds, true));
    }else{
        let query = 'SELECT * FROM INVOICE';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});
// UPDATE
app.put('/invoice', async function(req, res){
    // Column
    const invoiceAttributes = 'inv_id = :inv_id, inv_num = :inv_num, cust_id = :cust_id, emp_id = :emp_id, inv_status_id = :inv_status_id, estimate_id = :estimate_id, inv_seq = :inv_seq, ttlamt = :ttlamt, color = :color, year = :year, model = :model, make = :make, license_num = :license_num, vin = :vin, datein = :datein, dateout = :dateout, odomete = :odometer, desc = :desc';
    // Values
    let inv_id = req.body.inv_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM INVOICE WHERE inv_id = :inv_id';
    let readBinds = [inv_id];
    let readInv = await crudOP(readQuery, readBinds, true);
    let currentInv = readInv.rows[0];
    // Store Old
    let oldInv_num = currentInv[1];
    let oldCust_id = currentInv[2];
    let oldEmp_id = currentInv[3];
    let oldInv_status_id = currentInv[4];
    let oldEstimate_id = currentInv[5];
    let oldInv_seq = currentInv[6];
    let oldTtlamt = currentInv[7];
    let oldColor = currentInv[8];
    let oldYear = currentInv[9];
    let oldModel = currentInv[10];
    let oldMake = currentInv[11];
    let oldLicense_num = currentInv[12];
    let oldVin = currentInv[13];
    let oldDatein = currentInv[14];
    let oldDateout = currentInv[15];
    let oldOdometer = currentInv[16];
    let oldDesc = currentInv[17];
    // Request New
    let newInv_num = req.body.inv_num;
    let newCust_id = req.body.cust_id;
    let newEmp_id = req.body.emp_id;
    let newInv_status_id = req.body.inv_status_id;
    let newEstimate_id = req.body.estimate_id;
    let newInv_seq = req.body.inv_seq;
    let newTtlamt = req.body.ttlamt;
    let newColor = req.body.color;
    let newYear = req.body.year;
    let newModel = req.body.model;
    let newMake = req.body.make;
    let newLicense_num = req.body.license_num;
    let newVin = req.body.vin;
    let newDatein = req.body.datein;
    let newDateout = req.body.dateout;
    let newOdometer = req.body.odometer;
    let newDesc = req.body.desc;

    /* COMPARE and UPDATE */
    let inv_num = compare_update(oldInv_num, newInv_num);
    let cust_id = compare_update(oldCust_id, newCust_id);
    let emp_id = compare_update(oldEmp_id, newEmp_id);
    let inv_status_id = compare_update(oldInv_status_id, newInv_status_id);
    let estimate_id = compare_update(oldEstimate_id, newEstimate_id);
    let inv_seq = compare_update(oldInv_seq, newInv_seq);
    let ttlamt = compare_update(oldTtlamt, newTtlamt);
    let color = compare_update(oldColor, newColor);
    let year = compare_update(oldYear, newYear);
    let model = compare_update(oldModel, newModel);
    let make = compare_update(oldMake, newMake);
    let license_num = compare_update(oldLicense_num, newLicense_num);
    let vin = compare_update(oldVin, newVin);
    let datein = compare_update(oldDatein, newDatein);
    let dateout = compare_update(oldDateout, newDateout);
    let odometer = compare_update(oldOdometer, newOdometer);
    let desc = compare_update(oldDesc, newDesc);
    // Query Creation
    let query = `UPDATE INVOICE SET ${invoiceAttributes} WHERE inv_id = :inv_id`;
    let binds = [inv_num, cust_id, emp_id, inv_status_id, estimate_id, inv_seq, ttlamt, color, year, model, make, license_num, vin, datein, dateout, odometer, desc, inv_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/invoice', async function(req, res){
    // Values
    let inv_id = req.body.inv_id;
    // Query Creation
    let query = 'DELETE FROM INVOICE WHRE inv_id = :inv_id';
    let binds = [inv_id];
    res.send(await crudOP(query, binds, false));
});
/* INV_STATUS */
// CREATE
app.post('/invoice-status', async function(req, res) {
    // Column Names
    const inventory_statAttributes = ':inv_status_id, :status';
    // Values
    let inv_status_id = req.body.inv_status_id;
    let status = req.body.status;
    // Query Creation
    let query = `INSERT INTO INV_STATUS VALUES (${inventory_statAttributes})`;
    let binds = [inv_status_id, status];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/invoice-status', async function(req, res){
    // For WHERE statement
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM INV_STATUS WHERE ${columnName} = :columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query, binds, true));
    }else{
        let query = 'SELECT * FROM INV_STATUS';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});
// UPDATE
app.put('/invoice-status', async function(req, res){
    // Columns
    const inventory_statAttributes = 'status = :status'
    // Values
    let inv_status_id = req.body.inv_status_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM INV_STATUS WHERE inv_status_id = :inv_status_id';
    let readBinds = [inv_status_id];
    let readInventory_Stat = await crudOP(readQuery, readBinds, true);
    let currentInventory = readInventory_Stat.rows[0];
    // Store Old
    let oldStatus = currentInventory[1];
    // Request New
    let newStatus = req.body.status;
    /* COMPARE and UPDATE */
    let status = compare_update(oldStatus, newStatus);
    // Query Creation
    let query = `UPDATE INV_STATUS SET ${inventory_statAttributes} WHERE inv_status_id = :inv_status_id`;
    let binds = [status, inv_status_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/invoice-status', async function(req, res){
    // Values
    let inv_status_id = req.body.inv_status_id;
    // Query Creation
    let query = 'DELETE FROM INV_STATUS WHERE inv_status_id = :inv_status_id';
    let binds = [inv_status_id];
    res.send(await crudOP(query, binds, false));
});

/* CUSTOMER */
// CREATE
app.post('/customer',async function(req, res){
    // Column Names
    const custAttributes = ':cust_id, :cust_status_id, :name, :license_num, :lic_address, :lic_city, :lic_state, :zip, :phone, :email, :insurance, :ins_num';
    // Values
    let cust_id = req.body.cust_id;
    let cust_status_id = req.body.cust_status_id;
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
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted || false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM CUSTOMER WHERE ${columnName} =:columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query, binds, true));
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
    let cust_id = req.body.cust_id;
    // READ COMPARE and UPDATE
    /*READ*/
    //Current Values
    let readQuery = 'SELECT * FROM CUSTOMER WHERE cust_id = :cust_id';
    let readBinds = [cust_id];
    let readCust = await crudOP(readQuery, readBinds, true);
    let currentCust = readCust.rows[0];
    // Store Old
    let oldCust_status_id = currentCust[1];
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
    let newCust_status_id = req.body.cust_status_id;
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
    let cust_status_id = compare_update(oldCust_status_id, newCust_status_id);
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
    let query = `UPDATE CUSTOMER SET ${custAttributes} WHERE cust_id = :cust_id`;
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
// CREATE
app.post('/customer-status', async function(req, res) {
    // Column
    const cust_statAttributes = ':cust_status_id, :status, :status_desc';
    // Values
    let cust_status_id = req.body.cust_status_id;
    let status = req.body.status;
    let status_desc = req.body.status_desc;
    // Query Creation
    let query = `INSERT INTO CUST_STATUS VALUES (${cust_statAttributes})`;
    let binds = [cust_status_id, status, status_desc];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/customer-status', async function(req, res){
    // For WHERE statement
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM CUST_STATUS WHERE ${columnName} =:columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query, binds, true));
    }else{
        let query = 'SELECT * FROM CUST_STATUS';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});
// UPDATE
app.put('/customer-status', async function(req, res){
    // Columns
    const cust_statAttributes = 'status = :status, status_desc = :status_desc';
    // Values
    let cust_status_id = req.body.cust_status_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM CUSTOMER_STATUS WHERE cust_status_id = :cust_status_id';
    let readBinds = [cust_status_id];
    let readCust_stat = await crudOP(readQuery, readBinds, true);
    let currentCust_stat = readCust_stat.row[0];
    // Store Old
    let oldStatus = currentCust_stat[1];
    let oldStatus_desc = currentCust_stat[2];
    // Request New
    let newStatus = req.body.status;
    let newStatus_desc = req.body.status_desc;
    /* COMPARE and UPDATE */
    let status = compare_update(oldStatus, newStatus);
    let status_desc = compare_update(oldStatus_desc, newStatus_desc);
    // Query Creation
    let query = `UPDATE CUST_STATUS SET ${cust_statAttributes} WHERE cust_status_id = :cust_status_id`;
    let binds = [status, status_desc, cust_status_id];
    res.send(await crudOP(query, binds, false));
});
//DELETE
app.delete('/customer-status', async function(req, res){
    // Values
    let cust_status_id = req.body.cust_status_id;
    // Query Creation
    let query = 'DELETE FROM CUST_STATUS WHERE cust_status_id = :cust_status_id';
    let binds = [cust_status_id];
    res.send(await crudOP(query, binds, false));
});

/* ESTIMATE */
// CREATE
app.post('/estimate', async function(req, res){
    // Column Names
    const estiAttributes = ':estimate_id, :inv_id, :part_id, :part_qty, :total';
    // Values
    let estimate_id = req.body.estimate_id;
    let inv_id = req.body.inv_id;
    let part_id = req.body.part_id;
    let part_qty = req.body.part_qty;
    let total = req.body.total;
    // Query Creation
    let query = `INSERT INTO ESTIMATE VALUES (${estiAttributes})`;
    let binds = [estimate_id, inv_id, part_id, part_qty, total];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/estimate', async function(req, res){
    // For WHERE statement
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM ESTIMATE WHERE ${columnName} =:columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query, binds, true));
    }else{
        let query = 'SELECT * FROM ESTIMATE';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});
// UPDATE
app.put('/estimate', async function(req, res){
    // Columns
    const estiAttributes = 'inv_id = :inv_id, part_id = :part_id, part_qty = :part_qty, total = :total';
    // Values
    let estimate_id = req.body.estimate_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM ESTIMATE WHERE estimate_id = :estimate_id';
    let readBinds = [estimate_id];
    let readEstimate = await crudOP(readQuery, readBinds, true);
    let currentEstimate = readEstimate.rows[0];
    // Store Old
    let oldInv_id = currentEstimate[1];
    let oldPart_id = currentEstimate[2];
    let oldPart_qty = currentEstimate[3];
    let oldTotal = currentEstimate[4];
    // Request New
    let newInv_id = req.body.inv_id;
    let newPart_id = req.body.part_id;
    let newPart_qty = req.body.part_qty;
    let newTotal = req.body.total;
    /* COMPARE and UPDATE */
    let inv_id = compare_update(oldInv_id, newInv_id);
    let part_id = compare_update(oldPart_id, newPart_id);
    let part_qty = compare_update(oldPart_qty, newPart_qty);
    let total = compare_update(oldTotal, newTotal);
    // Query Creation
    let query = `UPDATE ESTIMATE SET ${estiAttributes} WHERE estimate_id = :estimate_id`;
    let binds = [inv_id, part_id, part_qty, total, estimate_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/estimate', async function(req, res){
    // Values
    let estimate_id = req.body.estimate_id;
    // Query Creation
    let query = 'DELETE FROM ESTIMATE WHERE estimate_id = :estimate_id';
    let binds = [estimate_id];
    res.send(await crudOP(query, binds, false));
});

/* PART */
// CREATE
app.post('/part', async function(req, res){
    // Column Names
    const partAttributes = ':part_id, :part_name, :part_desc';
    // Values
    let part_id = req.body.part_id;
    let part_name = req.body.part_name;
    let part_desc = req.body.part_desc;
    // Query Creation
    let query = `INSERT INTO PART VALUES (${partAttributes})`;
    let binds = [part_id, part_name, part_desc];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/part', async function(req, res){
    // For WHERE statement
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM PART WHERE ${columnName} = :columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query, binds, true));
    }else{
        let query = 'SELECT * FROM PART';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});
// UPDATE
app.put('/part', async function(req, res){
    // Columns
    const partAttributes = 'part_name = :part_name, part_desc = :part_desc';
    // Values
    let part_id = req.body.part_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM PART WHERE part_id = :part_id';
    let readBinds = [part_id];
    let readPart = await crudOP(readQuery, readBinds, true);
    let currentPart = readPart.rows[0];
    // Store Old
    let oldPart_name = currentPart[1];
    let oldPart_desc = currentPart[2];
    // Request New
    let newPart_name = req.body.part_name;
    let newPart_desc = req.body.part_desc;
    /* COMPARE and UPDATE */
    let part_name = compare_update(oldPart_name, newPart_name);
    let part_desc = compare_update(oldPart_desc, newPart_desc)
    // Query Creation
    let query = `UPDATE PART SET ${partAttributes} WHERE part_id = :part_id`;
    let binds = [part_name, part_desc, part_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/part', async function(req, res){
    // Values
    let part_id = req.body.part_id;
    // Query Creation
    let query = 'DELETE FROM PART WHERE part_id = :part_id';
    let binds = [part_id];
    res.send(await crudOP(query, binds, false));
});

/* VENDOR_INV */
// CREATE
app.post('/vendor-invoice', async function(req, res){
    // Column
    const vendor_inventAttributes = ':venpart_id, :part_id, :vendor_id, :qty_ordered, :date_ordered, :cost_per_unit, :total_cost';
    // Values
    let venpart_id = req.body.venpart_id;
    let part_id = req.body.part_id;
    let vendor_id = req.body.vendor_id;
    let qty_ordered = req.body.qty_ordered;
    let date_ordered = req.body.date_ordered;
    let cost_per_unit = req.body.cost_per_unit;
    let total_cost = req.body.total_cost;
    // Query Creation
    let query = `INSERT INTO VENDOR_INV VALUES (${vendor_inventAttributes})`;
    let binds = [venpart_id, part_id, vendor_id, qty_ordered, date_ordered, cost_per_unit, total_cost];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/vendor-invoice', async function(req, res){
    // For WHERE statement
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted || false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM VENDOR_INV WHERE ${columnName} = :columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query, binds, true));
    }else{
        let query = 'SELECT * FROM VENDOR_INV';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});
// UPDATE
app.put('/vendor-invoice', async function(req, res){
    // Columns
    const vendor_inventAttributes = 'venpart_id = :venpart_id, part_id = :part_id, vendor_id = :vendor_id, qty_ordered = :qty_ordered, date_ordered = :date_ordered, cost_per_unit = :cost_per_unit, total_cost = :total_cost'
    // Values
    let venpart_id = req.body.venpart_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM VENDOR_INV WHERE venpart_id = :venpart_id';
    let readBinds = [venpart_id];
    let readVend_invent = await crudOP(readQuery, readBinds, true);
    let currentVend_invent = readVend_invent.rows[0];
    // Store Old
    let oldPart_id = currentVend_invent[1];
    let oldVendor_id = currentVend_invent[2];
    let oldQty_ordered = currentVend_invent[3];
    let oldDate_ordered = currentVend_invent[4];
    let oldCost_per_unit = currentVend_invent[5];
    let oldTotal_cost = currentVend_invent[6];
    // Request New
    let newPart_id = req.body.part_id;
    let newVendor_id = req.body.vendor_id;
    let newQty_ordered = req.body.qty_ordered;
    let newDate_ordered = req.body.date_ordered;
    let newCost_per_unit = req.body.cost_per_unit;
    let newTotal_cost = req.body.total_cost;
    /* COMPARE and UPDATE */
    let part_id = compare_update(oldPart_id, newPart_id);
    let vendor_id = compare_update(oldVendor_id, newVendor_id);
    let qty_ordered = compare_update(oldQty_ordered, newQty_ordered);
    let date_ordered = compare_update(oldDate_ordered, newDate_ordered);
    let cost_per_unit = compare_update(oldCost_per_unit, newCost_per_unit);
    let total_cost = compare_update(oldTotal_cost, newTotal_cost);
    // Query Creation
    let query = `UPDATE VENDOR_INV SET ${vendor_inventAttributes} WHERE venpart_id = :venpart_id`;
    let binds = [part_id, vendor_id, qty_ordered, date_ordered, cost_per_unit, total_cost , venpart_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/vendor-invoice', async function(req, res){
    // Values
    let venpart_id = req.body.venpart_id;
    // Query Creation
    let query = 'DELETE FROM VENDOR_INV WHERE venpart_id = :venpart_id';
    let binds = [venpart_id];
    res.send(await crudOP(query, binds, false));
});

/* VENDOR */
// CREATE
app.post('/vendor',async function(req, res){
    // Column Names
    const vendAttributes = ':vendor_id, :state_id, :venpart_id, :ven_name, :address, :city, :phone, :website, :contact_name, :zip, :email, :keymap';
    // Values
    let vendor_id = req.body.vendor_id;
    let state_id = req.body.state_id;
    let venpart_id = req.body.venpart_id;
    let ven_name = req.body.ven_name;
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
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM VENDOR WHERE ${columnName} =:columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query, binds, true));
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
    let vendor_id = req.body.vendor_id;
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
    let query = `UPDATE CUSTOMER SET ${vendAttributes} WHERE vendor_id = :vendor_id`;
    let binds = [state_id, venpart_id, ven_name, address, city, phone, website, contact_name, zip, email, keymap, vendor_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/vendor',async function(req, res){
    // Values
    let vendor_id = req.body.vendor_id;
    // Query Creation
    let query = 'DELETE FROM CUSTOMER WHERE vendor_id = :vendor_id';
    let binds = [vendor_id];
    res.send(await crudOP(query, binds, false));
});

/* STATE */
// CREATE
app.post('/state', async function(req, res){
    // Columm Names
    const stateAttributes = ':state_id, :state_code, :state_name';
    // Values
    let state_id = req.body.state_id;
    let state_code = req.body.state_code;
    let state_name = req.body.state_name;
    // Query Creation
    let query = `INSERT INTO STATE VALUES (${stateAttributes})`;
    let binds = [state_id, state_code, state_name];
    res.send(await crudOP(query, binds, false));
});
// READ
app.get('/state', async function(req, res){
    // For WHERE statement
    let columnName = req.body.columnName; // Search by table attribute
    let columnValue = req.body.columnValue; // Value of attribute
    let isRestricted = req.body.isRestricted ||false; // (true = Where IS needed)/(false = WHERE IS NOT needed)
    // Query Creation
    if (isRestricted){
        let query = `SELECT * FROM STATE WHERE ${columnName} = :columnValue`;
        let binds = [columnValue];
        // Send a response
        res.send(await crudOP(query,binds, true));
    }else{
        let query = 'SELECT * FROM STATE';
        // Send a response
        res.send(await crudOP(query, undefined, true));
    }
});
// UPDATE
app.put('/state', async function(req, res){
    // Columns
    const stateAttributes = 'state_code = :state_code, state_name = :state_name';
    // Values
    let state_id = req.body.state_id;
    // READ COMPARE and UPDATE
    /*READ*/
    //Current Values
    let readQuery = '';
    let readBinds = [state_id];
    let readState = await crudOP(readQuery, readBinds, true);
    let currentState = readState.rows[0];
    // Store Old
    let oldState_code = currentState[1];
    let oldState_name = currentState[2];
    // Request New
    let newState_code = req.body.state_code;
    let newState_name = req.body.state_name;
    /* COMPARE and UPDATE */
    let state_code = compare_update(oldState_code, newState_code);
    let state_name = compare_update(oldState_name, newState_name);
    // Query Creation
    let query = `UPDATE STATE SET ${stateAttributes} WHERE state_id = :state_id`;
    let binds = [state_code, state_name, state_id];
    res.send(await crudOP(query, binds, false));
});
// DELETE
app.delete('/state', async function(req, res){
    // Values
    let state_id = req.body.state_id;
    // Query Creation
    let query = 'DELETE FROM STATE WHERE state_id = :state_id';
    let binds = [state_id];
    res.send(await crudOP(query, binds, false));
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
