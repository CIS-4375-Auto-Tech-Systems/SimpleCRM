// oracledb
import oracledb from 'oracledb';
// dotenv
require("dotenv").config();

//Credentials for oracleDB user from .env
const username = process.env.USER;
const password = process.env.PASSWORD;
const connectionString = process.env.CONNECTIONSTRING;

/* https://www.oracle.com/database/technologies/appdev/quickstartnodeonprem.html */
async function dbCheck() {
    let connection;
    try {
        connection = await oracledb.getConnection({user:username, password:password,connectionString:connectionString});
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