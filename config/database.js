const mysql = require('mysql2/promise');
const { logger } = require('./winston');

const pool = mysql.createPool({
    host: '15.164.131.119',
    user: 'root',
    password: 'falcon6351',
    database: 'hack_db'
});

module.exports = {
    pool: pool
};