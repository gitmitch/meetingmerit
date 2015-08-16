var mysql = require('mysql')


function runQuery() {
    var connection = mysql.createConnection({
        host     : process.env.OPENSHIFT_MYSQL_DB_HOST,
        user     : process.env.MM_DB_USERNAME,
        password : process.env.MM_DB_PASSWORD,
        port 	 : process.env.OPENSHIFT_MYSQL_DB_PORT,
        database : process.env.MM_DB_NAME
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