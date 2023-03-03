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
async function createOP(){
    let connection;
    try{

    }catch(err){
        console.log(err);
    }finally{
        if(connection){
            try{
                await connection.close();
            }catch(err){
                console.log(err);
            }
        }
    }
};
/* READ */
async function readOP(){
    let connection;
    try{
        
    }catch(err){
        console.log(err);
    }finally{
        if(connection){
            try{
                await connection.close();
            }catch(err){
                console.log(err);
            }
        }
    }
};
/* UPDATE */
async function updateOP(){
    let connection;
    try{
        
    }catch(err){
        console.log(err);
    }finally{
        if(connection){
            try{
                await connection.close();
            }catch(err){
                console.log(err);
            }
        }
    }
};
/* DELETE */
async function deleteOP(){
    let connection;
    try{
        
    }catch(err){
        console.log(err);
    }finally{
        if(connection){
            try{
                await connection.close();
            }catch(err){
                console.log(err);
            }
        }
    }
};
