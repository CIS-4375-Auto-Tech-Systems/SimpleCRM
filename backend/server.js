// oracledb
const express = require("express");
const cors = require("cors");
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
app.use(express.urlencoded({extended: true}));
app.use(cors());

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
            //  If Binds and IS NOT Reading
            result = await connection.execute(query,binds, {autoCommit:true});
            console.log(`${result.rowsAffected} Rows Affected`);
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
    console.log(oldValue, newValue)
    if (oldValue.toString().toUpperCase() == newValue.toString().toUpperCase()) {
        return oldValue;
    } else if (oldValue.toString().toUpperCase() != newValue.toString().toUpperCase()) {
        return newValue;
    }
};

/* SPECIAL ENDPOINTS */
app.post('/lookup', async function(req, res){{
    // Query has to be exact match including case
    let query = `
    SELECT *
    FROM customer
    WHERE LOWER(first_name) LIKE '%' || LOWER(:search_value) || '%'
    OR LOWER(last_name) LIKE '%' || LOWER(:search_value) || '%'
    OR LOWER(address) LIKE '%' || LOWER(:search_value) || '%'
    OR LOWER(phone) LIKE '%' || LOWER(:search_value) || '%'
    OR LOWER(email) LIKE '%' || LOWER(:search_value) || '%'`;
    let searchValue = req.body.searchValue
    let binds = [searchValue];
    //

    // Send a response
    const CRUDOP = await crudOP(query,binds, true);
    res.send(CRUDOP.rows);
}});

app.post('/employeelookup', async function(req, res){{
    // Query has to be exact match including case
    let query = `
    SELECT employee.*, TO_CHAR(employee.datehired, 'MM/DD/YYYY') as formatted_datehired
    FROM employee
    WHERE LOWER(employee.fname) LIKE '%' || LOWER(:search_value) || '%'
    OR LOWER(employee.lname) LIKE '%' || LOWER(:search_value) || '%'
    OR LOWER(employee.emp_address) LIKE '%' || LOWER(:search_value) || '%'
    OR LOWER(employee.phone) LIKE '%' || LOWER(:search_value) || '%'`;
    let searchValue = req.body.searchValue
    let binds = [searchValue];
    //

    // Send a response
    const CRUDOP = await crudOP(query,binds, true);
    res.send(CRUDOP.rows);
}});


