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

/* CREATE */
// QUERY CREATION
let createQuery =  `INSERT INTO hokage VALUES (:id, :name)`;
let createBinds = [[6, 'Kakashi'], [7, 'Boruto']]; // ITEMS BEING INSERTED
// FUNCTION
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
/* READ */
// QUERY CREATION
let readQuery =  `SELECT * FROM hokage`;
// FUNCTION
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
/* UPDATE */
// QUERY CREATION
let updateQuery =  `UPDATE hokage SET name = :2 WHERE id = :1`;
let updateBinds = [7, 'Naruto']; // ITEM BEING UPDATED
// FUNCTION
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
/* DELETE */
// QUERY CREATION
let deleteQuery =  `DELETE FROM hokage WHERE id = :1`;
let deleteBinds = [7]; //ITEM BEING DELETED
// FUNCTION
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
