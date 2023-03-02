// oracledb
import oracledb from 'oracledb';
// dotenv
require("dotenv").config();
// CREDENTIALS
const username = process.env.USER;
const password = process.env.PASSWORD;
const connectionString = process.env.CONNECTIONSTRING;

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
