// oracledb
const oracledb = require('oracledb');
const fs = require("fs");
// dotenv
require("dotenv").config();

//Credentials for oracleDB user from .env
const username = process.env.USER;
const pass = process.env.PASSWORD;
const conn = process.env.CONNECTIONSTRING;

// Client Libraries
let libPath;
if (process.platform === 'win32') {           // Windows
  libPath = 'C:\\oracle\\instantclient_19_16';
} else if (process.platform === 'darwin') {   // macOS
  libPath = process.env.HOME + '/Downloads/instantclient_19_8';
}
if (libPath && fs.existsSync(libPath)) {
  oracledb.initOracleClient({ libDir: libPath });
}

//ORCLPDB=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=COT-CIS4375-03.cougarnet.uh.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orclpdb)))
/* https://www.oracle.com/database/technologies/appdev/quickstartnodeonprem.html */
async function dbCheck() {
    let connection;
    try {
        connection = await oracledb.getConnection({user : username, password : pass, connectString : conn});
        console.log("Successfully connected to Oracle Database");
    }catch(err){
        console.log(err);
    }finally{
        if(connection){
            try{
                await connection.close();
                console.log("Successfully disconnected from Oracle Database");
            }catch(err){
                console.error(err);
            }
        }
    }
};
dbCheck();