/* EMPLOYEE */
// CREATE
app.post('/employee', async function(req, res){
    // Column Names
    const empAttributes = "seq_emp.nextval, :emp_status_id, :state_id, :fname, :lname, :emp_address, :city, :state, :zip, :phone, :datehired, :sex";
    // Values
    let emp_status_id = req.body.emp_status_id;
    let state_id = req.body.state_id;
    let fname = req.body.fname;
    let lname = req.body.lname;
    let emp_address = req.body.emp_address;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;
    let phone = req.body.phone;
    let datehired = new Date(req.body.datehired);
    let sex = req.body.sex;
    // Query Creation
    let query = `INSERT INTO EMPLOYEE VALUES (${empAttributes})`;
    let binds = [emp_status_id, state_id, fname.toUpperCase(), lname.toUpperCase(), emp_address.toUpperCase(), city.toUpperCase(), state.toUpperCase(), zip, phone, datehired, sex.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected employee by ROWID to send back
    let lastItemQuery = `SELECT * FROM EMPLOYEE WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItem = await crudOP(lastItemQuery, undefined, true);
    let lastItemId = lastItem.rows[0][0];
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/employee', async function(req, res){
    let query = 'SELECT * FROM EMPLOYEE';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
});
// UPDATE
app.put('/employee', async function(req, res){
    // Columns
    const empAttributes = "emp_status_id = :emp_status_id, state_id = :state_id, fname = :fname, lname = :lname, emp_address = :emp_address, city = :city, state = :state, zip = :zip, phone = :phone, datehired = :datehired, sex = :sex"
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
    let oldState_id = currentEmp[2];
    let oldFname = currentEmp[3];
    let oldLname = currentEmp[4];
    let oldEmp_address = currentEmp[5];
    let oldCity = currentEmp[6];
    let oldState = currentEmp[7];
    let oldZip = currentEmp[8];
    let oldPhone = currentEmp[9];
    let oldDateHired = currentEmp[10];
    let oldSex = currentEmp[11];
    // Request New
    let newEmp_status_id = req.body.emp_status_id;
    let newState_id = req.body.state_id;
    let newFname = req.body.fname;
    let newLname = req.body.lname;
    let newEmp_address = req.body.emp_address;
    let newCity = req.body.city;
    let newState = req.body.state;
    let newZip = req.body.zip;
    let newPhone = req.body.phone;
    let newDateHired = new Date(req.body.datehired);
    let newSex = req.body.sex;

    /* COMPARE and UPDATE */
    let emp_status_id = compare_update(oldEmp_status_id, newEmp_status_id);
    let state_id = compare_update(oldState_id, newState_id);
    let fname = compare_update(oldFname, newFname);
    let lname = compare_update(oldLname, newLname);
    let emp_address = compare_update(oldEmp_address, newEmp_address);
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
    let sex = compare_update(oldSex, newSex);
    // Query Creation 
    let query = `UPDATE EMPLOYEE SET ${empAttributes} WHERE emp_id = :emp_id`;
    let binds = [emp_status_id, state_id, fname.toUpperCase(), lname.toUpperCase(), emp_address.toUpperCase(), city.toUpperCase(), state.toUpperCase(), zip, phone, datehired, sex.toUpperCase(), emp_id];
    let CRUDOP = await crudOP(query, binds, false)
        // Find Affected employee by ROWID to send back
    let lastItemQuery = `SELECT * FROM EMPLOYEE WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
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
    let binds = [emp_status_id, status.toUpperCase(), status_desc.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected emp_status by ROWID to send back
    let lastItemQuery = `SELECT * FROM EMP_STATUS WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastRowid: lastItemId
    });
});
// READ
app.get('/employee-status', async function(req, res){
    let query = 'SELECT * FROM EMP_STATUS';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
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
    let binds = [status.toUpperCase(), status_desc.toUpperCase(), emp_status_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected emp_status by ROWID to send back
    let lastItemQuery = `SELECT * FROM EMP_STATUS WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
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

/* SERVICE_ORDER */
// CREATE
app.post('/service-order', async function(req, res) {
    // Column
    const service_orderAttributes = 'seq_service_order.nextval, :order_num, :cust_id, :vehicle_id, :emp_id, :order_status_id, :service_id, :ttlamt, :datein, :dateout, :odometer, :description';
    // Values
    let order_num = req.body.order_num;
    let cust_id = req.body.cust_id;
    let vehicle_id = req.body.vehicle_id;
    let emp_id = req.body.emp_id;
    let order_status_id = req.body.order_status_id;
    let service_id = req.body.service_id;
    let ttlamt = req.body.ttlamt;
    let datein = req.body.datein;
    let dateout = req.body.dateout;
    let odometer = req.body.odometer;
    let description = req.body.description;
    // Query Creation
    let query = `INSERT INTO SERVICE_ORDER VALUES (${service_orderAttributes})`;
    let binds = [order_id, order_num, cust_id, vehicle_id, emp_id, order_status_id, service_id, ttlamt, datein, dateout, odometer, description.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected service_order by ROWID to send back
    let lastItemQuery = `SELECT * FROM SERVICE_ORDER WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/service-order', async function(req, res){
    let query = 'SELECT * FROM SERVICE_ORDER';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
});
// UPDATE
app.put('/service-order', async function(req, res){
    // Column
    const service_orderAttributes = 'order_num = :order_num, cust_id = :cust_id, vehicle_id = :vehicle_id, emp_id = :emp_id, order_status_id = :order_status_id, service_id = :service_id, ttlamount = :ttlamount, datein = :datein, dateout = :dateout, odometer = :odometer, description = :description';
    // Values
    let order_id = req.body.order_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM SERVICE_ORDER WHERE order_id = :order_id';
    let readBinds = [order_id];
    let readOrder = await crudOP(readQuery, readBinds, true);
    let currentOrder = readOrder.rows[0];
    // Store Old
    let oldOrder_num = currentOrder[1];
    let oldCust_id  = currentOrder[2];
    let oldVehicle_id  = currentOrder[3];
    let oldEmp_id  = currentOrder[4];
    let oldOrder_status_id  = currentOrder[5];
    let oldService_id  = currentOrder[6];
    let oldTtlamt  = currentOrder[7];
    let oldDatein  = currentOrder[8];
    let oldDateout  = currentOrder[9];
    let oldOdometer  = currentOrder[10];
    let oldDescription = currentOrder[11];
    // Request New
    let newOrder_num = req.body.order_num;
    let newCust_id = req.body.cust_id;
    let newVehicle_id = req.body.vehicle_id;
    let newEmp_id = req.body.emp_id;
    let newOrder_status_id = req.body.order_status_id;
    let newService_id = req.body.service_id;
    let newTtlamt = req.body.ttlamount;
    let newDatein = req.body.datein;
    let newDateout  = req.body.dateout;
    let newOdometer = req.body.odometer;
    let newDescription  = req.body.description;
    /* COMPARE and UPDATE */
    let order_num = compare_update(oldOrder_num, newOrder_num);
    let cust_id = compare_update(oldCust_id, newCust_id);
    let vehicle_id = compare_update(oldVehicle_id, newVehicle_id);
    let emp_id = compare_update(oldEmp_id, newEmp_id);
    let order_status_id = compare_update(oldOrder_status_id, newOrder_status_id);
    let service_id = compare_update(oldService_id, newService_id);
    let ttlamount = compare_update(oldTtlamt, newTtlamt);
    let datein = '';
    if (oldDatein == newDatein){
        datein = new Date(oldDatein);
    }else if (oldDatein != newDatein){
        datein = new Date(newDatein);
    };
    let dateout = '';
    if (oldDateout == newDateout){
        dateout = new Date(oldDateout);
    }else if (oldDateout != newDateout){
        dateout = new Date(newDateout);
    };
    let odometer = compare_update(oldOdometer, newOdometer);
    let description = compare_update(oldDescription, newDescription);
    // Query Creation
    let query = `UPDATE SERVICE_ORDER SET ${service_orderAttributes} WHERE order_id = :order_id`;
    let binds = [order_num, cust_id, vehicle_id, emp_id, order_status_id, service_id, ttlamount, datein, dateout, odometer, description.toUpperCase(), order_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected service_order by ROWID to send back
    let lastItemQuery = `SELECT * FROM SERVICE_ORDER WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// DELETE
app.delete('/service-order', async function(req, res){
    // Values
    let order_id = req.body.order_id;
    // Query Creation
    let query = 'DELETE FROM SERVICE_ORDER WHRE order_id = :order_id';
    let binds = [order_id];
    res.send(await crudOP(query, binds, false));
});
/* ORDER_STATUS */
// CREATE
app.post('/order-status', async function(req, res) {
    // Column Names
    const order_statAttributes = ':order_status_id, :status';
    // Values
    let order_status_id = req.body.order_status_id;
    let status = req.body.status;
    // Query Creation
    let query = `INSERT INTO ORDER_STATUS VALUES (${order_statAttributes})`;
    let binds = [order_status_id, status.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected order_status by ROWID to send back
    let lastItemQuery = `SELECT * FROM ORDER_STATUS WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/order-status', async function(req, res){
    let query = 'SELECT * FROM ORDER_STATUS';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
});
// UPDATE
app.put('/order-status', async function(req, res){
    // Columns
    const order_statAttributes = 'status = :status'
    // Values
    let order_status_id = req.body.order_status_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM ORDER_STATUS WHERE order_status_id = :order_status_id';
    let readBinds = [order_status_id];
    let readOrder_Stat = await crudOP(readQuery, readBinds, true);
    let currentOrder = readOrder_Stat.rows[0];
    // Store Old
    let oldStatus = currentOrder[1];
    // Request New
    let newStatus = req.body.status;
    /* COMPARE and UPDATE */
    let status = compare_update(oldStatus, newStatus);
    // Query Creation
    let query = `UPDATE ORDER_STATUS SET ${order_statAttributes} WHERE order_status_id = :order_status_id`;
    let binds = [status.toUpperCase(), order_status_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected employee by order_status to send back
    let lastItemQuery = `SELECT * FROM ORDER_STATUS WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// DELETE
app.delete('/order-status', async function(req, res){
    // Values
    let order_status_id = req.body.order_status_id;
    // Query Creation
    let query = 'DELETE FROM ORDER_STATUS WHERE order_status_id = :order_status_id';
    let binds = [order_status_id];
    res.send(await crudOP(query, binds, false));
});
/* SERVICE */
// CREATE
app.post('/service', async function(req, res){
    // Column Name
    const serviceAttributes = 'seq_service.nextval, :service_name, :price'
    // Values
    let service_name = req.body.service_name;
    let price = req.body.price;
    // Query Creation
    let query = `INSERT INTO SERVICE VALUES (${serviceAttributes})`;
    let binds = [service_name.toUpperCase(), price];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected service by ROWID to send back
    let lastItemQuery = `SELECT * FROM SERVICE WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/service', async function(req, res){
    let query = 'SELECT * FROM SERVICE';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
});
// UPDATE
app.put('/service', async function(req, res){
    // Columns
    const serviceAttributes = 'service_name = :service_name, price = :price';
    // Values
    let service_id = req.body.service_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM SERVICE WHERE service_id = :service_id';
    let readBinds = [service_id];
    let readService = await crudOP(readQuery, readBinds, true);
    let currentService = readService.rows[0];
    // Store Old
    let oldService_name = currentService[1];
    let oldPrice = currentService[2];
    // Request New
    let newService_name = req.body.service_name;
    let newPrice = req.body.price;
    /* COMPARE and UPDATE */
    let service_name = compare_update(oldService_name, newService_name);
    let price = compare_update(oldPrice, newPrice);
    // Query Creation
    let query = `UPDATE SERVICE SET ${serviceAttributes} WHERE service_id = :service_id`;
    let binds = [service_name.toUpperCase(), price, service_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected service by ROWID to send back
    let lastItemQuery = `SELECT * FROM SERVICE WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// DELETE
app.delete('/service', async function(req, res){
    // Values
    let service_id = req.body.service_id;
    // Query Creation
    let query = 'DELETE FROM SERVICE WHERE service_id = :service_id';
    let binds = [service_id];
    res.send(await crudOP(query, binds, false));
});

/* CUSTOMER */
// CREATE
app.post('/customer',async function(req, res){
    // Column Names
    const custAttributes = 'seq_cust.nextval, :cust_status_id, :state_id, :first_name, :middle_in, :last_name, :address, :city, :zip, :phone, :email';
    // Values
    let cust_status_id = req.body.cust_status_id;
    let state_id = req.body.state_id;
    let first_name = req.body.first_name;
    let middle_in = req.body.middle_in;
    let last_name = req.body.last_name;
    let address = req.body.address;
    let city = req.body.city;
    let zip = req.body.zip;
    let phone = req.body.phone;
    let email = req.body.email;
    // Query Creation
    let query = `INSERT INTO CUSTOMER VALUES (${custAttributes})`;
    let binds = [cust_status_id, state_id, first_name.toUpperCase(), middle_in.toUpperCase(), last_name.toUpperCase(), address.toUpperCase(), city.toUpperCase(), zip, phone, email.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected customer by ROWID to send back
    let lastItemQuery = `SELECT * FROM CUSTOMER WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/customer', async function(req, res){
    let query = 'SELECT * FROM CUSTOMER';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
});
// UPDATE
app.put('/customer', async function(req, res){
    // Columns
    const custAttributes = 'cust_status_id = :cust_status_id, state_id = :state_id, first_name = :first_name, middle_in = :middle_in, last_name = :last_name, address = :address, city = :city, zip = :zip, phone = :phone, email = :email';
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
    let oldState_id = currentCust[2];
    let oldFirst_name = currentCust[3];
    let oldMiddle_in = currentCust[4];
    let oldLast_name = currentCust[5];
    let oldAddress = currentCust[6];
    let oldCity = currentCust[7];
    let oldZip = currentCust[8];
    let oldPhone = currentCust[9];
    let oldEmail = currentCust[10];
    // Request New
    let newCust_status_id = req.body.cust_status_id;
    let newState_id = req.body.state_id;
    let newFirst_name = req.body.first_name;
    let newMiddle_in = req.body.middle_in;
    let newLast_name = req.body.last_name;
    let newAddress = req.body.address;
    let newCity = req.body.city;
    let newZip = req.body.zip;
    let newPhone = req.body.phone;
    let newEmail = req.body.email;

    /* COMPARE and UPDATE */
    let cust_status_id = compare_update(oldCust_status_id, newCust_status_id);
    let state_id = compare_update(oldState_id, newState_id);
    let first_name = compare_update(oldFirst_name, newFirst_name);
    let middle_in = '';
    if (oldMiddle_in === null && newMiddle_in === null){
        middle_in = null;
    }else if (oldMiddle_in === null && newMiddle_in != null){
        middle_in = newMiddle_in;
    }else if(oldMiddle_in != null && newMiddle_in === null){
        middle_in = null;
    }else{
        middle_in = compare_update(oldMiddle_in, newMiddle_in);
    };
    let last_name = compare_update(oldLast_name, newLast_name);
    let address = compare_update(oldAddress, newAddress);
    let city = compare_update(oldCity, newCity);
    let zip = compare_update(oldZip, newZip);
    let phone = compare_update(oldPhone, newPhone);
    let email = compare_update(oldEmail, newEmail);
    // Query Creation
    let query = `UPDATE CUSTOMER SET ${custAttributes} WHERE cust_id = :cust_id`;
    let binds = [cust_status_id, state_id, first_name.toUpperCase(), middle_in.toUpperCase(), last_name.toUpperCase(), address.toUpperCase(), city.toUpperCase(), zip, phone, email.toUpperCase(), cust_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected customer by ROWID to send back
    let lastItemQuery = `SELECT * FROM CUSTOMER WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
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
    const cust_statAttributes = ':cust_status_id, :status';
    // Values
    let cust_status_id = req.body.cust_status_id;
    let status = req.body.status;
    // Query Creation
    let query = `INSERT INTO CUST_STATUS VALUES (${cust_statAttributes})`;
    let binds = [cust_status_id, status.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected customer_status by ROWID to send back
    let lastItemQuery = `SELECT * FROM CUST_STATUS WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/customer-status', async function(req, res){
    let query = 'SELECT * FROM CUST_STATUS';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
});
// UPDATE
app.put('/customer-status', async function(req, res){
    // Columns
    const cust_statAttributes = 'status = :status';
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
    // Request New
    let newStatus = req.body.status;
    /* COMPARE and UPDATE */
    let status = compare_update(oldStatus, newStatus);
    // Query Creation
    let query = `UPDATE CUST_STATUS SET ${cust_statAttributes} WHERE cust_status_id = :cust_status_id`;
    let binds = [status.toUpperCase(), cust_status_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected customer_status by ROWID to send back
    let lastItemQuery = `SELECT * FROM CUST_STATUS WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
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

/* VEHICLE */
// CREATE
app.post('/vehicle', async function(req, res){
    // Column Name
    const vehicleAttributes = 'seq_vehicle.nextval, :cust_id, :color_id, :model_id, :year, :license_plate, :state_id, :vin';
    // Values
    let cust_id = req.body.cust_id;
    let color_id = req.body.color_id;
    let model_id = req.body.model_id;
    let year = req.body.year;
    let license_plate = req.body.license_plate;
    let state_id = req.body.state_id;
    let vin = req.body.vin;
    // Query Creation
    let query = `INSERT INTO VEHICLE VALUES (${vehicleAttributes})`;
    let binds = [cust_id, color_id, model_id, year, license_plate.toUpperCase(), state_id, vin.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected vehicle by ROWID to send back
    let lastItemQuery = `SELECT * FROM VEHICLE WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/vehicle', async function(req, res){
    let query = 'SELECT * FROM VEHICLE';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
});
// UPDATE
app.put('/vehicle', async function(req, res){
    // Column Names
    const vehicleAttributes = 'cust_id = :cust_id, color_id = :color_id, model_id = :model_id, year = :year, license_plate = :license_plate, state_id = :state_id, vin = :vin';
    // Values
    let vehicle_id = req.body.vehicle_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM VEHICLE WHERE vehicle_id = :vehicle_id';
    let readBinds = [vehicle_id];
    let readVehicle= await crudOP(readQuery, readBinds, true);
    let currentVehicle = readVehicle.rows[0];
    // Store Old
    let oldCust_id = currentVehicle[1];
    let oldColor_id = currentVehicle[2];
    let oldModel_id = currentVehicle[3];
    let oldYear = currentVehicle[4];
    let oldLicense_plate = currentVehicle[5];
    let oldState_id = currentVehicle[6];
    let oldVin = currentVehicle[7];
    // Request New
    let newCust_id = req.body.cust_id;
    let newColor_id = req.body.color_id;
    let newModel_id = req.body.model_id;
    let newYear = req.body.year;
    let newLicense_plate = req.body.license_plate;
    let newState_id = req.body.state_id
    let newVin = req.body.vin;
    /* COMPARE and UPDATE */
    let cust_id = compare_update(oldCust_id, newCust_id);
    let color_id = compare_update(oldColor_id, newColor_id);
    let model_id = compare_update(oldModel_id, newModel_id);
    let year = compare_update(oldYear, newYear);
    let license_plate = compare_update(oldLicense_plate, newLicense_plate);
    let state_id = compare_update(oldState_id, newState_id);
    let vin = compare_update(oldVin, newVin);
    // Query Creation
    let query = `UPDATE VEHICLE SET ${vehicleAttributes} WHERE vehicle_id = :vehicle_id`;
    let binds = [cust_id, color_id, model_id, year, license_plate.toUpperCase(), state_id, vin.toUpperCase(), vehicle_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected vehicle by ROWID to send back
    let lastItemQuery = `SELECT * FROM VEHICLE WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// DELETE
app.delete('/vehicle', async function(req, res){
    // Values
    let vehicle_id = req.body.vehicle_id;
    // Query Creation
    let query = 'DELETE FROM VEHICLE WHERE vehicle_id = :vehicle_id';
    let binds = [vehicle_id];
    res.send(await crudOP(query, binds, false));
});
app.post('/color', async function(req, res){
    // Column name
    const colorAttrubutes = ':color_id, :color';
    // Values
    let color_id = req.body.color;
    let color = req.body.color;
    // Query Creation
    let query = `INSERT INTO COLOR VALUES (${colorAttrubutes})`;
    let binds = [color_id, color.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected vehicle by ROWID to send back
    let lastItemQuery = `SELECT * FROM COLOR WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/color', async function(req, res){
    let query = 'SELECT * FROM COLOR';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
});
// UPDATE
app.put('/color', async function(req, res){
    // Column Names
    const colorAttributes = 'color = :color';
    // Values
    let color_id = req.body.color_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM COLOR WHERE make_id = :make_id';
    let readBinds = [color_id];
    let readColor = await crudOP(readQuery, readBinds, true);
    let currentColor= readColor.rows[0];
    // Store Old
    let oldColor = currentColor[1];
    // Request New
    let newColor = req.body.color;
    /* COMPARE and UPDATE */
    let color = compare_update(oldColor, newColor);
    // Query Creation
    let query = `UPDATE COLOR SET ${colorAttributes} WHERE color_id = :color_id`;
    let binds = [color.toUpperCase(), color_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected vehicle_make by ROWID to send back
    let lastItemQuery = `SELECT * FROM COLOR WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// DELETE
app.delete('/color', async function(req, res){
    // Values
    let color_id = req.body.color;
    // Query Creation
    let query = 'DELETE FROM COLOR WHERE color_id = :color_id';
    let binds = [color_id];
    res.send(await crudOP(query, binds, false));
});

/* VEHICLE_MAKE */
// CREATE
app.post('/vehicle-make', async function(req, res){
    // Column Name
    const vehicle_makeAttributes = 'seq_vehicle_make.nextval, :make_name';
    // Values
    let make_name = req.body.make_name;
    // Query Creation
    let query = `INSERT INTO VEHICLE_MAKE VALUES (${vehicle_makeAttributes})`;
    let binds = [make_name.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected vehicle_make by ROWID to send back
    let lastItemQuery = `SELECT * FROM VEHICLE_MAKE WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/vehicle-make', async function(req, res){
    let query = 'SELECT * FROM VEHICLE_MAKE';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
});
// UPDATE
app.put('/vehicle-make', async function(req, res){
    // Column Names
    const vehicle_makeAttributes = 'make_name = :make_name';
    // Values
    let make_id = req.body.make_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM VEHICLE_MAKE WHERE make_id = :make_id';
    let readBinds = [make_id];
    let readVehicle_make = await crudOP(readQuery, readBinds, true);
    let currentVehicle_make = readVehicle_make.rows[0];
    // Store Old
    let oldMake_name = currentVehicle_make[1];
    // Request New
    let newMake_name = req.body.status;
    /* COMPARE and UPDATE */
    let make_name = compare_update(oldMake_name, newMake_name);
    // Query Creation
    let query = `UPDATE VEHICLE_MAKE SET ${vehicle_makeAttributes} WHERE make_id = :make_id`;
    let binds = [make_name.toUpperCase(), make_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected vehicle_make by ROWID to send back
    let lastItemQuery = `SELECT * FROM VEHICLE_MAKE WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// DELETE
app.delete('/vehicle_make', async function(req, res){
    // Values
    let make_id = req.body.make_id;
    // Query Creation
    let query = 'DELETE FROM VEHICLE_MAKE WHERE make_id = :make_id';
    let binds = [make_id];
    res.send(await crudOP(query, binds, false));
});
/* VEHICLE_MODEL */
// CREATE
app.post('/vehicle-model', async function(req, res){
    // Column Name
    const vehicle_modelAttributes = 'seq_vehicle_model.nextval, :make_id, :model';
    // Values
    let make_id = req.body.make_id;
    let model = req.body.model;
    // Query Creation
    let query = `INSERT INTO VEHICLE_MODEL VALUES (${vehicle_modelAttributes})`;
    let binds = [make_id, model.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected vehicle_make by ROWID to send back
    let lastItemQuery = `SELECT * FROM VEHICLE_MODEL WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/vehicle-model', async function(req, res){
    let query = 'SELECT * FROM VEHICLE_MODEL';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
});
// UPDATE
app.put('/vehicle-model', async function(req, res){
    // Column Names
    const vehicle_modelAttributes = 'make_id = :make_id, model = :model'
    // Values
    let model_id = req.body.model_id;
    // READ COMPARE and UPDATE
    /*READ*/
    // Current Values
    let readQuery = 'SELECT * FROM VEHICLE_MODEL WHERE model_id = :model_id';
    let readBinds = [model_id];
    let readVehicle_model = await crudOP(readQuery, readBinds, true);
    let currentModel = readVehicle_model.rows[0];
    // Store Old
    let oldMake_id =  currentModel[1];
    let oldModel = currentModel[2];
    // Request New
    let newMake_id = req.body.make_id;
    let newModel = req.body.model;
    /* COMPARE and UPDATE */
    let make_id = compare_update(oldMake_id, newMake_id);
    let model = compare_update(oldModel, newModel);
    // Query Creation
    let query = `UPDATE VEHICLE_MODEL SET ${vehicle_modelAttributes} WHERE model_id = :model_id`;
    let binds = [make_id, model.toUpperCase(), model_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected vehicle_model by ROWID to send back
    let lastItemQuery = `SELECT * FROM VEHICLE_MODEL WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// DELETE
app.delete('/vehicle-model', async function(req, res){
    // Values
    let model_id = req.body.model_id;
    // Query Creation
    let query = 'DELETE FROM VEHICLE_MODEL WHERE model_id = :model_id';
    let binds = [model_id];
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
    let binds = [state_id, state_code.toUpperCase(), state_name.toUpperCase()];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected state by ROWID to send back
    let lastItemQuery = `SELECT * FROM STATE WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
});
// READ
app.get('/state', async function(req, res){
    let query = 'SELECT * FROM STATE';
    const CRUDOP = await crudOP(query,undefined, true);
    res.send(CRUDOP.rows);
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
    let readQuery = 'SELECT * FROM STATE WHERE state_id = :state_id';
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
    let binds = [state_code.toUpperCase(), state_name.toUpperCase(), state_id];
    let CRUDOP = await crudOP(query, binds, false);
        // Find Affected state by ROWID to send back
    let lastItemQuery = `SELECT * FROM STATE WHERE ROWID = '${CRUDOP.lastRowid}'`;
    let lastItemId = await crudOP(lastItemQuery, undefined, true);
    res.json({ 
        lastItemId: lastItemId
    });
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

// Create customer service order
app.post('/customervehicle', async function(req, res) {
        //Customer NOT NULLABLE values
    let cust_status_id = '1';
    let state_id = req.body.state_id;
    //Customer NULLABLE values
    let first_name = req.body.first_name;
    let middle_in = req.body.middle_in || null;
    let last_name = req.body.last_name;
    let address = req.body.address;
    let city = req.body.city;
    let zip = req.body.zip;
    let phone = req.body.phone;
    let email = req.body.email;
    //Vehicle NOT NULLABLE values
    let model_id = req.body.model_id;
    //Vehicle NULLABLE values
    let color_id = req.body.color_id;
    let year = req.body.year;
    let license_plate = req.body.license_plate;
    let vin = req.body.vin;
    //Customer Column Names 
    const custAttributes = "seq_cust.nextval, :cust_status_id, :state_id, :first_name, :middle_in, :last_name, :address, :city, :zip, :phone, :email";
    //Customer Query
    let custQuery = `INSERT INTO CUSTOMER VALUES (${custAttributes})`;
    let binds = [cust_status_id, state_id, first_name.toUpperCase(), middle_in.toUpperCase(), last_name.toUpperCase(), address.toUpperCase(), city.toUpperCase(), zip, phone, email.toUpperCase()];
    let custCRUDOP = await crudOP(custQuery, binds, false);
    //Get customer rowID
    let lastItemQuery = `SELECT * FROM CUSTOMER WHERE ROWID = '${custCRUDOP.lastRowid}'`;
    let lastItem = await crudOP(lastItemQuery, undefined, true);
    let lastRowId = lastItem.rows[0][0];
    //Vehicle Column Names 
    const vehicleAttributes = "seq_vehicle.nextval, :cust_id, :color_id, :model_id, :year, :license_plate, :state_id, :vin"
    //Vehicle Query
    let vehicleQuery = `INSERT INTO VEHICLE VALUES (${vehicleAttributes})`;
    let vehicleBinds = [lastRowId, color_id, model_id, year.toUpperCase(), license_plate.toUpperCase(), state_id, vin.toUpperCase()];
    let vehicleCRUDOP = await crudOP(vehicleQuery, vehicleBinds, false);
    let completeResponse = vehicleCRUDOP.lastRowid;
    res.json({
        lastRowID: completeResponse,
        cust_id: lastRowId
    });    
});
app.post('/sales-data', async function(req, res) {
    const interval = req.query.interval;
    let groupBy = "";
    let dateFormat = "";
    switch (interval) {
      case "daily":
        groupBy = "TRUNC(datein, 'DD')";
        dateFormat = "YYYY-MM-DD";
        break;
      case "weekly":
        groupBy = "TRUNC(datein, 'IW')";
        dateFormat = "IYYY-IW";
        break;
      case "monthly":
        groupBy = "TRUNC(datein, 'MM')";
        dateFormat = "YYYY-MM";
        break;
      case "yearly":
        groupBy = "TRUNC(datein, 'YYYY')";
        dateFormat = "YYYY";
        break;
      default:
        res.status(400).send("Invalid interval");
        return;
    }
    const query = `SELECT TO_CHAR(${groupBy}, '${dateFormat}') AS date_range_start, SUM(ttlamount) AS total_sales FROM SERVICE_ORDER WHERE datein >= '01-Jan-98' AND dateout <= '31-Dec-23' GROUP BY ${groupBy} ORDER BY ${groupBy}`;
    const result = await crudOP(query, undefined, true);
    console.log(result.rows)
    res.json(result.rows);
  });

app.post('/api/sales-per-month', async (req, res) => {
    try {
      // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Month is zero-based, so add 1
    const currentYear = currentDate.getFullYear();
  
      // Build the SQL query to retrieve the sales data for the current month and year
    const query = `
    SELECT SUM(ttlamount) as totalSales, DATE_TRUNC('month', datein) as month
    FROM service_order
    WHERE DATE_TRUNC('month', datein) = DATE_TRUNC('month', NOW())
    GROUP BY DATE_TRUNC('month', datein)
      `;
  
    // Execute the query and retrieve the results
    const results = await pool.query(query);
  
    // Parse the results and format them for use in the chart
    const salesData = [];
      for (const row of results.rows) {
        salesData.push({
          month: row.month.toLocaleDateString('en-US', { month: 'long' }), // Format the month as a string
          sales: row.totalSales
        });
      }
  
      // Send the formatted data back to the client as JSON
      res.json(salesData);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
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