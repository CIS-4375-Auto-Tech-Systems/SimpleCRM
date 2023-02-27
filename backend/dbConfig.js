// Configuration for Connecting to Oracle SQL Database
module.exports = {
    // USER
    user : process.env.NODE_ORACLEDB_USER,
    // PASSWORD
    password : process.env.NODE_ORACLEDB_PASSWORD,
    // CONNECTION STRING
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING
};