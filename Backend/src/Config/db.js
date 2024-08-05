const mysql = require("mysql2")
const path = require('path')
require('dotenv').config({path:path.resolve(__dirname,'../../.env')})

const connection = mysql.createPool({
    host:process.env.HOST, 
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.NAME 
})
connection.getConnection((err, conn)=>{
    if(err){
        console.error("Error connecting to MySQL:", err)
        console.log("Connection Failed da Priyan")
    }
    console.log("Priyan! Connection success da")
    conn.release()
})

connection.on('error', err=>{
    console.error("MySQL Pool Error:",err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST'){
        console.error("Connection Lost! Trying to Reconnect..")
        connection.getConnection();
    }
})
connection.on("acquire",connection =>{
    console.log("MySQL Acquired")
}
)
connection.on("release",connection =>{
    console.log("MySQL Released")
}
)
module.exports = connection;