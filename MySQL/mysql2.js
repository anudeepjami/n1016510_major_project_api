const mysql2 = require("mysql2");
const https = require('https');
const fs = require("fs");

// Create a connection to the database
var connection_string = {
  host: "aj-major-project-mysql.mysql.database.azure.com",
  user: "majorproject",
  password: "p5HZ6S9!W93k",
  database: "majorproject",
  port: 3306,
  ssl:{
    ca: fs.readFileSync("./MySQL/DigiCertGlobalRootCA.crt.pem")
    },
  connectionLimit : 50, // maximum simultaneous connections
  debug    :  false
};

var pool = mysql2.createPool(connection_string);

pool.query("select * from user_table",(err, data) => {
  if(err) {
    // db connection failure check log
      console.error(err);
      return;
  }
  // db connection success check log
  console.log("Successfully connected to the database.");
}); 


module.exports = pool;