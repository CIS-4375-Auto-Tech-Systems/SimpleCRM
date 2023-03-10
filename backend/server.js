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

async function dbCheck() {
    let connection;
    try {
        connection = await oracledb.getConnection({user : username, password : pass, connectString : conn});
        console.log("Successfully connected to Oracle Database");
        await connection.close();
    }catch(err){
        console.log(err);
    }
};


//declare port number for the api
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.listen(PORT, () => {
    dbCheck();
    console.log("Server started listening on port: ", PORT);
});

//error handler
app.use(function (err, req, res, next) {
    // logs error and error code to console
    console.error(err.message, req);
    if (!err.statusCode)
      err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
  });
