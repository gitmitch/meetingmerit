var mysql = require('mysql')


function runQuery() {
    var connection = mysql.createConnection({
        host     : process.env.RDS_HOSTNAME,
        user     : process.env.RDS_USERNAME,
        password : process.env.RDS_PASSWORD,
        port 	 : process.env.RDS_PORT,
        database : process.env.DATABASE_NAME
    })
    connection.query.apply(connection, arguments)
    connection.end()
}

function getSalt() {
    return process.env.SALT
}

module.exports = {
    runQuery: runQuery,
    getSalt: getSalt
}